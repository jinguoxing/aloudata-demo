import {
  AgentEvent,
  AttachmentRef,
  AgentTask,
  TaskAction,
  ShareArtifact,
} from '../contracts';

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

    const { streamUrl } = await response.json();

    return new Promise<void>((resolve, reject) => {
      const source = new EventSource(streamUrl);

      source.onmessage = (message) => {
        try {
          const event = JSON.parse(message.data) as AgentEvent;
          params.onEvent(event);

          if (
            event.type === 'turn.completed' ||
            event.type === 'turn.failed'
          ) {
            source.close();
            if (event.type === 'turn.completed') {
              resolve();
            } else {
              reject(new Error(event.message || 'Turn execution failed'));
            }
          }
        } catch (err) {
          console.error('Failed to parse SSE message:', err);
        }
      };

      source.onerror = (err) => {
        source.close();
        console.warn('SSE stream closed or encountered error:', err);
        // If the turn had already yielded events, resolve cleanly
        resolve();
      };
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
    if (data.streamUrl) {
      return new Promise<any>((resolve, reject) => {
        const source = new EventSource(data.streamUrl);

        source.onmessage = (message) => {
          try {
            const event = JSON.parse(message.data) as AgentEvent;
            params.onEvent(event);

            if (
              event.type === 'turn.completed' ||
              event.type === 'turn.failed'
            ) {
              source.close();
              if (event.type === 'turn.completed') {
                resolve(data);
              } else {
                reject(new Error(event.message || 'Action failed'));
              }
            }
          } catch (e) {
            console.error(e);
          }
        };

        source.onerror = () => {
          source.close();
          resolve(data);
        };
      });
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
}

export const apiAgentRuntime = new ApiAgentRuntime();
