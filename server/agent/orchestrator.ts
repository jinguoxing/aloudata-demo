import { GoogleGenAI } from '@google/genai';
import crypto from 'node:crypto';
import { eventHub } from './eventHub';
import { taskStore } from './taskStore';
import { fileStore } from './fileStore';
import { semovix } from '../services/mockSemovix';
import { artifactStore } from './artifactStore';
import { parseSchedule } from './scheduleParser';

let aiClient: GoogleGenAI | null = null;
function getAI(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

const MODEL = process.env.GEMINI_MODEL ?? 'gemini-3.7-flash';

export type Route =
  | 'ASK_METRIC'
  | 'ANALYZE_CAUSE'
  | 'FILE_ANALYSIS'
  | 'CREATE_SCHEDULE'
  | 'SHARE'
  | 'SCOPE_DRILLDOWN'
  | 'TREND_QUERY'
  | 'COMPARE_QUERY'
  | 'SWITCH_METRIC'
  | 'GENERAL';

export function ruleGate(
  text: string,
  hasAttachment: boolean,
  context?: Record<string, any>,
): Route | null {
  if (hasAttachment || /focus_case|清单|csv|上传|附件|这批工单|数据文件/i.test(text)) {
    return 'FILE_ANALYSIS';
  }

  if (/每周|每天|定时|周期|定期|以后每周|每周一|每周五|排程|调度|帮我做一次这个分析/i.test(text)) {
    return 'CREATE_SCHEDULE';
  }

  // Follow-up context queries
  if (/只看七宝|七宝镇|莘庄|只看莘庄|切换到七宝|查看七宝/i.test(text)) {
    return 'SCOPE_DRILLDOWN';
  }

  if (/最近四周|近四周|四周趋势|近一个月|看下趋势|历史趋势/i.test(text)) {
    return 'TREND_QUERY';
  }

  if (/同比呢|同比|对比去年|去年同期/i.test(text)) {
    return 'COMPARE_QUERY';
  }

  if (/换成总体办结率|总体办结率|看下总体办结率|切换指标/i.test(text)) {
    return 'SWITCH_METRIC';
  }

  if (/为什么|原因|归因|下降原因|为何|下钻|怎么回事/i.test(text)) {
    return 'ANALYZE_CAUSE';
  }

  if (/分享|生成链接|分享分析|对外分享/i.test(text)) {
    return 'SHARE';
  }

  if (/办结率|指标|环比|工单|按期|总体办结率|公共服务热线/i.test(text)) {
    return 'ASK_METRIC';
  }

  return null;
}

export async function modelRoute(
  text: string,
  context?: Record<string, any>,
): Promise<Route> {
  const ai = getAI();
  if (!ai) {
    return 'GENERAL';
  }

  try {
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: `
你是 Semovix 语义工作台意图识别器。结合当前上下文判断用户意图：
当前任务指标：${context?.metricName || '按期办结率'}
当前区域范围：${context?.region || '上海市闵行区'}

可选枚举：
- ASK_METRIC (基本指标查询)
- ANALYZE_CAUSE (归因分析、原因诊断)
- FILE_ANALYSIS (工单清单附件分析)
- CREATE_SCHEDULE (建立周期定时任务)
- SHARE (生成分享)
- SCOPE_DRILLDOWN (下钻街镇区域，如只看七宝镇)
- TREND_QUERY (看近四周趋势)
- COMPARE_QUERY (同比查询)
- SWITCH_METRIC (切换指标为总体办结率等)
- GENERAL (其他问答)

用户输入：${text}
仅输出上述枚举中的一个，不要多余字符。
`,
    });

    const candidate = response.text?.trim() as Route;
    const allowed: Route[] = [
      'ASK_METRIC',
      'ANALYZE_CAUSE',
      'FILE_ANALYSIS',
      'CREATE_SCHEDULE',
      'SHARE',
      'SCOPE_DRILLDOWN',
      'TREND_QUERY',
      'COMPARE_QUERY',
      'SWITCH_METRIC',
      'GENERAL',
    ];

    return allowed.includes(candidate) ? candidate : 'GENERAL';
  } catch (err) {
    console.warn('Gemini intent resolver skipped, defaulting:', err);
    return 'GENERAL';
  }
}

// ---------------- Handlers ---------------- //

