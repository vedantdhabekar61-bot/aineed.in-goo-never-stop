import React, { useState, KeyboardEvent } from 'react';
import { SearchIcon } from './Icons';

interface SearchInputProps {
  onSearch: (query: string) => void;
  isLoading: boolean;
}

const SearchInput: React.FC<SearchInputProps> = ({ onSearch, isLoading }) => {
  const [value, setValue] = useState('');

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && value.trim() && !isLoading) {
      onSearch(value.trim());
    }
  };

  const handleSearch = () => {
    if (value.trim() && !isLoading) {
      onSearch(value.trim());
    }
  };

  return (
    <div className="w-full max-w-[800px] mx-auto relative z-20">
      <div className="relative flex items-center bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-slate-100 hover:border-slate-200 transition-all p-2">
        
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
          onClick={handleSearch}
          disabled={isLoading || !value.trim()}
          className={`
            flex items-center space-x-2 px-6 py-3.5 rounded-xl font-semibold transition-all duration-200 shrink-0
            ${value.trim() && !isLoading 
              ? 'bg-[#5D5CDE] hover:bg-[#4b4ac2] text-white shadow-lg shadow-indigo-500/30' 
              : 'bg-slate-100 text-slate-400 cursor-not-allowed'}
          `}
        >
          <SearchIcon className="w-5 h-5" />
          <span>Find AI</span>
        </button>
      </div>
    </div>
  );
};

export default SearchInput;