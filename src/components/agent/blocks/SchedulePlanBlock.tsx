import React from 'react';
import { SchedulePlanPayload } from '../../../agent/contracts';
import { Calendar, Clock, MapPin, CheckCircle2, ArrowRight, AlertCircle } from 'lucide-react';

interface Props {
  payload: SchedulePlanPayload;
  status?: 'PENDING' | 'RUNNING' | 'DONE' | 'FAILED';
  onConfirmSchedule: () => void;
  disabled?: boolean;
}

export const SchedulePlanBlock: React.FC<Props> = ({
  payload,
  status,
  onConfirmSchedule,
  disabled = false,
}) => {
  const { taskName, frequency, region, metric, steps, missingSlots } = payload;
  const isDone = status === 'DONE';
  const hasMissingSlots = missingSlots && missingSlots.length > 0;
  const canConfirm = !hasMissingSlots && !disabled && !isDone;

  if (isDone) {
    return (
      <div className="flex items-center gap-2 rounded-lg bg-slate-50 border border-slate-200/80 px-3.5 py-2.5 text-xs text-slate-600 shadow-2xs">
        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
        <span>已确认创建周期任务：</span>
        <strong className="font-semibold text-slate-900">{taskName || '公共服务热线周度监测'}</strong>
        <span className="text-slate-400">（{frequency || '每周'}）</span>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-600" />
          <h4 className="font-bold text-slate-900 text-sm">
            确认创建周期分析任务
          </h4>
        </div>
        <span
          className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${
            hasMissingSlots
              ? 'bg-rose-50 text-rose-700 border-rose-200'
              : 'bg-amber-50 text-amber-800 border-amber-200'
          }`}
        >
          {hasMissingSlots ? '调度信息待完善' : '待用户确认'}
        </span>
      </div>

      {/* Plan Card Config */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3 text-xs">
        <div className="font-bold text-slate-900 text-sm">
          {taskName || '公共服务热线按期办结率周度监测与归因'}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
          <div className="flex items-center gap-1.5 text-slate-700 bg-white p-2 rounded-lg border border-slate-200">
            <Clock className="w-3.5 h-3.5 text-blue-500 shrink-0" />
            <span>频率：<strong>{frequency || '待定'}</strong></span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-700 bg-white p-2 rounded-lg border border-slate-200">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>区域：<strong>{region || '上海市闵行区'}</strong></span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-700 bg-white p-2 rounded-lg border border-slate-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span>核心指标：<strong>{metric || '按期办结率'}</strong></span>
          </div>
        </div>

        {/* Missing slots warning */}
        {hasMissingSlots && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 p-2.5 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>请在对话框中补充具体时间（缺少：{missingSlots.join('、')}）。</span>
          </div>
        )}

        {/* Execution Workflow steps */}
        {steps && steps.length > 0 && (
          <div className="pt-2 border-t border-slate-200">
            <span className="text-slate-500 block mb-2 font-medium">任务执行计划流程：</span>
            <div className="space-y-1.5">
              {steps.map((step, idx) => (
                <div key={idx} className="flex items-center gap-2 text-slate-700">
                  <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Action Button */}
      <div className="flex items-center justify-between pt-1">
        <span className="text-xs text-slate-500">
          任务创建后将自动登记至 Semovix 企业自动化中心
        </span>

        <button
          disabled={!canConfirm}
          onClick={onConfirmSchedule}
          className={`bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs px-4 py-2.5 rounded-xl shadow-xs flex items-center gap-1.5 transition-all cursor-pointer ${
            !canConfirm ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <span>确认创建周期任务</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