export async function handleMetricDisambiguation(turnId: string, taskId: string) {
  const candidates = await semovix.resolveMetrics('按期办结率');
  const recommendedMetric = candidates.find((c) => c.isRecommended) || candidates[0];
  const blockId = `blk_${crypto.randomUUID().substring(0, 8)}`;

  taskStore.updateTaskContext(taskId, {
    recommendedMetricId: recommendedMetric?.id,
    pendingDecision: {
      type: 'METRIC_RESOLUTION',
      turnId,
      blockId,
    },
  });

  eventHub.publish(turnId, {
    type: 'task.updated',
    patch: {
      stage: 'METRIC_RESOLUTION',
      status: 'WAITING_USER',
      title: '公共服务热线工单按期办结率分析',
      context: {
        recommendedMetricId: recommendedMetric?.id,
        pendingDecision: {
          type: 'METRIC_RESOLUTION',
          turnId,
          blockId,
        },
      },
    },
  });

  eventHub.publish(turnId, {
    type: 'decision.required',
    turnId,
    block: {
      blockId,
      type: 'metric_disambiguation',
      status: 'PENDING',
      payload: {
        title: '找到 3 个相关正式指标，请确认本次使用的业务口径',
        candidates,
        recommendedMetricId: recommendedMetric?.id,
        selectedMetricId: undefined,
        resolutionStatus: 'PENDING',
      },
      createdAt: new Date().toISOString(),
    },
  });
}

export async function handleMetricQueryExecute(
  turnId: string,
  taskId: string,
  metricId: string,
  options?: {
    region?: string;
    scope?: string;
    timeRange?: string;
    compareType?: 'wow' | 'yoy';
  },
) {
  const task = taskStore.getTaskByTaskId(taskId);
  const region =
    options?.region ||
    options?.scope ||
    task?.context?.region ||
    (typeof task?.context?.scope === 'string'
      ? task.context.scope
      : task?.context?.scope?.region) ||
    '上海市闵行区';
  const timeRange =
    options?.timeRange ||
    (typeof task?.context?.timeRange === 'string'
      ? task.context.timeRange
      : task?.context?.timeRange?.label) ||
    '上周 (2026W32)';
  const compareType = options?.compareType || (typeof task?.context?.compareType === 'string' ? task.context.compareType : 'wow');

  // If there was a pending metric disambiguation decision, resolve and freeze it
  const pending = task?.context?.pendingDecision;
  if (pending?.type === 'METRIC_RESOLUTION' && pending.blockId && pending.turnId) {
    const existingBlock = taskStore.getBlock(taskId, pending.turnId, pending.blockId);
    if (existingBlock) {
      eventHub.publish(pending.turnId, {
        type: 'block.updated',
        turnId: pending.turnId,
        blockId: pending.blockId,
        patch: {
          status: 'DONE',
          payload: {
            ...existingBlock.payload,
            selectedMetricId: metricId,
            resolutionStatus: 'RESOLVED',
          },
        },
      });
    }
  }

  const queryResult = await semovix.queryMetric(metricId, {
    region,
    timeRange,
    compareType,
  });

  const metricDef = await semovix.getMetricDefinition(metricId);

  taskStore.updateTaskContext(taskId, {
    metricId: queryResult.metricId,
    metricName: queryResult.metricName,
    region,
    scope: region,
    timeRange,
    compareType,
    metricDefinition: metricDef,
    metricSnapshot: queryResult,
    pendingDecision: undefined,
  });

  eventHub.publish(turnId, {
    type: 'task.updated',
    patch: {
      stage: 'METRIC_RESOLUTION',
      status: 'OPEN',
      context: {
        metricId: queryResult.metricId,
        metricName: queryResult.metricName,
        region,
        scope: region,
        timeRange,
        compareType,
        metricDefinition: metricDef,
        metricSnapshot: queryResult,
        pendingDecision: undefined,
      },
    },
  });

  const periodLabel =
    (typeof timeRange === 'string' ? timeRange : (timeRange as any)?.label) || '上周';
  const scopeLabel =
    region ||
    (typeof task?.context?.scope === 'string'
      ? task.context.scope
      : task?.context?.scope?.streetTown || task?.context?.scope?.region) ||
    '当前业务范围';
  const comparisonText = queryResult.table?.[0]?.wow ? `较上期 ${queryResult.table[0].wow}` : '';

  eventHub.publish(turnId, {
    type: 'block.created',
    turnId,
    block: {
      blockId: `blk_${crypto.randomUUID().substring(0, 8)}`,
      type: 'metric_answer',
      status: 'DONE',
      payload: {
        metricName: queryResult.metricName,
        headlineValue: queryResult.headlineValue,
        headlineHighlight: queryResult.headlineHighlight,
        periodLabel,
        scopeLabel,
        comparisonText,
        table: queryResult.table,
        summaryNote: queryResult.summaryNote,
        metricId: queryResult.metricId,
      },
      createdAt: new Date().toISOString(),
    },
  });
}

