
'use client';

import React from 'react';
import { WorkflowPlan, ToolRecommendation } from '../types';
import { SparklesIcon, LoaderIcon, ArrowRightIcon } from './Icons';

interface WorkflowCanvasProps {
  plan: WorkflowPlan | null;
  isLoading: boolean;
  onClear: () => void;
  activeTool: ToolRecommendation | null;
}

const WorkflowCanvas: React.FC<WorkflowCanvasProps> = ({ plan, isLoading, onClear, activeTool }) => {
  if (!activeTool && !isLoading) return null;

  return (
    <div className="w-full mt-24 animate-in fade-in slide-in-from-bottom-12 duration-700">
      <div className="relative p-1 border-2 border-dashed border-[#5D5CDE]/30 rounded-[40px] bg-slate-50/50">
        <div className="bg-white rounded-[36px] shadow-2xl overflow-hidden border border-slate-200">
          
          {/* Header */}
          <div className="px-8 py-6 bg-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#5D5CDE] flex items-center justify-center">
                <SparklesIcon className="w-4 h-4" />
              </div>
              <h2 className="text-lg font-bold">Workflow Blueprint: <span className="text-indigo-300">{activeTool?.name}</span></h2>
            </div>
            <button onClick={onClear} className="text-slate-400 hover:text-white transition-colors text-sm font-bold">
              Dismiss Plan
            </button>
          </div>

          <div className="p-8 md:p-12">
            {isLoading ? (
              <div className="py-20 flex flex-col items-center justify-center">
                <LoaderIcon className="w-12 h-12 text-[#5D5CDE] animate-spin mb-6" />
                <p className="text-slate-500 font-bold animate-pulse uppercase tracking-widest text-xs">Architecting Solution...</p>
              </div>
            ) : plan ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                
                {/* Steps Section */}
                <div className="lg:col-span-2 space-y-8">
                  <div className="flex items-center gap-2 mb-6">
                    <span className="px-2 py-0.5 bg-indigo-50 text-[#5D5CDE] text-[10px] font-black uppercase rounded">Execution Path</span>
                  </div>
                  
                  {plan.steps.map((step, i) => (
                    <div key={i} className="flex gap-6 group">
                      <div className="flex flex-col items-center">
                        <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                          {i + 1}
                        </div>
                        {i < 2 && <div className="w-0.5 h-full bg-slate-100 my-2" />}
                      </div>
                      <div className="pt-1 pb-4">
                        <h4 className="text-base font-bold text-slate-900 mb-2">{step.action}</h4>
                        <p className="text-sm text-slate-500 leading-relaxed font-medium">{step.description}</p>
                      </div>
                    </div>
                  ))}

                  <div className="mt-12 p-6 bg-slate-50 rounded-2xl border border-slate-100">
                    <h5 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-4">Input & Files</h5>
                    <p className="text-sm text-slate-700 font-medium leading-relaxed">{plan.uploadGuide}</p>
                  </div>
                </div>

                {/* Prompt Section */}
                <div className="lg:col-span-1">
                  <div className="sticky top-8 bg-[#5D5CDE]/5 border border-[#5D5CDE]/10 rounded-3xl p-8">
                    <h5 className="text-xs font-black text-[#5D5CDE] uppercase tracking-wider mb-6 flex items-center gap-2">
                      <SparklesIcon className="w-3 h-3" />
                      Ready-to-use Prompt
                    </h5>
                    <div className="bg-white border border-slate-100 rounded-xl p-4 mb-6 shadow-sm">
                      <p className="text-xs text-slate-600 font-mono leading-relaxed whitespace-pre-wrap">
                        {plan.promptTemplate}
                      </p>
                    </div>
                    <button 
                      onClick={() => navigator.clipboard.writeText(plan.promptTemplate)}
                      className="w-full py-3 bg-[#5D5CDE] hover:bg-[#4b4ac2] text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2"
                    >
                      Copy Prompt Template
                    </button>
                    <p className="mt-4 text-[10px] text-slate-400 text-center font-medium">
                      Paste this directly into {activeTool?.name}
                    </p>
                  </div>
                </div>

              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkflowCanvas;
