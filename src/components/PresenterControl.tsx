import React from 'react';
import { PageState } from '../types';
import { PAGE_STEPS } from '../data/mockData';
import { ChevronLeft, ChevronRight, RotateCcw, Monitor, X } from 'lucide-react';

interface PresenterControlProps {
  currentPage: PageState;
  onNavigate: (page: PageState) => void;
  onClose: () => void;
}

export const PresenterControl: React.FC<PresenterControlProps> = ({
  currentPage,
  onNavigate,
  onClose,
}) => {
  const currentIndex = PAGE_STEPS.findIndex((s) => s.id === currentPage);
  const currentMeta = PAGE_STEPS[currentIndex] || PAGE_STEPS[0];

  const handlePrev = () => {
    if (currentIndex > 0) {
      onNavigate(PAGE_STEPS[currentIndex - 1].id);
    }
  };

  const handleNext = () => {
    if (currentIndex < PAGE_STEPS.length - 1) {
      onNavigate(PAGE_STEPS[currentIndex + 1].id);
    }
  };

  return (
    <div className="bg-slate-900 text-white border-b border-slate-800 px-4 py-2 flex flex-col md:flex-row md:items-center justify-between gap-2 shrink-0 z-30 shadow-md">
      {/* Step Info */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 bg-blue-500/20 text-blue-300 border border-blue-500/40 px-2.5 py-0.5 rounded-full text-xs font-semibold">
          <Monitor className="w-3.5 h-3.5" />
          <span>演示状态 Keyframe {currentMeta.stepNumber} / 8</span>
        </div>

        <div className="text-xs">
          <span className="font-bold text-white mr-1.5">{currentMeta.title}</span>
          <span className="text-slate-400 hidden lg:inline">— {currentMeta.description}</span>
        </div>
      </div>

      {/* Steps Switcher Pills */}
      <div className="flex items-center gap-1 overflow-x-auto py-1 scrollbar-none max-w-full">
        {PAGE_STEPS.map((step) => {
          const isActive = step.id === currentPage;
          return (
            <button
              key={step.id}
              onClick={() => onNavigate(step.id)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium whitespace-nowrap transition-all cursor-pointer flex items-center gap-1 ${
                isActive
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              <span className="font-mono text-[10px] opacity-75">0{step.stepNumber}</span>
              <span>{step.title.split(' ')[0]}</span>
            </button>
          );
        })}
      </div>

      {/* Prev / Next & Reset Controls */}
      <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="p-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-200 transition-colors"
          title="上一个关键帧"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <span className="text-xs font-mono text-slate-400">
          {currentIndex + 1} / {PAGE_STEPS.length}
        </span>

        <button
          onClick={handleNext}
          disabled={currentIndex === PAGE_STEPS.length - 1}
          className="p-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-200 transition-colors"
          title="下一个关键帧"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        <span className="h-3 w-px bg-slate-700 mx-0.5" />

        <button
          onClick={() => onNavigate('page01')}
          className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
          title="重置到 Page 01"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={onClose}
          className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors ml-1"
          title="隐藏控制台"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
