
'use client';

import React, { useState, KeyboardEvent } from 'react';
import { SearchIcon } from './Icons';

interface SearchInputProps {
  onSearch: (query: string) => void;
  onShowAuth: () => void;
  isLoading: boolean;
  user: any | null;
}

const SearchInput: React.FC<SearchInputProps> = ({ onSearch, onShowAuth, isLoading, user }) => {
  const [value, setValue] = useState('');

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (value.trim() && !isLoading) {
        onSearch(value.trim());
      }
    }
  };

  const handleAction = () => {
    if (value.trim() && !isLoading) {
      onSearch(value.trim());
    }
  };

  return (
    <div className="w-full max-w-[850px] mx-auto relative z-20 group">
      <div className={`
        relative flex items-center bg-white/60 backdrop-blur-2xl rounded-2xl 
        shadow-[0_20px_50px_rgba(0,0,0,0.06),inset_0_1px_0_0_rgba(255,255,255,0.8)] 
        border border-slate-200/60 transition-all duration-500 p-2 
        hover:border-primary/40 focus-within:border-primary focus-within:shadow-glow focus-within:scale-[1.01]
      `}>
        <div className="pl-6 pointer-events-none opacity-40 group-focus-within:opacity-100 transition-opacity">
          <SearchIcon className="w-6 h-6 text-slate-400 group-focus-within:text-primary" />
        </div>
        <input
          type="text"
          className="w-full bg-transparent text-slate-900 p-4 pl-4 focus:outline-none placeholder-slate-400 text-lg font-medium tracking-wide"
          placeholder="e.g., Automate LinkedIn networking for my SaaS..."
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
        />
        
        <button
          onClick={handleAction}
          disabled={isLoading || !value.trim()}
          className={`
            flex items-center space-x-2 px-8 py-4 rounded-xl font-bold transition-all duration-300 shrink-0
            ${value.trim() && !isLoading 
                ? 'bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/10 hover:shadow-primary/30' 
                : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
            }
          `}
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          ) : (
            <span>Find AI</span>
          )}
        </button>
      </div>
      {!user && (
        <p className="text-center mt-5 text-[13px] text-slate-400 font-medium tracking-wider uppercase">
          ✨ <span className="text-slate-400 font-bold">Limited:</span> 2 free intelligent searches for guests
        </p>
      )}
    </div>
  );
};

export default SearchInput;
