import React from 'react';
import { ToolExecutionPayload } from '../../../agent/contracts';
import { Terminal, CheckCircle2, ChevronRight, Code } from 'lucide-react';

interface Props {
  payload: ToolExecutionPayload;
  onOpenTrace?: () => void;
}

export const ToolExecutionBlock: React.FC<Props> = ({ payload, onOpenTrace }) => {
  const { tool, status, code, outputs } = payload;

  return (
    <div className="bg-slate-950 text-slate-200 border border-slate-800 rounded-2xl p-4 shadow-inner space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-mono text-slate-200">
            {tool === 'python' ? 'Python Sandbox Execution' : 'SQL Analytics Engine'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 text-[11px] font-mono bg-emerald-950/80 text-emerald-300 border border-emerald-800/80 px-2 py-0.5 rounded-full">
            <CheckCircle2 className="w-3 h-3" />
            {status}
          </span>

          {onOpenTrace && (
            <button
              onClick={onOpenTrace}
              className="text-[11px] text-blue-400 hover:text-blue-300 flex items-center gap-0.5 cursor-pointer bg-slate-900 hover:bg-slate-800 px-2 py-0.5 rounded border border-slate-700 transition-colors"
            >
              <span>查看执行记录</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {code && (
        <div className="bg-slate-900/90 rounded-xl p-3 font-mono text-[11px] text-slate-300 overflow-x-auto border border-slate-800/80">
          <div className="text-[10px] text-slate-500 pb-1 mb-1 border-b border-slate-800 flex items-center gap-1">
            <Code className="w-3 h-3" /> main.py
          </div>
          <pre className="whitespace-pre">{code}</pre>
        </div>
      )}

      {outputs && (
        <div className="flex items-center gap-4 text-xs font-mono pt-1 text-slate-400">
          <div>
            匹配工单：<span className="text-white font-semibold">{outputs.matchedRows?.toLocaleString() ?? 4094}</span> 行
          </div>
          <div>
            超期率：<span className="text-rose-400 font-semibold">{((outputs.focusOverdueRate || 0.224) * 100).toFixed(1)}%</span>
          </div>
        </div>
      )}
    </div>
  );
};
