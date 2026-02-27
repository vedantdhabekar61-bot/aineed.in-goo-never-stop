
'use client';

import React, { useState, KeyboardEvent, useEffect, useRef } from 'react';
import { SearchIcon } from '../common/Icons';

interface SearchInputProps {
  onSearch: (query: string) => void;
  onShowAuth: () => void;
  isLoading: boolean;
  user: any | null;
  isSticky?: boolean;
  onFocusChange?: (isFocused: boolean) => void;
}

const SearchInput: React.FC<SearchInputProps> = ({ 
  onSearch, 
  onShowAuth, 
  isLoading, 
  user, 
  isSticky = false,
  onFocusChange 
}) => {
  const [value, setValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (value.trim() && !isLoading) {
        onSearch(value.trim());
        inputRef.current?.blur();
      }
    }
  };

  const handleAction = () => {
    if (value.trim() && !isLoading) {
      onSearch(value.trim());
      inputRef.current?.blur();
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
    onFocusChange?.(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
    onFocusChange?.(false);
  };

  return (
    <div className={`
      w-full transition-all duration-700 ease-out z-[60]
      ${isSticky ? 'max-w-xl' : 'max-w-[850px]'} 
      mx-auto relative group
    `}>
      <div className={`
        relative flex items-center bg-white/70 backdrop-blur-2xl rounded-2xl 
        border transition-all duration-500 overflow-hidden
        ${isSticky ? 'p-1.5 shadow-premium' : 'p-2 shadow-soft'}
        ${isFocused 
          ? 'border-primary ring-4 ring-primary/10 shadow-glow scale-[1.02]' 
          : 'border-slate-200/60 hover:border-primary/40'
        }
      `}>
        <div className={`
          pl-5 pointer-events-none transition-all duration-300
          ${isFocused ? 'opacity-100 scale-110' : 'opacity-40'}
        `}>
          <SearchIcon className={`w-6 h-6 ${isFocused ? 'text-primary' : 'text-slate-400'}`} />
        </div>
        
        <input
          ref={inputRef}
          type="text"
          className={`
            w-full bg-transparent text-slate-900 p-4 pl-3 focus:outline-none 
            placeholder-slate-400 font-medium tracking-wide transition-all
            ${isSticky ? 'text-sm' : 'text-lg'}
          `}
          placeholder={isSticky ? "Search AI..." : "e.g., Automate LinkedIn networking for my SaaS..."}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={isLoading}
        />
        
        <button
          onClick={handleAction}
          disabled={isLoading || !value.trim()}
          className={`
            flex items-center space-x-2 rounded-xl font-bold transition-all duration-300 shrink-0
            ${isSticky ? 'px-5 py-2.5 text-xs' : 'px-8 py-4'}
            ${value.trim() && !isLoading 
                ? 'bg-slate-900 hover:bg-slate-800 text-white shadow-lg active:scale-95' 
                : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
            }
          `}
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          ) : (
            <span>{isSticky ? 'Find' : 'Find AI'}</span>
          )}
        </button>
      </div>
      
      {!isSticky && !user && (
        <p className={`
          text-center mt-6 text-[10px] font-black uppercase tracking-[0.25em] transition-all duration-500
          ${isFocused ? 'text-primary' : 'text-slate-400/60'}
        `}>
          ✨ LIMITED: 2 FREE INTELLIGENT SEARCHES FOR GUESTS
        </p>
      )}
    </div>
  );
};

export default SearchInput;
