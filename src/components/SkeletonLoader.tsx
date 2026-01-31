
import React from 'react';

const SkeletonCard = () => (
  <div className="bg-white border border-slate-100 rounded-2xl p-8 animate-pulse shadow-sm">
    <div className="flex items-center space-x-4 mb-6">
      <div className="w-12 h-12 rounded-xl bg-slate-100" />
      <div className="h-6 w-32 bg-slate-100 rounded" />
    </div>
    <div className="space-y-3 mb-8">
      <div className="h-4 w-full bg-slate-100 rounded" />
      <div className="h-4 w-5/6 bg-slate-100 rounded" />
    </div>
    <div className="h-10 w-full bg-slate-100 rounded-xl" />
  </div>
);

export const SkeletonGrid = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
    <SkeletonCard />
    <SkeletonCard />
    <SkeletonCard />
  </div>
);
