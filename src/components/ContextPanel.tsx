import React from 'react';
import { OFFICIAL_METRIC, PYTHON_EXECUTION_CODE } from '../data/mockData';
import { ToolExecutionPayload } from '../agent/contracts';
import { X, ShieldCheck, Terminal, CheckCircle2, FileText, ExternalLink, Code } from 'lucide-react';

interface ContextPanelProps {
  type: 'metric' | 'python' | null;
  onClose: () => void;
  dynamicExecution?: ToolExecutionPayload | null;
  metricName?: string;
}

export const ContextPanel: React.FC<ContextPanelProps> = ({
  type,
  onClose,
  dynamicExecution,
  metricName,
}) => {
  if (!type) return null;

  return (
    <aside className="w-[380px] bg-white border-l border-slate-200 flex flex-col shrink-0 z-10 shadow-sm animate-in slide-in-from-right duration-200">
      {/* Panel Header */}
      <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
        <div className="flex items-center gap-2">
          {type === 'metric' ? (
            <ShieldCheck className="w-5 h-5 text-blue-600" />
          ) : (
            <Terminal className="w-5 h-5 text-slate-800" />
          )}
          <h3 className="font-semibold text-slate-900 text-sm">
            {type === 'metric' ? '本次使用的指标与业务口径' : '执行记录 · Python'}
          </h3>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {type === 'metric' && (
          <div className="space-y-4 text-xs">
            {/* Indicator Card */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-medium">指标名称</span>
                <span className="bg-blue-100 text-blue-800 text-[11px] font-medium px-2 py-0.5 rounded-full border border-blue-200">
                  {OFFICIAL_METRIC.status}
                </span>
              </div>
              <p className="text-lg font-bold text-slate-900">{metricName || OFFICIAL_METRIC.name}</p>

              <div className="border-t border-slate-200 pt-2.5">
                <span className="text-slate-400 block mb-1">业务定义</span>
                <p className="text-slate-800 leading-relaxed bg-white p-2 rounded border border-slate-200">
                  {OFFICIAL_METRIC.definition}
                </p>
              </div>

              <div>
                <span className="text-slate-400 block mb-1">计算公式</span>
                <code className="text-blue-700 font-mono bg-blue-50/80 p-2 rounded border border-blue-200 block text-[11px]">
                  {OFFICIAL_METRIC.formula}
                </code>
              </div>
            </div>

            {/* Semantic Details Table */}
            <div className="bg-white border border-slate-200 rounded-xl p-3.5 space-y-2.5">
              <h4 className="font-semibold text-slate-800 text-xs flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-slate-500" />
                <span>模型语义关联</span>
              </h4>

              <div className="divide-y divide-slate-100 text-xs">
                <div className="py-1.5 flex justify-between">
                  <span className="text-slate-500">统计粒度</span>
                  <span className="text-slate-800 font-medium">{OFFICIAL_METRIC.granularity}</span>
                </div>
                <div className="py-1.5 flex justify-between">
                  <span className="text-slate-500">时间语义</span>
                  <span className="text-slate-800 font-medium">{OFFICIAL_METRIC.timeSemantics}</span>
                </div>
                <div className="py-1.5 flex justify-between">
                  <span className="text-slate-500">关联业务对象</span>
                  <span className="text-slate-800 font-medium">{OFFICIAL_METRIC.businessObject}</span>
                </div>
                <div className="py-1.5 flex justify-between">
                  <span className="text-slate-500">主要数据来源</span>
                  <span className="text-slate-800 font-medium text-right">{OFFICIAL_METRIC.dataSource}</span>
                </div>
              </div>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-[11px] text-emerald-800 leading-relaxed flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong>数据合规与可信保证：</strong>
                本次问数消费企业语义模型中的已认证正式指标，避免 AI 随机拟合衍生公式。
              </div>
            </div>

            <button className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-2 rounded-lg text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer">
              <span>查看语义指标库详情</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {type === 'python' && (
          <div className="space-y-4 text-xs">
            <div className="text-slate-600">
              用于本次临时上传 CSV 与企业正式服务工单数据的轻量统计计算。
            </div>

            {/* Code Block */}
            <div className="bg-slate-950 text-slate-200 rounded-xl p-3 font-mono text-[11px] overflow-x-auto border border-slate-800 shadow-inner">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-slate-400 text-[10px]">
                <span className="flex items-center gap-1">
                  <Code className="w-3 h-3" /> main.py
                </span>
                <span>Python 3.10</span>
              </div>
              <pre className="whitespace-pre leading-relaxed text-slate-300">
                {dynamicExecution?.code || PYTHON_EXECUTION_CODE}
              </pre>
            </div>

            {/* Output Trace */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-800">
                <span>执行日志输出</span>
                <span className="text-emerald-600 bg-emerald-50 border border-emerald-200 text-[10px] px-1.5 py-0.5 rounded font-mono">
                  Exit Code 0
                </span>
              </div>

              <div className="font-mono text-[11px] text-slate-700 bg-white p-2.5 rounded border border-slate-200 space-y-1">
                {dynamicExecution?.logs && dynamicExecution.logs.length > 0 ? (
                  dynamicExecution.logs.map((log, idx) => (
                    <p key={idx} className={log.startsWith('✓') ? 'text-emerald-700 font-medium' : log.startsWith('[INFO]') ? 'text-slate-500' : 'text-slate-800'}>
                      {log}
                    </p>
                  ))
                ) : (
                  <>
                    <p className="text-slate-500">[INFO] Loading CSV focus_case_list_2026W32.csv...</p>
                    <p className="text-emerald-700 font-medium">✓ Matched rows: 4,094</p>
                    <p className="text-slate-800">Focus overdue rate: 22.4%</p>
                    <p className="text-slate-800">Overall overdue rate: 13.6%</p>
                    <p className="text-blue-700 font-medium">Overdue contribution: 31.8% of weekly delta</p>
                  </>
                )}
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-[11px] leading-relaxed">
              <strong>提示：</strong> 此处展示经过隔离审计的工具执行日志（Tool Trace）。
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
