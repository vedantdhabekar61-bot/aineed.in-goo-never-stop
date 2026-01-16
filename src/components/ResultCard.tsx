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
      className="group relative bg-surface border border-slate-700 rounded-xl p-6 hover:border-indigo-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/10 flex flex-col h-full"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 group-hover:text-indigo-300 group-hover:bg-indigo-500/20 transition-colors">
            <SparklesIcon className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-white group-hover:text-indigo-300 transition-colors">
            {tool.name}
          </h3>
        </div>
      </div>
      
      <p className="text-slate-400 mb-6 flex-grow leading-relaxed">
        {tool.description}
      </p>
      
      <a 
        href={tool.url} 
        target="_blank" 
        rel="noopener noreferrer"
        className="inline-flex items-center justify-center w-full py-3 px-4 bg-slate-700/50 hover:bg-indigo-600 text-indigo-300 hover:text-white rounded-lg transition-all duration-200 font-medium group-hover:translate-y-[-2px]"
      >
        <span>Visit Website</span>
        <ExternalLinkIcon className="w-4 h-4 ml-2" />
      </a>
    </div>
  );
};

export default ResultCard;