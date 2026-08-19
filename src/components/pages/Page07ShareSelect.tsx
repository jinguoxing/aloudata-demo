import React, { useState } from 'react';
import { SelectableBlock } from '../../types';
import { DEFAULT_SHAREABLE_BLOCKS } from '../../data/mockData';
import { Check, Share2, ShieldCheck, FileText, BarChart2, Layers, Calendar, X } from 'lucide-react';

interface Page07Props {
  onGenerateShareLink: (selectedCount: number) => void;
  onCancel: () => void;
}

export const Page07ShareSelect: React.FC<Page07Props> = ({
  onGenerateShareLink,
  onCancel,
}) => {
  const [blocks, setBlocks] = useState<SelectableBlock[]>(DEFAULT_SHAREABLE_BLOCKS);

  const toggleBlock = (id: string) => {
    setBlocks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, selected: !b.selected } : b))
    );
  };

  const selectedCount = blocks.filter((b) => b.selected).length;

  const getIconForType = (type: string) => {
    switch (type) {
      case 'Metric Answer':
        return <BarChart2 className="w-4 h-4 text-blue-600" />;
      case 'Diagnostic Analysis':
        return <Layers className="w-4 h-4 text-amber-600" />;
      case 'Enriched Analysis':
        return <BarChart2 className="w-4 h-4 text-emerald-600" />;
      case 'Artifact File':
        return <FileText className="w-4 h-4 text-blue-600" />;
      default:
        return <Calendar className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto w-full pb-24 animate-in fade-in duration-300">
      {/* Top Select Mode Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-lg flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-blue-500 text-white text-[10px] font-bold px-2 py-0.5 rounded">
              内容精选模式
            </span>
            <h2 className="text-xl font-extrabold text-white">选择要分享的分析内容</h2>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            只分享你选中的分析过程和结果，不再展示完整私有聊天记录或系统内部 Log。
          </p>
        </div>

        <button
          onClick={onCancel}
          className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Selectable Blocks List */}
      <div className="space-y-3">
        {blocks.map((block) => (
          <div
            key={block.id}
            onClick={() => toggleBlock(block.id)}
            className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-4 ${
              block.selected
                ? 'bg-blue-50/80 border-blue-300 ring-2 ring-blue-200 shadow-sm'
                : 'bg-white border-slate-200/90 opacity-60 hover:opacity-100 hover:border-slate-300'
            }`}
          >
            {/* Custom Round Checkbox */}
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                block.selected ? 'bg-blue-600 text-white' : 'border-2 border-slate-300 bg-white'
              }`}
            >
              {block.selected && <Check className="w-4 h-4 stroke-[3]" />}
            </div>

            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getIconForType(block.type)}
                  <h3 className="font-bold text-slate-900 text-sm">{block.title}</h3>
                </div>
                <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                  {block.type}
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">{block.summaryText}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Floating Bottom Share Bar */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-slate-900/95 backdrop-blur-md text-white border border-slate-800 px-6 py-3 rounded-full shadow-2xl flex items-center gap-6">
        <div className="flex items-center gap-2 text-xs font-semibold">
          <ShieldCheck className="w-4 h-4 text-blue-400" />
          <span>已选择 <strong className="text-blue-400 font-mono text-sm">{selectedCount}</strong> 项分析内容</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onCancel}
            className="text-xs text-slate-300 hover:text-white px-3 py-1.5 rounded-full hover:bg-slate-800 transition-colors cursor-pointer"
          >
            取消
          </button>

          <button
            onClick={() => onGenerateShareLink(selectedCount)}
            className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-5 py-2 rounded-full flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>生成分享链接</span>
          </button>
        </div>
      </div>
    </div>
  );
};
