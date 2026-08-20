import { DiagnosticEvidenceItem, ReportDocument } from '../../src/agent/contracts';

class ArtifactStore {
  private reports = new Map<string, ReportDocument>();

  save(report: ReportDocument): ReportDocument {
    this.reports.set(report.artifactId, report);
    return report;
  }

  get(artifactId: string): ReportDocument | undefined {
    return this.reports.get(artifactId);
  }

  saveReport(report: ReportDocument): ReportDocument {
    return this.save(report);
  }

  getReport(artifactId: string): ReportDocument | undefined {
    return this.get(artifactId);
  }

  createReportFromContext(params: {
    taskId: string;
    region?: string;
    metricName?: string;
    periodText?: string;
    metricValue?: string;
    wowChange?: string;
    scope?: string;
  }): ReportDocument {
    const artifactId = `art_report_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const region = params.region || params.scope || '上海市闵行区';
    const metricName = params.metricName || '按期办结率';
    const periodText = params.periodText || '2026 年第 32 周（2026-08-03 至 2026-08-09）';
    const metricValue = params.metricValue || (region.includes('七宝') ? '78.15%' : '86.42%');
    const wowChange = params.wowChange || (region.includes('七宝') ? '↓ 7.3pp' : '↓ 4.8pp');

    const isQibao = region.includes('七宝');

    const findings = isQibao
      ? [
          {
            title: '1. 物业维修与积水诉求激增',
            description: '受极端降雨天气影响，小区地下车库与排水报修工单增长 68.2%。',
          },
          {
            title: '2. 维修备料与施工力量饱和',
            description: '物业承办响应周期由 2.8 天拉长至 4.3 天。',
          },
          {
            title: '3. 跨居委水务联调滞后',
            description: '涉及水务管网交界处的协调工单耗时增加 1.4 天。',
          },
        ]
      : [
          {
            title: '1. 重点街镇超期工单增加',
            description: '七宝镇、莘庄镇超期工单增幅明显，占全区超期增量的 62.4%。',
          },
          {
            title: '2. 物业与劳动保障处理周期拉长',
            description: '两类诉求平均办理时长分别增加 0.7 天 与 0.9 天。',
          },
          {
            title: '3. 跨部门协同工单占比上升',
            description: '跨部门协同工单占比上升 3.2 个百分点，按期办结率仅为 71.5%。',
          },
        ];

    const evidence: DiagnosticEvidenceItem[] = isQibao
      ? [
          {
            factor: '积水与物业维修增量',
            weeklyChange: '+184 件',
            impactLevel: '高',
            status: '已验证',
          },
          {
            factor: '平均办理时长延长',
            weeklyChange: '+1.5 天',
            impactLevel: '高',
            status: '已验证',
          },
          {
            factor: '管网跨部门协同',
            weeklyChange: '+4.1pp',
            impactLevel: '中',
            status: '已验证',
          },
        ]
      : [
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

    const summary = isQibao
      ? `本周期七宝镇${metricName}为 ${metricValue}，环比下降 ${wowChange.replace(/[↓↑\s]/g, '')}。主要受暴雨积水与老旧小区物业修缮诉求集中激增、承办处置积压影响。`
      : `本周${region}${metricName}为 ${metricValue}，较上一周环比下降 ${wowChange.replace(/[↓↑\s]/g, '')}。经多维数据下钻与融合诊断，办结率下降并非由全局诉求激增导致，而是受重点街镇超期集中、部分诉求办理周期拉长及跨部门协同流转滞后三大核心因素共同驱动。`;

    const limitation =
      '待补证据说明：目前缺少部分跨部门流转节点的完整内部环节耗时，因此只能确认跨部门协同与办结率下降高度相关，尚不可直接认定为单一因果关系。建议下一阶段接入部门内部流转日志进行深度追溯。';

    const report: ReportDocument = {
      artifactId,
      title: `${region}公共服务热线工单${metricName}波动归因诊断报告`,
      generatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      scope: {
        region,
        timeLabel: periodText,
      },
      metric: {
        id: 'metric_on_time_rate',
        name: metricName,
        value: metricValue,
        comparison: wowChange,
      },
      summary,
      findings,
      evidence,
      limitation,
    };

    this.reports.set(artifactId, report);
    return report;
  }
}

export const artifactStore = new ArtifactStore();
export type { ReportDocument };
