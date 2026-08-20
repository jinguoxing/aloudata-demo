export interface MetricDefinitionDTO {
  id: string;
  name: string;
  status: string;
  definition: string;
  formula: string;
  granularity: string;
  timeSemantics: string;
  businessObject: string;
  dataSource: string;
  isRecommended?: boolean;
}

export interface MetricResolveParams {
  query: string;
}

export interface MetricCandidateDTO {
  id: string;
  name: string;
  definition: string;
  isRecommended?: boolean;
  tag?: string;
}

export interface MetricQueryResultDTO {
  metricId: string;
  metricName: string;
  headlineValue: string;
  headlineHighlight: string;
  table: {
    name: string;
    current: string;
    wow: string;
    highlight?: boolean;
  }[];
  summaryNote: string;
}

export interface DiagnosisResultDTO {
  title: string;
  factors: {
    title: string;
    description: string;
  }[];
  evidenceTable: {
    factor: string;
    weeklyChange: string;
    impactLevel: '高' | '中高' | '中' | '低' | '待判断';
    status: '已验证' | '证据不足';
  }[];
  pendingNote: string;
  reportArtifact: {
    artifactId: string;
    title: string;
    type: string;
    description: string;
    fileFormat: 'HTML' | 'PDF' | 'EXCEL';
    previewAvailable: boolean;
  };
}

export interface PythonExecutionDTO {
  executionId: string;
  tool: 'python';
  code: string;
  status: 'SUCCEEDED' | 'FAILED';
  startedAt: string;
  endedAt: string;
  logs: string[];
  outputs: {
    matchedRows: number;
    focusOverdueRate: number;
    overallOverdueRate: number;
    contributionRate: number;
  };
  comparativeAnalysis: {
    group: string;
    count: number;
    overdueRate: string;
    mainArea: string;
  }[];
}

export interface ScheduleCreateDTO {
  taskName: string;
  frequency: string;
  metric: string;
  output: string;
  status: string;
  nextRun: string;
}

export interface ShareArtifactDTO {
  shareId: string;
  taskId: string;
  title: string;
  selectedBlockIds: string[];
  blocks: any[];
  createdAt: string;
  accessMode: 'READ_ONLY';
  url: string;
}
