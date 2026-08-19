import React from 'react';
import { X, Download, Share2, CheckCircle, AlertTriangle, FileText, Printer } from 'lucide-react';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShare?: () => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({ isOpen, onClose, onShare }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 sm:px-6 sm:py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-900 text-base">
                按期办结率波动归因分析 · 2026W32
              </h2>
              <p className="text-xs text-slate-500">HTML 分析报告 · 生成时间: 2026-08-17 09:30</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => alert('已触发报告 HTML 下载')}
              className="text-xs bg-white text-slate-700 hover:bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">下载 HTML</span>
            </button>

            {onShare && (
              <button
                onClick={onShare}
                className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">分享报告</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body - Styled Document Viewer */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 text-slate-800 text-sm leading-relaxed">
          {/* Document Header Box */}
          <div className="border-b border-slate-200 pb-6">
            <div className="inline-block bg-blue-50 text-blue-700 text-xs font-semibold px-2.5 py-1 rounded-md border border-blue-100 mb-2">
              Semovix AI Document Artifact
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              上海市闵行区公共服务热线工单按期办结率波动归因诊断报告
            </h1>
            <p className="text-xs text-slate-500 mt-2">
              数据周期：2026 年第 32 周（2026-08-03 至 2026-08-09）｜ 业务部门：闵行区公共服务热线运营中心
            </p>
          </div>

          {/* Core Findings Box */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 sm:p-5 space-y-3">
            <h3 className="font-semibold text-slate-900 text-sm flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-blue-600" />
              <span>一、核心分析结论</span>
            </h3>
            <p className="text-xs text-slate-700 leading-relaxed">
              本周按期办结率为 <strong>86.42%</strong>，较上一周环比下降 <strong>4.8 个百分点</strong>。
              经多维数据下钻与融合诊断，办结率下降并非由全局诉求激增导致，而是受<strong>重点街镇超期集中</strong>、
              <strong>部分诉求办理周期拉长</strong>及<strong>跨部门协同流转滞后</strong>三大核心因素共同驱动。
            </p>
          </div>

          {/* Section 2: Metric Performance Table */}
          <div className="space-y-3">
            <h3 className="font-semibold text-slate-900 text-sm">二、核心指标表现与环比对照</h3>
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
                  <tr>
                    <th className="p-3">指标名称</th>
                    <th className="p-3 text-right">本周数值</th>
                    <th className="p-3 text-right">上周数值</th>
                    <th className="p-3 text-right">环比变化</th>
                    <th className="p-3">业务判定</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="p-3 font-medium text-slate-900">按期办结率</td>
                    <td className="p-3 text-right font-bold text-blue-700">86.42%</td>
                    <td className="p-3 text-right">91.22%</td>
                    <td className="p-3 text-right font-semibold text-rose-600">↓ 4.8pp</td>
                    <td className="p-3 text-rose-600">明显下降</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-medium text-slate-900">已办结工单数</td>
                    <td className="p-3 text-right">8,642 件</td>
                    <td className="p-3 text-right">8,827 件</td>
                    <td className="p-3 text-right">↓ 2.1%</td>
                    <td className="p-3 text-slate-600">基本平稳</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-medium text-slate-900">超期办结工单数</td>
                    <td className="p-3 text-right font-bold text-rose-600">733 件</td>
                    <td className="p-3 text-right">618 件</td>
                    <td className="p-3 text-right font-semibold text-rose-600">↑ 18.6%</td>
                    <td className="p-3 text-rose-600">大幅增加</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 3: Diagnostic Breakdown */}
          <div className="space-y-3">
            <h3 className="font-semibold text-slate-900 text-sm">三、下钻归因与结构拆解</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1.5">
                <span className="font-bold text-slate-900 block">1. 街镇集中度拆解</span>
                <p className="text-slate-600">
                  七宝镇、莘庄镇超期工单增加 <strong>286 件</strong>，占全区超期增量的 <strong>62.4%</strong>。
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1.5">
                <span className="font-bold text-slate-900 block">2. 诉求类型办理时长</span>
                <p className="text-slate-600">
                  物业管理类与劳动保障类工单平均处理时长分别增加 <strong>0.7 天</strong> 与 <strong>0.9 天</strong>。
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1.5">
                <span className="font-bold text-slate-900 block">3. 跨部门协同影响</span>
                <p className="text-slate-600">
                  跨部门协同工单占比上升 <strong>3.2 个百分点</strong>，按期办结率仅为 <strong>71.5%</strong>。
                </p>
              </div>
            </div>
          </div>

          {/* Section 4: Evidence & Limitations */}
          <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2 text-xs text-amber-900">
            <div className="flex items-center gap-1.5 font-bold">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>数据证据与局限性说明</span>
            </div>
            <p className="leading-relaxed">
              目前缺少部分跨部门流转节点的完整内部环节耗时，因此只能确认跨部门协同与办结率下降高度相关，
              尚不可直接认定为单一因果关系。建议下一阶段接入部门内部流转日志进行深度追溯。
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>Semovix Enterprise Semantic Platform · Trusted Evidence Artifact</span>
          <button
            onClick={onClose}
            className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-1.5 rounded-lg font-medium cursor-pointer"
          >
            关闭预览
          </button>
        </div>
      </div>
    </div>
  );
};