export async function handleDiagnosis(turnId: string, taskId: string) {
  const task = taskStore.getTaskByTaskId(taskId);
  const region =
    task?.context?.region ||
    (typeof task?.context?.scope === 'string'
      ? task.context.scope
      : task?.context?.scope?.region) ||
    '上海市闵行区';
  const metricName = task?.context?.metricName || '按期办结率';

  eventHub.publish(turnId, {
    type: 'task.updated',
    patch: {
      stage: 'ANALYSIS',
      status: 'RUNNING',
    },
  });

  // Step-by-step progress steps
  const stepsDefinition = [
    { title: `查询${region}正式指标与基线数据`, tag: 'Metric Query' },
    { title: '按街镇空间维度拆解超期增量', tag: 'Dimension Analysis' },
    { title: '按诉求业务类型分析平均办理时长', tag: 'Dimension Analysis' },
    { title: '定位跨部门协同流转瓶颈与延期环节', tag: 'Detail Analysis' },
    { title: '多维交叉归因综合推导与可信度校核', tag: 'Synthesis' },
  ];

  const progressBlockId = `blk_${crypto.randomUUID().substring(0, 8)}`;

  // 1. Publish initial progress block with Step 0 RUNNING, others PENDING
  eventHub.publish(turnId, {
    type: 'block.created',
    turnId,
    block: {
      blockId: progressBlockId,
      type: 'execution_progress',
      status: 'RUNNING',
      payload: {
        title: '智能探查归因分析过程',
        steps: stepsDefinition.map((s, idx) => ({
          title: s.title,
          tag: s.tag,
          status: idx === 0 ? 'RUNNING' : 'PENDING',
        })),
      },
      createdAt: new Date().toISOString(),
    },
  });

  // Helper for pause
  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  // Step through intermediate states
  for (let i = 0; i < stepsDefinition.length; i++) {
    await sleep(200);
    const updatedSteps = stepsDefinition.map((s, idx) => ({
      title: s.title,
      tag: s.tag,
      status: idx < i ? 'DONE' : idx === i ? 'RUNNING' : 'PENDING',
    }));

    eventHub.publish(turnId, {
      type: 'block.updated',
      turnId,
      blockId: progressBlockId,
      patch: {
        status: 'RUNNING',
        payload: {
          title: '智能探查归因分析过程',
          steps: updatedSteps,
        },
      },
    });
  }

  await sleep(150);

  // Mark all steps DONE
  eventHub.publish(turnId, {
    type: 'block.updated',
    turnId,
    blockId: progressBlockId,
    patch: {
      status: 'DONE',
      payload: {
        title: '智能探查归因分析过程',
        steps: stepsDefinition.map((s) => ({
          title: s.title,
          tag: s.tag,
          status: 'DONE',
        })),
      },
    },
  });

  // Run business diagnosis
  const { diagnosis, reportDocument } = await semovix.runDiagnosis({
    taskId,
    region,
    metricName,
  });

  // Save report document into ArtifactStore
  artifactStore.saveReport(reportDocument);

  // 2. Evidence summary block
  eventHub.publish(turnId, {
    type: 'block.created',
    turnId,
    block: {
      blockId: `blk_${crypto.randomUUID().substring(0, 8)}`,
      type: 'evidence_summary',
      status: 'DONE',
      payload: {
        title: diagnosis.title,
        factors: diagnosis.factors,
        evidenceTable: diagnosis.evidenceTable,
        pendingNote: diagnosis.pendingNote,
      },
      createdAt: new Date().toISOString(),
    },
  });

  // 3. Artifact summary block
  eventHub.publish(turnId, {
    type: 'artifact.ready',
    artifactId: reportDocument.artifactId,
    turnId,
    block: {
      blockId: `blk_${crypto.randomUUID().substring(0, 8)}`,
      type: 'artifact_summary',
      status: 'DONE',
      payload: {
        ...diagnosis.reportArtifact,
        artifactId: reportDocument.artifactId,
        reportDocument,
      },
      createdAt: new Date().toISOString(),
    },
  });

  taskStore.updateTaskContext(taskId, {
    latestReportId: reportDocument.artifactId,
    latestReportDocument: reportDocument,
  });

  eventHub.publish(turnId, {
    type: 'task.updated',
    patch: {
      stage: 'ANALYSIS',
      status: 'OPEN',
      context: {
        latestReportId: reportDocument.artifactId,
        latestReportDocument: reportDocument,
      },
    },
  });
}

