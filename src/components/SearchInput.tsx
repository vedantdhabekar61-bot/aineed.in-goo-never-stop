import React, { useState, KeyboardEvent } from 'react';
import { SearchIcon, ArrowRightIcon } from './Icons';

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
    <div className="w-full max-w-3xl mx-auto relative group">
      <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
      <div className="relative flex items-center bg-surface rounded-lg shadow-xl border border-slate-700">
        <div className="pl-4 text-slate-400">
          <SearchIcon className="w-6 h-6" />
        </div>
        <input
          type="text"
          className="w-full bg-transparent text-white p-4 pl-3 focus:outline-none placeholder-slate-500 text-lg"
          placeholder="Describe your problem (e.g., 'I need to generate royalty-free music')"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
        />
        <button
          onClick={handleSearch}
          disabled={isLoading || !value.trim()}
          className={`mr-2 p-2 rounded-md transition-colors ${
            value.trim() && !isLoading
              ? 'bg-indigo-600 text-white hover:bg-indigo-500' 
              : 'bg-slate-700 text-slate-500 cursor-not-allowed'
          }`}
          aria-label="Search"
        >
          <ArrowRightIcon className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

export default SearchInput;