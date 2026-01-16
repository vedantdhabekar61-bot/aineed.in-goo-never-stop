'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { User } from '@supabase/supabase-js';
import { ToolRecommendation, GroundingSource } from '../types';
import SearchInput from '../components/SearchInput';
import ResultCard from '../components/ResultCard';
import AuthModal from '../components/AuthModal';
import { LoaderIcon, SparklesIcon, ExternalLinkIcon } from '../components/Icons';

const CATEGORIES = [
  "All Tools",
  "Video Automation",
  "AI Coding",
  "SaaS Growth",
  "Copywriting",
  "Design & Art",
  "Productivity",
  "Marketing"
];

export default function Page() {
  // Auth State
  const [user, setUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);

  // App State
  const [query, setQuery] = useState<string>('');
  const [results, setResults] = useState<ToolRecommendation[] | null>(null);
  const [sources, setSources] = useState<GroundingSource[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 1. Initial Session Check (Restores session on refresh)
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setAuthChecking(false);
    });

    // 2. Listen for Real-time Auth Changes (Login/Logout)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setAuthChecking(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSearch = async (searchQuery: string) => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }

    setQuery(searchQuery);
    setLoading(true);
    setError(null);
    setResults(null);
    setSources(null);

    try {
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

  const handleCategoryClick = (category: string) => {
    if (category === "All Tools") return;
    if (!user) {
        setIsAuthModalOpen(true);
        return;
    }
    handleSearch(`Find me the best AI tools for ${category}`);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setResults(null);
    setSources(null);
    setQuery('');
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans">
      
      {/* Auth Modal */}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />

      {/* Navigation */}
      <nav className="w-full border-b border-slate-100/50 bg-white/80 backdrop-blur-md sticky top-0 z-40">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.location.reload()}>
            <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center text-[#5D5CDE]">
              <SparklesIcon className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">aineed.in</span>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <a href="#" className="text-slate-600 hover:text-[#5D5CDE] font-medium text-sm transition-colors">Discover</a>
            <a href="#" className="text-slate-600 hover:text-[#5D5CDE] font-medium text-sm transition-colors">Categories</a>
            
            {authChecking ? (
              // Loading placeholder for auth state
              <div className="w-20 h-9 bg-slate-100 rounded-full animate-pulse"></div>
            ) : user ? (
              <div className="flex items-center space-x-4">
                 <span className="text-sm font-medium text-slate-500 truncate max-w-[150px]">
                   {user.email}
                 </span>
                 <button 
                  onClick={handleSignOut}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-5 py-2.5 rounded-full text-sm font-semibold transition-colors"
                 >
                   Sign Out
                 </button>
              </div>
            ) : (
              <button 
                onClick={() => setIsAuthModalOpen(true)}
                className="bg-slate-900 text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/20"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-16 md:py-24 flex flex-col min-h-screen relative">
        
        {/* Hero Section */}
        <div className={`transition-all duration-700 ease-out flex flex-col items-center text-center max-w-4xl mx-auto ${results ? 'mb-12' : 'mb-20'}`}>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-[1.1]">
            <span className="text-slate-900">Find the</span>
            <br className="md:hidden" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#5D5CDE] via-[#3B82F6] to-[#06B6D4] ml-3 md:ml-4">
               AI you need.
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto mb-12 font-medium">
            Describe your workflow bottleneck, and our AI engine will match you with the perfect tools to solve it.
          </p>

          <div className="w-full">
            <SearchInput 
                onSearch={handleSearch} 
                onShowAuth={() => setIsAuthModalOpen(true)}
                isLoading={loading} 
                user={user}
            />
          </div>

          {/* Categories Pills */}
          <div className="mt-10 flex flex-wrap justify-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
            {CATEGORIES.map((cat, idx) => (
              <button
                key={idx}
                onClick={() => handleCategoryClick(cat)}
                className={`
                  px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 border
                  ${idx === 0 
                    ? 'bg-[#5D5CDE] text-white border-[#5D5CDE] shadow-md shadow-indigo-500/20' 
                    : 'bg-white text-slate-600 border-slate-200 hover:border-[#5D5CDE] hover:text-[#5D5CDE] hover:shadow-sm'}
                `}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 animate-in fade-in duration-500">
            <div className="relative">
              <div className="absolute inset-0 bg-[#5D5CDE] blur-xl opacity-20 animate-pulse"></div>
              <LoaderIcon className="w-12 h-12 text-[#5D5CDE] animate-spin relative z-10" />
            </div>
            <p className="mt-6 text-slate-500 text-lg font-medium animate-pulse">
              Analysing your workflow needs...
            </p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="max-w-3xl mx-auto w-full bg-red-50 border border-red-100 rounded-2xl p-6 text-center animate-in fade-in slide-in-from-bottom-4">
            <p className="text-red-600 font-medium">{error}</p>
            <button 
              onClick={() => handleSearch(query)}
              className="mt-4 text-sm text-red-600 hover:text-red-800 underline underline-offset-4"
            >
              Try again
            </button>
          </div>
        )}

        {/* Results Grid */}
        {results && !loading && (
          <div className="w-full max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700">
             <div className="flex items-end justify-between mb-8 border-b border-slate-100 pb-4">
               <div>
                  <h2 className="text-3xl font-bold text-slate-900">Recommended Tools</h2>
                  <p className="text-slate-500 mt-1">Based on your specific requirements</p>
               </div>
               <span className="text-sm font-medium px-3 py-1 bg-slate-100 rounded-full text-slate-600">{results.length} results</span>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
               {results.map((tool, index) => (
                 <ResultCard key={index} tool={tool} index={index} />
               ))}
             </div>

             {results.length === 0 && (
               <div className="text-center py-20 bg-slate-50 rounded-3xl border border-slate-200 border-dashed">
                 <p className="text-slate-500 font-medium text-lg">No specific tools found. Try describing your problem differently.</p>
               </div>
             )}

             {sources && sources.length > 0 && (
                <div className="mt-16 pt-8 border-t border-slate-100">
                    <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center">
                        Verified Sources
                    </h3>
                    <div className="flex flex-wrap gap-3">
                        {sources.map((source, idx) => (
                            <a 
                              key={idx}
                              href={source.uri}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center space-x-2 px-3 py-1.5 bg-slate-50 hover:bg-white border border-slate-200 hover:border-slate-300 rounded-lg text-xs text-slate-600 hover:text-slate-900 transition-all shadow-sm"
                            >
                                <span className="truncate max-w-[200px]">{source.title}</span>
                                <ExternalLinkIcon className="w-3 h-3 text-slate-400" />
                            </a>
                        ))}
                    </div>
                </div>
             )}
          </div>
        )}

      </main>
      
      {/* Footer */}
      <footer className="w-full py-8 border-t border-slate-100 mt-auto bg-white">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center text-sm text-slate-500">
          <p>&copy; {new Date().getFullYear()} aineed.in. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-[#5D5CDE]">Privacy</a>
            <a href="#" className="hover:text-[#5D5CDE]">Terms</a>
            <a href="#" className="hover:text-[#5D5CDE]">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}