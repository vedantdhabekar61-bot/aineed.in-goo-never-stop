
'use client';

import React, { useState, useRef } from 'react';
import { SearchIcon, LoaderIcon } from '../common/Icons';

interface SearchInputProps {
  onSearch: (query: string) => void;
  isLoading: boolean;
  isSticky?: boolean;
  onFocusChange?: (isFocused: boolean) => void;
}

export const SearchInput: React.FC<SearchInputProps> = ({ onSearch, isLoading, isSticky = false, onFocusChange }) => {
  const [value, setValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (value.trim() && !isLoading) {
      onSearch(value.trim());
      inputRef.current?.blur();
    }
  };

  return (
    <form 
      onSubmit={handleSubmit}
      className={`w-full transition-all duration-700 ease-out z-[60] ${isSticky ? 'max-w-xl' : 'max-w-3xl'} mx-auto relative group`}
    >
      <div className={`
        relative flex items-center bg-white/70 backdrop-blur-2xl rounded-2xl border transition-all duration-500 overflow-hidden
        ${isSticky ? 'p-1 shadow-premium' : 'p-2 shadow-soft'}
        ${isFocused ? 'border-primary ring-4 ring-primary/10 shadow-glow scale-[1.01]' : 'border-slate-200/60'}
      `}>
        <div className={`pl-5 pointer-events-none transition-all duration-300 ${isFocused ? 'opacity-100 scale-110' : 'opacity-40'}`}>
          <SearchIcon className={`w-6 h-6 ${isFocused ? 'text-primary' : 'text-slate-400'}`} />
        </div>
        <input
          ref={inputRef}
          type="text"
          className={`w-full bg-transparent text-slate-900 p-4 pl-3 focus:outline-none placeholder-slate-400 font-medium transition-all ${isSticky ? 'text-sm' : 'text-lg'}`}
          placeholder={isSticky ? "Search AI tools..." : "e.g., Automate my YouTube content workflows..."}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => { setIsFocused(true); onFocusChange?.(true); }}
          onBlur={() => { setIsFocused(false); onFocusChange?.(false); }}
        />
        <button
          type="submit"
          disabled={isLoading || !value.trim()}
          className={`
            px-8 py-4 rounded-xl font-bold transition-all duration-300 shrink-0
            ${isSticky ? 'px-5 py-2.5 text-xs' : 'px-8 py-4'}
            ${value.trim() && !isLoading ? 'bg-slate-900 text-white hover:bg-slate-800' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}
          `}
        >
          {isLoading ? <LoaderIcon className="animate-spin" /> : <span>{isSticky ? 'Find' : 'Find Solution'}</span>}
        </button>
      </div>
    </form>
  );
};
