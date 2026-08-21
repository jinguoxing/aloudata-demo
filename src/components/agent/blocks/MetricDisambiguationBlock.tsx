import React from 'react';
import { MetricDisambiguationPayload } from '../../../agent/contracts';
import { CheckCircle2, ChevronRight, HelpCircle, ShieldCheck } from 'lucide-react';

interface Props {
  payload: MetricDisambiguationPayload;
  onSelectMetric: (metricId: string) => void;
  disabled?: boolean;
}

export const MetricDisambiguationBlock: React.FC<Props> = ({
  payload,
  onSelectMetric,
  disabled = false,
}) => {
  const { title, candidates, recommendedMetricId, selectedMetricId, resolutionStatus } = payload;

  if (resolutionStatus === 'RESOLVED' && selectedMetricId) {
    const selected = candidates.find((c) => c.id === selectedMetricId);
    return (
      <div className="flex items-center gap-2 rounded-lg bg-slate-50 border border-slate-200/80 px-3.5 py-2.5 text-xs text-slate-600 shadow-2xs">
        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
        <span>已使用正式指标口径：</span>
        <strong className="font-semibold text-slate-900">{selected?.name || selectedMetricId}</strong>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-4">
      <div className="flex items-center gap-2 text-slate-800 font-semibold text-sm">
        <HelpCircle className="w-4 h-4 text-blue-600" />
        <span>{title || '找到相关正式指标，请确认本次使用口径'}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {candidates.map((candidate) => {
          const isSelected = selectedMetricId === candidate.id;
          const isRecommended = candidate.isRecommended || recommendedMetricId === candidate.id;

          return (
            <div
              key={candidate.id}
              onClick={() => !disabled && onSelectMetric(candidate.id)}
              className={`p-4 rounded-xl border transition-all cursor-pointer relative flex flex-col justify-between ${
                isSelected
                  ? 'border-blue-500 bg-blue-50/40 ring-2 ring-blue-100'
                  : 'border-slate-200 bg-slate-50/50 hover:border-slate-300 hover:bg-slate-50'
              } ${disabled ? 'opacity-90 cursor-default' : ''}`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-900 text-sm flex items-center gap-1.5">
                    {candidate.name}
                    {isRecommended && (
                      <span className="bg-blue-100 text-blue-800 text-[10px] font-medium px-1.5 py-0.5 rounded border border-blue-200">
                        {candidate.tag || '推荐'}
                      </span>
                    )}
                  </span>
                  {isSelected && (
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                  )}
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {candidate.definition}
                </p>
              </div>

              <div className="pt-3 mt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-blue-700 font-medium">
                <span>{isSelected ? '已选择该口径' : '点击使用此指标'}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-2 text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
        <ShieldCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
        <span>认证指标直接连接企业语义模型，确保所有计算口径在全业务线统一一致。</span>
      </div>
    </div>
  );
};
