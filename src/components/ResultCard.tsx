import React from 'react';
import { ToolRecommendation } from '../types';
import { ExternalLinkIcon, SparklesIcon } from './Icons';

interface ResultCardProps {
  tool: ToolRecommendation;
  index: number;
}

const ResultCard: React.FC<ResultCardProps> = ({ tool, index }) => {
  return (
    <div 
      className="group relative bg-white border border-slate-200 rounded-2xl p-8 hover:border-[#5D5CDE]/30 transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-1 flex flex-col h-full"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[#5D5CDE] group-hover:bg-[#5D5CDE] group-hover:text-white transition-colors duration-300">
            <SparklesIcon className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 leading-tight">
            {tool.name}
          </h3>
        </div>
      </div>
      
      <p className="text-slate-600 mb-8 flex-grow leading-relaxed font-medium">
        {tool.description}
      </p>
      
      <a 
        href={tool.url} 
        target="_blank" 
        rel="noopener noreferrer"
        className="mt-auto inline-flex items-center justify-center w-full py-3.5 px-4 bg-slate-50 hover:bg-[#5D5CDE] text-slate-700 hover:text-white rounded-xl transition-all duration-200 font-semibold text-sm group-hover:shadow-lg group-hover:shadow-indigo-500/20"
      >
        <span>Visit Website</span>
        <ExternalLinkIcon className="w-4 h-4 ml-2" />
      </a>
    </div>
  );
};

export default ResultCard;