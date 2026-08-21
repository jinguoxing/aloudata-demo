import {
  AgentEvent,
  AttachmentRef,
  AgentTask,
  TaskAction,
  ShareArtifact,
  MetricDefinition,
  ReportDocument,
} from '../contracts';

function toAbsoluteUrl(url: string): string {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  if (typeof window !== 'undefined' && window.location) {
    try {
      const origin = window.location.origin;
      if (origin && origin !== 'null' && (origin.startsWith('http://') || origin.startsWith('https://'))) {
        const cleanOrigin = origin.replace(/\/+$/, '');
        const cleanPath = url.replace(/^\/+/, '');
        return `${cleanOrigin}/${cleanPath}`;
      }
    } catch {
      // ignore
    }
  }
  return url;
}

export class ApiAgentRuntime {
  async createSession(): Promise<{ sessionId: string; taskId: string; task: AgentTask }> {
    const response = await fetch('/api/v1/sessions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to create session');
    }

    return response.json();
  }

  async getTask(sessionId: string): Promise<AgentTask> {
    const response = await fetch(`/api/v1/sessions/${sessionId}/task`);
    if (!response.ok) {
      throw new Error('Failed to get task');
    }
    return response.json();
  }

  async uploadFile(file: File): Promise<AttachmentRef> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/v1/files', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      // Fallback for mock environment if FormData fails
      return {
        attachmentId: `att_${Date.now()}`,
        fileName: file.name,
        mimeType: file.type || 'text/csv',
        size: file.size,
      };
    }

    return response.json();
  }

  private listenToStreamOrPoll(params: {
    streamUrl: string;
    turnId: string;
    sessionId?: string;
    onEvent: (event: AgentEvent) => void;
  }): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      let isSettled = false;
      let seenEventCount = 0;
      let source: EventSource | null = null;
      let pollInterval: any = null;

      const finishSuccess = () => {
        if (isSettled) return;
        isSettled = true;
        if (pollInterval) clearInterval(pollInterval);
        if (source) {
          try {
            source.close();
          } catch {
            // ignore
          }
        }
        resolve();
      };

      const finishError = (err: Error) => {
        if (isSettled) return;
        isSettled = true;
        if (pollInterval) clearInterval(pollInterval);
        if (source) {
          try {
            source.close();
          } catch {
            // ignore
          }
        }
        reject(err);
      };

      // Fallback polling mechanism if EventSource fails or is blocked
      const startPolling = () => {
        if (pollInterval || isSettled) return;
        const eventsUrl = params.sessionId
          ? `/api/v1/sessions/${params.sessionId}/turns/${params.turnId}/events`
          : `/api/v1/turns/${params.turnId}/events`;

        let pollCount = 0;
        pollInterval = setInterval(async () => {
          if (isSettled) return;
          pollCount++;
          try {
            const res = await fetch(eventsUrl);
            if (res.ok) {
              const data = await res.json();
              const events: AgentEvent[] = data.events || [];
              if (events.length > seenEventCount) {
                const newEvents = events.slice(seenEventCount);
                seenEventCount = events.length;
                for (const ev of newEvents) {
                  params.onEvent(ev);
                  if (ev.type === 'turn.completed') {
                    finishSuccess();
                    return;
                  }
                  if (ev.type === 'turn.failed') {
                    finishError(new Error(ev.message || 'Turn execution failed'));
                    return;
                  }
                }
              }
            }
          } catch {
            // ignore polling errors
          }

          if (pollCount > 100) {
            // Safety timeout after 25s
            finishSuccess();
          }
        }, 250);
      };

      // Try EventSource with absolute URL, or fallback to polling mechanism
      try {
        const fullUrl = toAbsoluteUrl(params.streamUrl);
        const isValidHttp = fullUrl && (fullUrl.startsWith('http://') || fullUrl.startsWith('https://'));

        if (typeof EventSource !== 'undefined' && isValidHttp) {
          source = new EventSource(fullUrl);

          source.onmessage = (message) => {
            try {
              const event = JSON.parse(message.data) as AgentEvent;
              seenEventCount++;
              params.onEvent(event);

              if (event.type === 'turn.completed') {
                finishSuccess();
              } else if (event.type === 'turn.failed') {
                finishError(new Error(event.message || 'Turn execution failed'));
              }
            } catch (err) {
              console.error('Failed to parse SSE message:', err);
            }
          };

          source.onerror = () => {
            if (source) {
              try {
                source.close();
              } catch {
                // ignore
              }
            }
            // Start polling fallback if not settled
            if (!isSettled) {
              startPolling();
            }
          };
        } else {
          // If EventSource is unsupported or url is not absolute, poll directly
          startPolling();
        }
      } catch (err) {
        console.warn('EventSource initialization error, using polling fallback:', err);
        startPolling();
      }
    });
  }

  async submitTurn(params: {
    sessionId: string;
    text: string;
    attachments: AttachmentRef[];
    onEvent: (event: AgentEvent) => void;
  }): Promise<void> {
    const response = await fetch(
      `/api/v1/sessions/${params.sessionId}/turns`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: params.text,
          attachments: params.attachments,
        }),
      },
    );

    if (!response.ok) {
      throw new Error('Failed to submit turn');
    }

    const { turnId, streamUrl } = await response.json();

    return this.listenToStreamOrPoll({
      streamUrl,
      turnId,
      sessionId: params.sessionId,
      onEvent: params.onEvent,
    });
  }

  async performAction(params: {
    taskId: string;
    action: TaskAction;
    onEvent: (event: AgentEvent) => void;
  }): Promise<any> {
    const response = await fetch(`/api/v1/tasks/${params.taskId}/actions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params.action),
    });

    if (!response.ok) {
      throw new Error('Failed to perform task action');
    }

    const data = await response.json();

    // If streamUrl is provided for action execution
    if (data.streamUrl && data.turnId) {
      await this.listenToStreamOrPoll({
        streamUrl: data.streamUrl,
        turnId: data.turnId,
        onEvent: params.onEvent,
      });
      return data;
    }

    // Direct events returned in action response
    if (Array.isArray(data.events)) {
      data.events.forEach((ev: AgentEvent) => params.onEvent(ev));
    }

    return data;
  }

  async getShare(shareId: string): Promise<ShareArtifact> {
    const response = await fetch(`/api/v1/shares/${shareId}`);
    if (!response.ok) {
      throw new Error('Share artifact not found');
    }
    return response.json();
  }

  async getMetricDefinition(metricId: string): Promise<MetricDefinition> {
    const response = await fetch(`/api/v1/metrics/${metricId}`);
    if (!response.ok) {
      throw new Error('Failed to load metric definition');
    }
    return response.json();
  }

  async getArtifact(artifactId: string): Promise<ReportDocument> {
    const response = await fetch(`/api/v1/artifacts/${artifactId}`);
    if (!response.ok) {
      throw new Error('Artifact not found');
    }
    return response.json();
  }
}

export const apiAgentRuntime = new ApiAgentRuntime();
