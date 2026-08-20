import React from 'react';
import { Bot } from 'lucide-react';

interface Props {
  text?: string;
}

export const AssistantMessageBlock: React.FC<Props> = ({ text }) => {
  if (!text) return null;

  return (
    <div className="flex items-start gap-3 bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
      <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
        <Bot className="w-4 h-4" />
      </div>
      <div className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
        {text}
      </div>
    </div>
  );
};
