import React from 'react';
import { DIAGNOSTIC_EVIDENCE } from '../../data/mockData';
import { Sparkles, CheckCircle2, FileText, ExternalLink, AlertCircle, ArrowRight, Download, Share2 } from 'lucide-react';

interface Page03Props {
  onNavigateNext: () => void;
  onOpenReportModal: () => void;
}

export const Page03Diagnosis: React.FC<Page03Props> = ({
  onNavigateNext,
  onOpenReportModal,
}) => {
  const executionSteps = [
    { title: '查询正式指标', tag: 'Metric Query · 已完成' },
    { title: '按街镇拆解', tag: 'Dimension Analysis · 已完成' },
    { title: '按诉求类型拆解', tag: 'Dimension Analysis · 已完成' },
    { title: '分析超期工单变化', tag: 'Detail Analysis · 已完成' },
    { title: '比较承办部门办理时长', tag: 'Query · 已完成' },
    { title: '综合形成诊断结论', tag: 'Analysis · 已完成' },
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto w-full animate-in fade-in duration-300">
      {/* User Question */}
      <div className="flex items-start gap-3 justify-end">
        <div className="bg-blue-600 text-white rounded-2xl rounded-tr-xs px-4 py-2.5 max-w-xl shadow-xs text-sm">
          为什么环比下降了？
        </div>
        <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center text-xs font-semibold shrink-0">
          LZ
        </div>
      </div>

      {/* Xino Response Container */}
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
          X
        </div>

        <div className="flex-1 space-y-5">
          {/* Agent Execution Timeline Box */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <h3 className="font-semibold text-slate-800 text-xs">正在分析下降原因</h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {executionSteps.map((step, idx) => (
                <div
                  key={idx}
                  className="bg-white border border-slate-200/80 rounded-lg p-2 flex items-center justify-between text-[11px]"
                >
                  <span className="text-slate-800 font-medium">{step.title}</span>
                  <span className="text-emerald-700 bg-emerald-50 text-[10px] px-1.5 py-0.2 rounded font-mono">
                    ✓
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Diagnostic Conclusions Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              按期办结率下降主要由三个因素共同造成
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-1.5">
                <span className="font-bold text-slate-900 text-xs block">
                  1. 重点街镇超期工单增加
                </span>
                <p className="text-xs text-slate-600 leading-relaxed">
                  七宝镇、莘庄镇的超期工单增幅明显，高于全区平均水平。
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-1.5">
                <span className="font-bold text-slate-900 text-xs block">
                  2. 物业与劳动保障处理周期拉长
                </span>
                <p className="text-xs text-slate-600 leading-relaxed">
                  两类诉求平均办理时长分别增加 <strong>0.7 天</strong> 与 <strong>0.9 天</strong>。
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-1.5">
                <span className="font-bold text-slate-900 text-xs block">
                  3. 跨部门协同工单占比上升
                </span>
                <p className="text-xs text-slate-600 leading-relaxed">
                  跨部门协同工单的按期办结率明显低于普通工单，形成叠加作用。
                </p>
              </div>
            </div>

            {/* Evidence Table */}
            <div className="space-y-2 pt-2">
              <h3 className="font-semibold text-slate-800 text-xs">归因数据证据库</h3>
              <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                    <tr>
                      <th className="p-2.5">影响因素</th>
                      <th className="p-2.5 text-right">本周变化</th>
                      <th className="p-2.5">解释力度</th>
                      <th className="p-2.5 text-right">证据状态</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {DIAGNOSTIC_EVIDENCE.map((item, idx) => (
                      <tr key={idx}>
                        <td className="p-2.5 font-medium text-slate-900">{item.factor}</td>
                        <td className="p-2.5 text-right font-mono text-slate-800">{item.weeklyChange}</td>
                        <td className="p-2.5">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                              item.impactLevel === '高'
                                ? 'bg-rose-100 text-rose-800'
                                : item.impactLevel === '中高'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {item.impactLevel}
                          </span>
                        </td>
                        <td className="p-2.5 text-right">
                          {item.status === '已验证' ? (
                            <span className="text-emerald-700 font-medium flex items-center justify-end gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> 已验证
                            </span>
                          ) : (
                            <span className="text-slate-400 font-medium">证据不足</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pending Evidence Note */}
            <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block mb-0.5">待补证据说明：</strong>
                目前缺少部分跨部门流转节点的完整处理时长，因此只能确认其与下降高度相关，不能直接认定为单一因果因素。
              </div>
            </div>

            {/* Generated Artifact Card */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50/50 border border-blue-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold shrink-0 shadow-xs">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-slate-900 text-sm">
                      按期办结率波动归因分析 · 2026W32
                    </h4>
                    <span className="bg-blue-100 text-blue-800 text-[10px] font-semibold px-2 py-0.5 rounded border border-blue-200">
                      HTML 分析报告
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    包含核心结论、指标变化、街镇拆解、诉求类型拆解、部门办理时长与证据局限
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                <button
                  onClick={onOpenReportModal}
                  className="bg-white hover:bg-slate-50 text-blue-700 border border-blue-300 font-semibold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>预览报告</span>
                </button>

                <button
                  onClick={() => alert('报告 HTML 文件已下载')}
                  className="p-1.5 text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
                  title="下载报告"
                >
                  <Download className="w-4 h-4" />
                </button>

                <button
                  onClick={onNavigateNext}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-3.5 py-1.5 rounded-lg text-xs flex items-center gap-1 transition-colors cursor-pointer shadow-xs"
                >
                  <span>下一步：融合 CSV</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
