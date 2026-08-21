import React from 'react';
import { ScheduleCreatedPayload } from '../../../agent/contracts';
import { CheckCircle2, Play, Share2, Calendar } from 'lucide-react';

interface Props {
  payload: ScheduleCreatedPayload;
  onRunOnce?: () => void;
  onInitiateShare?: () => void;
}

export const ScheduleCreatedBlock: React.FC<Props> = ({
  payload,
  onRunOnce,
  onInitiateShare,
}) => {
  const { taskName, frequency, metric, output, status, nextRun } = payload;
  const [runningTrial, setRunningTrial] = React.useState(false);
  const [trialCompleted, setTrialCompleted] = React.useState(false);

  const handleTrialRun = () => {
    if (onRunOnce) {
      onRunOnce();
    } else {
      setRunningTrial(true);
      setTimeout(() => {
        setRunningTrial(false);
        setTrialCompleted(true);
        setTimeout(() => setTrialCompleted(false), 4000);
      }, 1500);
    }
  };

  return (
    <div className="bg-white border border-emerald-200/90 rounded-2xl p-5 shadow-xs space-y-4">
      {/* Banner */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-sm">
              周期分析任务已成功创建并固化
            </h4>
            <p className="text-xs text-slate-500">
              系统将按设定计划自动运行分析并在工作台生成结果
            </p>
          </div>
        </div>

        <span className="bg-emerald-50 text-emerald-700 text-xs px-2.5 py-1 rounded-full font-medium border border-emerald-200">
          {status || '已启用'}
        </span>
      </div>

      {/* Task Config Summary */}
      <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 bg-slate-50/50 text-xs">
        <div className="px-4 py-2.5 flex justify-between">
          <span className="text-slate-500">任务名称</span>
          <span className="text-slate-900 font-semibold">{taskName}</span>
        </div>
        <div className="px-4 py-2.5 flex justify-between">
          <span className="text-slate-500">执行频率</span>
          <span className="text-slate-800 font-medium">{frequency}</span>
        </div>
        <div className="px-4 py-2.5 flex justify-between">
          <span className="text-slate-500">监控指标</span>
          <span className="text-slate-800 font-medium">{metric}</span>
        </div>
        <div className="px-4 py-2.5 flex justify-between">
          <span className="text-slate-500">产物输出</span>
          <span className="text-slate-800 font-medium">{output}</span>
        </div>
        <div className="px-4 py-2.5 flex justify-between items-center bg-blue-50/40">
          <span className="text-slate-600 font-medium flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-blue-600" /> 下一次执行时间
          </span>
          <span className="text-blue-700 font-mono font-semibold">{nextRun}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-1">
        <button
          onClick={handleTrialRun}
          disabled={runningTrial}
          className="text-xs text-slate-700 hover:text-slate-900 font-medium px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-60 shadow-2xs"
        >
          <Play className={`w-3.5 h-3.5 ${runningTrial ? 'text-blue-600 animate-spin' : 'text-slate-500'}`} />
          <span>{runningTrial ? '正在试跑中...' : trialCompleted ? '✓ 试跑完成（调度正常）' : '立即试跑一次'}</span>
        </button>

        {onInitiateShare && (
          <button
            onClick={onInitiateShare}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium px-4 py-2 rounded-xl shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>精选分析内容并生成分享链接</span>
          </button>
        )}
      </div>
    </div>
  );
};
