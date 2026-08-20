export type TaskStatus =
  | 'OPEN'
  | 'RUNNING'
  | 'WAITING_USER'
  | 'VERIFYING'
  | 'COMPLETED'
  | 'FAILED';

export type TaskStage =
  | 'ASK_DATA'
  | 'METRIC_RESOLUTION'
  | 'ANALYSIS'
  | 'FILE_ENRICHMENT'
  | 'SCHEDULE_CONFIRM'
  | 'SCHEDULED'
  | 'SHARE';

export type BlockType =
  | 'assistant_message'
  | 'metric_disambiguation'
  | 'metric_answer'
  | 'execution_progress'
  | 'evidence_summary'
  | 'file_semantic_binding'
  | 'tool_execution'
  | 'analysis_result'
  | 'artifact_summary'
  | 'schedule_plan'
  | 'schedule_created'
  | 'share_selection'
  | 'error_notice';

export interface AgentBlock<T = any> {
  blockId: string;
  type: BlockType;
  status?: 'PENDING' | 'RUNNING' | 'DONE' | 'FAILED';
  payload: T;
  createdAt: string;
}

export interface Turn {
  turnId: string;
  role: 'user' | 'assistant';
  text?: string;
  attachments?: AttachmentRef[];
  blocks: AgentBlock[];
  createdAt: string;
}

export interface AttachmentRef {
  attachmentId: string;
  fileName: string;
  mimeType: string;
  size?: number;
}

export interface TaskContext {
  region?: string;
  metricId?: string;
  metricName?: string;
  businessObjects?: string[];
  resourceIds?: string[];
  attachmentIds?: string[];
  selectedMetricOption?: 'on_time' | 'total';
  latestReportId?: string;
  latestExecutionId?: string;
}

export interface AgentTask {
  sessionId: string;
  taskId: string;
  title: string;
  status: TaskStatus;
  stage: TaskStage;
  context: TaskContext;
  turns: Turn[];
  artifactIds: string[];
}

export type AgentEvent =
  | {
      type: 'turn.started';
      turn: Turn;
    }
  | {
      type: 'block.created';
      turnId: string;
      block: AgentBlock;
    }
  | {
      type: 'block.updated';
      turnId: string;
      blockId: string;
      patch: Partial<AgentBlock>;
    }
  | {
      type: 'task.updated';
      patch: Partial<AgentTask>;
    }
  | {
      type: 'decision.required';
      turnId: string;
      block: AgentBlock;
    }
  | {
      type: 'artifact.ready';
      artifactId: string;
      turnId: string;
      block: AgentBlock;
    }
  | {
      type: 'turn.completed';
      turnId: string;
    }
  | {
      type: 'turn.failed';
      turnId: string;
      message: string;
    };

export type TaskAction =
  | {
      actionType: 'SELECT_METRIC';
      payload: {
        metricId: string;
        metricName?: string;
      };
    }
  | {
      actionType: 'TRIGGER_DIAGNOSIS';
      payload?: {
        reason?: string;
      };
    }
  | {
      actionType: 'CONFIRM_SCHEDULE';
      payload?: {
        taskName?: string;
        frequency?: string;
        time?: string;
      };
    }
  | {
      actionType: 'CREATE_SHARE';
      payload: {
        blockIds: string[];
      };
    };

export interface ShareArtifact {
  shareId: string;
  taskId: string;
  title: string;
  selectedBlockIds: string[];
  blocks: AgentBlock[];
  createdAt: string;
  accessMode: 'READ_ONLY';
  url: string;
}

// Detailed Block Payload Contracts
export interface MetricCandidate {
  id: string;
  name: string;
  definition: string;
  isRecommended?: boolean;
  tag?: string;
}

export interface MetricDisambiguationPayload {
  title: string;
  candidates: MetricCandidate[];
  selectedMetricId?: string;
}

export interface MetricTableRow {
  name: string;
  current: string;
  wow: string;
  highlight?: boolean;
}

export interface MetricAnswerPayload {
  metricName: string;
  headlineValue: string;
  headlineHighlight: string;
  table: MetricTableRow[];
  summaryNote: string;
  metricId: string;
}

export interface ExecutionProgressStep {
  title: string;
  tag: string;
  status: 'PENDING' | 'RUNNING' | 'DONE';
}

export interface ExecutionProgressPayload {
  title: string;
  steps: ExecutionProgressStep[];
}

export interface DiagnosticEvidenceItem {
  factor: string;
  weeklyChange: string;
  impactLevel: '高' | '中高' | '中' | '低' | '待判断';
  status: '已验证' | '证据不足';
}

export interface EvidenceSummaryPayload {
  title: string;
  factors: {
    title: string;
    description: string;
  }[];
  evidenceTable: DiagnosticEvidenceItem[];
  pendingNote: string;
}

export interface FileSemanticBindingPayload {
  fileName: string;
  fileSizeText: string;
  bindings: {
    sourceColumn: string;
    mappedConcept: string;
    description: string;
  }[];
  summary: string;
}

export interface ToolExecutionPayload {
  executionId: string;
  tool: 'python' | 'sql_query' | 'metric_engine';
  status: 'RUNNING' | 'SUCCEEDED' | 'FAILED';
  code: string;
  startedAt: string;
  endedAt?: string;
  logs?: string[];
  outputs: {
    matchedRows?: number;
    focusOverdueRate?: number;
    overallOverdueRate?: number;
    contributionRate?: number;
    [key: string]: any;
  };
}

export interface ComparativeGroupMetric {
  group: string;
  count: number;
  overdueRate: string;
  mainArea: string;
}

export interface AnalysisResultPayload {
  headline: string;
  stats: {
    label: string;
    value: string;
    subtext?: string;
    theme?: 'neutral' | 'rose' | 'blue';
  }[];
  table: ComparativeGroupMetric[];
}

export interface ArtifactSummaryPayload {
  artifactId: string;
  title: string;
  type: string;
  description: string;
  fileFormat: 'HTML' | 'PDF' | 'EXCEL';
  previewAvailable: boolean;
}

export interface SchedulePlanStep {
  text: string;
}

export interface SchedulePlanPayload {
  taskName: string;
  frequency: string;
  weekday: number;
  time: string;
  timezone: string;
  metric: string;
  region: string;
  steps: string[];
}

export interface ScheduleCreatedPayload {
  taskName: string;
  frequency: string;
  metric: string;
  output: string;
  status: string;
  nextRun: string;
}
