import React, { useState, useRef } from 'react';
import { Paperclip, Sparkles, Send, Database, MapPin, X, FileSpreadsheet } from 'lucide-react';
import { TaskStage } from '../agent/contracts';

interface ComposerProps {
  stage?: TaskStage;
  loading?: boolean;
  onSend: (text: string, files?: File[]) => Promise<void> | void;
}

export const Composer: React.FC<ComposerProps> = ({
  stage,
  loading = false,
  onSend,
}) => {
  const [inputText, setInputText] = useState('');
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getPlaceholder = () => {
    switch (stage) {
      case 'ASK_DATA':
        return '描述你的问题或目标，例如：“查一下上周公共服务热线工单办结率”...';
      case 'METRIC_RESOLUTION':
        return '选择上方指标口径，或直接追问：“为什么办结率下降了？”...';
      case 'ANALYSIS':
        return '上传重点工单 CSV 或输入：“上传重点关注工单清单，分析这批工单的影响”...';
      case 'FILE_ENRICHMENT':
        return '输入：“以后每周都帮我做一次这个分析，每周一上午 9 点给我结果。”...';
      case 'SCHEDULE_CONFIRM':
        return '点击上方“确认创建周期任务”，或继续调整调度规则...';
      case 'SCHEDULED':
        return '输入：“生成精选分享链接”或继续下钻分析...';
      case 'SHARE':
        return '勾选上方需要分享的内容并生成链接，或继续提问...';
      default:
        return '输入您的业务分析诉求或让 Semovix 执行下一步...';
    }
  };

  const handleSend = async () => {
    if ((inputText.trim() || attachedFiles.length > 0) && !loading) {
      const textToSend = inputText.trim();
      const filesToSend = [...attachedFiles];
      setInputText('');
      setAttachedFiles([]);
      await onSend(textToSend, filesToSend);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setAttachedFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setAttachedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Mock demo file attachment
  const attachDemoCsv = () => {
    const blob = new Blob(['case_id,street_code,is_overdue\n1001,SH01,1'], { type: 'text/csv' });
    const file = new File([blob], 'focus_case_list_2026W32.csv', { type: 'text/csv' });
    setAttachedFiles((prev) => [...prev, file]);
    if (!inputText) {
      setInputText('我上传了本周重点关注工单清单，请帮我看看这批工单对按期办结率的影响。');
    }
  };

  return (
    <div className="p-4 bg-gradient-to-t from-slate-100 via-slate-100/90 to-transparent shrink-0">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl border border-slate-200/90 shadow-lg p-3 transition-all focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100">
        {/* Attachment Chips */}
        {attachedFiles.length > 0 && (
          <div className="flex flex-wrap gap-2 pb-2 mb-2 border-b border-slate-100">
            {attachedFiles.map((file, idx) => (
              <div
                key={idx}
                className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-2.5 py-1 rounded-lg"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                <span className="font-mono">{file.name}</span>
                <button
                  onClick={() => removeFile(idx)}
                  className="hover:text-rose-600 ml-1 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        <textarea
          rows={2}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={getPlaceholder()}
          disabled={loading}
          className="w-full bg-transparent resize-none outline-none text-xs sm:text-sm text-slate-800 placeholder-slate-400 font-normal leading-relaxed disabled:opacity-60"
        />

        <div className="flex items-center justify-between pt-2 border-t border-slate-100 mt-1">
          {/* Bottom Toolbar Tools */}
          <div className="flex items-center gap-2 flex-wrap text-xs">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".csv,.xlsx,.txt"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors flex items-center gap-1 cursor-pointer"
              title="添加 CSV 附件"
            >
              <Paperclip className="w-4 h-4 text-slate-500" />
              <span className="hidden sm:inline text-slate-600 text-[11px]">添加附件</span>
            </button>

            <button
              onClick={attachDemoCsv}
              className="px-2 py-0.5 text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md cursor-pointer transition-colors"
              title="快速载入重点关注工单清单 CSV"
            >
              + 快速载入演示 CSV
            </button>

            <span className="h-3 w-px bg-slate-200 hidden sm:inline" />

            <div className="hidden sm:flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full text-[11px] font-medium border border-blue-100">
              <Sparkles className="w-3 h-3 text-blue-600" />
              <span>智能语义代理</span>
            </div>

            <div className="hidden md:flex items-center gap-1 bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full text-[11px] font-medium">
              <Database className="w-3 h-3 text-slate-500" />
              <span>公共服务工单模型</span>
            </div>

            <div className="hidden lg:flex items-center gap-1 bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full text-[11px]">
              <MapPin className="w-3 h-3 text-slate-400" />
              <span>上海市闵行区</span>
            </div>
          </div>

          {/* Send Button */}
          <button
            onClick={handleSend}
            disabled={loading || (!inputText.trim() && attachedFiles.length === 0)}
            className="w-8 h-8 rounded-full bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white flex items-center justify-center shadow-xs transition-colors cursor-pointer shrink-0 ml-2"
            title="发送指令并推进任务"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
