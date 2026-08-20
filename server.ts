import express from 'express';
import path from 'path';
import crypto from 'node:crypto';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { eventHub } from './server/agent/eventHub';
import {
  runTurn,
  handleMetricQueryExecute,
  handleScheduleConfirmAction,
} from './server/agent/orchestrator';
import { semovix } from './server/services/mockSemovix';
import { AgentTask } from './src/agent/contracts';

dotenv.config();

// Memory task store for active sessions
const sessions = new Map<string, { sessionId: string; taskId: string; task: AgentTask }>();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON Body Parser with ample limit for CSV/Data payloads
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // ---------------- API Routes ---------------- //

  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Create new session & task
  app.post('/api/v1/sessions', (_req, res) => {
    const sessionId = `sess_${crypto.randomUUID().substring(0, 8)}`;
    const taskId = `task_${crypto.randomUUID().substring(0, 8)}`;

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

    sessions.set(sessionId, { sessionId, taskId, task: initialTask });
    res.json({ sessionId, taskId, task: initialTask });
  });

  // Get session task
  app.get('/api/v1/sessions/:sessionId/task', (req, res) => {
    const session = sessions.get(req.params.sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    res.json(session.task);
  });

  // Submit new turn
  app.post('/api/v1/sessions/:sessionId/turns', async (req, res) => {
    const { sessionId } = req.params;
    const { text, attachments = [] } = req.body;

    let session = sessions.get(sessionId);
    if (!session) {
      const taskId = `task_${crypto.randomUUID().substring(0, 8)}`;
      const task: AgentTask = {
        sessionId,
        taskId,
        title: '公共服务热线工单按期办结率分析',
        status: 'OPEN',
        stage: 'ASK_DATA',
        context: { region: '上海市闵行区' },
        turns: [],
        artifactIds: [],
      };
      session = { sessionId, taskId, task };
      sessions.set(sessionId, session);
    }

    const turnId = `turn_${crypto.randomUUID().substring(0, 8)}`;
    const streamUrl = `/api/v1/sessions/${sessionId}/turns/${turnId}/stream`;

    // Asynchronously orchestrate agent response
    setTimeout(() => {
      runTurn({
        turnId,
        taskId: session!.taskId,
        text: text || '',
        attachments,
      }).catch((err) => {
        console.error('Turn execution error:', err);
        eventHub.publish(turnId, {
          type: 'turn.failed',
          turnId,
          message: err.message || 'Execution failed',
        });
      });
    }, 100);

    res.json({ turnId, streamUrl });
  });

  // SSE Event Stream for a turn
  app.get('/api/v1/sessions/:sessionId/turns/:turnId/stream', (req, res) => {
    const { turnId } = req.params;

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    eventHub.subscribe(turnId, res);
  });

  // Task Actions (Interactions like selecting metric, confirming schedule, creating share)
  app.post('/api/v1/tasks/:taskId/actions', async (req, res) => {
    const { taskId } = req.params;
    const action = req.body;
    const turnId = `turn_act_${crypto.randomUUID().substring(0, 8)}`;

    switch (action.actionType) {
      case 'SELECT_METRIC': {
        const metricId = action.payload?.metricId || 'metric_on_time_rate';
        await handleMetricQueryExecute(turnId, taskId, metricId);

        const events = eventHub.getEvents(turnId);
        return res.json({ success: true, events });
      }

      case 'CONFIRM_SCHEDULE': {
        await handleScheduleConfirmAction(turnId, taskId, action.payload);
        const events = eventHub.getEvents(turnId);
        return res.json({ success: true, events });
      }

      case 'CREATE_SHARE': {
        const blockIds = action.payload?.blockIds || [];
        const share = await semovix.createShareArtifact({
          taskId,
          selectedBlockIds: blockIds,
          blocks: [],
        });
        return res.json({ success: true, share });
      }

      default:
        return res.status(400).json({ error: 'Unknown action type' });
    }
  });

  // File Upload endpoint (CSV / Excel)
  app.post('/api/v1/files', (req, res) => {
    // In demo environment, generate attachment ref
    const attachmentId = `att_${Date.now()}`;
    const fileName = req.body?.fileName || 'focus_case_list_2026W32.csv';
    res.json({
      attachmentId,
      fileName,
      mimeType: 'text/csv',
      size: 967372,
    });
  });

  // Share Artifact Retrieval
  app.get('/api/v1/shares/:shareId', async (req, res) => {
    const share = await semovix.getShareArtifact(req.params.shareId);
    if (!share) {
      // Return default curated share if not found
      return res.json({
        shareId: req.params.shareId,
        taskId: 'task_default',
        title: '公共服务热线工单按期办结率变化分析 · 精选结果',
        selectedBlockIds: ['blk_01', 'blk_02', 'blk_03', 'blk_04'],
        blocks: [],
        createdAt: new Date().toISOString(),
        accessMode: 'READ_ONLY',
        url: `/share/${req.params.shareId}`,
      });
    }
    res.json(share);
  });

  // Metric semantic definitions
  app.get('/api/v1/metrics/:metricId', async (req, res) => {
    const metric = await semovix.getMetricDefinition(req.params.metricId);
    res.json(metric);
  });

  // ---------------- Vite Middleware / Production Serving ---------------- //
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Semovix Agent Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
