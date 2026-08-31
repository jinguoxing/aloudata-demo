import React, { useState, useMemo } from 'react';
import { Share2, Check, ExternalLink, Copy, CheckCheck, BarChart2, Layers, FileText, Calendar, AlertCircle } from 'lucide-react';
import { AgentBlock } from '../../../agent/contracts';
import { convertBlocksToSelectable } from '../../../agent/utils/shareUtils';
import { safeCopyText } from '../../../utils/safeBrowser';

interface Props {
  availableBlocks?: AgentBlock[];
  onCreateShare: (blockIds: string[], blocksToShare?: AgentBlock[]) => Promise<any>;
  onOpenReadOnlyView?: () => void;
}

export const ShareSelectionBlock: React.FC<Props> = ({
  availableBlocks,
  onCreateShare,
  onOpenReadOnlyView,
}) => {
  const initialItems = useMemo(() => {
    return convertBlocksToSelectable(availableBlocks).items;
  }, [availableBlocks]);

  const [items, setItems] = useState(initialItems);
  const [createdUrl, setCreatedUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const toggleItem = (id: string) => {
    setErrorMessage(null);
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, selected: !item.selected } : item,
      ),
    );
  };

  const handleGenerate = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const selected = items.filter((i) => i.selected);
      const selectedIds = selected.map((i) => i.id);
      const selectedBlocks = selected
        .map((i) => i.originalBlock)
        .filter((b): b is AgentBlock => !!b);

      const res = await onCreateShare(selectedIds, selectedBlocks);
      if (!res?.url) {
        throw new Error('未生成有效的分享链接');
      }
      setCreatedUrl(res.url);
    } catch (err) {
      console.error(err);
      setErrorMessage('分享创建失败，请重试。');
    } finally {
      setLoading(false);
    }
  };

  const copyLink = async () => {
    const fullLink = (typeof window !== 'undefined' ? window.location.origin : '') + (createdUrl || '');
    await safeCopyText(fullLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
    <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-4">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Share2 className="w-5 h-5 text-blue-600" />
          <h4 className="font-bold text-slate-900 text-sm">
            精选需要对外呈现的分析内容
          </h4>
        </div>
        <span className="text-xs text-slate-500">
          已选 {items.filter((i) => i.selected).length} / {items.length} 项
        </span>
      </div>

      <p className="text-xs text-slate-600">
        系统已根据本轮任务的实际分析产物建立精选清单。勾选需要导出的结论，将生成专属只读展示页，过滤掉中间执行细节。
      </p>

      {/* Selectable Items */}
      <div className="space-y-2">
        {items.map((item) => (
          <div
            key={item.id}
            onClick={() => toggleItem(item.id)}
            className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
              item.selected
                ? 'border-blue-500 bg-blue-50/40'
                : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50 opacity-70'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-md flex items-center justify-center mt-0.5 border shrink-0 transition-colors ${
                item.selected
                  ? 'bg-blue-600 border-blue-600 text-white'
                  : 'bg-white border-slate-300'
              }`}
            >
              {item.selected && <Check className="w-3.5 h-3.5" />}
            </div>

            <div className="space-y-1 flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 min-w-0">
                  {getIconForType(item.type)}
                  <span className="font-semibold text-slate-900 text-xs truncate">
                    {item.title}
                  </span>
                </div>
                <span className="bg-slate-100 text-slate-600 text-[10px] px-1.5 py-0.5 rounded font-mono shrink-0 ml-2">
                  {item.type}
                </span>
              </div>
              <p className="text-xs text-slate-500 line-clamp-1">{item.summaryText}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Error message banner */}
      {errorMessage && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span className="font-medium">{errorMessage}</span>
        </div>
      )}

      {/* Created Link or Generate Button */}
      {createdUrl ? (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-800">
              ✓ 分享链接已生成，具有只读权限
            </span>
            {onOpenReadOnlyView && (
              <button
                onClick={onOpenReadOnlyView}
                className="text-xs text-blue-700 hover:text-blue-800 font-medium flex items-center gap-1 cursor-pointer"
              >
                <span>立即打开只读展示页</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={`${window.location.origin}${createdUrl}`}
              className="flex-1 bg-white border border-emerald-300 rounded-lg px-3 py-1.5 text-xs text-slate-700 font-mono select-all outline-none"
            />
            <button
              onClick={copyLink}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
            >
              {copied ? <CheckCheck className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? '已复制' : '复制'}</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="flex justify-end pt-1">
          <button
            disabled={loading || items.filter((i) => i.selected).length === 0}
            onClick={handleGenerate}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer transition-colors disabled:opacity-50"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>{loading ? '正在生成...' : '生成精选分享链接'}</span>
          </button>
        </div>
      )}
    </div>
  );
};
