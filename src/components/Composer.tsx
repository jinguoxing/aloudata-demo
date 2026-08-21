import React, { useState, useRef } from 'react';
import { Paperclip, Send, MapPin, X, FileSpreadsheet, Square } from 'lucide-react';
import { AgentTask } from '../agent/contracts';

interface ComposerProps {
  task: AgentTask;
  loading?: boolean;
  demoMode?: boolean;
  onSend: (text: string, files?: File[]) => Promise<void> | void;
  onStop?: () => void;
}

export const Composer: React.FC<ComposerProps> = ({
  task,
  loading = false,
  demoMode = false,
  onSend,
  onStop,
}) => {
  const [inputText, setInputText] = useState('');
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getPlaceholder = () => {
    switch (task.status) {
      case 'WAITING_USER':
        if (task.stage === 'SCHEDULE_CONFIRM') {
          return '可以继续修改执行时间、范围或其他条件…';
        }
        return '补充你的选择或条件…';

      case 'RUNNING':
        return '可以先输入下一步想继续做什么…';

      default:
        return task.turns.length === 0
          ? '描述你的数据问题或业务目标…'
          : '继续追问、补充范围或添加数据…';
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

  // Demo file attachment
  const attachDemoCsv = () => {
    const blob = new Blob(['case_id,street_code,is_overdue\n1001,SH01,1'], { type: 'text/csv' });
    const file = new File([blob], 'focus_case_list_2026W32.csv', { type: 'text/csv' });
    setAttachedFiles((prev) => [...prev, file]);
    if (!inputText) {
      setInputText('我上传了本周重点关注工单清单，请帮我看看这批工单对按期办结率的影响。');
    }
  };

  const currentScope =
    (typeof task.context?.scope === 'string'
      ? task.context.scope
      : task.context?.scope?.streetTown || task.context?.scope?.region) ||
    task.context?.region ||
    '上海市闵行区';

  return (
    <div className="p-4 bg-gradient-to-t from-slate-100 via-slate-100/90 to-transparent shrink-0">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-slate-200/90 shadow-lg p-3 transition-all focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100">
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
          className="w-full bg-transparent resize-none outline-none text-xs sm:text-sm text-slate-800 placeholder-slate-400 font-normal leading-relaxed"
        />

        <div className="flex items-center justify-between pt-2 border-t border-slate-100 mt-1">
          {/* Bottom Toolbar Tools */}
          <div className="flex items-center gap-2 flex-wrap text-xs">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".csv,.txt"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 transition-colors cursor-pointer py-1 px-1.5 rounded-md hover:bg-slate-50"
            >
              <Paperclip className="w-4 h-4" />
              <span>添加附件</span>
            </button>

            <span className="h-3 w-px bg-slate-200" />

            <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
              <MapPin className="w-3 h-3 text-slate-400" />
              <span>{currentScope} · 公共服务热线</span>
            </div>

            {demoMode && (
              <>
                <span className="h-3 w-px bg-slate-200" />
                <button
                  onClick={attachDemoCsv}
                  className="px-2 py-0.5 text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md cursor-pointer transition-colors"
                >
                  + 加载演示 CSV
                </button>
              </>
            )}
          </div>

          {/* Send or Stop Button */}
          {loading ? (
            <button
              onClick={onStop}
              className="w-8 h-8 rounded-full bg-slate-900 hover:bg-slate-800 text-white flex items-center justify-center shadow-xs transition-colors cursor-pointer shrink-0 ml-2"
              title="停止生成"
            >
              <Square className="w-3.5 h-3.5 fill-white" />
            </button>
          ) : (
            <button
              onClick={handleSend}
              disabled={!inputText.trim() && attachedFiles.length === 0}
              className="w-8 h-8 rounded-full bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white flex items-center justify-center shadow-xs transition-colors cursor-pointer shrink-0 ml-2"
              title="发送"
            >
              <Send className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
