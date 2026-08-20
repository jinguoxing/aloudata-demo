import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface Props {
  message: string;
}

export const ErrorNoticeBlock: React.FC<Props> = ({ message }) => {
  return (
    <div className="flex items-center gap-2.5 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs">
      <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
      <span>{message || '执行遇到错误，请重试或更换指令'}</span>
    </div>
  );
};
