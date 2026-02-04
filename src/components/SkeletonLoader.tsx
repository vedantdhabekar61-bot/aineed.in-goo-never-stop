
import React from 'react';

const SkeletonCard = () => (
  <div className="bg-[#121214] border border-white/5 rounded-3xl p-8 animate-pulse shadow-glass">
    <div className="flex items-center space-x-4 mb-8">
      <div className="w-14 h-14 rounded-2xl bg-white/5 shadow-glass" />
      <div className="h-6 w-32 bg-white/5 rounded-lg" />
    </div>
    <div className="space-y-3 mb-10">
      <div className="h-4 w-full bg-white/5 rounded-md" />
      <div className="h-4 w-5/6 bg-white/5 rounded-md" />
      <div className="h-4 w-4/6 bg-white/5 rounded-md" />
    </div>
    <div className="space-y-3">
      <div className="h-12 w-full bg-white/5 rounded-2xl" />
      <div className="h-12 w-full bg-white/5 rounded-2xl opacity-50" />
    </div>
  </div>
);

export const SkeletonGrid = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full">
    <SkeletonCard />
    <SkeletonCard />
    <SkeletonCard />
  </div>
);
