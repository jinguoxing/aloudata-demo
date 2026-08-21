import React from 'react';
import { ArtifactSummaryPayload } from '../../../agent/contracts';
import { FileText, ExternalLink, Download } from 'lucide-react';

interface Props {
  payload: ArtifactSummaryPayload;
  onOpenReport?: (artifactId: string) => void;
}

export const ArtifactBlock: React.FC<Props> = ({ payload, onOpenReport }) => {
  const { artifactId, title, type, description } = payload;

  return (
    <div className="bg-gradient-to-r from-blue-50/70 via-slate-50 to-indigo-50/50 border border-blue-200/80 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div className="flex items-start gap-3.5">
        <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
          <FileText className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded border border-blue-200 uppercase">
              HTML Artifact
            </span>
            <h4 className="font-bold text-slate-900 text-sm">
              {title || '按期办结率波动归因分析 · 2026W32.html'}
            </h4>
          </div>
          <p className="text-xs text-slate-600">
            {description || '包含核心结论、指标变化、街镇拆解与证据局限'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 self-end sm:self-center">
        {onOpenReport && (
          <button
            onClick={() => onOpenReport(artifactId)}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium px-3.5 py-2 rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <span>预览报告</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        )}

        <button
          onClick={async () => {
            try {
              const res = await fetch(`/api/v1/artifacts/${artifactId}`);
              if (res.ok) {
                const doc = await res.json();
                const htmlContent = doc.content || `<!DOCTYPE html><html><head><title>${title}</title></head><body><h1>${title}</h1><p>${description}</p></body></html>`;
                const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${title || 'report'}.html`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
              } else {
                onOpenReport?.(artifactId);
              }
            } catch {
              onOpenReport?.(artifactId);
            }
          }}
          className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-medium px-3 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
          title="下载离线 HTML 报告"
        >
          <Download className="w-3.5 h-3.5 text-slate-500" />
          <span className="hidden sm:inline">下载</span>
        </button>
      </div>
    </div>
  );
};
