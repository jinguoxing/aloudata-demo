import React from 'react';
import { AnalysisResultPayload } from '../../../agent/contracts';
import { BarChart3 } from 'lucide-react';

interface Props {
  payload: AnalysisResultPayload;
}

export const AnalysisResultBlock: React.FC<Props> = ({ payload }) => {
  const { headline, stats, table } = payload;

  return (
    <div className="space-y-3">
      {/* Title */}
      <h3 className="font-semibold text-slate-900 text-sm flex items-center gap-2">
        <BarChart3 className="w-4 h-4 text-blue-600 shrink-0" />
        <span>{headline || '重点关注工单确实放大了本周办结率下降'}</span>
      </h3>

      {/* Stats Cards - Lightweight inline metrics */}
      {stats && stats.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {stats.map((stat, idx) => {
            let bgClass = 'bg-white border-slate-200 text-slate-900';
            let valClass = 'text-slate-900';
            if (stat.theme === 'rose') {
              bgClass = 'bg-rose-50/40 border-rose-200/70 text-rose-900';
              valClass = 'text-rose-600';
            } else if (stat.theme === 'blue') {
              bgClass = 'bg-blue-50/40 border-blue-200/70 text-blue-900';
              valClass = 'text-blue-600';
            }

            return (
              <div key={idx} className={`p-3 rounded-xl border ${bgClass} space-y-0.5 shadow-2xs`}>
                <span className="text-xs text-slate-500 font-medium block">{stat.label}</span>
                <div className="flex items-baseline gap-1.5">
                  <span className={`text-lg font-bold font-mono ${valClass}`}>
                    {stat.value}
                  </span>
                  {stat.subtext && (
                    <span className="text-[11px] text-slate-400 font-medium">
                      {stat.subtext}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Group Contrast Table */}
      {table && table.length > 0 && (
        <div className="border border-slate-200 rounded-xl overflow-hidden text-xs bg-white">
          <div className="bg-slate-50 px-3.5 py-2 text-slate-600 font-semibold grid grid-cols-4 border-b border-slate-100">
            <span>对比分析客群</span>
            <span className="text-right">工单数量</span>
            <span className="text-right">超期率</span>
            <span className="text-right">主要集中街镇</span>
          </div>
          <div className="divide-y divide-slate-100">
            {table.map((row, idx) => (
              <div
                key={idx}
                className={`px-3.5 py-2.5 grid grid-cols-4 items-center ${
                  row.group.includes('重点') ? 'bg-amber-50/30 font-medium' : ''
                }`}
              >
                <span className="text-slate-800">{row.group}</span>
                <span className="text-right font-mono text-slate-900">
                  {row.count.toLocaleString()} 件
                </span>
                <span
                  className={`text-right font-mono font-semibold ${
                    parseFloat(row.overdueRate) > 15 ? 'text-rose-600' : 'text-slate-800'
                  }`}
                >
                  {row.overdueRate}
                </span>
                <span className="text-right text-slate-600">{row.mainArea}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
