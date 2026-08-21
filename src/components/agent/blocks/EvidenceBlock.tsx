import React from 'react';
import { EvidenceSummaryPayload } from '../../../agent/contracts';
import { AlertCircle, CheckCircle, Info } from 'lucide-react';

interface Props {
  payload: EvidenceSummaryPayload;
}

export const EvidenceBlock: React.FC<Props> = ({ payload }) => {
  const { title, factors, evidenceTable, pendingNote } = payload;

  return (
    <div className="space-y-3">
      {/* Title */}
      <h3 className="font-semibold text-slate-900 text-sm flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
        <span>{title || '按期办结率下降主要由三个因素共同造成'}</span>
      </h3>

      {/* Factors list */}
      <div className="space-y-2">
        {factors.map((f, idx) => (
          <div
            key={idx}
            className="p-3 rounded-xl border border-slate-200 bg-white/80 space-y-1"
          >
            <span className="font-semibold text-slate-900 text-xs flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              {f.title}
            </span>
            <p className="text-xs text-slate-600 leading-relaxed pl-3">{f.description}</p>
          </div>
        ))}
      </div>

      {/* Evidence Table */}
      {evidenceTable && evidenceTable.length > 0 && (
        <div className="border border-slate-200 rounded-xl overflow-hidden text-xs bg-white">
          <div className="bg-slate-50 px-3.5 py-2 text-slate-600 font-semibold grid grid-cols-4 border-b border-slate-100">
            <span className="col-span-2">归因诊断因子</span>
            <span className="text-center">周度变动</span>
            <span className="text-right">验证状态</span>
          </div>
          <div className="divide-y divide-slate-100">
            {evidenceTable.map((item, idx) => (
              <div key={idx} className="px-3.5 py-2.5 grid grid-cols-4 items-center">
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
        <div className="p-3 bg-amber-50/70 border border-amber-200/70 rounded-xl text-amber-900 text-xs leading-relaxed flex items-start gap-2">
          <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>{pendingNote}</div>
        </div>
      )}
    </div>
  );
};