export async function handleFileAnalysis(
  turnId: string,
  taskId: string,
  attachments: { attachmentId: string; fileName: string; size?: number }[],
) {
  eventHub.publish(turnId, {
    type: 'task.updated',
    patch: {
      stage: 'FILE_ENRICHMENT',
      status: 'RUNNING',
    },
  });

  const attachment = attachments[0];
  const fileRecord = attachment?.attachmentId
    ? fileStore.getFile(attachment.attachmentId)
    : undefined;

  const fileName = fileRecord?.fileName || attachment?.fileName || 'focus_case_list_2026W32.csv';

  // Check file parse status: Strict validation without fabrication
  if (!fileRecord || fileRecord.status !== 'SUCCESS') {
    const errorReason =
      fileRecord?.errorMessage ||
      (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')
        ? '目前只正式支持 CSV / TXT 格式，XLSX 暂不支持，请导出为 CSV 后重试。'
        : '未能识别有效的文件结构或缺少工单标识字段（如 case_id / 工单编号）。');

    eventHub.publish(turnId, {
      type: 'block.created',
      turnId,
      block: {
        blockId: `blk_${crypto.randomUUID().substring(0, 8)}`,
        type: 'file_semantic_binding',
        status: 'DONE',
        payload: {
          fileName,
          fileSizeText: fileRecord?.size ? `${((fileRecord.size) / 1024).toFixed(1)} KB` : '—',
          bindings: [],
          summary: `❌ ${errorReason}`,
        },
        createdAt: new Date().toISOString(),
      },
    });

    eventHub.publish(turnId, {
      type: 'block.created',
      turnId,
      block: {
        blockId: `blk_${crypto.randomUUID().substring(0, 8)}`,
        type: 'assistant_message',
        status: 'DONE',
        payload: {
          text: `⚠️ 数据文件解析未通过：${errorReason} 请检查并重新上传包含有效工单列的 CSV 文件。`,
        },
        createdAt: new Date().toISOString(),
      },
    });

    eventHub.publish(turnId, {
      type: 'task.updated',
      patch: {
        stage: 'FILE_ENRICHMENT',
        status: 'WAITING_USER',
      },
    });
    return;
  }

  const rowCount = fileRecord.rowCount;
  const columns = fileRecord.columnNames;

  const sizeNumber = fileRecord.size;
  const fileSizeText =
    sizeNumber > 1024 * 1024
      ? `${(sizeNumber / (1024 * 1024)).toFixed(1)} MB`
      : `${(sizeNumber / 1024).toFixed(1)} KB`;

  // Semantic column mappings
  const bindings = [
    {
      sourceColumn: columns[0] || 'case_id',
      mappedConcept: '工单标识 (Service Case ID)',
      description: '主键映射，与企业认证服务工单数据建立主键级比对',
    },
    {
      sourceColumn: columns[1] || 'street_code',
      mappedConcept: '街镇编码 / 区域维度 (Street Code)',
      description: '空间维度映射至闵行区行政区划，校核下辖街镇分布',
    },
    {
      sourceColumn: columns[2] || 'appeal_category',
      mappedConcept: '诉求分类 (Category / Sub-category)',
      description: '业务标签映射，用于物业、劳动保障细分交叉分析',
    },
  ];

  // 1. File Semantic Binding Block
  eventHub.publish(turnId, {
    type: 'block.created',
    turnId,
    block: {
      blockId: `blk_${crypto.randomUUID().substring(0, 8)}`,
      type: 'file_semantic_binding',
      status: 'DONE',
      payload: {
        fileName,
        fileSizeText,
        bindings,
        summary:
          fileRecord.summary ||
          `已通过元数据语义识别并建立字段映射，成功解析 ${rowCount.toLocaleString()} 行工单数据，支持临时数据与企业正式数据协同计算。`,
      },
      createdAt: new Date().toISOString(),
    },
  });

  // 2. Python Tool Execution
  const pythonResult = await semovix.executePythonAnalysis({
    fileName,
    rowCount,
    columnNames: columns,
  });

  eventHub.publish(turnId, {
    type: 'block.created',
    turnId,
    block: {
      blockId: `blk_${crypto.randomUUID().substring(0, 8)}`,
      type: 'tool_execution',
      status: 'DONE',
      payload: pythonResult,
      createdAt: new Date().toISOString(),
    },
  });

  // 3. Analysis Comparative Result Block
  eventHub.publish(turnId, {
    type: 'block.created',
    turnId,
    block: {
      blockId: `blk_${crypto.randomUUID().substring(0, 8)}`,
      type: 'analysis_result',
      status: 'DONE',
      payload: {
        headline: '重点关注工单确实放大了本周办结率下降',
        stats: [
          {
            label: '重点清单工单数',
            value: `${rowCount.toLocaleString()} 件`,
            theme: 'neutral',
          },
          {
            label: '重点工单超期率',
            value: '22.4%',
            subtext: 'vs 全量 13.6%',
            theme: 'rose',
          },
          {
            label: '对新增超期的贡献',
            value: '31.8%',
            theme: 'blue',
          },
        ],
        table: pythonResult.comparativeAnalysis,
      },
      createdAt: new Date().toISOString(),
    },
  });

  taskStore.updateTaskContext(taskId, {
    latestExecutionId: pythonResult.executionId,
    lastAnalysisRows: rowCount,
  });

  eventHub.publish(turnId, {
    type: 'task.updated',
    patch: {
      stage: 'FILE_ENRICHMENT',
      status: 'OPEN',
      context: {
        latestExecutionId: pythonResult.executionId,
      },
    },
  });
}

