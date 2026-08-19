import React, { useState } from 'react';
import { PageState } from '../types';
import { Paperclip, Sparkles, Send, Database, MapPin } from 'lucide-react';

interface ComposerProps {
  currentPage: PageState;
  onNavigateNext: () => void;
  onCustomSend?: (input: string) => void;
}

export const Composer: React.FC<ComposerProps> = ({
  currentPage,
  onNavigateNext,
  onCustomSend,
}) => {
  const [inputText, setInputText] = useState('');

  // Default prompts suggested per page state
  const getPlaceholder = () => {
    switch (currentPage) {
      case 'page01':
        return '描述你的问题或目标，Xino 会使用企业正式数据和业务语义协助完成…';
      case 'page02':
        return '输入“为什么环比下降了？”或输入其它追问...';
      case 'page03':
        return '上传 CSV 或输入“我上传了本周重点关注工单清单，请帮我看看...”';
      case 'page04':
        return '输入“以后每周都帮我做一次这个分析，每周一上午 9 点给我结果。”';
      case 'page05':
        return '点击“确认创建”生成周期任务...';
      case 'page06':
        return '输入“分享分析结果”或进行进一步下钻...';
      case 'page07':
        return '勾选需要分享的内容，点击“生成分享链接”...';
      default:
        return '继续追问、补充条件或让 Xino 执行下一步…';
    }
  };

  const handleSend = () => {
    if (onCustomSend && inputText.trim()) {
      onCustomSend(inputText);
      setInputText('');
    } else {
      onNavigateNext();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="p-4 bg-gradient-to-t from-slate-100 via-slate-100/90 to-transparent shrink-0">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl border border-slate-200/90 shadow-lg p-3 transition-all focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100">
        <textarea
          rows={currentPage === 'page01' ? 2 : 1}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={getPlaceholder()}
          className="w-full bg-transparent resize-none outline-none text-sm text-slate-800 placeholder-slate-400 font-normal leading-relaxed"
        />

        <div className="flex items-center justify-between pt-2 border-t border-slate-100 mt-1">
          {/* Bottom Toolbar Tools */}
          <div className="flex items-center gap-2 flex-wrap text-xs">
            <button
              onClick={() => {
                if (currentPage === 'page03') onNavigateNext();
              }}
              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors flex items-center gap-1 cursor-pointer"
              title="添加附件 / CSV 文件"
            >
              <Paperclip className="w-4 h-4 text-slate-500" />
              <span className="hidden sm:inline text-slate-600 text-[11px]">附件</span>
            </button>

            <span className="h-3 w-px bg-slate-200" />

            <div className="flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full text-[11px] font-medium border border-blue-100">
              <Sparkles className="w-3 h-3 text-blue-600" />
              <span>自动模式</span>
            </div>

            <div className="flex items-center gap-1 bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full text-[11px] font-medium">
              <Database className="w-3 h-3 text-slate-500" />
              <span>数据工作</span>
            </div>

            <div className="hidden md:flex items-center gap-1 bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full text-[11px]">
              <MapPin className="w-3 h-3 text-slate-400" />
              <span>上海市闵行区</span>
            </div>
          </div>

          {/* Send Button */}
          <button
            onClick={handleSend}
            className="w-8 h-8 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shadow-xs transition-colors cursor-pointer shrink-0 ml-2"
            title="发送指令并推进任务"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
