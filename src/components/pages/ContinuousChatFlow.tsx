import React, { useRef, useState, useEffect } from 'react';
import { PageState } from '../../types';
import { WEEKLY_METRIC_TABLE, DIAGNOSTIC_EVIDENCE, COMPARATIVE_ANALYSIS, SCHEDULE_CONFIG } from '../../data/mockData';
import {
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  HelpCircle,
  FileSearch,
  ArrowRight,
  FileText,
  ExternalLink,
  Download,
  AlertCircle,
  FileSpreadsheet,
  Code2,
  Calendar,
  Clock,
  Play,
  Share2,
  MessageSquare,
  ChevronDown,
  Layers,
  ArrowUpRight
} from 'lucide-react';

interface ContinuousChatFlowProps {
  onOpenMetricPanel: () => void;
  onOpenPythonPanel: () => void;
  onOpenReportModal: () => void;
  onOpenShareModal: () => void;
  onNavigateToKeyframe: (page: PageState) => void;
}

export const ContinuousChatFlow: React.FC<ContinuousChatFlowProps> = ({
  onOpenMetricPanel,
  onOpenPythonPanel,
  onOpenReportModal,
  onOpenShareModal,
  onNavigateToKeyframe,
}) => {
  // State for interactive user selections inside the continuous thread
  const [selectedMetricOption, setSelectedMetricOption] = useState<'on_time' | 'total'>('on_time');
  const [activeStepFilter, setActiveStepFilter] = useState<'all' | 'turn1' | 'turn2' | 'turn3' | 'turn4'>('all');

  const turn1Ref = useRef<HTMLDivElement>(null);
  const turn2Ref = useRef<HTMLDivElement>(null);
  const turn3Ref = useRef<HTMLDivElement>(null);
  const turn4Ref = useRef<HTMLDivElement>(null);

  const scrollToRef = (ref: React.RefObject<HTMLDivElement | null>) => {
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const executionSteps = [
    { title: '查询正式指标', tag: 'Metric Query · 已完成' },
    { title: '按街镇拆解', tag: 'Dimension Analysis · 已完成' },
    { title: '按诉求类型拆解', tag: 'Dimension Analysis · 已完成' },
    { title: '分析超期工单变化', tag: 'Detail Analysis · 已完成' },
    { title: '比较承办部门办理时长', tag: 'Query · 已完成' },
    { title: '综合形成诊断结论', tag: 'Analysis · 已完成' },
  ];

  return (
    <div className="max-w-4xl mx-auto w-full space-y-8 pb-12 animate-in fade-in duration-300">
      {/* Quick Jump Bar for Single Chat Flow */}
      <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-md border border-slate-200/90 rounded-2xl p-2.5 shadow-sm flex items-center justify-between text-xs overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-1.5 shrink-0 pl-1 font-semibold text-slate-700">
          <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
          <span>连续会话流</span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => scrollToRef(turn1Ref)}
            className="bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 px-2.5 py-1 rounded-lg transition-colors font-medium flex items-center gap-1 cursor-pointer"
          >
            <span>1. 问数消歧</span>
          </button>
          <button
            onClick={() => scrollToRef(turn2Ref)}
            className="bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 px-2.5 py-1 rounded-lg transition-colors font-medium flex items-center gap-1 cursor-pointer"
          >
            <span>2. 归因诊断</span>
          </button>
          <button
            onClick={() => scrollToRef(turn3Ref)}
            className="bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 px-2.5 py-1 rounded-lg transition-colors font-medium flex items-center gap-1 cursor-pointer"
          >
            <span>3. CSV融合</span>
          </button>
          <button
            onClick={() => scrollToRef(turn4Ref)}
            className="bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 px-2.5 py-1 rounded-lg transition-colors font-medium flex items-center gap-1 cursor-pointer"
          >
            <span>4. 周期自动化</span>
          </button>
        </div>
      </div>

      {/* ================= TURN 1: ASK DATA & METRIC DISAMBIGUATION ================= */}
      <div ref={turn1Ref} className="space-y-6 pt-2 scroll-mt-16">
        {/* User Message 1 */}
        <div className="flex items-start gap-3 justify-end">
          <div className="bg-blue-600 text-white rounded-2xl rounded-tr-xs px-4 py-2.5 max-w-xl shadow-xs text-sm">
            上周公共服务热线工单按期办结率和环比变化如何？
          </div>
          <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center text-xs font-semibold shrink-0 shadow-xs">
            LZ
          </div>
        </div>

        {/* Xino Response 1 */}
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
                {/* Option 1 */}
                <div
                  onClick={() => setSelectedMetricOption('on_time')}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer space-y-1.5 ${
                    selectedMetricOption === 'on_time'
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
                      {selectedMetricOption === 'on_time' && (
                        <CheckCircle2 className="w-4 h-4 text-blue-600" />
                      )}
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    统计期内按规定时限完成办结的工单，占全部已办结工单的比例。
                  </p>
                </div>

                {/* Option 2 */}
                <div
                  onClick={() => setSelectedMetricOption('total')}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer space-y-1.5 ${
                    selectedMetricOption === 'total'
                      ? 'bg-white border-blue-500 ring-2 ring-blue-100 shadow-2xs'
                      : 'bg-white/60 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-xs">总体办结率</span>
                    {selectedMetricOption === 'total' && (
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

            {/* Answer Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-sm">
              <div className="space-y-1">
                <span className="text-xs text-slate-400 font-medium">数据解答</span>
                <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  上周按期办结率为 <span className="text-blue-700">86.42%</span>
                </h2>
              </div>

              {/* 3 Column Table */}
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

              <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
                上周按期办结率较前一周明显下降，下降主要来自超期工单增加，而不是单纯由总工单量变化造成。
              </p>

              <div className="flex items-center gap-2 pt-1 flex-wrap">
                <button
                  onClick={onOpenMetricPanel}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-medium px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <FileSearch className="w-3.5 h-3.5 text-slate-500" />
                  <span>查看指标口径定义</span>
                </button>

                <button
                  onClick={() => scrollToRef(turn2Ref)}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                >
                  <span>继续查看：为什么下降？</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <hr className="border-slate-200/80 my-4" />

      {/* ================= TURN 2: DIAGNOSTIC ATTRIBUTION ================= */}
      <div ref={turn2Ref} className="space-y-6 pt-2 scroll-mt-16">
        {/* User Message 2 */}
        <div className="flex items-start gap-3 justify-end">
          <div className="bg-blue-600 text-white rounded-2xl rounded-tr-xs px-4 py-2.5 max-w-xl shadow-xs text-sm">
            为什么环比下降了？
          </div>
          <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center text-xs font-semibold shrink-0 shadow-xs">
            LZ
          </div>
        </div>

        {/* Xino Response 2 */}
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
            X
          </div>

          <div className="flex-1 space-y-5">
            {/* Agent Timeline */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <h3 className="font-semibold text-slate-800 text-xs">智能探查归因分析过程</h3>
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
                    跨部门协同工单的按期办结率明显低于普通工单。
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

              {/* Artifact Card */}
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
                      包含核心结论、指标变化、街镇拆解与证据局限
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
                    onClick={() => scrollToRef(turn3Ref)}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-3.5 py-1.5 rounded-lg text-xs flex items-center gap-1 transition-colors cursor-pointer shadow-xs"
                  >
                    <span>继续查看：融合 CSV 分析</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <hr className="border-slate-200/80 my-4" />

      {/* ================= TURN 3: CSV FILE ANALYSIS & PYTHON ================= */}
      <div ref={turn3Ref} className="space-y-6 pt-2 scroll-mt-16">
        {/* User Message 3 */}
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

          <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center text-xs font-semibold shrink-0 shadow-xs">
            LZ
          </div>
        </div>

        {/* Xino Response 3 */}
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
            X
          </div>

          <div className="flex-1 space-y-5">
            {/* Tool Execution Log */}
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
                  <span>查看 Python 代码与审计</span>
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
            </div>

            {/* Central Analysis Result */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                重点关注工单确实放大了本周下降
              </h2>

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

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => scrollToRef(turn4Ref)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                >
                  <span>继续查看：转为每周周期任务</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <hr className="border-slate-200/80 my-4" />

      {/* ================= TURN 4: SCHEDULED TASK AUTOMATION ================= */}
      <div ref={turn4Ref} className="space-y-6 pt-2 scroll-mt-16">
        {/* User Message 4 */}
        <div className="flex items-start gap-3 justify-end">
          <div className="bg-blue-600 text-white rounded-2xl rounded-tr-xs px-4 py-2.5 max-w-xl shadow-xs text-sm">
            以后每周都帮我做一次这个分析，每周一上午 9 点给我结果。
          </div>
          <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center text-xs font-semibold shrink-0 shadow-xs">
            LZ
          </div>
        </div>

        {/* Xino Response 4 */}
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
            X
          </div>

          <div className="flex-1 space-y-4">
            {/* Green Success Banner */}
            <div className="bg-emerald-500/10 border border-emerald-300 rounded-2xl p-4 sm:p-5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
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
                    已成功将当前临时问数诊断沉淀为 Persistent Analytical Workflow 自动化分析周期队列。
                  </p>
                </div>
              </div>
            </div>

            {/* Config Detail Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <h3 className="font-bold text-slate-900 text-sm">{SCHEDULE_CONFIG.taskName}</h3>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100 font-mono">
                  <Clock className="w-3.5 h-3.5 text-blue-600" />
                  <span>下一次自动执行：{SCHEDULE_CONFIG.nextRun}</span>
                </div>
              </div>

              {/* Detail Table */}
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
                      <td className="p-3 text-slate-500 font-medium">正式指标</td>
                      <td className="p-3 font-semibold text-blue-700">{SCHEDULE_CONFIG.metric}</td>
                    </tr>
                    <tr>
                      <td className="p-3 text-slate-500 font-medium">产物形态</td>
                      <td className="p-3 text-slate-900 font-medium">{SCHEDULE_CONFIG.output}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => alert('已触发立即试跑，正在生成测试周报...')}
                    className="bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 text-xs font-medium px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 text-blue-600" />
                    <span>立即试跑一次</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={onOpenShareModal}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>生成精选分享链接</span>
                  </button>

                  <button
                    onClick={() => onNavigateToKeyframe('page08')}
                    className="bg-slate-900 hover:bg-slate-800 text-white font-semibold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                  >
                    <span>查看只读精选成果</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
