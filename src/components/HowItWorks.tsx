
'use client';

import React from 'react';
import { SearchIcon, SparklesIcon, ClipboardListIcon } from './Icons';

const steps = [
  {
    name: "Step 1: Describe",
    description: "Describe your problem or workflow in detail. The more specific you are, the better the match.",
    icon: <SearchIcon className="w-8 h-8 text-primary" />,
  },
  {
    name: "Step 2: Match",
    description: "Our engine analyzes your request and recommends the most suitable AI tools from our curated directory.",
    icon: <SparklesIcon className="w-8 h-8 text-primary" />,
  },
  {
    name: "Step 3: Implement",
    description: "Receive a simple, actionable 3-step workflow to implement your chosen AI tool effectively.",
    icon: <ClipboardListIcon className="w-8 h-8 text-primary" />,
  },
];

export const HowItWorks = () => {
  return (
    <div className="w-full max-w-7xl mx-auto py-20 animate-in fade-in zoom-in-95 duration-700">
      <div className="text-center mb-20">
        <h2 className="text-5xl md:text-6xl font-black text-slate-900 mb-6 tracking-tighter">
          From Problem to <span className="text-primary">Solution</span> in 3 Steps.
        </h2>
        <p className="text-lg md:text-xl text-slate-500 font-medium max-w-3xl mx-auto leading-relaxed">
          Our intelligent process turns complex operational bottlenecks into streamlined, AI-driven workflows.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
        {steps.map((step, index) => (
          <div
            key={step.name}
            className="group p-8 md:p-10 bg-white border border-slate-200/80 rounded-3xl transition-all duration-300 hover:border-primary/50 hover:shadow-soft hover:scale-[1.02]"
            style={{ animationDelay: `${index * 150}ms` }}
          >
            <div className="w-16 h-16 bg-primary/5 rounded-2xl flex items-center justify-center mb-8 border border-primary/10 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
              {step.icon}
            </div>
            <h3 className="text-2xl font-bold mb-4 text-slate-900 tracking-tight">
              {step.name}
            </h3>
            <p className="text-slate-600 text-base leading-relaxed font-medium">
              {step.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
