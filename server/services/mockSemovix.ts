import {
  MetricCandidateDTO,
  MetricDefinitionDTO,
  MetricQueryResultDTO,
  DiagnosisResultDTO,
  PythonExecutionDTO,
  ScheduleCreateDTO,
  ShareArtifactDTO,
} from './contracts';

export class MockSemovixService {
  private metrics: Map<string, MetricDefinitionDTO> = new Map([
    [
      'metric_on_time_rate',
      {
        id: 'metric_on_time_rate',
        name: '按期办结率',
        status: '正式指标',
        definition: '统计期内按规定时限完成办结的工单，占全部已办结工单的比例。',
        formula: '按期办结工单数 / 已办结工单数 × 100%',
        granularity: '周 / 区级',
        timeSemantics: '办结时间',
        businessObject: '服务工单',
        dataSource: '公共服务热线工单记录',
        isRecommended: true,
      },
    ],
    [
      'metric_total_completion_rate',
      {
        id: 'metric_total_completion_rate',
        name: '总体办结率',
        status: '正式指标',
        definition: '统计期内已办结工单，占全部受理工单的比例（包含按期与超期）。',
        formula: '已办结工单数 / 全部受理工单数 × 100%',
        granularity: '周 / 区级',
        timeSemantics: '受理时间',
        businessObject: '服务工单',
        dataSource: '公共服务热线工单记录',
        isRecommended: false,
      },
    ],
  ]);

  private shares: Map<string, ShareArtifactDTO> = new Map();

  // Metric semantic disambiguation candidates
  async resolveMetrics(_query: string): Promise<MetricCandidateDTO[]> {
    return [
      {
        id: 'metric_on_time_rate',
        name: '按期办结率',
        definition: '统计期内按规定时限完成办结的工单，占全部已办结工单的比例。',
        isRecommended: true,
        tag: '推荐',
      },
      {
        id: 'metric_total_completion_rate',
        name: '总体办结率',
        definition: '统计期内已办结工单，占全部受理工单的比例（包含按期与超期）。',
        isRecommended: false,
      },
    ];
  }

  // Get metric definition
  async getMetricDefinition(metricId: string): Promise<MetricDefinitionDTO | undefined> {
    return this.metrics.get(metricId) || this.metrics.get('metric_on_time_rate');
  }

  // Execute query on verified metric
  async queryMetric(metricId: string): Promise<MetricQueryResultDTO> {
    if (metricId === 'metric_total_completion_rate') {
      return {
        metricId,
        metricName: '总体办结率',
        headlineValue: '94.18%',
        headlineHighlight: '94.18%',
        table: [
          { name: '总体办结率', current: '94.18%', wow: '↓ 0.8 个百分点', highlight: true },
          { name: '总受理工单', current: '9,176 件', wow: '↑ 3.4%', highlight: false },
          { name: '累计已办结', current: '8,642 件', wow: '↓ 2.1%', highlight: false },
        ],
        summaryNote: '上周总体办结率较为平稳，波动主要来自新进工单受理总量增长。',
      };
    }

    return {
      metricId: 'metric_on_time_rate',
      metricName: '按期办结率',
      headlineValue: '86.42%',
      headlineHighlight: '86.42%',
      table: [
        { name: '按期办结率', current: '86.42%', wow: '↓ 4.8 个百分点', highlight: true },
        { name: '已办结工单', current: '8,642 件', wow: '↓ 2.1%', highlight: false },
        { name: '超期办结工单', current: '733 件', wow: '↑ 18.6%', highlight: false },
      ],
      summaryNote:
        '上周按期办结率较前一周明显下降，下降主要来自超期工单增加，而不是单纯由总工单量变化造成。',
    };
  }

  // Diagnostic multi-factor attribution
  async runDiagnosis(_context: any): Promise<DiagnosisResultDTO> {
    return {
      title: '按期办结率下降主要由三个因素共同造成',
      factors: [
        {
          title: '1. 重点街镇超期工单增加',
          description: '七宝镇、莘庄镇的超期工单增幅明显，高于全区平均水平。',
        },
        {
          title: '2. 物业与劳动保障处理周期拉长',
          description: '两类诉求平均办理时长分别增加 0.7 天 与 0.9 天。',
        },
        {
          title: '3. 跨部门协同工单占比上升',
          description: '跨部门协同工单的按期办结率明显低于普通工单。',
        },
      ],
      evidenceTable: [
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
      ],
      pendingNote:
        '待补证据说明：目前缺少部分跨部门流转节点的完整处理时长，因此只能确认其与下降高度相关，不能直接认定为单一因果因素。',
      reportArtifact: {
        artifactId: 'art_report_2026W32',
        title: '按期办结率波动归因分析 · 2026W32',
        type: 'HTML 分析报告',
        description: '包含核心结论、指标变化、街镇拆解与证据局限',
        fileFormat: 'HTML',
        previewAvailable: true,
      },
    };
  }

  // Execute Python tool calculation for CSV file binding
  async executePythonAnalysis(fileName: string): Promise<PythonExecutionDTO> {
    const code = `focus_cases = read_csv("${fileName || 'focus_case_list_2026W32.csv'}")
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

    return {
      executionId: `exec_${Date.now()}`,
      tool: 'python',
      code,
      status: 'SUCCEEDED',
      startedAt: new Date(Date.now() - 1200).toISOString(),
      endedAt: new Date().toISOString(),
      logs: [
        `[INFO] Loading CSV ${fileName || 'focus_case_list_2026W32.csv'}...`,
        '✓ Matched rows: 4,094',
        'Focus overdue rate: 22.4%',
        'Overall overdue rate: 13.6%',
        'Overdue contribution: 31.8% of weekly delta',
      ],
      outputs: {
        matchedRows: 4094,
        focusOverdueRate: 0.224,
        overallOverdueRate: 0.136,
        contributionRate: 0.318,
      },
      comparativeAnalysis: [
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
      ],
    };
  }

  // Create persistent schedule
  async createSchedule(params?: any): Promise<ScheduleCreateDTO> {
    return {
      taskName: params?.taskName || '公共服务热线按期办结率周度监测与归因',
      frequency: params?.frequency || '每周一 09:00',
      metric: params?.metric || '按期办结率',
      output: '工作台摘要 + HTML 分析报告',
      status: '已启用',
      nextRun: '2026-08-24 09:00',
    };
  }

  // Save curated share artifact
  async createShareArtifact(params: {
    taskId: string;
    title?: string;
    selectedBlockIds: string[];
    blocks: any[];
  }): Promise<ShareArtifactDTO> {
    const shareId = `share_${Math.random().toString(36).substring(2, 9)}`;
    const artifact: ShareArtifactDTO = {
      shareId,
      taskId: params.taskId,
      title: params.title || '公共服务热线按期办结率变化分析 · 精选结果',
      selectedBlockIds: params.selectedBlockIds,
      blocks: params.blocks || [],
      createdAt: new Date().toISOString(),
      accessMode: 'READ_ONLY',
      url: `/share/${shareId}`,
    };

    this.shares.set(shareId, artifact);
    return artifact;
  }

  async getShareArtifact(shareId: string): Promise<ShareArtifactDTO | undefined> {
    return this.shares.get(shareId);
  }
}

export const semovix = new MockSemovixService();
