import React from 'react';
import { COMPARATIVE_ANALYSIS } from '../../data/mockData';
import { FileSpreadsheet, Sparkles, Code2, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface Page04Props {
  onNavigateNext: () => void;
  onOpenPythonPanel: () => void;
}

export const Page04FileAnalysis: React.FC<Page04Props> = ({
  onNavigateNext,
  onOpenPythonPanel,
}) => {
  return (
    <div className="space-y-6 max-w-4xl mx-auto w-full animate-in fade-in duration-300">
      {/* User Upload Message */}
      <div className="flex items-start gap-3 justify-end">
        <div className="space-y-2 max-w-xl">
          {/* CSV File Pill */}
          <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-slate-900 text-xs truncate">
                focus_case_list_2026W32.csv
              </p>
              <p className="text-[11px] text-slate-400">944.7 KB · CSV 数据文件</p>
            </div>
            <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded font-medium">
              已就绪
            </span>
          </div>

          <div className="bg-blue-600 text-white rounded-2xl rounded-tr-xs px-4 py-2.5 shadow-xs text-sm">
            我上传了本周重点关注工单清单，请帮我看看这批工单是否放大了办结率下降。
          </div>
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
          {/* Xino Tool Execution Log */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <h3 className="font-semibold text-slate-800 text-xs">企业语义模型与临时数据融合</h3>
              </div>
              <button
                onClick={onOpenPythonPanel}
                className="text-blue-600 hover:text-blue-800 text-xs font-medium flex items-center gap-1 cursor-pointer"
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>查看 Python 代码与计算审计</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="bg-white p-2.5 rounded-xl border border-slate-200/80 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-800">读取附件 & 语义识别</span>
                  <span className="text-emerald-700 font-mono text-[10px]">read_file · 已完成</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  识别字段：<code className="text-blue-700">case_id</code> → 工单标识,{' '}
                  <code className="text-blue-700">street_code</code> → 街镇编码
                </p>
              </div>

              <div className="bg-white p-2.5 rounded-xl border border-slate-200/80 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-800">正式数据映射 & Python 计算</span>
                  <span className="text-emerald-700 font-mono text-[10px]">
                    Python Analysis · 已完成
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  与正式「服务工单」建立 `case_id` 主体链接并进行比对。
                </p>
              </div>
            </div>

            <div className="p-2.5 bg-blue-50/80 border border-blue-100 rounded-xl text-xs text-blue-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
              <span>
                <strong>语义强一致保证：</strong> 已确认 `case_id`
                可以与正式“服务工单”业务对象的主体标识建立安全匹配。
              </span>
            </div>
          </div>

          {/* Central Analysis Result Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              重点关注工单确实放大了本周下降
            </h2>

            {/* Key Fact Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-400 text-xs">重点清单工单数</span>
                <p className="text-xl font-extrabold text-slate-900 mt-0.5">4,094 件</p>
              </div>

              <div className="p-3.5 bg-rose-50/60 rounded-xl border border-rose-200">
                <span className="text-rose-700 text-xs">重点工单超期率</span>
                <p className="text-xl font-extrabold text-rose-700 mt-0.5">
                  22.4% <span className="text-xs font-normal text-rose-600">vs 全量 13.6%</span>
                </p>
              </div>

              <div className="p-3.5 bg-blue-50/60 rounded-xl border border-blue-200">
                <span className="text-blue-700 text-xs">对新增超期的贡献</span>
                <p className="text-xl font-extrabold text-blue-800 mt-0.5">31.8%</p>
              </div>
            </div>

            {/* Contrast Table */}
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
                      <td
                        className={`p-3 text-right font-mono font-bold ${
                          idx === 0 ? 'text-rose-600' : 'text-slate-700'
                        }`}
                      >
                        {row.overdueRate}
                      </td>
                      <td className="p-3 text-slate-700">{row.mainArea}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200">
              <strong>Xino 总结：</strong>{' '}
              重点清单不是全部原因，但其超期率显著高于整体，是本周办结率下降的重要放大因素之一。
            </p>

            {/* Management Action Suggestions */}
            <div className="space-y-2 pt-1">
              <h4 className="font-semibold text-slate-800 text-xs">管理动作建议</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="font-bold text-blue-700 block">① 重点跟进</span>
                  <p className="text-slate-600 text-[11px]">七宝镇物业管理类重点工单</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="font-bold text-blue-700 block">② 补充分析</span>
                  <p className="text-slate-600 text-[11px]">查看跨部门流转节点耗时</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="font-bold text-blue-700 block">③ 继续验证</span>
                  <p className="text-slate-600 text-[11px]">比较重点工单近 4 周超期趋势</p>
                </div>
              </div>
            </div>

            {/* Bottom Action */}
            <div className="flex justify-end pt-2">
              <button
                onClick={onNavigateNext}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <span>转为每周周期任务</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
