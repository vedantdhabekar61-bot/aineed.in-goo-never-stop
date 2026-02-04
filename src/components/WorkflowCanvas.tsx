
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
    <div className="w-full mt-32 animate-in fade-in slide-in-from-bottom-20 duration-1000">
      <div className="relative p-1.5 border-2 border-dashed border-primary/20 rounded-[48px] bg-white/[0.02]">
        <div className="bg-[#121214] rounded-[42px] shadow-[0_40px_100px_rgba(0,0,0,0.6)] overflow-hidden border border-white/10 shadow-glass">
          
          {/* Header */}
          <div className="px-10 py-8 bg-black/40 backdrop-blur-md border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-5">
              <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center text-white shadow-glow">
                <SparklesIcon className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold tracking-tight">Execution Blueprint: <span className="text-primary/80">{activeTool?.name}</span></h2>
            </div>
            <button onClick={onClear} className="px-5 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-slate-400 hover:text-slate-100 transition-all text-[12px] font-black tracking-widest uppercase border border-white/5">
              Dismiss
            </button>
          </div>

          <div className="p-10 md:p-16">
            {isLoading ? (
              <div className="py-24 flex flex-col items-center justify-center">
                <LoaderIcon className="w-16 h-16 text-primary animate-spin mb-8 opacity-50" />
                <p className="text-slate-500 font-black animate-pulse uppercase tracking-[0.3em] text-[11px]">Architecting Solution...</p>
              </div>
            ) : plan ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
                
                {/* Steps Section */}
                <div className="lg:col-span-2 space-y-12">
                  <div className="flex items-center gap-3 mb-10">
                    <span className="px-3 py-1 bg-primary/10 text-primary text-[11px] font-black uppercase tracking-[0.1em] rounded-lg border border-primary/20">Operational Logic</span>
                  </div>
                  
                  {plan.steps.map((step, i) => (
                    <div key={i} className="flex gap-10 group">
                      <div className="flex flex-col items-center">
                        <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 text-slate-100 flex items-center justify-center font-bold text-lg shrink-0 shadow-glass group-hover:bg-primary transition-all group-hover:scale-110 duration-500 group-hover:text-white group-hover:shadow-glow">
                          {i + 1}
                        </div>
                        {i < 2 && <div className="w-[1px] h-full bg-white/5 my-4" />}
                      </div>
                      <div className="pt-2 pb-6">
                        <h4 className="text-lg font-bold text-slate-100 mb-3 tracking-tight group-hover:text-primary transition-colors">{step.action}</h4>
                        <p className="text-[15px] text-slate-500 leading-relaxed font-medium">{step.description}</p>
                      </div>
                    </div>
                  ))}

                  <div className="mt-16 p-8 bg-white/5 rounded-[32px] border border-white/5 shadow-glass">
                    <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-6">Input Architecture</h5>
                    <p className="text-[15px] text-slate-300 font-medium leading-relaxed">{plan.uploadGuide}</p>
                  </div>
                </div>

                {/* Prompt Section */}
                <div className="lg:col-span-1">
                  <div className="sticky top-12 bg-white/[0.03] border border-white/10 rounded-[40px] p-10 shadow-glass overflow-hidden">
                    {/* Background glow for the prompt box */}
                    <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl" />
                    
                    <h5 className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
                      <SparklesIcon className="w-4 h-4" />
                      Configuration Prompt
                    </h5>
                    <div className="bg-black/40 border border-white/5 rounded-2xl p-6 mb-8 shadow-inner relative z-10">
                      <p className="text-[13px] text-slate-400 font-mono leading-relaxed whitespace-pre-wrap">
                        {plan.promptTemplate}
                      </p>
                    </div>
                    <button 
                      onClick={() => navigator.clipboard.writeText(plan.promptTemplate)}
                      className="w-full py-4 bg-primary hover:bg-primary/90 text-white rounded-2xl text-[13px] font-black tracking-widest uppercase shadow-lg shadow-primary/20 transition-all active:scale-95 flex items-center justify-center gap-3 group/copy"
                    >
                      Copy Logic
                      <svg className="w-4 h-4 group-hover:rotate-12 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                    </button>
                    <p className="mt-6 text-[11px] text-slate-600 text-center font-bold tracking-tight">
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
