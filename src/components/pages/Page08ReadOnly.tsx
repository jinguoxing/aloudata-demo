import React from 'react';
import { AgentBlock, ShareArtifact } from '../../agent/contracts';
import { BlockRenderer } from '../agent/BlockRenderer';
import {
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  Lock,
  Calendar,
  Layers,
} from 'lucide-react';

interface Page08Props {
  shareArtifact?: ShareArtifact | null;
  taskBlocks?: AgentBlock[];
  onOpenReportModal?: (artifactId?: string) => void;
  onReturnToWorkbench?: () => void;
}

export const Page08ReadOnly: React.FC<Page08Props> = ({
  shareArtifact,
  taskBlocks,
  onOpenReportModal,
  onReturnToWorkbench,
}) => {
  // Determine which blocks to render:
  // 1. If shareArtifact has explicit blocks saved, use them
  // 2. Else if shareArtifact has selectedBlockIds and taskBlocks exist, filter taskBlocks
  // 3. Else fallback to all taskBlocks or default curated set
  const blocksToRender: AgentBlock[] = React.useMemo(() => {
    if (shareArtifact?.blocks && shareArtifact.blocks.length > 0) {
      return shareArtifact.blocks;
    }

    if (taskBlocks && taskBlocks.length > 0) {
      if (shareArtifact?.selectedBlockIds && shareArtifact.selectedBlockIds.length > 0) {
        const filtered = taskBlocks.filter((b) =>
          shareArtifact.selectedBlockIds.includes(b.blockId),
        );
        if (filtered.length > 0) return filtered;
      }

      // Filter only business blocks if not specific
      const meaningful = taskBlocks.filter((b) =>
        [
          'metric_answer',
          'evidence_summary',
          'analysis_result',
          'artifact_summary',
        ].includes(b.type),
      );
      if (meaningful.length > 0) return meaningful;
    }

    // Default curated fallback if no task execution yet
    return [
      {
        blockId: 'default_metric_answer',
        type: 'metric_answer',
        status: 'DONE',
        payload: {
          metricName: '按期办结率',
          headlineValue: '86.42%',
          headlineHighlight: '86.42%',
          table: [
            { name: '总体按期办结率', current: '86.42%', wow: '↓ 4.8%', highlight: true },
            { name: '重点街镇超期集中度', current: '34.20%', wow: '↑ 7.1%' },
            { name: '物业响应平均周期', current: '3.8 天', wow: '↑ 0.7 天' },
            { name: '劳动保障办理时长', current: '4.2 天', wow: '↑ 0.9 天' },
          ],
          summaryNote: '数据已通过企业指标语义模型校核，环比下降主要受部分重点街镇工单激增影响。',
        },
        createdAt: new Date().toISOString(),
      },
      {
        blockId: 'default_evidence_summary',
        type: 'evidence_summary',
        status: 'DONE',
        payload: {
          title: '按期办结率下降主要由三个因素共同造成',
          factors: [
            {
              title: '1. 重点街镇超期集中',
              description: '七宝镇、莘庄镇的超期工单增幅明显，高于全区平均水平。',
            },
            {
              title: '2. 物业与劳动保障响应拉长',
              description: '两类诉求平均办理时长分别增加 0.7 天 与 0.9 天。',
            },
            {
              title: '3. 跨部门协同延迟',
              description: '跨部门协同工单的按期办结率明显低于普通工单。',
            },
          ],
          evidenceTable: [
            { factor: '七宝/莘庄超期集聚', weeklyChange: '+7.1%', impactLevel: '高', status: '已验证' },
            { factor: '物业诉求办理时长增加', weeklyChange: '+0.7 天', impactLevel: '中高', status: '已验证' },
            { factor: '劳动保障复杂诉求激增', weeklyChange: '+0.9 天', impactLevel: '中', status: '已验证' },
          ],
          pendingNote: '需结合重点工单清单进一步量化责任归属与细分诉求分布。',
        },
        createdAt: new Date().toISOString(),
      },
      {
        blockId: 'default_analysis_result',
        type: 'analysis_result',
        status: 'DONE',
        payload: {
          headline: '重点关注工单确实放大了本周办结率下降',
          stats: [
            { label: '重点清单工单数', value: '4,094 件', theme: 'neutral' },
            { label: '重点工单超期率', value: '22.4%', subtext: 'vs 全量 13.6%', theme: 'rose' },
            { label: '对新增超期的贡献', value: '31.8%', theme: 'blue' },
          ],
          table: [
            { group: '重点清单客群 (4,094件)', count: 4094, overdueRate: '22.4%', mainArea: '七宝镇 / 莘庄镇' },
            { group: '非重点普通工单 (26,018件)', count: 26018, overdueRate: '12.2%', mainArea: '全区均匀' },
            { group: '全量工单 (30,112件)', count: 30112, overdueRate: '13.6%', mainArea: '全区综合' },
          ],
        },
        createdAt: new Date().toISOString(),
      },
      {
        blockId: 'default_artifact_summary',
        type: 'artifact_summary',
        status: 'DONE',
        payload: {
          artifactId: 'art_rep_2026w32',
          title: '按期办结率波动归因分析 · 2026W32.html',
          type: 'HTML Analysis Report',
          description: '包含完整指标变化、多维归因拆解、CSV 融合与证据依据说明。',
          fileFormat: 'HTML',
          previewAvailable: true,
        },
        createdAt: new Date().toISOString(),
      },
    ];
  }, [shareArtifact, taskBlocks]);

  const shareTitle =
    shareArtifact?.title || '上周公共服务热线工单按期办结率变化分析 · 精选结果';

  const shareTime = shareArtifact?.createdAt
    ? new Date(shareArtifact.createdAt).toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      })
    : '2026-08-17';

  return (
    <div className="min-h-full bg-slate-50/70 p-4 sm:p-8 flex flex-col items-center animate-in fade-in duration-300">
      {/* Read-Only Top Header Bar */}
      <div className="w-full max-w-4xl bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4 mb-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
              S
            </div>
            <span className="font-bold text-slate-900 text-base">Semovix</span>
            <span className="text-slate-300">/</span>
            <span className="text-xs text-slate-500 font-medium">精选只读分析成果</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>外部只读模式 · 已过滤内部环境</span>
            </span>

            {onReturnToWorkbench && (
              <button
                onClick={onReturnToWorkbench}
                className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
              >
                返回 AI 工作台
              </button>
            )}
          </div>
        </div>

        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {shareTitle}
          </h1>
          <div className="flex items-center flex-wrap gap-2 text-xs text-slate-500 mt-1.5">
            <span className="flex items-center gap-1 text-blue-600 font-medium">
              <Sparkles className="w-3.5 h-3.5" />
              <span>由 Semovix Agent 自动生成</span>
            </span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>生成日期：{shareTime}</span>
            </span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-slate-400" />
              <span>包含 {blocksToRender.length} 项精选结论与公开产物</span>
            </span>
          </div>
        </div>
      </div>

      {/* Main Dynamically Rendered Content Blocks */}
      <div className="w-full max-w-4xl space-y-6">
        {blocksToRender.map((block) => (
          <div key={block.blockId} className="transition-all">
            <BlockRenderer
              block={block}
              onOpenReport={(artifactId) => onOpenReportModal?.(artifactId)}
            />
          </div>
        ))}

        {/* Evidence Footer Box */}
        <section className="bg-slate-100/80 border border-slate-200 rounded-2xl p-5 space-y-2 text-xs text-slate-600">
          <div className="flex items-center gap-1.5 font-bold text-slate-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>数据依据与可信安全保证</span>
          </div>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-600 pt-1">
            <li>
              • <strong>正式指标：</strong>按期办结率（基于企业语义模型认证）
            </li>
            <li>
              • <strong>服务工单数据：</strong>闵行区公共服务热线工单数据库
            </li>
            <li>
              • <strong>融合文件：</strong>重点关注工单清单 (focus_case_list_2026W32.csv)
            </li>
            <li>
              • <strong>数据脱敏：</strong>已过滤所有底层 Python 执行代码与内部 Trace 日志
            </li>
          </ul>
          <p className="text-[10px] text-slate-400 pt-2 border-t border-slate-200 flex items-center gap-1">
            <Lock className="w-3 h-3 text-slate-400" />
            <span>
              注：本页面经由工作台精选分享生成，仅对外呈现已授权的分析结论，受只读访问保护。
            </span>
          </p>
        </section>

        {/* Bottom Branding */}
        <footer className="text-center py-6 text-xs text-slate-400">
          由 <strong>Semovix</strong> 企业原生语义智能平台提供可信数据支持
        </footer>
      </div>
    </div>
  );
};
