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
  // 1. If shareArtifact has explicit blocks saved, strictly use them
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
          'schedule_created',
        ].includes(b.type),
      );
      if (meaningful.length > 0) return meaningful;
    }

    // Default fallback
    return [];
  }, [shareArtifact, taskBlocks]);

  const shareTitle =
    shareArtifact?.title || '公共服务热线工单按期办结率变化分析 · 精选结果';

  const shareTime = shareArtifact?.createdAt
    ? new Date(shareArtifact.createdAt).toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      })
    : new Date().toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });

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
        {blocksToRender.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-500 text-sm">
            暂无已精选的公开分析卡片。
          </div>
        ) : (
          blocksToRender.map((block) => (
            <div key={block.blockId} className="transition-all">
              <BlockRenderer
                block={block}
                onOpenReport={(artifactId) => onOpenReportModal?.(artifactId)}
              />
            </div>
          ))
        )}

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
              • <strong>服务工单数据：</strong>公共服务热线工单数据库
            </li>
            <li>
              • <strong>融合机制：</strong>临时数据与企业正式库隔离校核
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
