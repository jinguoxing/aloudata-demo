import { AgentEvent, AgentTask } from './contracts';

export function applyAgentEvent(
  state: AgentTask,
  event: AgentEvent,
): AgentTask {
  switch (event.type) {
    case 'turn.started': {
      const existingTurnIndex = state.turns.findIndex(
        (t) => t.turnId === event.turn.turnId,
      );
      if (existingTurnIndex >= 0) {
        const updatedTurns = [...state.turns];
        updatedTurns[existingTurnIndex] = event.turn;
        return {
          ...state,
          status: 'RUNNING',
          turns: updatedTurns,
        };
      }
      return {
        ...state,
        status: 'RUNNING',
        turns: [...state.turns, event.turn],
      };
    }

    case 'block.created':
    case 'decision.required':
    case 'artifact.ready': {
      const turnExists = state.turns.some((t) => t.turnId === event.turnId);
      let turns = state.turns;

      if (!turnExists) {
        turns = [
          ...state.turns,
          {
            turnId: event.turnId,
            role: 'assistant',
            blocks: [event.block],
            createdAt: new Date().toISOString(),
          },
        ];
      } else {
        turns = state.turns.map((turn) => {
          if (turn.turnId === event.turnId) {
            const blockExists = turn.blocks.some(
              (b) => b.blockId === event.block.blockId,
            );
            if (blockExists) {
              return {
                ...turn,
                blocks: turn.blocks.map((b) =>
                  b.blockId === event.block.blockId ? event.block : b,
                ),
              };
            }
            return {
              ...turn,
              blocks: [...turn.blocks, event.block],
            };
          }
          return turn;
        });
      }

      const artifactIds =
        event.type === 'artifact.ready' && !state.artifactIds.includes(event.artifactId)
          ? [...state.artifactIds, event.artifactId]
          : state.artifactIds;

      const status =
        event.type === 'decision.required' ? 'WAITING_USER' : state.status;

      return {
        ...state,
        status,
        turns,
        artifactIds,
      };
    }

    case 'block.updated': {
      return {
        ...state,
        turns: state.turns.map((turn) =>
          turn.turnId === event.turnId
            ? {
                ...turn,
                blocks: turn.blocks.map((block) =>
                  block.blockId === event.blockId
                    ? { ...block, ...event.patch }
                    : block,
                ),
              }
            : turn,
        ),
      };
    }

    case 'task.updated': {
      return {
        ...state,
        ...event.patch,
        context: {
          ...state.context,
          ...(event.patch.context || {}),
        },
      };
    }

    case 'turn.completed': {
      return {
        ...state,
        status: state.status === 'WAITING_USER' ? 'WAITING_USER' : 'OPEN',
      };
    }

    case 'turn.cancelled': {
      return {
        ...state,
        status: 'OPEN',
      };
    }

    case 'turn.failed': {
      return {
        ...state,
        status: 'FAILED',
      };
    }

    default:
      return state;
  }
}
