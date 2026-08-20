import type { Response } from 'express';
import type { AgentEvent } from '../../src/agent/contracts';
import { taskStore } from './taskStore';

class EventHub {
  private history = new Map<string, AgentEvent[]>();
  private listeners = new Map<string, Set<Response>>();
  private turnToTask = new Map<string, string>();

  bindTurnToTask(turnId: string, taskId: string) {
    this.turnToTask.set(turnId, taskId);
  }

  publish(turnId: string, event: AgentEvent, explicitTaskId?: string) {
    const events = this.history.get(turnId) ?? [];
    events.push(event);
    this.history.set(turnId, events);

    // Sync authoritative Server Task state
    const taskId = explicitTaskId || this.turnToTask.get(turnId);
    if (taskId) {
      taskStore.applyEvent(turnId, taskId, event);
    }

    const listeners = this.listeners.get(turnId);

    listeners?.forEach((res) => {
      try {
        res.write(`data: ${JSON.stringify(event)}\n\n`);

        if (
          event.type === 'turn.completed' ||
          event.type === 'turn.failed'
        ) {
          res.end();
        }
      } catch (err) {
        console.error('Error writing event to SSE listener:', err);
      }
    });
  }

  subscribe(turnId: string, res: Response) {
    const oldEvents = this.history.get(turnId) ?? [];

    oldEvents.forEach((event) => {
      try {
        res.write(`data: ${JSON.stringify(event)}\n\n`);
      } catch (err) {
        console.error('Error sending historical event to SSE subscriber:', err);
      }
    });

    const set = this.listeners.get(turnId) ?? new Set<Response>();
    set.add(res);
    this.listeners.set(turnId, set);

    res.on('close', () => {
      const currentSet = this.listeners.get(turnId);
      if (currentSet) {
        currentSet.delete(res);
      }
    });
  }

  getEvents(turnId: string): AgentEvent[] {
    return this.history.get(turnId) || [];
  }
}

export const eventHub = new EventHub();
