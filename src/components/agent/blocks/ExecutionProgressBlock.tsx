import React, { useEffect, useRef, useState } from 'react';
import { CheckCircle2, ChevronDown, ChevronRight, Loader2, Sparkles } from 'lucide-react';
import { ExecutionProgressPayload } from '../../../agent/contracts';

interface Props {
  payload: ExecutionProgressPayload;
}

export const ExecutionProgressBlock: React.FC<Props> = ({ payload }) => {
  const steps = payload.steps ?? [];
  const isDone = steps.length > 0 && steps.every((step) => step.status === 'DONE');
  const doneCount = steps.filter((step) => step.status === 'DONE').length;

  const previousDone = useRef(isDone);
  const [expanded, setExpanded] = useState(!isDone);

  // Automatically collapse when execution completes
  useEffect(() => {
    if (!previousDone.current && isDone) {
      setExpanded(false);
    }
    previousDone.current = isDone;
  }, [isDone]);

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/70 overflow-hidden shadow-2xs">
      <button
        onClick={() => setExpanded((value) => !value)}
        className="w-full flex items-center justify-between px-3.5 py-2.5 text-left cursor-pointer hover:bg-slate-100/60 transition-colors"
      >
        <div className="flex items-center gap-2">
          {isDone ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
          )}

          <span className="text-xs font-medium text-slate-700">
            {isDone
              ? `已完成 ${steps.length} 步分析`
              : payload.title || '正在分析'}
          </span>

          {!isDone && (
            <span className="text-[11px] text-slate-400 font-mono">
              {doneCount}/{steps.length}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 text-slate-400 text-xs">
          {isDone && <span className="text-[11px] text-slate-400">查看过程</span>}
          {expanded ? (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronRight className="w-4 h-4 text-slate-400" />
          )}
        </div>
      </button>

      {expanded && (
        <div className="border-t border-slate-200 px-3.5 py-3 space-y-2 bg-white/60">
          {steps.map((step, index) => (
            <div key={index} className="flex items-center justify-between text-xs py-0.5">
              <div className="flex items-center gap-2 min-w-0 pr-2">
                {step.status === 'DONE' ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                ) : step.status === 'RUNNING' ? (
                  <Loader2 className="w-3.5 h-3.5 text-blue-600 animate-spin shrink-0" />
                ) : (
                  <span className="w-3.5 h-3.5 rounded-full border border-slate-300 shrink-0" />
                )}

                <span
                  className={
                    step.status === 'RUNNING'
                      ? 'text-slate-900 font-medium'
                      : 'text-slate-500'
                  }
                >
                  {step.title}
                </span>
              </div>

              {step.status === 'RUNNING' && (
                <span className="text-[11px] text-blue-600 font-medium">执行中</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
