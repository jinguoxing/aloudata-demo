import React, { useState } from 'react';
import { X, Check, Copy, ExternalLink, ShieldCheck, Link2 } from 'lucide-react';
import { safeCopyText } from '../utils/safeBrowser';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCount: number;
  shareUrl?: string;
  onOpenReadOnlyView: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  selectedCount,
  shareUrl: customShareUrl,
  onOpenReadOnlyView,
}) => {
  const [copied, setCopied] = useState(false);
  const shareUrl =
    customShareUrl ||
    (typeof window !== 'undefined'
      ? `${window.location.origin}/share/s_8f3a9d2c91e4`
      : 'https://semovix.ai/share/s_8f3a9d2c91e4');

  if (!isOpen) return null;

  const handleCopy = async () => {
    await safeCopyText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              <Link2 className="w-4 h-4" />
            </div>
            <h3 className="font-semibold text-slate-900 text-sm">分享分析成果</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs">
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-blue-900 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-blue-900">精选只读保护</p>
              <p className="text-blue-700 mt-0.5 leading-relaxed">
                已精选 <strong>{selectedCount}</strong> 项分析内容。接收者仅可查看精选的分析结论和公开证据，无法访问底层 Python 代码与内部环境信息。
              </p>
            </div>
          </div>

          <div>
            <label className="block text-slate-500 font-medium mb-1.5">专属分享链接</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 font-mono text-[11px] text-slate-800 outline-none"
              />
              <button
                onClick={handleCopy}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-3 py-2 rounded-lg flex items-center gap-1 transition-colors cursor-pointer shrink-0"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? '已复制' : '复制链接'}</span>
              </button>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <span className="text-slate-400">链接有效期：永久有效</span>
            <button
              onClick={() => {
                onClose();
                onOpenReadOnlyView();
              }}
              className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 hover:underline cursor-pointer"
            >
              <span>体验只读页面 (Page 08)</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
