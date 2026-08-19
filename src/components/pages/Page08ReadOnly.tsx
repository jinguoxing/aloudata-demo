import React from 'react';
import { WEEKLY_METRIC_TABLE, COMPARATIVE_ANALYSIS } from '../../data/mockData';
import { ShieldCheck, FileText, Download, ExternalLink, Sparkles, CheckCircle2 } from 'lucide-react';

interface Page08Props {
  onOpenReportModal: () => void;
  onReturnToWorkbench: () => void;
}

export const Page08ReadOnly: React.FC<Page08Props> = ({
  onOpenReportModal,
  onReturnToWorkbench,
}) => {
  return (
    <div className="min-h-full bg-slate-50/70 p-4 sm:p-8 flex flex-col items-center animate-in fade-in duration-300">
      {/* Read-Only Top Header Bar */}
      <div className="w-full max-w-4xl bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4 mb-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
              S
            </div>
            <span className="font-bold text-slate-900 text-base">Semovix</span>
            <span className="text-slate-300">/</span>
            <span className="text-xs text-slate-500 font-medium">精选只读分析成果</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>外部只读视图</span>
            </span>

            <button
              onClick={onReturnToWorkbench}
              className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
            >
              返回 AI 工作台
            </button>
          </div>
        </div>

        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            上周公共服务热线工单按期办结率变化分析
          </h1>
          <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>由 Xino 协助完成</span>
            <span>·</span>
            <span>生成于 2026-08-17</span>
            <span>·</span>
            <span>数据来源：上海市闵行区公共服务热线运营中心</span>
          </div>
        </div>
      </div>

      {/* Main Curated Content Blocks */}
      <div className="w-full max-w-4xl space-y-6">
        {/* Block 1: Metrics Answer */}
        <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-blue-700 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-blue-600" />
            <span>一、核心指标结果</span>
          </div>

          <h2 className="text-xl font-bold text-slate-900">
            上周按期办结率为 <span className="text-blue-700">86.42%</span> (环比 ↓ 4.8 个百分点)
          </h2>

          <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                <tr>
                  <th className="p-3">指标名称</th>
                  <th className="p-3 text-right">本周数值</th>
                  <th className="p-3 text-right">环比变化</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {WEEKLY_METRIC_TABLE.map((row, idx) => (
                  <tr key={idx} className={row.highlight ? 'bg-blue-50/40 font-semibold' : ''}>
                    <td className="p-3 text-slate-900">{row.name}</td>
                    <td className="p-3 text-right text-slate-900 font-mono">{row.current}</td>
                    <td
                      className={`p-3 text-right font-mono font-medium ${
                        row.wow.includes('↓')
                          ? 'text-rose-600'
                          : row.wow.includes('↑')
                          ? 'text-amber-600'
                          : 'text-slate-600'
                      }`}
                    >
                      {row.wow}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Block 2: Diagnostic Factors */}
        <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-amber-700 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-amber-600" />
            <span>二、为什么下降 · 归因诊断</span>
          </div>

          <h3 className="font-bold text-slate-900 text-base">三大核心驱动因素分析</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-1">
              <span className="font-bold text-slate-900 text-xs block">1. 重点街镇超期集中</span>
              <p className="text-xs text-slate-600">
                七宝镇、莘庄镇的超期工单增幅明显，高于全区平均水平。
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-1">
              <span className="font-bold text-slate-900 text-xs block">2. 物业与劳动保障响应拉长</span>
              <p className="text-xs text-slate-600">
                两类诉求平均办理时长分别增加 <strong>0.7 天</strong> 与 <strong>0.9 天</strong>。
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-1">
              <span className="font-bold text-slate-900 text-xs block">3. 跨部门协同延迟</span>
              <p className="text-xs text-slate-600">
                跨部门协同工单的按期办结率明显低于普通工单。
              </p>
            </div>
          </div>
        </section>

        {/* Block 3: Enriched Analysis */}
        <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-emerald-700 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-600" />
            <span>三、重点关注工单融合分析结果</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-400 text-xs">重点关注工单</span>
              <p className="text-xl font-extrabold text-slate-900 mt-0.5">4,094 件</p>
            </div>

            <div className="p-3.5 bg-rose-50/60 rounded-xl border border-rose-200">
              <span className="text-rose-700 text-xs">重点工单超期率</span>
              <p className="text-xl font-extrabold text-rose-700 mt-0.5">22.4%</p>
            </div>

            <div className="p-3.5 bg-blue-50/60 rounded-xl border border-blue-200">
              <span className="text-blue-700 text-xs">对新增超期的贡献</span>
              <p className="text-xl font-extrabold text-blue-800 mt-0.5">31.8%</p>
            </div>
          </div>

          <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                <tr>
                  <th className="p-3">群体</th>
                  <th className="p-3 text-right">工单数</th>
                  <th className="p-3 text-right">超期率</th>
                  <th className="p-3">主要集中区域</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {COMPARATIVE_ANALYSIS.map((row, idx) => (
                  <tr key={idx} className={idx === 0 ? 'bg-amber-50/30 font-semibold' : ''}>
                    <td className="p-3 text-slate-900">{row.group}</td>
                    <td className="p-3 text-right font-mono text-slate-800">
                      {row.count.toLocaleString()} 件
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-rose-600">
                      {row.overdueRate}
                    </td>
                    <td className="p-3 text-slate-700">{row.mainArea}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Block 4: Report Artifact */}
        <section className="bg-gradient-to-r from-blue-50/80 to-indigo-50/60 border border-blue-200 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shrink-0 shadow-xs">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-slate-900 text-base">
                  按期办结率波动归因分析 · 2026W32
                </h3>
                <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded border border-blue-200">
                  HTML 分析报告
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                包含全套指标变化、结构拆解与证据依据说明
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
            <button
              onClick={onOpenReportModal}
              className="bg-white hover:bg-slate-50 text-blue-700 border border-blue-300 font-semibold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>预览完整报告</span>
            </button>

            <button
              onClick={() => alert('报告 HTML 文件已下载')}
              className="p-2 text-slate-700 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer"
              title="下载报告"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </section>

        {/* Evidence Footer Box */}
        <section className="bg-slate-100/80 border border-slate-200 rounded-2xl p-5 space-y-2 text-xs text-slate-600">
          <div className="flex items-center gap-1.5 font-bold text-slate-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>数据依据与安全保证</span>
          </div>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-600 pt-1">
            <li>• <strong>正式指标：</strong>按期办结率（统计期内按时办结工单比例）</li>
            <li>• <strong>服务工单数据：</strong>闵行区公共服务热线工单库</li>
            <li>• <strong>融合文件：</strong>重点关注工单清单 (focus_case_list_2026W32.csv)</li>
            <li>• <strong>分析生成时间：</strong>2026-08-17 09:30</li>
          </ul>
          <p className="text-[10px] text-slate-400 pt-2 border-t border-slate-200">
            注：本页面仅对外呈现已通过可信授权的精选分析成果，不暴露内部系统环境日志或底层 Python 脚本。
          </p>
        </section>

        {/* Bottom Branding */}
        <footer className="text-center py-6 text-xs text-slate-400">
          由 <strong>Semovix</strong> 企业原生语义智能平台提供可信数据支持
        </footer>
      </div>
    </div>
  );
};
