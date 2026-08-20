import { AgentEvent, AgentTask, Turn } from '../../src/agent/contracts';
import { applyAgentEvent } from '../../src/agent/reducer';

export interface SessionRecord {
  sessionId: string;
  taskId: string;
  task: AgentTask;
  createdAt: string;
  updatedAt: string;
}

class TaskStore {
  private sessions = new Map<string, SessionRecord>();
  private taskToSession = new Map<string, string>();

  createSession(customSessionId?: string, customTaskId?: string): SessionRecord {
    const sessionId = customSessionId || `sess_${Math.random().toString(36).substring(2, 10)}`;
    const taskId = customTaskId || `task_${Math.random().toString(36).substring(2, 10)}`;

    const initialTask: AgentTask = {
      sessionId,
      taskId,
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

    const record: SessionRecord = {
      sessionId,
      taskId,
      task: initialTask,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.sessions.set(sessionId, record);
    this.taskToSession.set(taskId, sessionId);
    return record;
  }

  getSession(sessionId: string): SessionRecord | undefined {
    return this.sessions.get(sessionId);
  }

  getTaskBySessionId(sessionId: string): AgentTask | undefined {
    return this.sessions.get(sessionId)?.task;
  }

  getTaskByTaskId(taskId: string): AgentTask | undefined {
    const sessionId = this.taskToSession.get(taskId);
    if (!sessionId) return undefined;
    return this.sessions.get(sessionId)?.task;
  }

  ensureSession(sessionId: string): SessionRecord {
    let session = this.sessions.get(sessionId);
    if (!session) {
      session = this.createSession(sessionId);
    }
    return session;
  }

  recordUserTurn(sessionId: string, turn: Turn) {
    const session = this.ensureSession(sessionId);
    const updatedTask = {
      ...session.task,
      status: 'RUNNING' as const,
      turns: [...session.task.turns, turn],
    };
    session.task = updatedTask;
    session.updatedAt = new Date().toISOString();
  }

  applyEvent(turnId: string, taskId: string, event: AgentEvent) {
    const sessionId = this.taskToSession.get(taskId);
    let session = sessionId ? this.sessions.get(sessionId) : undefined;

    if (!session) {
      // Find session by taskId search
      for (const s of this.sessions.values()) {
        if (s.taskId === taskId) {
          session = s;
          this.taskToSession.set(taskId, s.sessionId);
          break;
        }
      }
    }

    if (!session) return;

    // Apply the event to update the server authoritative task
    session.task = applyAgentEvent(session.task, event);
    session.updatedAt = new Date().toISOString();
  }

  updateTaskContext(taskId: string, patch: Record<string, any>) {
    const task = this.getTaskByTaskId(taskId);
    if (!task) return;
    task.context = {
      ...task.context,
      ...patch,
    };
  }
}

export const taskStore = new TaskStore();
