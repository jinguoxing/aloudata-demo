import React from 'react';
import { MetricDefinition, ToolExecutionPayload } from '../agent/contracts';
import { X, ShieldCheck, Terminal, CheckCircle2, FileText, ExternalLink, Code, AlertCircle } from 'lucide-react';

interface ContextPanelProps {
  type: 'metric' | 'python' | null;
  onClose: () => void;
  dynamicExecution?: ToolExecutionPayload | null;
  metricDefinition?: MetricDefinition | null;
}

export const ContextPanel: React.FC<ContextPanelProps> = ({
  type,
  onClose,
  dynamicExecution,
  metricDefinition,
}) => {
  if (!type) return null;

  const activeDef = metricDefinition;

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
            {activeDef ? (
              <>
                {/* Indicator Card */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-medium">指标名称</span>
                    <span className="bg-blue-100 text-blue-800 text-[11px] font-medium px-2 py-0.5 rounded-full border border-blue-200">
                      {activeDef.status || '正式指标'}
                    </span>
                  </div>
                  <p className="text-lg font-bold text-slate-900">{activeDef.name}</p>

                  <div className="border-t border-slate-200 pt-2.5">
                    <span className="text-slate-400 block mb-1">业务定义</span>
                    <p className="text-slate-800 leading-relaxed bg-white p-2 rounded border border-slate-200">
                      {activeDef.definition}
                    </p>
                  </div>

                  <div>
                    <span className="text-slate-400 block mb-1">计算公式</span>
                    <code className="text-blue-700 font-mono bg-blue-50/80 p-2 rounded border border-blue-200 block text-[11px]">
                      {activeDef.formula}
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
                      <span className="text-slate-800 font-medium">{activeDef.granularity}</span>
                    </div>
                    <div className="py-1.5 flex justify-between">
                      <span className="text-slate-500">时间语义</span>
                      <span className="text-slate-800 font-medium">{activeDef.timeSemantics}</span>
                    </div>
                    <div className="py-1.5 flex justify-between">
                      <span className="text-slate-500">关联业务对象</span>
                      <span className="text-slate-800 font-medium">{activeDef.businessObject}</span>
                    </div>
                    <div className="py-1.5 flex justify-between">
                      <span className="text-slate-500">主要数据来源</span>
                      <span className="text-slate-800 font-medium text-right">{activeDef.dataSource}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-[11px] text-emerald-800 leading-relaxed flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong>数据合规与可信保证：</strong>
                    本次问数直接消费企业语义模型中的已认证正式指标，确保所有计算口径在全业务线统一一致。
                  </div>
                </div>

                <button className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-2 rounded-lg text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer">
                  <span>查看语义指标库详情</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </>
            ) : (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center space-y-2">
                <AlertCircle className="w-6 h-6 text-slate-400 mx-auto" />
                <p className="text-slate-600 font-medium">暂无已确认的正式指标</p>
                <p className="text-slate-400 text-[11px]">请先在会话中选择或查询具体指标口径。</p>
              </div>
            )}
          </div>
        )}

        {type === 'python' && (
          <div className="space-y-4 text-xs">
            <div className="text-slate-600">
              用于本次上传文件与企业正式服务工单数据的轻量统计计算。
            </div>

            {/* Code Block */}
            <div className="bg-slate-950 text-slate-200 rounded-xl p-3 font-mono text-[11px] overflow-x-auto border border-slate-800 shadow-inner">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-slate-400 text-[10px]">
                <span className="flex items-center gap-1">
                  <Code className="w-3 h-3" /> analysis.py
                </span>
                <span>Python 3.10</span>
              </div>
              <pre className="whitespace-pre leading-relaxed text-slate-300">
                {dynamicExecution?.code || '# 暂无工具执行代码'}
              </pre>
            </div>

            {/* Output Trace */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-800">
                <span>执行日志输出</span>
                <span className="text-emerald-600 bg-emerald-50 border border-emerald-200 text-[10px] px-1.5 py-0.5 rounded font-mono">
                  {dynamicExecution?.status === 'SUCCEEDED' ? 'Exit Code 0' : dynamicExecution?.status || 'IDLE'}
                </span>
              </div>

              <div className="font-mono text-[11px] text-slate-700 bg-white p-2.5 rounded border border-slate-200 space-y-1">
                {dynamicExecution?.logs && dynamicExecution.logs.length > 0 ? (
                  dynamicExecution.logs.map((log, idx) => (
                    <p
                      key={idx}
                      className={
                        log.startsWith('✓')
                          ? 'text-emerald-700 font-medium'
                          : log.startsWith('[INFO]')
                          ? 'text-slate-500'
                          : 'text-slate-800'
                      }
                    >
                      {log}
                    </p>
                  ))
                ) : (
                  <p className="text-slate-400 italic">暂无执行日志</p>
                )}
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-[11px] leading-relaxed">
              <strong>提示：</strong> 此处展示经过隔离审计的沙箱计算日志（Tool Trace）。
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
