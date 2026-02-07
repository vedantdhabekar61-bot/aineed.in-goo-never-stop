
'use client';

import React from 'react';
// Explicitly importing from index to resolve module ambiguity between directory and file
import { ToolRecommendation } from '../../types/index';
import { SparklesIcon, ExternalLinkIcon, ArrowRightIcon } from '../common/Icons';

interface ResultCardProps {
  tool: ToolRecommendation;
  index: number;
  onAnalyze: () => void;
}

export const ResultCard: React.FC<ResultCardProps> = ({ tool, index, onAnalyze }) => {
  return (
    <div 
      className="group relative bg-white border border-slate-100 rounded-3xl p-8 hover:border-primary/30 transition-all duration-500 hover:shadow-soft flex flex-col h-full animate-in fade-in slide-in-from-bottom-4"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="flex items-center space-x-4 mb-8">
        <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-primary group-hover:scale-110 transition-transform shadow-sm">
          <SparklesIcon className="w-7 h-7" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 leading-tight">{tool.name}</h3>
      </div>
      <p className="text-slate-500 mb-8 flex-grow leading-relaxed font-medium">{tool.description}</p>
      
      {tool.reasoning && (
        <div className="mb-10 p-5 bg-primary/5 rounded-2xl border border-primary/10">
          <p className="text-[13px] text-slate-600 leading-relaxed italic">"{tool.reasoning}"</p>
        </div>
      )}

      <div className="mt-auto space-y-3">
        <button onClick={onAnalyze} className="w-full py-4 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-2xl transition-all font-bold text-[13px] flex items-center justify-center gap-2">
          Blueprint <ArrowRightIcon />
        </button>
        <a href={tool.url} target="_blank" className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl transition-all font-black text-[13px] flex items-center justify-center gap-2">
          Launch <ExternalLinkIcon />
        </a>
      </div>
    </div>
  );
};
