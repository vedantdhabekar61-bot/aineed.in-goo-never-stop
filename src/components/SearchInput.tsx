'use client';

import React, { useState, KeyboardEvent } from 'react';
import { SearchIcon, UserIcon } from './Icons';

interface SearchInputProps {
  onSearch: (query: string) => void;
  onShowAuth: () => void;
  isLoading: boolean;
  user: any | null; // Using any for simplicity with Supabase user type, or import User type
}

const SearchInput: React.FC<SearchInputProps> = ({ onSearch, onShowAuth, isLoading, user }) => {
  const [value, setValue] = useState('');

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (!user) {
        onShowAuth();
        return;
      }
      if (value.trim() && !isLoading) {
        onSearch(value.trim());
      }
    }
  };

  const handleAction = () => {
    if (!user) {
      onShowAuth();
      return;
    }
    if (value.trim() && !isLoading) {
      onSearch(value.trim());
    }
  };

  return (
    <div className="w-full max-w-[800px] mx-auto relative z-20">
      <div className={`relative flex items-center bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border transition-all p-2 ${!user ? 'border-amber-200 shadow-amber-500/10' : 'border-slate-100 hover:border-slate-200'}`}>
        
        <input
          type="text"
          className="w-full bg-transparent text-slate-800 p-4 pl-6 focus:outline-none placeholder-slate-400 text-lg font-medium"
          placeholder="e.g., I spend 4 hours a week editing podcast clips..."
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
        />
        
        <button
          onClick={handleAction}
          disabled={isLoading || (!!user && !value.trim())}
          className={`
            flex items-center space-x-2 px-6 py-3.5 rounded-xl font-semibold transition-all duration-200 shrink-0
            ${!user 
              ? 'bg-slate-900 hover:bg-slate-800 text-white shadow-lg' 
              : (value.trim() && !isLoading 
                  ? 'bg-[#5D5CDE] hover:bg-[#4b4ac2] text-white shadow-lg shadow-indigo-500/30' 
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed')
            }
          `}
        >
          {!user ? (
            <>
              <UserIcon className="w-4 h-4" />
              <span>Sign in to Search</span>
            </>
          ) : (
            <>
              <SearchIcon className="w-5 h-5" />
              <span>Find AI</span>
            </>
          )}
        </button>
      </div>
      {!user && (
        <p className="text-center mt-3 text-sm text-slate-500 font-medium">
          🔒 You must be logged in to use the AI assistant.
        </p>
      )}
    </div>
  );
};

export default SearchInput;