export async function handleSchedulePlan(
  turnId: string,
  taskId: string,
  userText: string,
) {
  const task = taskStore.getTaskByTaskId(taskId);
  const metric = task?.context?.metricName || '按期办结率';
  const region = task?.context?.region || '上海市闵行区';

  const parsed = parseSchedule(userText, metric, region);

  // Store parsed draft schedule in task context
  taskStore.updateTaskContext(taskId, {
    scheduleDraft: parsed,
  });

  eventHub.publish(turnId, {
    type: 'task.updated',
    patch: {
      stage: 'SCHEDULE_CONFIRM',
      status: 'WAITING_USER',
      context: {
        scheduleDraft: parsed,
      },
    },
  });

  // If missing slots, also add assistant message to clearly prompt user
  if (!parsed.isValid) {
    eventHub.publish(turnId, {
      type: 'block.created',
      turnId,
      block: {
        blockId: `blk_${crypto.randomUUID().substring(0, 8)}`,
        type: 'assistant_message',
        status: 'DONE',
        payload: {
          text: `⚠️ 已识别到调度意图，但缺少：【${parsed.missingSlots.join('、')}】。请在对话框中补充具体时间（如“每周五下午3点”或“每周一上午9点”）。`,
        },
        createdAt: new Date().toISOString(),
      },
    });
  }

  // Publish Decision Required schedule plan block
  eventHub.publish(turnId, {
    type: 'decision.required',
    turnId,
    block: {
      blockId: `blk_${crypto.randomUUID().substring(0, 8)}`,
      type: 'schedule_plan',
      status: 'PENDING',
      payload: {
        taskName: parsed.taskName,
        frequency: parsed.frequency,
        weekday: parsed.weekday,
        time: parsed.time,
        timezone: parsed.timezone,
        metric,
        region,
        missingSlots: parsed.missingSlots,
        steps: [
          `查询${metric}及环比基线指标`,
          '按街镇、诉求类型、部门三维下钻拆解',
          '自动融合当期最新重点工单清单',
          '生成 HTML 分析周报及预警摘要',
        ],
      },
      createdAt: new Date().toISOString(),
    },
  });
}

