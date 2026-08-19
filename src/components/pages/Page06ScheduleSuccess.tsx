import React from 'react';
import { SCHEDULE_CONFIG } from '../../data/mockData';
import { CheckCircle2, Clock, Calendar, Play, Share2, ArrowRight, ExternalLink } from 'lucide-react';

interface Page06Props {
  onNavigateNext: () => void;
}

export const Page06ScheduleSuccess: React.FC<Page06Props> = ({ onNavigateNext }) => {
  return (
    <div className="space-y-6 max-w-4xl mx-auto w-full animate-in fade-in duration-300">
      {/* Xino Response Container */}
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
          X
        </div>

        <div className="flex-1 space-y-4">
          {/* Green Status Badge Banner */}
          <div className="bg-emerald-500/10 border border-emerald-300 rounded-2xl p-4 sm:p-5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-extrabold text-emerald-950">周期分析任务已创建</h2>
                <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {SCHEDULE_CONFIG.status}
                </span>
              </div>
              <p className="text-xs text-emerald-800 mt-0.5">
                一次 Ad-hoc 问数诊断已成功沉淀为 Persistent Analytical Workflow 自动化工作流。
              </p>
            </div>
          </div>

          {/* Structured Config Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-sm">{SCHEDULE_CONFIG.taskName}</h3>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100 font-mono">
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                <span>下一次执行：{SCHEDULE_CONFIG.nextRun}</span>
              </div>
            </div>

            {/* Table Detail */}
            <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
              <table className="w-full text-left">
                <tbody className="divide-y divide-slate-100">
                  <tr className="bg-slate-50/50">
                    <td className="p-3 text-slate-500 font-medium w-32">任务名称</td>
                    <td className="p-3 text-slate-900 font-semibold">{SCHEDULE_CONFIG.taskName}</td>
                  </tr>
                  <tr>
                    <td className="p-3 text-slate-500 font-medium">执行频率</td>
                    <td className="p-3 text-slate-900 font-mono">{SCHEDULE_CONFIG.frequency}</td>
                  </tr>
                  <tr className="bg-slate-50/50">
                    <td className="p-3 text-slate-500 font-medium">数据范围与时区</td>
                    <td className="p-3 text-slate-900">
                      {SCHEDULE_CONFIG.region} ({SCHEDULE_CONFIG.timezone})
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 text-slate-500 font-medium">正式指标</td>
                    <td className="p-3 font-semibold text-blue-700">{SCHEDULE_CONFIG.metric}</td>
                  </tr>
                  <tr className="bg-slate-50/50">
                    <td className="p-3 text-slate-500 font-medium">分析策略</td>
                    <td className="p-3 text-slate-800">{SCHEDULE_CONFIG.strategy}</td>
                  </tr>
                  <tr>
                    <td className="p-3 text-slate-500 font-medium">附件策略</td>
                    <td className="p-3 text-slate-800">{SCHEDULE_CONFIG.attachmentStrategy}</td>
                  </tr>
                  <tr className="bg-slate-50/50">
                    <td className="p-3 text-slate-500 font-medium">输出形式</td>
                    <td className="p-3 text-slate-900 font-medium">{SCHEDULE_CONFIG.output}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-2 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => alert('展示自动化任务中心后台')}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-medium px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                  <span>查看周期任务</span>
                </button>

                <button
                  onClick={() => alert('已触发立即试跑，正在生成测试周报...')}
                  className="bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 text-xs font-medium px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 text-blue-600" />
                  <span>立即试跑一次</span>
                </button>
              </div>

              <button
                onClick={onNavigateNext}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>分享分析成果 (Page 07)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
