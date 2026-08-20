import React from 'react';
import { MetricAnswerPayload } from '../../../agent/contracts';
import { ShieldCheck, HelpCircle, ArrowDownRight, ArrowRight } from 'lucide-react';

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
  const { metricName, headlineValue, headlineHighlight, table, summaryNote } = payload;

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-4">
      {/* Metric Title & Verified badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-blue-600" />
          <h3 className="font-bold text-slate-900 text-base">{metricName}</h3>
          <span className="bg-emerald-50 text-emerald-700 text-xs px-2 py-0.5 rounded-full font-medium border border-emerald-200">
            正式认证口径
          </span>
        </div>

        {onOpenMetricContext && (
          <button
            onClick={onOpenMetricContext}
            className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 cursor-pointer bg-blue-50/60 hover:bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100 transition-colors"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>查看指标口径定义</span>
          </button>
        )}
      </div>

      {/* Headline banner */}
      <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-xs text-slate-500 font-medium block mb-0.5">
            上周闵行区工单按期办结率
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 tracking-tight">
              {headlineHighlight || headlineValue}
            </span>
            <span className="text-xs font-semibold text-rose-600 flex items-center">
              <ArrowDownRight className="w-4 h-4" />
              环比下降 4.8 个百分点
            </span>
          </div>
        </div>

        {onFollowUpDiagnosis && (
          <button
            onClick={onFollowUpDiagnosis}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium px-3.5 py-2 rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer transition-all self-start sm:self-auto"
          >
            <span>下钻诊断：为什么下降？</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Metric Breakdown Table */}
      {table && table.length > 0 && (
        <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
          <div className="bg-slate-100/70 px-4 py-2 text-slate-600 font-semibold grid grid-cols-3">
            <span>指标项</span>
            <span className="text-right">本周数值</span>
            <span className="text-right">环比变动</span>
          </div>
          <div className="divide-y divide-slate-100 bg-white">
            {table.map((row, idx) => (
              <div
                key={idx}
                className={`px-4 py-2.5 grid grid-cols-3 items-center ${
                  row.highlight ? 'bg-blue-50/30 font-medium' : ''
                }`}
              >
                <span className="text-slate-800">{row.name}</span>
                <span className="text-right font-mono text-slate-900">{row.current}</span>
                <span
                  className={`text-right font-mono ${
                    row.wow.includes('↓') ? 'text-rose-600' : 'text-emerald-600'
                  }`}
                >
                  {row.wow}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary Note */}
      {summaryNote && (
        <p className="text-xs text-slate-600 leading-relaxed bg-slate-50/50 p-3 rounded-xl border border-slate-100">
          {summaryNote}
        </p>
      )}
    </div>
  );
};
