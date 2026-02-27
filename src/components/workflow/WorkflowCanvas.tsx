
'use client';

import React from 'react';
import { WorkflowPlan, ToolRecommendation } from '../../types';
import { SparklesIcon, LoaderIcon, ArrowRightIcon } from '../common/Icons';

interface WorkflowCanvasProps {
  plan: WorkflowPlan | null;
  isLoading: boolean;
  onClear: () => void;
  activeTool: ToolRecommendation | null;
}

const WorkflowCanvas: React.FC<WorkflowCanvasProps> = ({ plan, isLoading, onClear, activeTool }) => {
  if (!activeTool && !isLoading) return null;

  return (
    <div className="w-full mt-32 animate-in fade-in slide-in-from-bottom-20 duration-1000">
      <div className="relative p-1.5 border-2 border-dashed border-slate-100 rounded-[48px] bg-slate-50/50">
        <div className="bg-white rounded-[42px] shadow-[0_40px_100px_rgba(0,0,0,0.08)] overflow-hidden border border-slate-100">
          
          {/* Header */}
          <div className="px-10 py-8 bg-white border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-5">
              <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center text-white shadow-glow">
                <SparklesIcon className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold tracking-tight text-slate-900">Execution Blueprint: <span className="text-primary/80">{activeTool?.name}</span></h2>
            </div>
            <button onClick={onClear} className="px-5 py-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-600 transition-all text-[12px] font-black tracking-widest uppercase border border-slate-200">
              Dismiss
            </button>
          </div>

          <div className="p-10 md:p-16">
            {isLoading ? (
              <div className="py-24 flex flex-col items-center justify-center">
                <div className="relative">
                  <LoaderIcon className="w-16 h-16 text-primary animate-spin opacity-50" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-2 h-2 bg-primary rounded-full animate-ping" />
                  </div>
                </div>
                <p className="mt-8 text-slate-400 font-black animate-pulse uppercase tracking-[0.3em] text-[11px]">Architecting Solution...</p>
              </div>
            ) : plan ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
                
                {/* Steps Section */}
                <div className="lg:col-span-2 space-y-12">
                  <div className="flex items-center gap-3 mb-10">
                    <span className="px-3 py-1 bg-primary/5 text-primary text-[11px] font-black uppercase tracking-[0.1em] rounded-lg border border-primary/10">Operational Logic</span>
                  </div>
                  
                  {plan.steps.map((step, i) => (
                    <div key={i} className="flex gap-10 group">
                      <div className="flex flex-col items-center">
                        <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 flex items-center justify-center font-bold text-lg shrink-0 group-hover:bg-primary transition-all group-hover:scale-110 duration-500 group-hover:text-white group-hover:shadow-glow">
                          {i + 1}
                        </div>
                        {i < 2 && <div className="w-[1px] h-full bg-slate-100 my-4" />}
                      </div>
                      <div className="pt-2 pb-6">
                        <h4 className="text-lg font-bold text-slate-900 mb-3 tracking-tight group-hover:text-primary transition-colors">{step.action}</h4>
                        <p className="text-[15px] text-slate-500 leading-relaxed font-medium">{step.description}</p>
                      </div>
                    </div>
                  ))}

                  <div className="mt-16 p-10 bg-slate-50/50 rounded-[32px] border border-slate-100 border-dashed">
                    <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                       <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                       Input Architecture
                    </h5>
                    <p className="text-[15px] text-slate-600 font-bold leading-relaxed">{plan.uploadGuide}</p>
                  </div>
                </div>

                {/* Prompt Section */}
                <div className="lg:col-span-1">
                  <div className="sticky top-12 bg-white border border-slate-200 rounded-[40px] p-10 overflow-hidden shadow-soft">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
                    
                    <h5 className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
                      <SparklesIcon className="w-4 h-4" />
                      Configuration Prompt
                    </h5>
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 mb-8 shadow-inner relative z-10 group/code">
                      <p className="text-[13px] text-slate-700 font-mono leading-relaxed whitespace-pre-wrap selection:bg-primary selection:text-white">
                        {plan.promptTemplate}
                      </p>
                    </div>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(plan.promptTemplate);
                        // Optional: trigger a temporary success state
                      }}
                      className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-[13px] font-black tracking-widest uppercase shadow-lg shadow-slate-200 transition-all active:scale-95 flex items-center justify-center gap-3 group/copy"
                    >
                      Copy Logic
                      <svg className="w-4 h-4 group-hover:rotate-12 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                    </button>
                    <p className="mt-6 text-[11px] text-slate-400 text-center font-bold tracking-tight">
                      Ready for copy-paste deployment.
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
