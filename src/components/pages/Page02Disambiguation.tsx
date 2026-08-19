import React, { useState } from 'react';
import { WEEKLY_METRIC_TABLE } from '../../data/mockData';
import { User, Sparkles, CheckCircle2, FileSearch, ArrowRight, ShieldCheck, HelpCircle } from 'lucide-react';

interface Page02Props {
  onNavigateNext: () => void;
  onOpenMetricPanel: () => void;
}

export const Page02Disambiguation: React.FC<Page02Props> = ({
  onNavigateNext,
  onOpenMetricPanel,
}) => {
  const [selectedOption, setSelectedOption] = useState<'on_time' | 'total'>('on_time');

  return (
    <div className="space-y-6 max-w-4xl mx-auto w-full animate-in fade-in duration-300">
      {/* User Message */}
      <div className="flex items-start gap-3 justify-end">
        <div className="bg-blue-600 text-white rounded-2xl rounded-tr-xs px-4 py-2.5 max-w-xl shadow-xs text-sm">
          上周公共服务热线工单按期办结率和环比变化如何？
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

        <div className="flex-1 space-y-4">
          {/* Indicator Disambiguation Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-3 shadow-2xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <h3 className="font-semibold text-slate-900 text-sm">
                  找到 2 个相关正式指标，请确认本次使用口径
                </h3>
              </div>
              <span className="text-[11px] text-slate-400">数据语义消歧</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {/* Option 1: 按期办结率 */}
              <div
                onClick={() => setSelectedOption('on_time')}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer space-y-1.5 ${
                  selectedOption === 'on_time'
                    ? 'bg-white border-blue-500 ring-2 ring-blue-100 shadow-2xs'
                    : 'bg-white/60 border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-xs">按期办结率</span>
                  <div className="flex items-center gap-1">
                    <span className="bg-blue-100 text-blue-800 text-[10px] font-semibold px-1.5 py-0.2 rounded">
                      推荐
                    </span>
                    {selectedOption === 'on_time' && (
                      <CheckCircle2 className="w-4 h-4 text-blue-600" />
                    )}
                  </div>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  统计期内按规定时限完成办结的工单，占全部已办结工单的比例。
                </p>
              </div>

              {/* Option 2: 总体办结率 */}
              <div
                onClick={() => setSelectedOption('total')}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer space-y-1.5 ${
                  selectedOption === 'total'
                    ? 'bg-white border-blue-500 ring-2 ring-blue-100 shadow-2xs'
                    : 'bg-white/60 border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-xs">总体办结率</span>
                  {selectedOption === 'total' && (
                    <CheckCircle2 className="w-4 h-4 text-blue-600" />
                  )}
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  统计期内已办结工单，占全部受理工单的比例（包含按期与超期）。
                </p>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 flex items-center gap-1 pt-1">
              <HelpCircle className="w-3 h-3 text-slate-400" />
              系统按规范消费企业认证语义模型，不会自行混用不同业务口径。
            </p>
          </div>

          {/* Ask Data Result Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-sm">
            <div className="space-y-1">
              <span className="text-xs text-slate-400 font-medium">数据解答</span>
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                上周按期办结率为 <span className="text-blue-700">86.42%</span>
              </h2>
            </div>

            {/* Compact 3-Column Table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                  <tr>
                    <th className="p-3">指标</th>
                    <th className="p-3 text-right">本周</th>
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

            {/* Xino Interpretation Text */}
            <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
              上周按期办结率较前一周明显下降，下降主要来自超期工单增加，而不是单纯由总工单量变化造成。可以继续从街镇、诉求类型和承办部门进行下钻。
            </p>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 pt-1 flex-wrap">
              <button
                onClick={onOpenMetricPanel}
                className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-medium px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <FileSearch className="w-3.5 h-3.5 text-slate-500" />
                <span>查看指标口径</span>
              </button>

              <button
                onClick={onNavigateNext}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <span>为什么下降？</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
