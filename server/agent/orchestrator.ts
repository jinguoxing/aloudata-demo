import { GoogleGenAI } from '@google/genai';
import crypto from 'node:crypto';
import { eventHub } from './eventHub';
import { taskStore } from './taskStore';
import { fileStore } from './fileStore';
import { semovix } from '../services/mockSemovix';
import { AgentTask, TaskAction, AgentEvent } from '../../src/agent/contracts';

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
  | 'GENERAL';

export function ruleGate(text: string, hasAttachment: boolean): Route | null {
  if (hasAttachment || /focus_case|清单|csv|上传|附件|这批工单/i.test(text)) {
    return 'FILE_ANALYSIS';
  }

  if (/每周|每天|定时|周期|定期|以后每周|每周一|排程|调度/i.test(text)) {
    return 'CREATE_SCHEDULE';
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

export async function modelRoute(text: string): Promise<Route> {
  const ai = getAI();
  if (!ai) {
    return 'GENERAL';
  }

  try {
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: `
你是 Semovix AI 智能语义工作台 Intent Resolver。
请判断用户输入当前需要推进哪种任务类型：

可选枚举：
- ASK_METRIC (查询指标、工单办结率等基本问数)
- ANALYZE_CAUSE (归因诊断、原因分析、为什么下降)
- FILE_ANALYSIS (上传或结合 CSV 重点工单附件做融合计算分析)
- CREATE_SCHEDULE (建立周期调度任务、每周自动化分析)
- SHARE (生成精选分析分享链接)
- GENERAL (通用助手问答)

用户输入：
${text}

仅输出上述其中一个枚举字符串，不要包含任何其他文字或标点。
`,
    });

    const candidate = response.text?.trim() as Route;
    const allowed: Route[] = [
      'ASK_METRIC',
      'ANALYZE_CAUSE',
      'FILE_ANALYSIS',
      'CREATE_SCHEDULE',
      'SHARE',
      'GENERAL',
    ];

    return allowed.includes(candidate) ? candidate : 'GENERAL';
  } catch (err) {
    console.warn('Gemini intent resolver skipped, defaulting:', err);
    return 'GENERAL';
  }
}

// ---------------- Task Handlers ---------------- //

export async function handleMetricDisambiguation(turnId: string, _taskId: string) {
  const candidates = await semovix.resolveMetrics('按期办结率');

  eventHub.publish(turnId, {
    type: 'task.updated',
    patch: {
      stage: 'METRIC_RESOLUTION',
      status: 'WAITING_USER',
      title: '公共服务热线工单按期办结率分析',
    },
  });

  eventHub.publish(turnId, {
    type: 'decision.required',
    turnId,
    block: {
      blockId: `blk_${crypto.randomUUID().substring(0, 8)}`,
      type: 'metric_disambiguation',
      status: 'PENDING',
      payload: {
        title: '找到 2 个相关正式指标，请确认本次使用口径',
        candidates,
        selectedMetricId: 'metric_on_time_rate',
      },
      createdAt: new Date().toISOString(),
    },
  });
}

export async function handleMetricQueryExecute(
  turnId: string,
  taskId: string,
  metricId: string,
) {
  const queryResult = await semovix.queryMetric(metricId);

  eventHub.publish(turnId, {
    type: 'task.updated',
    patch: {
      stage: 'METRIC_RESOLUTION',
      status: 'OPEN',
      context: {
        metricId: queryResult.metricId,
        metricName: queryResult.metricName,
      },
    },
  });

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
        table: queryResult.table,
        summaryNote: queryResult.summaryNote,
        metricId: queryResult.metricId,
      },
      createdAt: new Date().toISOString(),
    },
  });
}

export async function handleDiagnosis(turnId: string, _taskId: string) {
  eventHub.publish(turnId, {
    type: 'task.updated',
    patch: {
      stage: 'ANALYSIS',
      status: 'RUNNING',
    },
  });

  // 1. Progress Step Block
  eventHub.publish(turnId, {
    type: 'block.created',
    turnId,
    block: {
      blockId: `blk_${crypto.randomUUID().substring(0, 8)}`,
      type: 'execution_progress',
      status: 'DONE',
      payload: {
        title: '智能探查归因分析过程',
        steps: [
          { title: '查询正式指标', tag: 'Metric Query', status: 'DONE' },
          { title: '按街镇拆解', tag: 'Dimension Analysis', status: 'DONE' },
          { title: '按诉求类型拆解', tag: 'Dimension Analysis', status: 'DONE' },
          { title: '分析超期工单变化', tag: 'Detail Analysis', status: 'DONE' },
          { title: '比较承办部门办理时长', tag: 'Query', status: 'DONE' },
          { title: '综合形成诊断结论', tag: 'Analysis', status: 'DONE' },
        ],
      },
      createdAt: new Date().toISOString(),
    },
  });

  const diagnosis = await semovix.runDiagnosis({});

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
    artifactId: diagnosis.reportArtifact.artifactId,
    turnId,
    block: {
      blockId: `blk_${crypto.randomUUID().substring(0, 8)}`,
      type: 'artifact_summary',
      status: 'DONE',
      payload: diagnosis.reportArtifact,
      createdAt: new Date().toISOString(),
    },
  });

  eventHub.publish(turnId, {
    type: 'task.updated',
    patch: {
      status: 'OPEN',
      context: {
        latestReportId: diagnosis.reportArtifact.artifactId,
      },
    },
  });
}

