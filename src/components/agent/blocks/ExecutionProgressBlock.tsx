import React from 'react';
import { ExecutionProgressPayload } from '../../../agent/contracts';
import { CheckCircle2, Loader2, Sparkles } from 'lucide-react';

interface Props {
  payload: ExecutionProgressPayload;
}

export const ExecutionProgressBlock: React.FC<Props> = ({ payload }) => {
  const { title, steps } = payload;

  return (
    <div className="bg-slate-900 text-slate-100 rounded-2xl p-5 border border-slate-800 shadow-md space-y-3.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-blue-400" />
          <h4 className="text-sm font-semibold text-white">
            {title || '智能探查归因分析过程'}
          </h4>
        </div>
        <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded-full">
          6 步分析已完成
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
        {steps.map((step, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between p-2.5 rounded-lg bg-slate-800/80 border border-slate-700/60"
          >
            <div className="flex items-center gap-2">
              {step.status === 'DONE' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <Loader2 className="w-4 h-4 text-blue-400 animate-spin shrink-0" />
              )}
              <span className="text-slate-200">{step.title}</span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono bg-slate-900 px-1.5 py-0.5 rounded">
              {step.tag}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
