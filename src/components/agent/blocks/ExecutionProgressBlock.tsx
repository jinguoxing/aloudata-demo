import React from 'react';
import { ExecutionProgressPayload } from '../../../agent/contracts';
import { CheckCircle2, Loader2, Sparkles } from 'lucide-react';

interface Props {
  payload: ExecutionProgressPayload;
}

export const ExecutionProgressBlock: React.FC<Props> = ({ payload }) => {
  const { title, steps = [] } = payload;
  const isAllDone = steps.every((s) => s.status === 'DONE');
  const doneCount = steps.filter((s) => s.status === 'DONE').length;

  return (
    <div className="bg-slate-900 text-slate-100 rounded-2xl p-5 border border-slate-800 shadow-md space-y-3.5 animate-in fade-in duration-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-blue-400" />
          <h4 className="text-sm font-semibold text-white">
            {title || '智能探查归因分析过程'}
          </h4>
        </div>
        {isAllDone ? (
          <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded-full flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            <span>{steps.length} 步探查已全部就绪</span>
          </span>
        ) : (
          <span className="text-[11px] font-mono text-blue-300 bg-blue-950/60 border border-blue-800/60 px-2 py-0.5 rounded-full flex items-center gap-1">
            <Loader2 className="w-3 h-3 animate-spin text-blue-400" />
            <span>探查进度 {doneCount}/{steps.length}</span>
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
        {steps.map((step, idx) => {
          const isRunning = step.status === 'RUNNING';
          const isDone = step.status === 'DONE';

          return (
            <div
              key={idx}
              className={`flex items-center justify-between p-2.5 rounded-lg border transition-all ${
                isRunning
                  ? 'bg-blue-950/40 border-blue-700/80 ring-1 ring-blue-500/30'
                  : isDone
                  ? 'bg-slate-800/80 border-slate-700/60'
                  : 'bg-slate-900/50 border-slate-800/80 opacity-60'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0 pr-2">
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : isRunning ? (
                  <Loader2 className="w-4 h-4 text-blue-400 animate-spin shrink-0" />
                ) : (
                  <div className="w-3.5 h-3.5 rounded-full border border-slate-600 shrink-0 ml-0.5" />
                )}
                <span
                  className={`truncate ${
                    isRunning
                      ? 'text-blue-200 font-medium'
                      : isDone
                      ? 'text-slate-200'
                      : 'text-slate-400'
                  }`}
                >
                  {step.title}
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono bg-slate-950 px-1.5 py-0.5 rounded shrink-0">
                {step.tag}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
