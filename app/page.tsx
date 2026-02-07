
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { ToolRecommendation, GroundingSource, WorkflowPlan, AppView } from '../types/index';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { Sidebar } from '../components/layout/Sidebar';
import { SearchInput } from '../components/search/SearchInput';
import { ResultCard } from '../components/search/ResultCard';
import { WorkflowCanvas } from '../components/workflow/WorkflowCanvas';
import { SkeletonGrid } from '../components/common/SkeletonLoader';
import { Feed } from '../components/feed/Feed';
import { AuthModal } from '../components/auth/AuthModal';
import { SparklesIcon, NewspaperIcon } from '../components/common/Icons';

export default function Home() {
  const [view, setView] = useState<AppView>('search');
  const [user, setUser] = useState<any>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isSticky, setIsSticky] = useState(false);
  
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ToolRecommendation[] | null>(null);
  const [sources, setSources] = useState<GroundingSource[] | null>(null);
  const [activePlan, setActivePlan] = useState<WorkflowPlan | null>(null);
  const [planLoading, setPlanLoading] = useState(false);
  const [activeWorkflowTool, setActiveWorkflowTool] = useState<ToolRecommendation | null>(null);
  
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setUser(session?.user ?? null));
    const handleScroll = () => {
      if (heroRef.current) setIsSticky(window.scrollY > heroRef.current.offsetHeight + 100);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = async (searchQuery: string) => {
    setQuery(searchQuery);
    setLoading(true);
    setResults(null);
    setSources(null);
    setActivePlan(null);
    setActiveWorkflowTool(null);
    
    try {
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery })
      });
      const data = await res.json();
      if (data.result) {
        setResults(data.result.recommendations);
        setSources(data.result.sources);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async (tool: ToolRecommendation) => {
    setActiveWorkflowTool(tool);
    setPlanLoading(true);
    setActivePlan(null);
    try {
      const res = await fetch('/api/workflow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ problem: query, tool })
      });
      const data = await res.json();
      setActivePlan(data.plan);
    } catch (e) {
      console.error(e);
    } finally {
      setPlanLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      <Navbar 
        user={user} 
        isSticky={isSticky} 
        onSearch={handleSearch} 
        isLoading={loading}
        onAuthClick={() => setIsAuthOpen(true)}
      />
      
      <div className={`fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 pointer-events-none transition-opacity duration-700 ${isFocused ? 'opacity-100' : 'opacity-0'}`} />

      <main className="container mx-auto px-6 pt-32 pb-32">
        {view === 'search' ? (
          <div className="flex flex-col items-center">
            <div ref={heroRef} className={`w-full max-w-4xl text-center transition-all duration-1000 ${results ? 'mb-16 scale-95 opacity-50' : 'mb-32'}`}>
              <h1 className="text-6xl md:text-8xl font-black mb-10 leading-tight tracking-tight text-slate-900">
                Fix your bottlenecks. <br/>
                <span className="text-primary bg-clip-text text-transparent bg-gradient-to-r from-primary to-indigo-500">Find the exact AI.</span>
              </h1>
              <SearchInput onSearch={handleSearch} isLoading={loading} onFocusChange={setIsFocused} />
            </div>

            <div className="w-full max-w-7xl">
              {loading ? <SkeletonGrid /> : results && (
                <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
                    {results.map((tool, idx) => (
                      <ResultCard key={idx} tool={tool} index={idx} onAnalyze={() => handleAnalyze(tool)} />
                    ))}
                  </div>
                  <WorkflowCanvas 
                    plan={activePlan} 
                    isLoading={planLoading} 
                    activeTool={activeWorkflowTool} 
                    onClear={() => { setActivePlan(null); setActiveWorkflowTool(null); }} 
                  />
                </div>
              )}
            </div>
          </div>
        ) : (
          <Feed />
        )}
      </main>

      <Footer />
      
      <button 
        onClick={() => setView(view === 'search' ? 'feed' : 'search')} 
        className="fixed bottom-10 right-10 z-50 w-16 h-16 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-premium hover:scale-110 transition-transform"
      >
        {view === 'search' ? <NewspaperIcon /> : <SparklesIcon />}
      </button>
    </div>
  );
}
