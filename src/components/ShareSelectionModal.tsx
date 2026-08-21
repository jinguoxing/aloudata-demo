import React, { useState, useMemo, useEffect } from 'react';
import { AgentBlock } from '../agent/contracts';
import { convertBlocksToSelectable } from '../agent/utils/shareUtils';
import {
  X,
  Check,
  ShieldCheck,
  BarChart2,
  Layers,
  FileText,
  Calendar,
  Sparkles,
  Link2,
} from 'lucide-react';

interface ShareSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableBlocks?: AgentBlock[];
  onCreateShare: (selectedBlockIds: string[], blocksToShare?: AgentBlock[]) => Promise<any>;
  onShareCreated: (shareUrl: string, selectedCount: number) => void;
}

export const ShareSelectionModal: React.FC<ShareSelectionModalProps> = ({
  isOpen,
  onClose,
  availableBlocks,
  onCreateShare,
  onShareCreated,
}) => {
  const [blocks, setBlocks] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const { items } = convertBlocksToSelectable(availableBlocks);
      setBlocks(items);
    }
  }, [isOpen, availableBlocks]);

  if (!isOpen) return null;

  const toggleBlock = (id: string) => {
    setBlocks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, selected: !b.selected } : b)),
    );
  };

  const selectedCount = blocks.filter((b) => b.selected).length;

  const handleGenerate = async () => {
    if (selectedCount === 0) return;
    setIsGenerating(true);
    try {
      const selectedIds = blocks.filter((b) => b.selected).map((b) => b.id);
      const shareResult = await onCreateShare(selectedIds, availableBlocks);
      const fullUrl =
        shareResult?.url
          ? `${window.location.origin}${shareResult.url}`
          : `${window.location.origin}/share/s_${Math.random().toString(36).substring(2, 10)}`;
      onClose();
      onShareCreated(fullUrl, selectedCount);
    } catch (err) {
      console.error('Failed to create share artifact:', err);
    } finally {
      setIsGenerating(false);
    }
  };

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
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl max-h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">
              <Link2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 text-sm">选择要分享的分析内容</h3>
              <p className="text-[11px] text-slate-500">仅公开所选分析结论与图表，保护私有会话环境</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Security notice */}
        <div className="px-5 py-3 bg-blue-50/70 border-b border-blue-100 flex items-center gap-2.5 text-xs text-blue-900 shrink-0">
          <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
          <span>
            已选择 <strong>{selectedCount}</strong> 项内容。接收方将进入受控只读视图。
          </span>
        </div>

        {/* Selectable Items List */}
        <div className="p-4 space-y-2.5 overflow-y-auto flex-1 text-xs">
          {blocks.map((block) => (
            <div
              key={block.id}
              onClick={() => toggleBlock(block.id)}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                block.selected
                  ? 'bg-blue-50/60 border-blue-300 ring-1 ring-blue-200/80 shadow-2xs'
                  : 'bg-white border-slate-200/80 opacity-60 hover:opacity-100 hover:border-slate-300'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                  block.selected ? 'bg-blue-600 text-white' : 'border border-slate-300 bg-white'
                }`}
              >
                {block.selected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
              </div>

              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center gap-2">
                  {getIconForType(block.type)}
                  <h4 className="font-semibold text-slate-900 text-xs">{block.title}</h4>
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed">{block.summaryText}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-500">
            {selectedCount > 0 ? `已勾选 ${selectedCount} 项分析成果` : '请至少勾选 1 项'}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 text-xs font-medium hover:bg-slate-50 cursor-pointer"
            >
              取消
            </button>
            <button
              onClick={handleGenerate}
              disabled={selectedCount === 0 || isGenerating}
              className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-xs"
            >
              {isGenerating ? (
                <>
                  <Sparkles className="w-3.5 h-3.5 animate-spin" />
                  <span>生成中...</span>
                </>
              ) : (
                <>
                  <Link2 className="w-3.5 h-3.5" />
                  <span>生成专属分享链接</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
