
'use client';

import React from 'react';
import { WorkflowPlan, ToolRecommendation } from '../../types/index';
import { SparklesIcon, LoaderIcon } from '../common/Icons';

interface WorkflowCanvasProps {
  plan: WorkflowPlan | null;
  isLoading: boolean;
  onClear: () => void;
  activeTool: ToolRecommendation | null;
}

export const WorkflowCanvas: React.FC<WorkflowCanvasProps> = ({ plan, isLoading, onClear, activeTool }) => {
  if (!activeTool && !isLoading) return null;

  return (
    <div className="w-full mt-24 animate-in fade-in slide-in-from-bottom-12 duration-1000">
      <div className="bg-white rounded-[42px] shadow-premium overflow-hidden border border-slate-100 p-10 md:p-16">
        <div className="flex items-center justify-between mb-12">
          <h2 className="text-xl font-bold tracking-tight text-slate-900">Blueprint: <span className="text-primary">{activeTool?.name}</span></h2>
          <button onClick={onClear} className="px-5 py-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl text-slate-400 text-xs font-black uppercase">Dismiss</button>
        </div>
        {isLoading ? (
          <div className="py-24 flex flex-col items-center justify-center">
            <LoaderIcon className="w-16 h-16 text-primary animate-spin opacity-50" />
            <p className="mt-8 text-slate-400 font-black animate-pulse uppercase tracking-widest text-[11px]">Architecting Solution...</p>
          </div>
        ) : plan ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <div className="space-y-12">
              {plan.steps.map((step, i) => (
                <div key={i} className="flex gap-10">
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center font-bold text-lg shrink-0">{i + 1}</div>
                  <div>
                    <h4 className="text-lg font-bold mb-3">{step.action}</h4>
                    <p className="text-slate-500 leading-relaxed">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-slate-50 p-10 rounded-3xl border border-slate-100 border-dashed">
              <h5 className="text-[10px] font-black text-primary uppercase tracking-widest mb-6">Optimization Prompt</h5>
              <p className="text-sm text-slate-700 font-mono leading-relaxed bg-white p-6 rounded-2xl border border-slate-200">{plan.promptTemplate}</p>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};
