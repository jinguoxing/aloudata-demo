import {
  MetricCandidateDTO,
  MetricDefinitionDTO,
  MetricQueryResultDTO,
  DiagnosisResultDTO,
  PythonExecutionDTO,
  ScheduleCreateDTO,
  ShareArtifactDTO,
} from './contracts';
import { artifactStore, ReportDocument } from '../agent/artifactStore';

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
        granularity: '周 / 区级及街镇级',
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
        granularity: '周 / 区级及街镇级',
        timeSemantics: '受理时间',
        businessObject: '服务工单',
        dataSource: '公共服务热线工单记录',
        isRecommended: false,
      },
    ],
    [
      'metric_first_contact_resolution',
      {
        id: 'metric_first_contact_resolution',
        name: '一次性化解率',
        status: '正式指标',
        definition: '首派责任单位即完成满意化解、未发生二次流转重办的工单比例。',
        formula: '首派办结工单数 / 全部受理工单数 × 100%',
        granularity: '周 / 区级',
        timeSemantics: '办结时间',
        businessObject: '服务工单',
        dataSource: '工单流转节点及回访记录',
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
      {
        id: 'metric_first_contact_resolution',
        name: '一次性化解率',
        definition: '首派责任单位即完成满意化解、未发生二次流转重办的工单比例。',
        isRecommended: false,
      },
    ];
  }

  // Get metric definition
  async getMetricDefinition(metricId: string): Promise<MetricDefinitionDTO | undefined> {
    return this.metrics.get(metricId) || this.metrics.get('metric_on_time_rate');
  }

  // Execute query on verified metric dynamically based on context
  async queryMetric(
    metricId: string,
    options?: {
      region?: string;
      scope?: string;
      timeRange?: string;
      compareType?: 'wow' | 'yoy';
    },
  ): Promise<MetricQueryResultDTO> {
    const region = options?.region || options?.scope || '上海市闵行区';
    const timeRange = options?.timeRange || '上周 (2026W32)';
    const compareType = options?.compareType || 'wow';

    if (metricId === 'metric_total_completion_rate') {
      return {
        metricId,
        metricName: '总体办结率',
        headlineValue: '94.18%',
        headlineHighlight: '94.18%',
        table: [
          { name: `${region} 总体办结率`, current: '94.18%', wow: '↓ 0.8 个百分点', highlight: true },
          { name: '总受理工单', current: '9,176 件', wow: '↑ 3.4%', highlight: false },
          { name: '累计已办结', current: '8,642 件', wow: '↓ 2.1%', highlight: false },
        ],
        summaryNote: `${region}${timeRange}总体办结率较为平稳（94.18%），受理工单总量达 9,176 件。`,
      };
    }

    if (metricId === 'metric_first_contact_resolution') {
      return {
        metricId,
        metricName: '一次性化解率',
        headlineValue: '73.40%',
        headlineHighlight: '73.40%',
        table: [
          { name: `${region} 一次性化解率`, current: '73.40%', wow: '↓ 3.2 个百分点', highlight: true },
          { name: '首派办结工单', current: '6,343 件', wow: '↓ 5.4%', highlight: false },
          { name: '二次流转工单', current: '2,299 件', wow: '↑ 12.1%', highlight: false },
        ],
        summaryNote: `${region}${timeRange}一次性化解率下降 3.2 个百分点，二次流转跨部门工单增多。`,
      };
    }

    // Default metric: metric_on_time_rate (按期办结率)
    // 1. Regional drill-down (e.g. 七宝镇)
    if (region.includes('七宝')) {
      return {
        metricId: 'metric_on_time_rate',
        metricName: '按期办结率',
        headlineValue: '78.15%',
        headlineHighlight: '78.15%',
        table: [
          { name: '七宝镇按期办结率', current: '78.15%', wow: '↓ 7.3 个百分点', highlight: true },
          { name: '七宝镇已办结工单', current: '1,420 件', wow: '↑ 5.2%', highlight: false },
          { name: '七宝镇超期办结工单', current: '311 件', wow: '↑ 28.5%', highlight: false },
        ],
        summaryNote:
          '已切换至【七宝镇】范围：上周按期办结率为 78.15%，显著低于全区平均（86.42%），主要由于暴雨后积水与老旧小区物业修缮诉求集中激增。',
      };
    }

    if (region.includes('莘庄')) {
      return {
        metricId: 'metric_on_time_rate',
        metricName: '按期办结率',
        headlineValue: '81.30%',
        headlineHighlight: '81.30%',
        table: [
          { name: '莘庄镇按期办结率', current: '81.30%', wow: '↓ 5.6 个百分点', highlight: true },
          { name: '莘庄镇已办结工单', current: '1,890 件', wow: '↑ 3.1%', highlight: false },
          { name: '莘庄镇超期办结工单', current: '353 件', wow: '↑ 21.0%', highlight: false },
        ],
        summaryNote:
          '已切换至【莘庄镇】范围：上周按期办结率为 81.30%，环比下降 5.6 个百分点，商圈噪声与劳动争议诉求增加。',
      };
    }

    // 2. Time range trend query (e.g. 最近四周)
    if (timeRange.includes('四') || timeRange.includes('4') || timeRange.includes('趋势') || timeRange.includes('月')) {
      return {
        metricId: 'metric_on_time_rate',
        metricName: '按期办结率',
        headlineValue: '88.35% (四周均值)',
        headlineHighlight: '88.35%',
        table: [
          { name: 'W29 (7.14-7.20) 按期办结率', current: '92.10%', wow: '↑ 0.5pp', highlight: false },
          { name: 'W30 (7.21-7.27) 按期办结率', current: '91.80%', wow: '↓ 0.3pp', highlight: false },
          { name: 'W31 (7.28-8.03) 按期办结率', current: '91.22%', wow: '↓ 0.58pp', highlight: false },
          { name: 'W32 (8.04-8.10) 按期办结率', current: '86.42%', wow: '↓ 4.80pp', highlight: true },
        ],
        summaryNote:
          '最近四周按期办结率从 W29 的 92.10% 逐步回落，并在上周（W32）出现明显拐点（环比骤降 4.8 个百分点）。',
      };
    }

    // 3. Year-over-year comparison (同比)
    if (compareType === 'yoy' || options?.compareType === 'yoy') {
      return {
        metricId: 'metric_on_time_rate',
        metricName: '按期办结率',
        headlineValue: '86.42%',
        headlineHighlight: '86.42%',
        table: [
          { name: '按期办结率 (2026W32)', current: '86.42%', wow: '↓ 2.3pp (同比 2025W32: 88.72%)', highlight: true },
          { name: '已办结工单', current: '8,642 件', wow: '↑ 8.6% (同比增加 685 件)', highlight: false },
          { name: '超期办结工单', current: '733 件', wow: '↑ 14.2% (同比增加 91 件)', highlight: false },
        ],
        summaryNote:
          '同比去年同期（2025W32），按期办结率下降 2.3 个百分点，总受理工单量同比增长 8.6%，超期工单增加 91 件。',
      };
    }

    // Standard baseline (全区上周)
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
        '上周按期办结率较前一周明显下降，下降主要来自超期工单增加（+18.6%），而不是单纯由总工单量变化造成。',
    };
  }

  // Diagnostic multi-factor attribution
  async runDiagnosis(context: {
    taskId: string;
    region?: string;
    scope?: string;
    metricName?: string;
    timeRange?: string;
  }): Promise<{
    diagnosis: DiagnosisResultDTO;
    reportDocument: ReportDocument;
  }> {
    const region = context.region || context.scope || '上海市闵行区';
    const metricName = context.metricName || '按期办结率';
    const isQibao = region.includes('七宝');

    // Create Report Document dynamically
    const reportDoc = artifactStore.createReportFromContext({
      taskId: context.taskId,
      region,
      metricName,
      periodText: context.timeRange || '2026 年第 32 周（2026-08-03 至 2026-08-09）',
      metricValue: isQibao ? '78.15%' : '86.42%',
      wowChange: isQibao ? '↓ 7.3pp' : '↓ 4.8pp',
    });

    const diagnosis: DiagnosisResultDTO = {
      title: isQibao
        ? '七宝镇按期办结率下降主要由暴雨积水与物业修缮滞后造成'
        : `${metricName}下降主要由三个因素共同造成`,
      factors: reportDoc.findings.map((f) => ({
        title: f.title,
        description: f.description,
      })),
      evidenceTable: reportDoc.evidence.map((e) => ({
        factor: e.factor,
        weeklyChange: e.weeklyChange,
        impactLevel: e.impactLevel as any,
        status: e.status as any,
      })),
      pendingNote: reportDoc.limitation,
      reportArtifact: {
        artifactId: reportDoc.artifactId,
        title: `${region}${metricName}波动归因分析 · 2026W32`,
        type: 'HTML 分析报告',
        description: `包含${region}核心结论、指标变化、维度拆解与证据局限`,
        fileFormat: 'HTML',
        previewAvailable: true,
      },
    };

    return { diagnosis, reportDocument: reportDoc };
  }

  // Execute Python tool calculation strictly based on parsed file metadata
  async executePythonAnalysis(params: {
    fileName: string;
    rowCount: number;
    columnNames: string[];
  }): Promise<PythonExecutionDTO> {
    const { fileName, rowCount, columnNames } = params;
    const primaryKey = columnNames[0] || 'case_id';

    const code = `focus_cases = read_csv("${fileName}")
case_data = query_dataset("service_case")

matched = case_data.merge(
    focus_cases,
    on="${primaryKey}",
    how="inner"
)

focus_overdue_rate = (
    matched["is_overdue"].mean()
)

overall_overdue_rate = (
    case_data["is_overdue"].mean()
)`;

    const matchedRows = rowCount;
    const otherRows = 27385;

    return {
      executionId: `exec_${Date.now()}`,
      tool: 'python',
      code,
      status: 'SUCCEEDED',
      startedAt: new Date(Date.now() - 1200).toISOString(),
      endedAt: new Date().toISOString(),
      logs: [
        `[INFO] Loading CSV ${fileName}...`,
        `✓ Matched rows: ${matchedRows.toLocaleString()}`,
        'Focus overdue rate: 22.4%',
        'Overall overdue rate: 13.6%',
        'Overdue contribution: 31.8% of weekly delta',
      ],
      outputs: {
        matchedRows,
        focusOverdueRate: 0.224,
        overallOverdueRate: 0.136,
        contributionRate: 0.318,
      },
      comparativeAnalysis: [
        {
          group: `重点关注清单 (${matchedRows.toLocaleString()} 件)`,
          count: matchedRows,
          overdueRate: '22.4%',
          mainArea: '七宝镇、莘庄镇',
        },
        {
          group: `普通服务工单 (${otherRows.toLocaleString()} 件)`,
          count: otherRows,
          overdueRate: '13.6%',
          mainArea: '全区综合分布',
        },
      ],
    };
  }

  // Create persistent schedule with parsed frequency
  async createSchedule(params?: {
    taskName?: string;
    frequency?: string;
    metric?: string;
    region?: string;
    nextRun?: string;
  }): Promise<ScheduleCreateDTO> {
    const frequency = params?.frequency || '每周五 15:00';
    const metric = params?.metric || '按期办结率';
    const taskName = params?.taskName || `公共服务热线${metric}定期监测与归因`;

    return {
      taskName,
      frequency,
      metric,
      output: '工作台摘要 + HTML 分析报告',
      status: '已启用',
      nextRun: params?.nextRun || '2026-08-21 15:00',
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
      title: params.title || '公共服务热线工单按期办结率变化分析 · 精选结果',
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
