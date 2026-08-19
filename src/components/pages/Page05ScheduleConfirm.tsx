import React, { useState } from 'react';
import { Calendar, Clock, CheckCircle2, ShieldCheck, ArrowRight, Settings2, FileSpreadsheet } from 'lucide-react';

interface Page05Props {
  onNavigateNext: () => void;
}

export const Page05ScheduleConfirm: React.FC<Page05Props> = ({ onNavigateNext }) => {
  const [useFileStrategy, setUseFileStrategy] = useState(true);

  return (
    <div className="space-y-6 max-w-4xl mx-auto w-full animate-in fade-in duration-300">
      {/* User Prompt */}
      <div className="flex items-start gap-3 justify-end">
        <div className="bg-blue-600 text-white rounded-2xl rounded-tr-xs px-4 py-2.5 max-w-xl shadow-xs text-sm">
          以后每周都帮我做一次这个分析，每周一上午 9 点给我结果。
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
          <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-5 shadow-md">
            {/* Confirmation Header */}
            <div className="border-b border-slate-200 pb-4">
              <div className="flex items-center gap-2 text-blue-700 text-xs font-semibold mb-1">
                <Calendar className="w-4 h-4 text-blue-600" />
                <span>周期任务固化策略</span>
              </div>
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                创建周期任务前，请确认分析计划
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                我会复用当前已经验证的指标、分析范围和诊断逻辑。
              </p>
            </div>

            {/* Analysis Logic Steps */}
            <div className="space-y-3">
              <h3 className="font-semibold text-slate-800 text-xs">周期分析内容逻辑</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <div className="font-bold text-slate-900">1. 查询上周按期办结率及环比</div>
                  <p className="text-slate-500 text-[11px]">使用正式指标「按期办结率」与权威统计库</p>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <div className="font-bold text-slate-900">2. 自动识别主要变化来源</div>
                  <p className="text-slate-500 text-[11px]">按街镇、诉求类型、承办部门自动下钻拆解</p>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <div className="font-bold text-slate-900">3. 超期工单与重点清单融合</div>
                  <p className="text-slate-500 text-[11px]">如检测到本周最新重点清单，则加入融合分析</p>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <div className="font-bold text-slate-900">4. 生成完整 HTML 分析报告</div>
                  <p className="text-slate-500 text-[11px]">输出 HTML Artifact + 工作台结果摘要</p>
                </div>
              </div>
            </div>

            {/* File Dependency Strategy */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  <span className="font-semibold text-slate-800 text-xs">重点关注工单文件策略</span>
                </div>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded">
                  柔性依赖
                </span>
              </div>

              <label className="flex items-start gap-2 cursor-pointer text-xs text-slate-800 font-medium">
                <input
                  type="checkbox"
                  checked={useFileStrategy}
                  onChange={(e) => setUseFileStrategy(e.target.checked)}
                  className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span>使用执行时最新上传的重点关注清单（如有）</span>
              </label>

              <p className="text-[11px] text-slate-500 leading-relaxed pl-5">
                如当周没有新文件，系统将自动跳过重点名单分析环节，不影响其余基础指标诊断。
              </p>
            </div>

            {/* Task Schedule Metadata Grid */}
            <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 text-xs space-y-3">
              <div className="flex items-center justify-between border-b border-blue-100 pb-2 font-semibold text-blue-900">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span>执行时间与配置参数</span>
                </span>
                <span className="text-blue-700">每周一 09:00</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                <div>
                  <span className="text-slate-500 block">频率</span>
                  <span className="font-bold text-slate-800">每周</span>
                </div>
                <div>
                  <span className="text-slate-500 block">时区</span>
                  <span className="font-bold text-slate-800">Asia/Shanghai</span>
                </div>
                <div>
                  <span className="text-slate-500 block">数据范围</span>
                  <span className="font-bold text-slate-800">上海市闵行区</span>
                </div>
                <div>
                  <span className="text-slate-500 block">产物形态</span>
                  <span className="font-bold text-slate-800">摘要 + HTML Report</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => alert('调整周期任务计划选项')}
                className="text-xs text-slate-600 hover:text-slate-900 font-medium flex items-center gap-1 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <Settings2 className="w-3.5 h-3.5" />
                <span>调整计划细节</span>
              </button>

              <button
                onClick={onNavigateNext}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-md transition-colors cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>确认创建周期任务</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <p className="text-[11px] text-slate-400 text-center border-t border-slate-100 pt-3">
              周期任务会在每次运行时重新校验数据权限和指标有效状态。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
