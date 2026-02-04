
'use client';

import React from 'react';
import { ToolRecommendation } from '../types';
import { ExternalLinkIcon, SparklesIcon, ArrowRightIcon } from './Icons';

interface ResultCardProps {
  tool: ToolRecommendation;
  index: number;
  onSave?: (tool: ToolRecommendation) => void;
  onAnalyze?: (tool: ToolRecommendation) => void;
  isSaved?: boolean;
}

const ResultCard: React.FC<ResultCardProps> = ({ tool, index, onSave, onAnalyze, isSaved }) => {
  return (
    <div 
      className="group relative bg-[#121214] border border-white/5 rounded-3xl p-8 hover:border-primary/40 transition-all duration-500 hover:shadow-[0_30px_60px_rgba(0,0,0,0.5),inset_0_1px_0_0_rgba(255,255,255,0.05)] flex flex-col h-full overflow-hidden hover:-translate-y-2"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl pointer-events-none group-hover:bg-primary/10 transition-colors" />

      {/* Save Button */}
      <button 
        onClick={() => onSave?.(tool)}
        className={`absolute top-6 right-6 p-2.5 rounded-xl transition-all duration-300 z-10 ${
          isSaved 
            ? 'bg-primary text-white shadow-lg shadow-primary/20' 
            : 'bg-white/5 text-slate-500 hover:bg-white/10 hover:text-slate-300'
        }`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill={isSaved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>
      </button>

      <div className="flex items-start mb-8">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-500 shadow-glass">
            <SparklesIcon className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-bold text-slate-100 leading-tight tracking-tight">
            {tool.name}
          </h3>
        </div>
      </div>
      
      <p className="text-slate-400 mb-8 flex-grow leading-relaxed font-medium text-[15px]">
        {tool.description}
      </p>

      {/* Logic Snippet */}
      {tool.reasoning && (
        <div className="mb-10 p-5 bg-primary/5 border border-primary/10 rounded-2xl relative overflow-hidden group/logic">
          <div className="absolute top-0 left-0 w-1 h-full bg-primary/50" />
          <p className="text-[13px] text-slate-300 leading-relaxed tracking-wide">
            <span className="font-black uppercase tracking-[0.1em] text-[10px] text-primary/70 block mb-2">AI Reasoning</span>
            {tool.reasoning}
          </p>
        </div>
      )}
      
      <div className="mt-auto space-y-3">
        <button 
          onClick={() => onAnalyze?.(tool)}
          className="w-full py-4 px-4 bg-white/5 hover:bg-white/10 text-slate-100 rounded-2xl transition-all duration-300 font-bold text-[13px] flex items-center justify-center gap-2 border border-white/5 shadow-glass"
        >
          <span>Execution Blueprint</span>
          <ArrowRightIcon className="w-4 h-4 opacity-50 group-hover:translate-x-1 transition-transform" />
        </button>
        
        <a 
          href={tool.url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center w-full py-4 px-4 bg-primary hover:bg-primary/90 text-white rounded-2xl transition-all duration-300 font-black text-[13px] shadow-lg shadow-primary/10 group-hover:shadow-primary/30"
        >
          <span>Launch Platform</span>
          <ExternalLinkIcon className="w-4 h-4 ml-2" />
        </a>
      </div>
    </div>
  );
};

export default ResultCard;
