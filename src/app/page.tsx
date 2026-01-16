'use client';

import React, { useState } from 'react';
import { ToolRecommendation, GroundingSource } from '../types';
import SearchInput from '../components/SearchInput';
import ResultCard from '../components/ResultCard';
import { LoaderIcon, SparklesIcon, ExternalLinkIcon } from '../components/Icons';

export default function Page() {
  const [query, setQuery] = useState<string>('');
  const [results, setResults] = useState<ToolRecommendation[] | null>(null);
  const [sources, setSources] = useState<GroundingSource[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (searchQuery: string) => {
    setQuery(searchQuery);
    setLoading(true);
    setError(null);
    setResults(null);
    setSources(null);

    try {
      // Call the Next.js API route instead of the Gemini Service directly
      const response = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: searchQuery }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch results");
      }

      const data = await response.json();
      setResults(data.result.recommendations);
      setSources(data.result.sources);

    } catch (err: any) {
      setError(err.message || "Something went wrong while searching.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-white selection:bg-indigo-500/30">
      
      {/* Background decoration */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-900/20 rounded-full blur-[128px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-900/20 rounded-full blur-[128px]"></div>
      </div>

      <main className="relative z-10 container mx-auto px-4 py-16 flex flex-col min-h-screen">
        
        {/* Header Section */}
        <div className={`transition-all duration-700 ease-in-out flex flex-col items-center text-center ${results ? 'mt-0 mb-12' : 'mt-[20vh] mb-12'}`}>
          <div className="inline-flex items-center space-x-2 bg-slate-800/50 border border-slate-700/50 rounded-full px-4 py-1.5 mb-8 backdrop-blur-sm">
            <SparklesIcon className="w-4 h-4 text-indigo-400" />
            <span className="text-sm font-medium text-slate-300">Powered by Gemini 2.0</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 via-white to-purple-300">
            Find the Perfect AI Tool
          </h1>
          
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Describe your task or problem, and let our AI directory assistant scour the web to find the best tools for you.
          </p>

          <SearchInput onSearch={handleSearch} isLoading={loading} />
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-12 animate-in fade-in duration-500">
            <div className="relative">
              <div className="absolute inset-0 bg-indigo-500 blur-xl opacity-20 animate-pulse"></div>
              <LoaderIcon className="w-12 h-12 text-indigo-500 animate-spin relative z-10" />
            </div>
            <p className="mt-6 text-slate-400 text-lg font-medium animate-pulse">
              Searching the web for the best tools...
            </p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="max-w-3xl mx-auto w-full bg-red-900/20 border border-red-900/50 rounded-xl p-6 text-center animate-in fade-in slide-in-from-bottom-4">
            <p className="text-red-400 font-medium">Error: {error}</p>
            <button 
              onClick={() => handleSearch(query)}
              className="mt-4 text-sm text-red-300 hover:text-white underline underline-offset-4"
            >
              Try again
            </button>
          </div>
        )}

        {/* Results Grid */}
        {results && !loading && (
          <div className="w-full max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700">
             <div className="flex items-center justify-between mb-8">
               <h2 className="text-2xl font-bold text-white">Recommended Tools</h2>
               <span className="text-slate-400 text-sm">{results?.length} results found</span>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {results.map((tool, index) => (
                 <ResultCard key={index} tool={tool} index={index} />
               ))}
             </div>

             {results.length === 0 && (
               <div className="text-center py-12 bg-surface rounded-xl border border-slate-700 border-dashed">
                 <p className="text-slate-400">No specific tools found. Try describing your problem differently.</p>
               </div>
             )}

             {sources && sources.length > 0 && (
                <div className="mt-12 pt-8 border-t border-slate-700/50 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
                    <h3 className="text-lg font-medium text-slate-300 mb-4 flex items-center">
                        <SparklesIcon className="w-4 h-4 mr-2 text-slate-400" />
                        Sources
                    </h3>
                    <div className="flex flex-wrap gap-3">
                        {sources.map((source, idx) => (
                            <a 
                              key={idx}
                              href={source.uri}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center space-x-2 px-3 py-2 bg-slate-800/50 hover:bg-slate-700 rounded-lg text-sm text-slate-400 hover:text-white transition-colors border border-slate-700"
                            >
                                <span className="truncate max-w-[200px]">{source.title}</span>
                                <ExternalLinkIcon className="w-3 h-3" />
                            </a>
                        ))}
                    </div>
                </div>
             )}
          </div>
        )}

      </main>
      
      {/* Footer */}
      <footer className="relative z-10 text-center py-8 text-slate-600 text-sm">
        <p>&copy; {new Date().getFullYear()} AI Directory Assistant. Built with Next.js & Gemini.</p>
      </footer>
    </div>
  );
}