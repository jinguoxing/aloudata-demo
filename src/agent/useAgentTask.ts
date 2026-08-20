import { useState, useEffect, useCallback, useRef } from 'react';
import {
  AgentTask,
  AgentEvent,
  AgentBlock,
  AttachmentRef,
  TaskAction,
  ShareArtifact,
  ToolExecutionPayload,
} from './contracts';
import { applyAgentEvent } from './reducer';
import { apiAgentRuntime } from './runtime/ApiAgentRuntime';

const INITIAL_TASK: AgentTask = {
  sessionId: '',
  taskId: '',
  title: '公共服务热线工单按期办结率分析',
  status: 'OPEN',
  stage: 'ASK_DATA',
  context: {
    region: '上海市闵行区',
    metricName: '按期办结率',
  },
  turns: [],
  artifactIds: [],
};

export function useAgentTask() {
  const [task, setTask] = useState<AgentTask>(INITIAL_TASK);
  const [loading, setLoading] = useState<boolean>(false);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [activeTraceExecution, setActiveTraceExecution] = useState<ToolExecutionPayload | null>(null);
  const [activeShareArtifact, setActiveShareArtifact] = useState<ShareArtifact | null>(null);

  const taskRef = useRef<AgentTask>(task);
  taskRef.current = task;

  const handleEvent = useCallback((event: AgentEvent) => {
    setTask((prev) => {
      const next = applyAgentEvent(prev, event);
      taskRef.current = next;
      return next;
    });

    // Check if event has a tool execution payload to track for context panel
    if (
      event.type === 'block.created' &&
      event.block.type === 'tool_execution'
    ) {
      setActiveTraceExecution(event.block.payload as ToolExecutionPayload);
    }
  }, []);

  // Initialize session on mount (Hydrate from server if existing)
  const initSession = useCallback(async (forceNew = false) => {
    try {
      setLoading(true);

      const savedSessionId =
        !forceNew && typeof window !== 'undefined'
          ? sessionStorage.getItem('semovix_session_id')
          : null;

      if (savedSessionId) {
        try {
          const serverTask = await apiAgentRuntime.getTask(savedSessionId);
          if (serverTask && serverTask.sessionId) {
            setTask(serverTask);
            taskRef.current = serverTask;
            setIsInitialized(true);

            // Restore any share artifact from context
            if (serverTask.context?.shareArtifact) {
              setActiveShareArtifact(serverTask.context.shareArtifact);
            }

            return;
          }
        } catch (fetchErr) {
          console.warn('Could not rehydrate existing session, creating new:', fetchErr);
        }
      }

      // Create new authoritative session on server
      const res = await apiAgentRuntime.createSession();
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('semovix_session_id', res.sessionId);
      }

      setTask({
        ...INITIAL_TASK,
        sessionId: res.sessionId,
        taskId: res.taskId,
        ...(res.task || {}),
      });
      setIsInitialized(true);
    } catch (err) {
      console.error('Failed to init agent session:', err);
      // Fallback local session for development resilience
      const mockSessionId = `sess_${Date.now()}`;
      const mockTaskId = `task_${Date.now()}`;
      setTask({
        ...INITIAL_TASK,
        sessionId: mockSessionId,
        taskId: mockTaskId,
      });
      setIsInitialized(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    initSession();
  }, [initSession]);

  const resetSession = useCallback(async () => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('semovix_session_id');
    }
    await initSession(true);
  }, [initSession]);

  // Send a user prompt with optional file attachments
  const sendMessage = useCallback(
    async (text: string, files?: File[]) => {
      const currentTask = taskRef.current;
      if (!currentTask.sessionId) {
        await initSession();
      }

      setLoading(true);

      try {
        let attachments: AttachmentRef[] = [];
        if (files && files.length > 0) {
          const uploads = await Promise.all(
            files.map((file) => apiAgentRuntime.uploadFile(file)),
          );
          attachments = uploads;
        }

        await apiAgentRuntime.submitTurn({
          sessionId: taskRef.current.sessionId,
          text,
          attachments,
          onEvent: handleEvent,
        });
      } catch (err) {
        console.error('Error in sendMessage:', err);
      } finally {
        setLoading(false);
      }
    },
    [handleEvent, initSession],
  );

  // Perform an agent action (e.g. SELECT_METRIC, CONFIRM_SCHEDULE, CREATE_SHARE)
  const performAction = useCallback(
    async (action: TaskAction) => {
      setLoading(true);
      try {
        const result = await apiAgentRuntime.performAction({
          taskId: taskRef.current.taskId,
          action,
          onEvent: handleEvent,
        });

        if (action.actionType === 'CREATE_SHARE' && result.share) {
          setActiveShareArtifact(result.share);
        }

        return result;
      } catch (err) {
        console.error('Error performing action:', err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [handleEvent],
  );

  // Quick action helpers
  const selectMetric = useCallback(
    async (metricId: string, metricName?: string) => {
      return performAction({
        actionType: 'SELECT_METRIC',
        payload: { metricId, metricName },
      });
    },
    [performAction],
  );

  const confirmSchedule = useCallback(
    async (payload?: { taskName?: string; frequency?: string; time?: string }) => {
      return performAction({
        actionType: 'CONFIRM_SCHEDULE',
        payload: payload || {},
      });
    },
    [performAction],
  );

  const createShare = useCallback(
    async (blockIds: string[], blocksToShare?: AgentBlock[]) => {
      // Find all blocks from task if not directly supplied
      const allTaskBlocks: AgentBlock[] = [];
      taskRef.current.turns.forEach((t) => {
        t.blocks.forEach((b) => allTaskBlocks.push(b));
      });

      const selectedBlocks =
        blocksToShare && blocksToShare.length > 0
          ? blocksToShare
          : allTaskBlocks.filter((b) => blockIds.includes(b.blockId));

      const res = await performAction({
        actionType: 'CREATE_SHARE',
        payload: {
          blockIds,
          blocks: selectedBlocks,
        },
      });
      return res.share as ShareArtifact;
    },
    [performAction],
  );

  const triggerDiagnosis = useCallback(
    async (reason?: string) => {
      return sendMessage(reason || '为什么环比下降了？');
    },
    [sendMessage],
  );

  return {
    task,
    loading,
    isInitialized,
    activeTraceExecution,
    activeShareArtifact,
    sendMessage,
    performAction,
    selectMetric,
    confirmSchedule,
    createShare,
    triggerDiagnosis,
    resetSession,
  };
}
