import React from 'react';
import { EvidenceSummaryPayload } from '../../../agent/contracts';
import { AlertCircle, CheckCircle, Info } from 'lucide-react';

interface Props {
  payload: EvidenceSummaryPayload;
}

export const EvidenceBlock: React.FC<Props> = ({ payload }) => {
  const { title, factors, evidenceTable, pendingNote } = payload;

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-4">
      {/* Title */}
      <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-rose-500" />
        {title || '按期办结率下降主要由三个因素共同造成'}
      </h3>

      {/* Factors 3 Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {factors.map((f, idx) => (
          <div
            key={idx}
            className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1.5"
          >
            <span className="font-semibold text-slate-900 text-xs block">{f.title}</span>
            <p className="text-xs text-slate-600 leading-relaxed">{f.description}</p>
          </div>
        ))}
      </div>

      {/* Evidence Table */}
      {evidenceTable && evidenceTable.length > 0 && (
        <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
          <div className="bg-slate-100/70 px-4 py-2 text-slate-600 font-semibold grid grid-cols-4">
            <span className="col-span-2">归因诊断因子</span>
            <span className="text-center">周度变动</span>
            <span className="text-right">验证状态</span>
          </div>
          <div className="divide-y divide-slate-100 bg-white">
            {evidenceTable.map((item, idx) => (
              <div key={idx} className="px-4 py-2.5 grid grid-cols-4 items-center">
                <span className="col-span-2 text-slate-800 font-medium">{item.factor}</span>
                <span className="text-center font-mono text-slate-700">{item.weeklyChange}</span>
                <span className="text-right">
                  {item.status === '已验证' ? (
                    <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 text-[11px] font-medium">
                      <CheckCircle className="w-3 h-3" />
                      已验证 · {item.impactLevel}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 text-[11px] font-medium">
                      <AlertCircle className="w-3 h-3" />
                      {item.status}
                    </span>
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pending Evidence Note */}
      {pendingNote && (
        <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl text-amber-900 text-xs leading-relaxed flex items-start gap-2">
          <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>{pendingNote}</div>
        </div>
      )}
    </div>
  );
};