export async function handleScheduleConfirmAction(
  turnId: string,
  taskId: string,
  payload?: any,
) {
  const task = taskStore.getTaskByTaskId(taskId);
  const draft = task?.context?.scheduleDraft;

  const scheduleParams = {
    taskName: payload?.taskName || draft?.taskName || `${task?.context?.region || '上海市闵行区'}公共服务热线${task?.context?.metricName || '按期办结率'}周度监测与归因`,
    frequency: payload?.frequency || draft?.frequency || '每周一 09:00',
    time: payload?.time || draft?.time || '09:00',
    weekday: payload?.weekday ?? draft?.weekday ?? 1,
    timezone: draft?.timezone || 'Asia/Shanghai',
    region: task?.context?.region || '上海市闵行区',
    metric: task?.context?.metricName || '按期办结率',
  };

  const schedule = await semovix.createSchedule(scheduleParams);

  taskStore.updateTaskContext(taskId, {
    scheduleConfig: schedule,
  });

  // Keep task status OPEN so user can continue interacting
  eventHub.publish(turnId, {
    type: 'task.updated',
    patch: {
      stage: 'SCHEDULED',
      status: 'OPEN',
      context: {
        scheduleConfig: schedule,
      },
    },
  });

  eventHub.publish(turnId, {
    type: 'block.created',
    turnId,
    block: {
      blockId: `blk_${crypto.randomUUID().substring(0, 8)}`,
      type: 'schedule_created',
      status: 'DONE',
      payload: schedule,
      createdAt: new Date().toISOString(),
    },
  });
}

// ---------------- Master Turn Orchestrator ---------------- //

export async function runTurn(params: {
  turnId: string;
  taskId: string;
  text: string;
  attachments: {
    attachmentId: string;
    fileName: string;
    mimeType: string;
    size?: number;
  }[];
}) {
  const { turnId, taskId, text, attachments } = params;
  const task = taskStore.getTaskByTaskId(taskId);
  const context = task?.context || {};

  // Publish turn.started
  eventHub.publish(turnId, {
    type: 'turn.started',
    turn: {
      turnId,
      role: 'user',
      text,
      attachments,
      blocks: [],
      createdAt: new Date().toISOString(),
    },
  });

  const route =
    ruleGate(text, attachments.length > 0, context) ??
    (await modelRoute(text, context));

  switch (route) {
    case 'ASK_METRIC':
      await handleMetricDisambiguation(turnId, taskId);
      break;

    case 'SCOPE_DRILLDOWN': {
      const region = text.includes('七宝') ? '七宝镇' : '莘庄镇';
      await handleMetricQueryExecute(turnId, taskId, context.metricId || 'metric_on_time_rate', {
        region,
        scope: region,
      });
      break;
    }

    case 'TREND_QUERY': {
      await handleMetricQueryExecute(turnId, taskId, context.metricId || 'metric_on_time_rate', {
        timeRange: '最近四周',
      });
      break;
    }

    case 'COMPARE_QUERY': {
      await handleMetricQueryExecute(turnId, taskId, context.metricId || 'metric_on_time_rate', {
        compareType: 'yoy',
      });
      break;
    }

    case 'SWITCH_METRIC': {
      await handleMetricQueryExecute(turnId, taskId, 'metric_total_completion_rate');
      break;
    }

    case 'ANALYZE_CAUSE':
      await handleDiagnosis(turnId, taskId);
      break;

    case 'FILE_ANALYSIS':
      await handleFileAnalysis(turnId, taskId, attachments);
      break;

    case 'CREATE_SCHEDULE':
      await handleSchedulePlan(turnId, taskId, text);
      break;

    case 'SHARE':
      eventHub.publish(turnId, {
        type: 'task.updated',
        patch: {
          stage: 'SHARE',
          status: 'WAITING_USER',
        },
      });
      eventHub.publish(turnId, {
        type: 'block.created',
        turnId,
        block: {
          blockId: `blk_${crypto.randomUUID().substring(0, 8)}`,
          type: 'share_selection',
          status: 'PENDING',
          payload: {
            title: '选择需要分享的分析内容',
          },
          createdAt: new Date().toISOString(),
        },
      });
      break;

    default: {
      eventHub.publish(turnId, {
        type: 'block.created',
        turnId,
        block: {
          blockId: `blk_${crypto.randomUUID().substring(0, 8)}`,
          type: 'assistant_message',
          status: 'DONE',
          payload: {
            text:
              '我已收到您的提问。您可以问我“上周公共服务热线工单按期办结率如何？”、“为什么下降了？”、“只看七宝镇”、上传重点工单清单 CSV，或让我“每周五下午3点帮我做一次这个分析”。',
          },
          createdAt: new Date().toISOString(),
        },
      });
      break;
    }
  }

  eventHub.publish(turnId, {
    type: 'turn.completed',
    turnId,
  });
}
