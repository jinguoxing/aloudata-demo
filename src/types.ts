export type PageState =
  | 'page01' // 发起问数
  | 'page02' // 指标消歧 + 可信答案
  | 'page03' // 下钻归因 + 分析报告
  | 'page04' // 上传文件 + 融合分析
  | 'page05' // 周期任务确认
  | 'page06' // 周期任务创建成功
  | 'page07' // 选择分析内容分享
  | 'page08'; // 分享结果只读页

export interface PageMeta {
  id: PageState;
  stepNumber: number;
  title: string;
  badge: string;
  description: string;
  verb: string;
}

export interface MetricDefinition {
  name: string;
  status: '正式指标' | '未定义' | '候选指标';
  definition: string;
  formula: string;
  granularity: string;
  timeSemantics: string;
  businessObject: string;
  dataSource: string;
}

export interface EvidenceItem {
  factor: string;
  weeklyChange: string;
  impactLevel: '高' | '中高' | '中' | '待判断';
  status: '已验证' | '证据不足';
}

export interface ComparativeMetric {
  group: string;
  count: number;
  overdueRate: string;
  mainArea: string;
}

export interface ScheduleTaskConfig {
  taskName: string;
  frequency: string;
  time: string;
  timezone: string;
  region: string;
  metric: string;
  strategy: string;
  attachmentStrategy: string;
  output: string;
  status: '已启用' | '未启用';
  nextRun: string;
}

export interface SelectableBlock {
  id: string;
  title: string;
  type: string;
  selected: boolean;
  pageOrigin: PageState;
  summaryText: string;
}
