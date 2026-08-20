import { AgentBlock } from '../contracts';
import { SelectableBlock } from '../../types';
import { DEFAULT_SHAREABLE_BLOCKS } from '../../data/mockData';

export function convertBlocksToSelectable(availableBlocks?: AgentBlock[]): {
  items: (SelectableBlock & { originalBlock?: AgentBlock })[];
} {
  if (!availableBlocks || availableBlocks.length === 0) {
    return { items: DEFAULT_SHAREABLE_BLOCKS };
  }

  // Filter only meaningful business blocks (skip disambiguation, progress, share_selection, assistant messages)
  const candidates = availableBlocks.filter((b) =>
    ['metric_answer', 'evidence_summary', 'analysis_result', 'artifact_summary'].includes(
      b.type,
    ),
  );

  if (candidates.length === 0) {
    return { items: DEFAULT_SHAREABLE_BLOCKS };
  }

  const items: (SelectableBlock & { originalBlock?: AgentBlock })[] = candidates.map((block) => {
    switch (block.type) {
      case 'metric_answer':
        return {
          id: block.blockId,
          title: `一、核心指标结果 · ${block.payload?.metricName || '按期办结率'}`,
          type: 'Metric Answer',
          pageOrigin: 'page02',
          summaryText: `上周数值：${block.payload?.headlineValue || '86.42%'} (${block.payload?.headlineHighlight || '环比 ↓ 4.8%'})，包含全区各细分口径周度变动对照。`,
          selected: true,
          originalBlock: block,
        };

      case 'evidence_summary':
        return {
          id: block.blockId,
          title: `二、归因诊断结论 · ${block.payload?.title || '三大核心驱动因素'}`,
          type: 'Diagnostic Analysis',
          pageOrigin: 'page03',
          summaryText: `归因诊断因子：${(block.payload?.factors || [])
            .map((f: any) => f.title)
            .join('、') || '重点街镇超期、物业响应拉长、跨部门协同'}。`,
          selected: true,
          originalBlock: block,
        };

      case 'analysis_result':
        return {
          id: block.blockId,
          title: `三、重点关注工单融合分析 · ${block.payload?.headline || '超期贡献分析'}`,
          type: 'Enriched Analysis',
          pageOrigin: 'page04',
          summaryText: `融合计算：重点清单 4,094 件，超期率 22.4%，贡献了 31.8% 的新增超期。`,
          selected: true,
          originalBlock: block,
        };

      case 'artifact_summary':
        return {
          id: block.blockId,
          title: `四、产物报告文件 · ${block.payload?.title || 'HTML 分析报告'}`,
          type: 'Artifact File',
          pageOrigin: 'page04',
          summaryText: block.payload?.description || '包含完整指标变化、结构拆解与证据说明。',
          selected: true,
          originalBlock: block,
        };

      default:
        return {
          id: block.blockId,
          title: '分析内容项',
          type: 'Analysis',
          pageOrigin: 'page03',
          summaryText: '系统分析产出的结论及数据支撑。',
          selected: true,
          originalBlock: block,
        };
    }
  });

  return { items };
}