export async function handleFileAnalysis(
  turnId: string,
  _taskId: string,
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

  const fileName =
    fileRecord?.fileName || attachment?.fileName || 'focus_case_list_2026W32.csv';

  const sizeNumber = fileRecord?.size || attachment?.size || 967372;
  const fileSizeText =
    sizeNumber > 1024 * 1024
      ? `${(sizeNumber / (1024 * 1024)).toFixed(1)} MB`
      : `${(sizeNumber / 1024).toFixed(1)} KB`;

  const rowCount = fileRecord?.rowCount || 4094;
  const columns = fileRecord?.columnNames || [
    'case_id',
    'street_code',
    'appeal_category',
    'is_overdue',
    'duration_days',
  ];

  // Dynamic semantic bindings based on columns detected
  const bindings = [
    {
      sourceColumn: columns[0] || 'case_id',
      mappedConcept: '工单标识 (Service Case ID)',
      description: '主键映射，与认证服务工单数据建立主键级比对',
    },
    {
      sourceColumn: columns[1] || 'street_code',
      mappedConcept: '街镇编码 / 区域维度 (Street / Area Code)',
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
          fileRecord?.summary ||
          `已通过元数据语义识别并建立字段映射，成功解析 ${rowCount.toLocaleString()} 行工单数据，支持临时数据与企业正式数据协同计算。`,
      },
      createdAt: new Date().toISOString(),
    },
  });

  // 2. Python Tool Execution
  const pythonResult = await semovix.executePythonAnalysis(fileName);

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

  eventHub.publish(turnId, {
    type: 'task.updated',
    patch: {
      status: 'OPEN',
      context: {
        latestExecutionId: pythonResult.executionId,
      },
    },
  });
}

export async function handleSchedulePlan(turnId: string, _taskId: string) {
  eventHub.publish(turnId, {
    type: 'task.updated',
    patch: {
      stage: 'SCHEDULE_CONFIRM',
      status: 'WAITING_USER',
    },
  });

  eventHub.publish(turnId, {
    type: 'decision.required',
    turnId,
    block: {
      blockId: `blk_${crypto.randomUUID().substring(0, 8)}`,
      type: 'schedule_plan',
      status: 'PENDING',
      payload: {
        taskName: '公共服务热线按期办结率周度监测与归因',
        frequency: '每周一 09:00',
        weekday: 1,
        time: '09:00',
        timezone: 'Asia/Shanghai',
        metric: '按期办结率',
        region: '上海市闵行区',
        steps: [
          '查询按期办结率及环比指标',
          '按街镇、诉求类型、部门三维拆解',
          '自动融合当周最新重点工单清单',
          '生成 HTML 分析周报及预警摘要',
        ],
      },
      createdAt: new Date().toISOString(),
    },
  });
}

export async function handleScheduleConfirmAction(
  turnId: string,
  _taskId: string,
  payload?: any,
) {
  const schedule = await semovix.createSchedule(payload);

  eventHub.publish(turnId, {
    type: 'task.updated',
    patch: {
      stage: 'SCHEDULED',
      status: 'COMPLETED',
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
    ruleGate(text, attachments.length > 0) ?? (await modelRoute(text));

  switch (route) {
    case 'ASK_METRIC':
      await handleMetricDisambiguation(turnId, taskId);
      break;

    case 'ANALYZE_CAUSE':
      await handleDiagnosis(turnId, taskId);
      break;

    case 'FILE_ANALYSIS':
      await handleFileAnalysis(turnId, taskId, attachments);
      break;

    case 'CREATE_SCHEDULE':
      await handleSchedulePlan(turnId, taskId);
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
              '我已收到您的提问。您可以问我“上周公共服务热线工单按期办结率如何？”、“为什么下降了？”、上传重点工单清单 CSV，或让我“每周一帮我做一次这个分析”。',
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
