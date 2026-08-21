import React from 'react';
import { AgentTask } from '../agent/contracts';
import { PageState } from '../types';
import { Sparkles, MapPin, Sliders, Share2, MessageSquare, LayoutGrid, Layers, MoreHorizontal } from 'lucide-react';

interface HeaderProps {
  task: AgentTask;
  demoMode?: boolean;
  onShare?: () => void;
  viewMode?: 'continuous' | 'keyframes';
  setViewMode?: (mode: 'continuous' | 'keyframes') => void;
  showPresenterControl?: boolean;
  setShowPresenterControl?: (visible: boolean) => void;
  currentPage?: PageState;
  onNavigate?: (page: PageState) => void;
  activeRightPanel?: 'metric' | 'python' | null;
  toggleRightPanel?: (panel: 'metric' | 'python' | null) => void;
}

export const Header: React.FC<HeaderProps> = ({
  task,
  demoMode = false,
  onShare,
  viewMode = 'continuous',
  setViewMode,
  showPresenterControl = false,
  setShowPresenterControl,
  currentPage,
  onNavigate,
  activeRightPanel,
  toggleRightPanel,
}) => {
  const isReadOnlyPage = currentPage === 'page08';
  const regionName =
    (typeof task.context?.scope === 'string'
      ? task.context.scope
      : task.context?.scope?.streetTown || task.context?.scope?.region) ||
    task.context?.region ||
    '上海市闵行区';

  return (
    <header className="h-[60px] bg-white border-b border-slate-200 px-4 flex items-center justify-between shrink-0 z-20">
      {/* Left: Brand + App Name */}
      <div className="flex items-center gap-3">
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => onNavigate?.('page01')}
        >
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-xs">
            S
          </div>
          <span className="font-semibold text-slate-900 tracking-tight text-lg">Semovix</span>
        </div>

        <span className="text-slate-300 font-light">/</span>

        <div className="flex items-center gap-1.5 bg-blue-50/80 border border-blue-100 text-blue-700 px-2.5 py-0.5 rounded-full text-xs font-medium">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Xino｜犀诺</span>
        </div>
      </div>

      {/* Middle: Current Task Title + Mode Switcher */}
      <div className="hidden md:flex items-center gap-3">
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200/80 px-3 py-1 rounded-md text-xs">
          <span className="text-slate-400 font-normal">任务：</span>
          <span className="font-medium text-slate-800">
            {task.title || '公共服务热线工单按期办结率分析'}
          </span>
          {isReadOnlyPage && (
            <span className="ml-1 bg-amber-50 text-amber-700 border border-amber-200 text-[11px] px-1.5 py-0.2 rounded font-medium">
              只读视图
            </span>
          )}
        </div>

        {/* Demo Mode Only: View switcher */}
        {demoMode && !isReadOnlyPage && setViewMode && (
          <div className="bg-slate-100 p-0.5 rounded-lg border border-slate-200 flex items-center text-xs">
            <button
              onClick={() => setViewMode('continuous')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-all flex items-center gap-1 cursor-pointer ${
                viewMode === 'continuous'
                  ? 'bg-white text-blue-700 shadow-xs border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>单页对话流</span>
            </button>
            <button
              onClick={() => setViewMode('keyframes')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-all flex items-center gap-1 cursor-pointer ${
                viewMode === 'keyframes'
                  ? 'bg-white text-blue-700 shadow-xs border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>分步演示模式</span>
            </button>
          </div>
        )}
      </div>

      {/* Right: Region, Status, Share & User */}
      <div className="flex items-center gap-2.5">
        {!isReadOnlyPage && (
          <>
            {/* Dynamic Status: only visible when running */}
            {task.status === 'RUNNING' && (
              <div className="flex items-center gap-1.5 text-xs text-blue-600 bg-blue-50 border border-blue-200/60 px-2.5 py-1 rounded-md">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                <span>执行中</span>
              </div>
            )}

            <div className="flex items-center gap-1 text-xs text-slate-600 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-md">
              <MapPin className="w-3.5 h-3.5 text-slate-500" />
              <span>{regionName}</span>
            </div>

            {/* Context panel triggers in Demo Mode */}
            {demoMode && toggleRightPanel && (
              <>
                <button
                  onClick={() => toggleRightPanel(activeRightPanel === 'metric' ? null : 'metric')}
                  className={`text-xs px-2.5 py-1 rounded-md border flex items-center gap-1 transition-colors cursor-pointer ${
                    activeRightPanel === 'metric'
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>指标口径</span>
                </button>

                <button
                  onClick={() => toggleRightPanel(activeRightPanel === 'python' ? null : 'python')}
                  className={`text-xs px-2.5 py-1 rounded-md border flex items-center gap-1 transition-colors cursor-pointer ${
                    activeRightPanel === 'python'
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Python 执行</span>
                </button>
              </>
            )}

            {currentPage !== 'page07' && onShare && (
              <button
                onClick={onShare}
                className="text-xs bg-white text-slate-700 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 px-2.5 py-1 rounded-md flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                title="分享分析结果"
              >
                <Share2 className="w-3.5 h-3.5 text-slate-500" />
                <span>分享</span>
              </button>
            )}
          </>
        )}

        {/* Presenter Mode Control Switcher: Only when demoMode is active */}
        {demoMode && setShowPresenterControl && (
          <button
            onClick={() => setShowPresenterControl(!showPresenterControl)}
            className={`text-xs px-2.5 py-1 rounded-md border flex items-center gap-1.5 font-medium transition-colors cursor-pointer ${
              showPresenterControl
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
            }`}
            title="切换演示步骤控制台"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">演示控制台</span>
          </button>
        )}

        {/* More actions menu icon */}
        <button
          className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
          title="更多选项"
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>

        {/* User Avatar */}
        <div className="w-7 h-7 rounded-full bg-slate-800 text-white flex items-center justify-center text-xs font-medium border border-slate-300 shadow-2xs">
          LZ
        </div>
      </div>
    </header>
  );
};
