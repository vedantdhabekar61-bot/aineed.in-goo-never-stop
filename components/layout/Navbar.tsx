
'use client';

import React from 'react';
import { SearchInput } from '../search/SearchInput';
import { SparklesIcon } from '../common/Icons';

interface NavbarProps {
  user: any;
  isSticky: boolean;
  onSearch: (q: string) => void;
  isLoading: boolean;
  onAuthClick: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ user, isSticky, onSearch, isLoading, onAuthClick }) => {
  return (
    <div className="fixed top-6 inset-x-0 z-50 flex justify-center px-4">
      <nav className={`
        w-full max-w-5xl bg-white/80 backdrop-blur-2xl border border-slate-200/50 rounded-2xl shadow-premium px-6 h-16 flex items-center justify-between transition-all duration-500
        ${isSticky ? 'scale-[0.98]' : ''}
      `}>
        <div className="flex items-center gap-10">
          <div className={`flex items-center gap-3 cursor-pointer group transition-all duration-500 ${isSticky ? 'opacity-0 -translate-x-10 pointer-events-none' : ''}`}>
            <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center text-white shadow-glow group-hover:rotate-12 transition-transform">
              <SparklesIcon className="w-5 h-5" />
            </div>
            <span className="text-xl font-black tracking-tighter text-slate-900">aineed.in</span>
          </div>

          {isSticky && (
            <div className="absolute inset-0 flex items-center justify-center px-4">
              <SearchInput onSearch={onSearch} isLoading={isLoading} isSticky={true} />
            </div>
          )}
        </div>

        <div className={`flex items-center gap-4 transition-opacity duration-500 ${isSticky ? 'opacity-0' : ''}`}>
          {user ? (
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center font-bold text-xs">
                {user.email?.[0].toUpperCase()}
              </div>
            </div>
          ) : (
            <button onClick={onAuthClick} className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-black shadow-glow">Sign Up</button>
          )}
        </div>
      </nav>
    </div>
  );
};
