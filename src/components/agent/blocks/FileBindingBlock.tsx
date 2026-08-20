import React from 'react';
import { FileSemanticBindingPayload } from '../../../agent/contracts';
import { FileSpreadsheet, CheckCircle2, Link2, AlertCircle } from 'lucide-react';

interface Props {
  payload: FileSemanticBindingPayload;
}

export const FileBindingBlock: React.FC<Props> = ({ payload }) => {
  const { fileName, fileSizeText, bindings = [], summary } = payload;
  const isFailed = summary?.includes('❌') || summary?.includes('解析失败') || summary?.includes('未识别') || summary?.includes('不支持');

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-4 animate-in fade-in duration-200">
      {/* File Card Header */}
      <div className={`flex items-center justify-between p-3 rounded-xl border ${
        isFailed ? 'bg-rose-50/60 border-rose-200' : 'bg-slate-50 border border-slate-200'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-lg border flex items-center justify-center ${
            isFailed
              ? 'bg-rose-100 border-rose-200 text-rose-700'
              : 'bg-emerald-100 border border-emerald-200 text-emerald-700'
          }`}>
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <div className="font-semibold text-slate-900 text-xs font-mono">
              {fileName || 'data_upload.csv'}
            </div>
            <div className="text-[11px] text-slate-500">
              数据文件 · {fileSizeText || '已上传'}
            </div>
          </div>
        </div>

        {isFailed ? (
          <span className="bg-rose-100 text-rose-800 border border-rose-200 text-[11px] px-2.5 py-1 rounded-full font-medium flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
            解析未通过
          </span>
        ) : (
          <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] px-2.5 py-1 rounded-full font-medium flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            语义已对齐
          </span>
        )}
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
        <p className={`text-xs leading-relaxed p-2.5 rounded-lg border ${
          isFailed
            ? 'bg-rose-50 border-rose-200 text-rose-800 font-medium'
            : 'bg-slate-50 border-slate-100 text-slate-600'
        }`}>
          {summary}
        </p>
      )}
    </div>
  );
};
