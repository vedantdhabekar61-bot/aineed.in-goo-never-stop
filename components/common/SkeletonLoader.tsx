
import React from 'react';

const SkeletonCard = () => (
  <div className="bg-white border border-slate-100 rounded-3xl p-8 animate-pulse">
    <div className="flex items-center space-x-4 mb-8">
      <div className="w-14 h-14 rounded-2xl bg-slate-100" />
      <div className="h-6 w-32 bg-slate-100 rounded-lg" />
    </div>
    <div className="space-y-3 mb-10">
      <div className="h-4 w-full bg-slate-100 rounded-md" />
      <div className="h-4 w-5/6 bg-slate-100 rounded-md" />
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
