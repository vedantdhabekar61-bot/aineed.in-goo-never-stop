
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
      className="group relative bg-white border border-slate-200 rounded-2xl p-8 hover:border-[#5D5CDE]/40 transition-all duration-500 hover:shadow-[0_20px_50px_rgba(93,92,222,0.06)] flex flex-col h-full overflow-hidden"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Save Ribbon */}
      <button 
        onClick={() => onSave?.(tool)}
        className={`absolute top-4 right-4 p-2 rounded-full transition-all duration-300 z-10 ${
          isSaved 
            ? 'bg-[#5D5CDE] text-white' 
            : 'bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600'
        }`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill={isSaved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>
      </button>

      <div className="flex items-start mb-6">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[#5D5CDE] group-hover:scale-110 transition-transform duration-500">
            <SparklesIcon className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 leading-tight">
            {tool.name}
          </h3>
        </div>
      </div>
      
      <p className="text-slate-600 mb-6 flex-grow leading-relaxed font-medium">
        {tool.description}
      </p>

      {/* Logic Snippet */}
      {tool.reasoning && (
        <div className="mb-8 p-4 bg-amber-50/50 border border-amber-100/50 rounded-xl relative overflow-hidden group/logic">
          <div className="absolute top-0 left-0 w-1 h-full bg-amber-200" />
          <p className="text-[13px] text-amber-800 leading-snug">
            <span className="font-bold uppercase tracking-wider text-[10px] block mb-1 opacity-70">AI Insight</span>
            {tool.reasoning}
          </p>
        </div>
      )}
      
      <div className="mt-auto space-y-3">
        <button 
          onClick={() => onAnalyze?.(tool)}
          className="w-full py-3 px-4 bg-indigo-50 hover:bg-indigo-100 text-[#5D5CDE] rounded-xl transition-all duration-300 font-bold text-sm flex items-center justify-center gap-2 border border-indigo-100"
        >
          <span>Blueprint Workflow</span>
          <ArrowRightIcon className="w-4 h-4" />
        </button>
        
        <a 
          href={tool.url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center w-full py-3 px-4 bg-slate-900 hover:bg-[#5D5CDE] text-white rounded-xl transition-all duration-300 font-bold text-sm shadow-sm group-hover:shadow-indigo-500/25"
        >
          <span>Visit Website</span>
          <ExternalLinkIcon className="w-4 h-4 ml-2" />
        </a>
      </div>
    </div>
  );
};

export default ResultCard;
