import React, { useEffect, useRef, useState } from 'react';
import { Turn, AgentBlock, AgentTask } from '../../agent/contracts';
import { ConversationTurn } from './ConversationTurn';
import { Sparkles, ArrowRight, Search, MessageSquare, TrendingUp, Calendar, FileSpreadsheet } from 'lucide-react';
import { getNextActions } from '../../agent/utils/nextActions';

interface AgentThreadProps {
  task?: AgentTask;
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
  task,
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
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const isNearBottom = useRef(true);
  const [hasNewContent, setHasNewContent] = useState(false);

  // Extract all meaningful blocks across turns to serve as shareable candidates
  const allBlocks = turns.flatMap((t) => t.blocks);

  const handleScroll = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const distance = el.scrollHeight - el.scrollTop - el.clientHeight;
    isNearBottom.current = distance < 100;
    if (isNearBottom.current) {
      setHasNewContent(false);
    }
  };

  useEffect(() => {
    if (isNearBottom.current) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    } else {
      setHasNewContent(true);
    }
  }, [turns, loading]);

  const currentTask: AgentTask = task || {
    sessionId: '',
    taskId: '',
    title: '公共服务热线工单按期办结率分析',
    status: 'OPEN',
    stage: 'ASK_DATA',
    context: {
      region: '上海市闵行区',
      metricName: '按期办结率',
    },
    turns,
    artifactIds: [],
  };

  const nextActions = getNextActions(currentTask);

  return (
    <div
      ref={scrollContainerRef}
      onScroll={handleScroll}
      className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 relative"
    >
      {/* If empty, show welcome guide */}
      {turns.length === 0 && (
        <div className="max-w-2xl mx-auto space-y-8 py-10 animate-in fade-in duration-300">
          <div className="text-center space-y-2.5">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              今天需要完成什么工作？
            </h2>
            <p className="text-sm text-slate-500 max-w-md mx-auto">
              可以直接描述数据问题、分析目标或上传文件。
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
            {nextActions.map((q, idx) => {
              const icon =
                idx === 0 ? (
                  <Search className="w-4 h-4 text-blue-600" />
                ) : idx === 1 ? (
                  <MessageSquare className="w-4 h-4 text-emerald-600" />
                ) : idx === 2 ? (
                  <TrendingUp className="w-4 h-4 text-indigo-600" />
                ) : (
                  <FileSpreadsheet className="w-4 h-4 text-amber-600" />
                );

              return (
                <div
                  key={q.id}
                  onClick={() => onQuickPrompt?.(q.text, q.hasFile)}
                  className="p-4.5 bg-white hover:bg-slate-50/80 border border-slate-200/90 hover:border-blue-300 rounded-2xl cursor-pointer transition-all shadow-xs space-y-2 group"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-slate-100/80 flex items-center justify-center group-hover:bg-blue-50 transition-colors">
                      {icon}
                    </div>
                    <span className="text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {q.title}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                    {q.text}
                  </p>
                  <div className="flex items-center gap-1 text-[11px] text-blue-600 font-medium pt-0.5">
                    <span>点击发起</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Render Turns using ConversationTurn hierarchy */}
      <div className="max-w-3xl mx-auto space-y-6">
        {turns.map((turn) => (
          <ConversationTurn
            key={turn.turnId}
            turn={turn}
            task={currentTask}
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
        ))}

        {/* Suggest Next Actions chip bar if turns exist and not loading */}
        {turns.length > 0 && !loading && nextActions.length > 0 && (
          <div className="space-y-2 pt-2 animate-in fade-in duration-200">
            <span className="text-xs text-slate-400">你还可以继续：</span>
            <div className="flex flex-wrap gap-2">
              {nextActions.slice(0, 3).map((action) => (
                <button
                  key={action.id}
                  onClick={() => onQuickPrompt?.(action.text, action.hasFile)}
                  className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-600 hover:border-blue-300 hover:text-blue-700 transition-colors cursor-pointer shadow-2xs"
                >
                  {action.title}
                </button>
              ))}
            </div>
          </div>
        )}

        {loading && (
          <div className="flex items-center gap-2 text-xs text-slate-500 py-2 bg-slate-50 border border-slate-200/60 rounded-xl px-4 w-fit">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            <span>Semovix Agent 正在执行意图解析与分析推理...</span>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Floating pill when new content arrived while user scrolled up */}
      {hasNewContent && (
        <button
          onClick={() => {
            bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
            setHasNewContent(false);
          }}
          className="sticky bottom-3 mx-auto flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-600 shadow-lg cursor-pointer hover:bg-slate-50 transition-all z-10 block"
        >
          ↓ 有新内容
        </button>
      )}
    </div>
  );
};
