import React, { useState } from 'react';
import { PageState } from '../../types';
import { Sparkles, Send, Database, MapPin, Paperclip, ArrowRight } from 'lucide-react';

interface Page01Props {
  onNavigateNext: () => void;
}

export const Page01Ask: React.FC<Page01Props> = ({ onNavigateNext }) => {
  const [question, setQuestion] = useState('上周公共服务热线工单按期办结率和环比变化如何？');

  const recommendedPrompts = [
    '哪些街镇变化最大？',
    '为什么按期办结率下降？',
    '看看不同诉求类型的变化',
  ];

  return (
    <div className="flex-1 flex flex-col justify-center items-center px-4 py-8 max-w-3xl mx-auto w-full animate-in fade-in duration-300">
      {/* Title */}
      <div className="text-center space-y-2 mb-8">
        <div className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold border border-blue-100">
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          <span>Semovix Enterprise AI Assistant</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          今天需要完成什么工作？
        </h1>
        <p className="text-sm text-slate-500 max-w-lg mx-auto">
          描述你的问题或目标，Xino 会使用企业正式数据和业务语义协助完成。
        </p>
      </div>

      {/* Central Large Input Box */}
      <div className="w-full bg-white rounded-2xl border border-slate-200 shadow-xl p-4 space-y-3 transition-all focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
        <textarea
          rows={3}
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="输入您的业务数据分析目标..."
          className="w-full text-base text-slate-800 placeholder-slate-400 outline-none resize-none leading-relaxed"
        />

        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <div className="flex items-center gap-2 text-xs">
            <div className="flex items-center gap-1 text-slate-500 hover:text-slate-800 px-2 py-1 rounded-md hover:bg-slate-100 transition-colors cursor-pointer">
              <Paperclip className="w-3.5 h-3.5" />
              <span>附件</span>
            </div>
            <span className="h-3 w-px bg-slate-200" />
            <div className="flex items-center gap-1 bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full text-xs font-medium border border-blue-100">
              <Sparkles className="w-3 h-3 text-blue-600" />
              <span>自动模式</span>
            </div>
            <div className="flex items-center gap-1 bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full text-xs font-medium">
              <Database className="w-3.5 h-3.5 text-slate-500" />
              <span>数据工作</span>
            </div>
            <div className="hidden sm:flex items-center gap-1 bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full text-xs">
              <MapPin className="w-3 h-3 text-slate-400" />
              <span>上海市闵行区</span>
            </div>
          </div>

          <button
            onClick={onNavigateNext}
            className="bg-blue-600 hover:bg-blue-700 text-white p-2.5 rounded-full shadow-md transition-transform hover:scale-105 cursor-pointer flex items-center justify-center"
            title="发送提问"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Recommended Prompts */}
      <div className="mt-6 space-y-2 w-full text-center">
        <p className="text-xs text-slate-400 font-medium">推荐问题探查</p>
        <div className="flex flex-wrap justify-center gap-2">
          {recommendedPrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => {
                setQuestion(prompt);
                onNavigateNext();
              }}
              className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs px-3 py-1.5 rounded-full shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span>{prompt}</span>
              <ArrowRight className="w-3 h-3 text-slate-400" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
