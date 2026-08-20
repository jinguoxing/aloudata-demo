import express from 'express';
import path from 'path';
import crypto from 'node:crypto';
import dotenv from 'dotenv';
import multer from 'multer';
import { createServer as createViteServer } from 'vite';
import { eventHub } from './server/agent/eventHub';
import { taskStore } from './server/agent/taskStore';
import { fileStore } from './server/agent/fileStore';
import { artifactStore } from './server/agent/artifactStore';
import {
  runTurn,
  handleMetricQueryExecute,
  handleScheduleConfirmAction,
} from './server/agent/orchestrator';
import { semovix } from './server/services/mockSemovix';

dotenv.config();

// Multer in-memory storage for file processing
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB
  },
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON Body Parser
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // ---------------- API Routes ---------------- //

  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Create new session & task
  app.post('/api/v1/sessions', (_req, res) => {
    const session = taskStore.createSession();
    res.json({
      sessionId: session.sessionId,
      taskId: session.taskId,
      task: session.task,
    });
  });

  // Get session task (Authoritative Server State)
  app.get('/api/v1/sessions/:sessionId/task', (req, res) => {
    const task = taskStore.getTaskBySessionId(req.params.sessionId);
    if (!task) {
      return res.status(404).json({ error: 'Session not found' });
    }
    res.json(task);
  });

  // Get task by taskId
  app.get('/api/v1/tasks/:taskId', (req, res) => {
    const task = taskStore.getTaskByTaskId(req.params.taskId);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json(task);
  });

  // Submit new turn
  app.post('/api/v1/sessions/:sessionId/turns', async (req, res) => {
    const { sessionId } = req.params;
    const { text, attachments = [] } = req.body;

    const session = taskStore.ensureSession(sessionId);
    const turnId = `turn_${crypto.randomUUID().substring(0, 8)}`;
    const streamUrl = `/api/v1/sessions/${sessionId}/turns/${turnId}/stream`;

    // Bind turn to task in EventHub for real-time task state synchronization
    eventHub.bindTurnToTask(turnId, session.taskId);

    // Record user turn immediately in the server task store
    taskStore.recordUserTurn(sessionId, {
      turnId,
      role: 'user',
      text: text || '',
      attachments,
      blocks: [],
      createdAt: new Date().toISOString(),
    });

    // If attachments present, bind them into server task context
    if (attachments.length > 0) {
      taskStore.updateTaskContext(session.taskId, {
        attachedFiles: attachments,
        hasAttachments: true,
      });
    }

    // Asynchronously orchestrate agent response
    setTimeout(() => {
      runTurn({
        turnId,
        taskId: session.taskId,
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
    }, 80);

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

  // JSON Events endpoint for fallback polling
  app.get('/api/v1/sessions/:sessionId/turns/:turnId/events', (req, res) => {
    const { turnId } = req.params;
    const events = eventHub.getEvents(turnId);
    res.json({ events });
  });

  app.get('/api/v1/turns/:turnId/events', (req, res) => {
    const { turnId } = req.params;
    const events = eventHub.getEvents(turnId);
    res.json({ events });
  });

  // Task Actions (Interactions like selecting metric, confirming schedule, creating share)
  app.post('/api/v1/tasks/:taskId/actions', async (req, res) => {
    const { taskId } = req.params;
    const action = req.body;
    const turnId = `turn_act_${crypto.randomUUID().substring(0, 8)}`;

    // Bind action turn to task for server task synchronization
    eventHub.bindTurnToTask(turnId, taskId);

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
        const selectedBlockIds: string[] = action.payload?.selectedBlockIds || action.payload?.blockIds || [];

        // Retrieve server authoritative task and blocks
        const task = taskStore.getTaskByTaskId(taskId);
        const allBlocks = task ? task.turns.flatMap((t) => t.blocks) : [];

        // Server-side authoritative filter of blocks
        const matchedBlocks = allBlocks.filter((b) => selectedBlockIds.includes(b.blockId));

        const shareableTypes = [
          'metric_answer',
          'evidence_summary',
          'analysis_result',
          'artifact_summary',
          'schedule_created',
          'assistant_message',
        ];

        const finalBlocks = matchedBlocks.filter((b) => shareableTypes.includes(b.type));

        const share = await semovix.createShareArtifact({
          taskId,
          title: action.payload?.title || `${task?.context?.region || '上海市闵行区'}${task?.context?.metricName || '按期办结率'}分析 · 精选结果`,
          selectedBlockIds,
          blocks: finalBlocks,
        });

        // Record share artifact in task context on server
        taskStore.updateTaskContext(taskId, {
          shareArtifact: share,
          shareUrl: share.url,
        });

        return res.json({ success: true, share });
      }

      default:
        return res.status(400).json({ error: 'Unknown action type' });
    }
  });

  // File Upload endpoint (Supports both multipart FormData and JSON demo payload)
  app.post('/api/v1/files', upload.single('file'), (req, res) => {
    try {
      if (req.file) {
        // Real multipart file parsed by multer
        const saved = fileStore.saveFile({
          fileName: req.file.originalname,
          mimeType: req.file.mimetype || 'text/csv',
          size: req.file.size,
          buffer: req.file.buffer,
        });

        return res.json({
          attachmentId: saved.attachmentId,
          fileName: saved.fileName,
          mimeType: saved.mimeType,
          size: saved.size,
          rowCount: saved.rowCount,
          columns: saved.columnNames,
          status: saved.status,
          errorMessage: saved.errorMessage,
          summary: saved.summary,
        });
      }

      // Fallback for JSON body
      const fileName = req.body?.fileName || 'focus_case_list_2026W32.csv';
      const sampleCsv = 'case_id,street_code,appeal_category,is_overdue,duration_days\n1001,SH01,物业管理,1,4.2\n1002,SH02,劳动保障,1,3.8';
      const saved = fileStore.saveFile({
        fileName,
        mimeType: 'text/csv',
        size: sampleCsv.length,
        buffer: Buffer.from(sampleCsv, 'utf-8'),
      });

      res.json({
        attachmentId: saved.attachmentId,
        fileName: saved.fileName,
        mimeType: saved.mimeType,
        size: saved.size,
        rowCount: saved.rowCount,
        columns: saved.columnNames,
        status: saved.status,
        errorMessage: saved.errorMessage,
        summary: saved.summary,
      });
    } catch (err: any) {
      console.error('File upload error:', err);
      res.status(500).json({ error: 'Failed to process file upload' });
    }
  });

  // Share Artifact Retrieval - Server Authoritative 404
  app.get('/api/v1/shares/:shareId', async (req, res) => {
    const share = await semovix.getShareArtifact(req.params.shareId);
    if (!share) {
      return res.status(404).json({
        error: 'Share artifact not found',
        code: 'NOT_FOUND',
        message: '该分享链接不存在或已过期。',
      });
    }
    res.json(share);
  });

  // Metric semantic definitions
  app.get('/api/v1/metrics/:metricId', async (req, res) => {
    const metric = await semovix.getMetricDefinition(req.params.metricId);
    if (!metric) {
      return res.status(404).json({ error: 'Metric not found' });
    }
    res.json(metric);
  });

  // Report Artifact Document retrieval
  app.get('/api/v1/artifacts/:artifactId', (req, res) => {
    const report = artifactStore.getReport(req.params.artifactId);
    if (!report) {
      return res.status(404).json({ error: 'Artifact not found' });
    }
    res.json(report);
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
