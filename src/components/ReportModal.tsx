import React from 'react';
import { X, Download, Share2, CheckCircle, AlertTriangle, FileText, ShieldCheck } from 'lucide-react';
import { ReportDocument } from '../agent/contracts';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShare?: () => void;
  reportDocument?: ReportDocument | null;
  loading?: boolean;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  onShare,
  reportDocument,
  loading = false,
}) => {
  if (!isOpen) return null;

  if (loading || !reportDocument) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
        <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg p-6 text-center space-y-4">
          <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto animate-pulse">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">正在载入归因分析报告...</h3>
            <p className="text-xs text-slate-500 mt-1">
              正在从 Semovix ArtifactStore 加载报告内容与多维证据链。
            </p>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs rounded-xl font-medium cursor-pointer"
          >
            关闭
          </button>
        </div>
      </div>
    );
  }

  const doc = reportDocument;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 sm:px-6 sm:py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-900 text-base">
                {doc.title || '归因诊断报告'}
              </h2>
              <p className="text-xs text-slate-500">
                HTML 分析报告 · 生成时间: {doc.generatedAt || '最新'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const blob = new Blob([JSON.stringify(doc, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${doc.artifactId || 'report'}.json`;
                a.click();
              }}
              className="text-xs bg-white text-slate-700 hover:bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">导出报告</span>
            </button>

            {onShare && (
              <button
                onClick={onShare}
                className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">分享报告</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body - Styled Document Viewer */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 text-slate-800 text-sm leading-relaxed">
          {/* Document Header Box */}
          <div className="border-b border-slate-200 pb-6">
            <div className="inline-block bg-blue-50 text-blue-700 text-xs font-semibold px-2.5 py-1 rounded-md border border-blue-100 mb-2">
              Semovix Verified Artifact
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              {doc.title}
            </h1>
            <p className="text-xs text-slate-500 mt-2">
              数据周期：{doc.scope?.timeLabel || '最新周期'} ｜ 分析范围：{doc.scope?.region || '全区'}
            </p>
          </div>

          {/* Core Findings Box */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 sm:p-5 space-y-3">
            <h3 className="font-semibold text-slate-900 text-sm flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-blue-600" />
              <span>一、核心分析结论</span>
            </h3>
            <p className="text-xs text-slate-700 leading-relaxed">
              {doc.summary}
            </p>
          </div>

          {/* Section 2: Metric Performance Table (if metric present) */}
          {doc.metric && (
            <div className="space-y-3">
              <h3 className="font-semibold text-slate-900 text-sm">二、核心指标表现</h3>
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
                    <tr>
                      <th className="p-3">指标名称</th>
                      <th className="p-3 text-right">本期数值</th>
                      <th className="p-3 text-right">环比/同比变化</th>
                      <th className="p-3">状态</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="p-3 font-medium text-slate-900">{doc.metric.name}</td>
                      <td className="p-3 text-right font-bold text-blue-700">{doc.metric.value}</td>
                      <td className="p-3 text-right font-semibold text-rose-600">{doc.metric.comparison || '—'}</td>
                      <td className="p-3 text-slate-600">已接入语义模型</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Section 3: Diagnostic Breakdown */}
          {doc.findings && doc.findings.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-slate-900 text-sm">三、下钻归因与结构拆解</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                {doc.findings.map((f, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1.5">
                    <span className="font-bold text-slate-900 block">{f.title}</span>
                    <p className="text-slate-600 leading-relaxed">{f.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 4: Evidence Table */}
          {doc.evidence && doc.evidence.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-slate-900 text-sm">四、多维归因证据清单</h3>
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
                    <tr>
                      <th className="p-3">归因维度 / 驱动因子</th>
                      <th className="p-3 text-right">周度变化量</th>
                      <th className="p-3">影响等级</th>
                      <th className="p-3">证据状态</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {doc.evidence.map((ev, idx) => (
                      <tr key={idx}>
                        <td className="p-3 font-medium text-slate-900">{ev.factor}</td>
                        <td className="p-3 text-right font-mono text-slate-700">{ev.weeklyChange}</td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                              ev.impactLevel === '高'
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : ev.impactLevel === '中高'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {ev.impactLevel}
                          </span>
                        </td>
                        <td className="p-3 text-slate-600 flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{ev.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Section 5: Limitations */}
          {doc.limitation && (
            <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2 text-xs text-amber-900">
              <div className="flex items-center gap-1.5 font-bold">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>数据证据与局限性说明</span>
              </div>
              <p className="leading-relaxed">{doc.limitation}</p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>Semovix Enterprise Semantic Platform · Trusted Evidence Artifact</span>
          <button
            onClick={onClose}
            className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-1.5 rounded-lg font-medium cursor-pointer"
          >
            关闭预览
          </button>
        </div>
      </div>
    </div>
  );
};
