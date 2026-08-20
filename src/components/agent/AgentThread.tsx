import React, { useEffect, useRef } from 'react';
import { Turn, AgentBlock } from '../../agent/contracts';
import { BlockRenderer } from './BlockRenderer';
import { User, Sparkles, FileSpreadsheet, ArrowRight } from 'lucide-react';

interface AgentThreadProps {
  turns: Turn[];
  loading?: boolean;
  onSelectMetric?: (metricId: string) => void;
  onOpenMetricContext?: () => void;
  onFollowUpDiagnosis?: () => void;
  onOpenTrace?: () => void;
  onOpenReport?: (artifactId: string) => void;
  onConfirmSchedule?: () => void;
  onInitiateShare?: () => void;
  onCreateShare?: (blockIds: string[], blocksToShare?: AgentBlock[]) => Promise<any>;
  onOpenReadOnlyView?: () => void;
  onQuickPrompt?: (prompt: string, attachment?: boolean) => void;
}

export const AgentThread: React.FC<AgentThreadProps> = ({
  turns,
  loading,
  onSelectMetric,
  onOpenMetricContext,
  onFollowUpDiagnosis,
  onOpenTrace,
  onOpenReport,
  onConfirmSchedule,
  onInitiateShare,
  onCreateShare,
  onOpenReadOnlyView,
  onQuickPrompt,
}) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Extract all meaningful blocks across turns to serve as shareable candidates
  const allBlocks = turns.flatMap((t) => t.blocks);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [turns, loading]);

  const quickPrompts = [
    {
      title: '发起问数',
      text: '帮我查一下上周公共服务热线工单按期办结率，看看趋势。',
      badge: 'Metric Query',
    },
    {
      title: '下钻归因',
      text: '为什么按期办结率环比下降了？请做多维归因分析。',
      badge: 'Attribution',
    },
    {
      title: '上传融合分析',
      text: '结合我上传的重点关注工单清单，帮我分析这批工单的超期影响。',
      badge: 'CSV Enrichment',
      hasFile: true,
    },
    {
      title: '创建周期任务',
      text: '以后每周一上午 9 点帮我做一次这个分析，生成周报。',
      badge: 'Workflow Schedule',
    },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
      {/* If empty, show welcome guide */}
      {turns.length === 0 && (
        <div className="max-w-3xl mx-auto space-y-6 py-6 animate-in fade-in duration-300">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Semovix AI Native Semantic Intelligence</span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              公共服务热线问数与自动化分析工作台
            </h2>
            <p className="text-sm text-slate-500 max-w-xl mx-auto">
              基于企业正式语义模型、指标消歧与工具执行引擎。输入您的分析诉求或点击推荐场景直接发起。
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {quickPrompts.map((q, idx) => (
              <div
                key={idx}
                onClick={() => onQuickPrompt?.(q.text, q.hasFile)}
                className="p-4 bg-white hover:bg-slate-50 border border-slate-200 hover:border-blue-300 rounded-2xl cursor-pointer transition-all shadow-xs space-y-2 group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                    {q.title}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                    {q.badge}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{q.text}</p>
                <div className="flex items-center gap-1 text-[11px] text-blue-600 font-medium pt-1">
                  <span>点击运行</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Render Turns */}
      <div className="max-w-3xl mx-auto space-y-6">
        {turns.map((turn) => (
          <div key={turn.turnId} className="space-y-4">
            {/* User Turn */}
            {turn.role === 'user' && (
              <div className="flex justify-end items-start gap-2.5">
                <div className="max-w-[85%] space-y-2">
                  {turn.attachments && turn.attachments.length > 0 && (
                    <div className="flex flex-wrap gap-2 justify-end">
                      {turn.attachments.map((att) => (
                        <div
                          key={att.attachmentId}
                          className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-2.5 py-1 rounded-lg shadow-xs"
                        >
                          <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="font-mono">{att.fileName}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {turn.text && (
                    <div className="bg-slate-900 text-white px-4 py-2.5 rounded-2xl rounded-tr-xs text-xs sm:text-sm leading-relaxed shadow-sm font-normal">
                      {turn.text}
                    </div>
                  )}
                </div>

                <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5 text-xs font-semibold">
                  <User className="w-4 h-4" />
                </div>
              </div>
            )}

            {/* Agent response blocks belonging to this turn */}
            {turn.blocks.length > 0 && (
              <div className="space-y-3.5 animate-in fade-in duration-200">
                {turn.blocks.map((block) => (
                  <div key={block.blockId}>
                    <BlockRenderer
                      block={block}
                      availableBlocks={allBlocks}
                      onSelectMetric={onSelectMetric}
                      onOpenMetricContext={onOpenMetricContext}
                      onFollowUpDiagnosis={onFollowUpDiagnosis}
                      onOpenTrace={onOpenTrace}
                      onOpenReport={onOpenReport}
                      onConfirmSchedule={onConfirmSchedule}
                      onInitiateShare={onInitiateShare}
                      onCreateShare={onCreateShare}
                      onOpenReadOnlyView={onOpenReadOnlyView}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-xs text-slate-500 py-2 bg-slate-50 border border-slate-200/60 rounded-xl px-4 w-fit">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            <span>Semovix Agent 正在执行意图解析与工具协同...</span>
          </div>
        )}

        <div ref={bottomRef} />
      </div>
    </div>
  );
};
