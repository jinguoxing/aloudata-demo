import React from 'react';
import { MetricAnswerPayload } from '../../../agent/contracts';

interface Props {
  payload: MetricAnswerPayload;
  onOpenMetricContext?: () => void;
  onFollowUpDiagnosis?: () => void;
}

export const MetricAnswerBlock: React.FC<Props> = ({
  payload,
  onOpenMetricContext,
  onFollowUpDiagnosis,
}) => {
  const {
    metricName,
    headlineValue,
    periodLabel,
    scopeLabel,
    comparisonText,
    table,
    summaryNote,
  } = payload;

  return (
    <div className="space-y-3">
      {/* Natural language first */}
      <div className="space-y-1">
        <p className="text-sm leading-6 text-slate-800">
          {periodLabel || '当前周期'}
          {scopeLabel ? ` ${scopeLabel}` : ''} 的
          <strong className="mx-1 font-semibold text-slate-900">{metricName}</strong>
          为
          <strong className="ml-1 text-lg font-bold text-slate-950">{headlineValue}</strong>。
        </p>

        {comparisonText && (
          <p className="text-xs text-slate-500">{comparisonText}</p>
        )}
      </div>

      {/* Lightweight table surface */}
      {table && table.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          {table.map((row, index) => (
            <div
              key={`${row.name}-${index}`}
              className={`grid grid-cols-[1fr_auto_auto] items-center gap-5 px-3.5 py-2.5 text-xs border-b border-slate-100 last:border-0 ${
                row.highlight ? 'bg-blue-50/30 font-medium' : ''
              }`}
            >
              <span className="text-slate-700">{row.name}</span>
              <span className="font-mono font-medium text-slate-900">{row.current}</span>
              <span
                className={`font-mono ${
                  row.wow.includes('↓') ? 'text-rose-600' : 'text-emerald-600'
                }`}
              >
                {row.wow}
              </span>
            </div>
          ))}
        </div>
      )}

      {summaryNote && (
        <p className="text-xs leading-relaxed text-slate-600 bg-slate-50/60 p-3 rounded-lg border border-slate-100">
          {summaryNote}
        </p>
      )}

      <div className="flex items-center gap-3 pt-1">
        {onOpenMetricContext && (
          <button
            onClick={onOpenMetricContext}
            className="text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors cursor-pointer"
          >
            查看指标口径
          </button>
        )}

        {onFollowUpDiagnosis && (
          <button
            onClick={onFollowUpDiagnosis}
            className="text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors cursor-pointer"
          >
            为什么变化？
          </button>
        )}
      </div>
    </div>
  );
};
