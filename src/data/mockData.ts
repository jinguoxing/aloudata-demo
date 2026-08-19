import { PageMeta, MetricDefinition, EvidenceItem, ComparativeMetric, ScheduleTaskConfig, SelectableBlock } from '../types';

export const PAGE_STEPS: PageMeta[] = [
  {
    id: 'page01',
    stepNumber: 1,
    title: '发起问数',
    badge: 'Ask',
    description: '极简输入，业务人员直接提问',
    verb: '提问取数',
  },
  {
    id: 'page02',
    stepNumber: 2,
    title: '指标消歧 + 可信答案',
    badge: 'Clarify & Query',
    description: '选择正式指标、展示结果、右侧查看业务口径',
    verb: '指标消歧',
  },
  {
    id: 'page03',
    stepNumber: 3,
    title: '下钻归因 + 分析报告',
    badge: 'Diagnose & Report',
    description: '“为什么下降”触发多步分析，形成 HTML 报告',
    verb: '多步诊断',
  },
  {
    id: 'page04',
    stepNumber: 4,
    title: '上传文件 + 融合分析',
    badge: 'Enrich & Calculate',
    description: 'CSV 加入当前上下文，调用 Python / Query 分析',
    verb: '数据融合',
  },
  {
    id: 'page05',
    stepNumber: 5,
    title: '周期任务确认',
    badge: 'Automate Plan',
    description: '当前分析一键转周期任务，但先确认计划',
    verb: '计划确认',
  },
  {
    id: 'page06',
    stepNumber: 6,
    title: '周期任务创建成功',
    badge: 'Workflow Persisted',
    description: '展示任务频率、计划、产物、下一次执行',
    verb: '固化任务',
  },
  {
    id: 'page07',
    stepNumber: 7,
    title: '选择分析内容分享',
    badge: 'Curate & Share',
    description: '勾选对话轮次、结果、Artifact，生成分享链接',
    verb: '内容精选',
  },
  {
    id: 'page08',
    stepNumber: 8,
    title: '分享结果只读页',
    badge: 'Deliver & Read-Only',
    description: '对外呈现精选分析内容，不再是完整聊天记录',
    verb: '对外呈现',
  },
];

export const OFFICIAL_METRIC: MetricDefinition = {
  name: '按期办结率',
  status: '正式指标',
  definition: '统计期内按规定时限完成办结的工单，占全部已办结工单的比例。',
  formula: '按期办结工单数 / 已办结工单数 × 100%',
  granularity: '周 / 区级',
  timeSemantics: '办结时间',
  businessObject: '服务工单',
  dataSource: '公共服务热线工单记录',
};

export const WEEKLY_METRIC_TABLE = [
  { name: '按期办结率', current: '86.42%', wow: '↓ 4.8 个百分点', highlight: true },
  { name: '已办结工单', current: '8,642 件', wow: '↓ 2.1%', highlight: false },
  { name: '超期办结工单', current: '733 件', wow: '↑ 18.6%', highlight: false },
];

export const DIAGNOSTIC_EVIDENCE: EvidenceItem[] = [
  {
    factor: '七宝 / 莘庄超期增加',
    weeklyChange: '+286 件',
    impactLevel: '高',
    status: '已验证',
  },
  {
    factor: '物业管理办理时长',
    weeklyChange: '+0.7 天',
    impactLevel: '中高',
    status: '已验证',
  },
  {
    factor: '跨部门协同占比',
    weeklyChange: '+3.2pp',
    impactLevel: '中',
    status: '已验证',
  },
  {
    factor: '节假日影响',
    weeklyChange: '—',
    impactLevel: '待判断',
    status: '证据不足',
  },
];

export const COMPARATIVE_ANALYSIS: ComparativeMetric[] = [
  {
    group: '重点关注工单',
    count: 4094,
    overdueRate: '22.4%',
    mainArea: '七宝、莘庄',
  },
  {
    group: '其他工单',
    count: 27385,
    overdueRate: '13.6%',
    mainArea: '分布较均衡',
  },
];

export const PYTHON_EXECUTION_CODE = `focus_cases = read_csv("focus_case_list_2026W32.csv")
case_data = query_dataset("service_case")

matched = case_data.merge(
    focus_cases,
    on="case_id",
    how="inner"
)

focus_overdue_rate = (
    matched["is_overdue"].mean()
)

overall_overdue_rate = (
    case_data["is_overdue"].mean()
)`;

export const SCHEDULE_CONFIG: ScheduleTaskConfig = {
  taskName: '公共服务热线按期办结率周度监测与归因',
  frequency: '每周一 09:00',
  time: '09:00',
  timezone: 'Asia/Shanghai',
  region: '上海市闵行区',
  metric: '按期办结率',
  strategy: '环比 → 街镇 → 诉求类型 → 部门 → 超期工单',
  attachmentStrategy: '使用当周最新重点关注工单清单',
  output: '工作台摘要 + HTML 分析报告',
  status: '已启用',
  nextRun: '2026-08-24 09:00',
};

export const DEFAULT_SHAREABLE_BLOCKS: SelectableBlock[] = [
  {
    id: 'block_01',
    title: '上周按期办结率及环比指标结果',
    type: 'Metric Answer',
    selected: true,
    pageOrigin: 'page02',
    summaryText: '上周按期办结率为 86.42%，环比下降 4.8 个百分点。已办结工单 8,642 件，超期 733 件。',
  },
  {
    id: 'block_02',
    title: '为什么下降 · 三维归因诊断',
    type: 'Diagnostic Analysis',
    selected: true,
    pageOrigin: 'page03',
    summaryText: '三大主因：1.七宝与莘庄超期工单显著增加；2.物业与劳动保障类办理周期拉长；3.跨部门协同工单占比上升。',
  },
  {
    id: 'block_03',
    title: '重点关注工单 CSV 融合分析结果',
    type: 'Enriched Analysis',
    selected: true,
    pageOrigin: 'page04',
    summaryText: '上传 4,094 件重点工单，超期率高达 22.4%（全量为 13.6%），贡献新增超期量的 31.8%。',
  },
  {
    id: 'block_04',
    title: 'HTML 归因分析报告 Artifact',
    type: 'Artifact File',
    selected: true,
    pageOrigin: 'page03',
    summaryText: '【报告文档】按期办结率波动归因分析 · 2026W32.html',
  },
  {
    id: 'block_05',
    title: '周期分析任务创建信息',
    type: 'Workflow Config',
    selected: false,
    pageOrigin: 'page06',
    summaryText: '任务名称：公共服务热线按期办结率周度监测与归因 | 执行频率：每周一 09:00',
  },
];
