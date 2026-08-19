import React, { useState } from 'react';
import { PageState } from '../types';
import { Plus, Search, MessageSquare, Clock, ShieldCheck, ChevronRight } from 'lucide-react';

interface SidebarProps {
  currentPage: PageState;
  onNavigate: (page: PageState) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentPage, onNavigate }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const historyTasks = [
    {
      id: 'task_current',
      title: '上周热线工单按期办结率变化分析',
      time: '当前分析任务',
      active: true,
      pageTarget: 'page01' as PageState,
    },
    {
      id: 'task_02',
      title: '老年人口区域分布分析',
      time: '3天前',
      active: false,
      pageTarget: 'page01' as PageState,
    },
    {
      id: 'task_03',
      title: '老龄化率近三年趋势',
      time: '上周',
      active: false,
      pageTarget: 'page01' as PageState,
    },
    {
      id: 'task_04',
      title: '公共服务热线高频诉求分析',
      time: '2周前',
      active: false,
      pageTarget: 'page01' as PageState,
    },
  ];

  const filteredTasks = historyTasks.filter((t) =>
    t.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <aside className="w-[240px] bg-slate-50/80 border-r border-slate-200 flex flex-col shrink-0 select-none">
      {/* Top AI Partner Section */}
      <div className="p-3 border-b border-slate-200/80">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
              X
            </div>
            <span className="font-semibold text-slate-800 text-sm">Xino｜犀诺</span>
          </div>
          <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-medium">
            AI Partner
          </span>
        </div>

        {/* New Task Button */}
        <button
          onClick={() => onNavigate('page01')}
          className="w-full bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 shadow-2xs font-medium py-1.5 px-3 rounded-lg text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 text-blue-600" />
          <span>＋ 新建任务</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="px-3 py-2 border-b border-slate-200/60">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-slate-400" />
          <input
            type="text"
            placeholder="搜索任务历史..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-md pl-8 pr-2 py-1 text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* History List */}
      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1">
        <div className="px-2 py-1 text-[11px] font-medium text-slate-400 tracking-wider uppercase">
          最近分析任务
        </div>

        {filteredTasks.map((task) => (
          <div
            key={task.id}
            onClick={() => {
              if (task.active) {
                // Keep inside current task flow
              } else {
                onNavigate('page01');
              }
            }}
            className={`group p-2.5 rounded-lg text-xs cursor-pointer transition-all ${
              task.active
                ? 'bg-blue-50/90 border border-blue-200/80 text-blue-900 shadow-2xs'
                : 'hover:bg-slate-100 text-slate-700 border border-transparent'
            }`}
          >
            <div className="flex items-start gap-2">
              <MessageSquare
                className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${
                  task.active ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'
                }`}
              />
              <div className="flex-1 min-w-0">
                <p
                  className={`font-medium line-clamp-2 leading-tight ${
                    task.active ? 'text-blue-900' : 'text-slate-800'
                  }`}
                >
                  {task.title}
                </p>
                <div className="flex items-center justify-between mt-1 text-[10px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {task.time}
                  </span>
                  {task.active && (
                    <span className="text-blue-600 font-medium text-[10px] flex items-center">
                      就绪 <ChevronRight className="w-3 h-3" />
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Semantic Intelligence Badge */}
      <div className="p-3 border-t border-slate-200 bg-slate-100/60 text-[11px] text-slate-500 flex flex-col gap-1">
        <div className="flex items-center gap-1.5 font-medium text-slate-700">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>语义模型版本：Semovix v3.4</span>
        </div>
        <p className="text-[10px] text-slate-400 leading-tight">
          按规范对接企业正式指标库，所有计算逻辑可审计追溯。
        </p>
      </div>
    </aside>
  );
};
