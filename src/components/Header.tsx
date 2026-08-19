import React from 'react';
import { PageState } from '../types';
import { Sparkles, MapPin, Activity, Sliders, Share2, Layers, MessageSquare, LayoutGrid } from 'lucide-react';

interface HeaderProps {
  currentPage: PageState;
  onNavigate: (page: PageState) => void;
  showPresenterControl: boolean;
  setShowPresenterControl: (show: boolean) => void;
  activeRightPanel: 'metric' | 'python' | null;
  toggleRightPanel: (panel: 'metric' | 'python' | null) => void;
  viewMode: 'continuous' | 'keyframes';
  setViewMode: (mode: 'continuous' | 'keyframes') => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentPage,
  onNavigate,
  showPresenterControl,
  setShowPresenterControl,
  activeRightPanel,
  toggleRightPanel,
  viewMode,
  setViewMode,
}) => {
  const isReadOnlyPage = currentPage === 'page08';

  return (
    <header className="h-[60px] bg-white border-b border-slate-200 px-4 flex items-center justify-between shrink-0 z-20">
      {/* Left: Brand + App Name */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => onNavigate('page01')}>
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
          <span className="font-medium text-slate-800">上周热线工单按期办结率变化分析</span>
          {isReadOnlyPage && (
            <span className="ml-1 bg-amber-50 text-amber-700 border border-amber-200 text-[11px] px-1.5 py-0.2 rounded font-medium">
              只读视图
            </span>
          )}
        </div>

        {!isReadOnlyPage && (
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

      {/* Right: Region, Status, User & Presenter Toggle */}
      <div className="flex items-center gap-3">
        {!isReadOnlyPage && (
          <>
            <div className="flex items-center gap-1 text-xs text-slate-600 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-md">
              <MapPin className="w-3.5 h-3.5 text-slate-500" />
              <span>上海市闵行区</span>
            </div>

            <div className="hidden lg:flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2.5 py-1 rounded-md">
              <Activity className="w-3.5 h-3.5 text-emerald-600" />
              <span>分析进行中</span>
            </div>

            {/* Context panel triggers */}
            <button
              onClick={() => toggleRightPanel(activeRightPanel === 'metric' ? null : 'metric')}
              className={`text-xs px-2.5 py-1 rounded-md border flex items-center gap-1 transition-colors ${
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
              className={`text-xs px-2.5 py-1 rounded-md border flex items-center gap-1 transition-colors ${
                activeRightPanel === 'python'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Python 执行</span>
            </button>

            {currentPage !== 'page07' && (
              <button
                onClick={() => onNavigate('page07')}
                className="text-xs bg-white text-slate-700 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 px-2.5 py-1 rounded-md flex items-center gap-1.5 transition-colors"
                title="分享分析结果"
              >
                <Share2 className="w-3.5 h-3.5 text-slate-500" />
                <span>分享</span>
              </button>
            )}
          </>
        )}

        {/* Presenter Mode Control Switcher */}
        <button
          onClick={() => setShowPresenterControl(!showPresenterControl)}
          className={`text-xs px-2.5 py-1 rounded-md border flex items-center gap-1.5 font-medium transition-colors ${
            showPresenterControl
              ? 'bg-slate-900 text-white border-slate-900'
              : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
          }`}
          title="切换演示步骤控制台"
        >
          <Sliders className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">演示控制台</span>
        </button>

        {/* User Avatar */}
        <div className="w-7 h-7 rounded-full bg-slate-800 text-white flex items-center justify-center text-xs font-medium border border-slate-300">
          LZ
        </div>
      </div>
    </header>
  );
};
