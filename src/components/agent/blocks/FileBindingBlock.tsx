import React from 'react';
import { FileSemanticBindingPayload } from '../../../agent/contracts';
import { FileSpreadsheet, CheckCircle2, Link2 } from 'lucide-react';

interface Props {
  payload: FileSemanticBindingPayload;
}

export const FileBindingBlock: React.FC<Props> = ({ payload }) => {
  const { fileName, fileSizeText, bindings, summary } = payload;

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-4">
      {/* File Card Header */}
      <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-700">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <div className="font-semibold text-slate-900 text-xs font-mono">
              {fileName || 'focus_case_list_2026W32.csv'}
            </div>
            <div className="text-[11px] text-slate-500">
              CSV 数据文件 · {fileSizeText || '944.7 KB'} · 已解析 4,094 行
            </div>
          </div>
        </div>

        <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] px-2.5 py-1 rounded-full font-medium flex items-center gap-1">
          <CheckCircle2 className="w-3.5 h-3.5" />
          语义已对齐
        </span>
      </div>

      {/* Field Bindings */}
      {bindings && bindings.length > 0 && (
        <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
          <div className="bg-slate-100/70 px-4 py-2 text-slate-600 font-semibold grid grid-cols-2">
            <span>CSV 原始字段</span>
            <span>映射至企业语义概念</span>
          </div>
          <div className="divide-y divide-slate-100 bg-white">
            {bindings.map((b, idx) => (
              <div key={idx} className="px-4 py-2.5 grid grid-cols-2 items-center">
                <span className="font-mono text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded w-fit text-[11px]">
                  {b.sourceColumn}
                </span>
                <span className="text-slate-800 font-medium flex items-center gap-1.5">
                  <Link2 className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                  {b.mappedConcept}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {summary && (
        <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-100">
          {summary}
        </p>
      )}
    </div>
  );
};
