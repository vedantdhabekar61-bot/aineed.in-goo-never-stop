
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../src/lib/supabaseClient';
import { ToolRecommendation, GroundingSource, WorkflowPlan } from '../src/types';
import SearchInput from '../src/components/SearchInput';
import ResultCard from '../src/components/ResultCard';
import AuthModal from '../src/components/AuthModal';
import WorkflowCanvas from '../src/components/WorkflowCanvas';
import { SkeletonGrid } from '../src/components/SkeletonLoader';
import { Feed } from '../src/components/Feed';
import { SparklesIcon, NewspaperIcon, XIcon, ExternalLinkIcon, SearchIcon, ArrowRightIcon, GoogleIcon } from '../src/components/Icons';

const CATEGORIES = [
  "All Tools", 
  "YouTube Automation", 
  "LinkedIn Automation", 
  "AI Coding", 
  "SaaS Growth", 
  "Copywriting", 
  "Design & Art", 
  "Productivity",
  "SEO Automation"
];

const PROMPTS = [
  "I want to create AI influencers for Instagram",
  "Help me automate my YouTube clip creation",
  "I need an AI that can write code from screenshots",
  "How can I grow my SaaS with AI SEO?",
  "I spend 5 hours a week manually tagging images..."
];

type AppView = 'search' | 'feed' | 'how-it-works';

export default function Page() {
  const [user, setUser] = useState<any | null>(null);
  const [activeView, setActiveView] = useState<AppView>('search');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);
  const [isStickySearch, setIsStickySearch] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  
  const [query, setQuery] = useState<string>('');
  const [results, setResults] = useState<ToolRecommendation[] | null>(null);
  const [sources, setSources] = useState<GroundingSource[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const [savedTools, setSavedTools] = useState<ToolRecommendation[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const [searchCount, setSearchCount] = useState<number>(0);

  const [workflowPlan, setWorkflowPlan] = useState<WorkflowPlan | null>(null);
  const [isWorkflowLoading, setIsWorkflowLoading] = useState(false);
  const [activeWorkflowTool, setActiveWorkflowTool] = useState<ToolRecommendation | null>(null);
  const workflowRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);

  const [promptIndex, setPromptIndex] = useState(0);
  const [currentText, setCurrentText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    (supabase.auth as any).getSession().then(({ data: { session } }: any) => {
      setUser(session?.user ?? null);
      setAuthChecking(false);
      if (session?.user) fetchSavedTools(session.user.id);
    });

    const { data: { subscription } } = (supabase.auth as any).onAuthStateChange((_event: any, session: any) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchSavedTools(session.user.id);
      else setSavedTools([]);
    });

    const handleScroll = () => {
      if (heroRef.current) {
        const heroBottom = heroRef.current.offsetTop + heroRef.current.offsetHeight - 200;
        setIsStickySearch(window.scrollY > heroBottom);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      subscription.unsubscribe();
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    const handleType = () => {
      const fullText = PROMPTS[promptIndex];
      setCurrentText(isDeleting 
        ? fullText.substring(0, currentText.length - 1)
        : fullText.substring(0, currentText.length + 1)
      );

      if (!isDeleting && currentText === fullText) {
        setTimeout(() => setIsDeleting(true), 2000);
      } else if (isDeleting && currentText === "") {
        setIsDeleting(false);
        setPromptIndex((prev) => (prev + 1) % PROMPTS.length);
      }
    };

    const timer = setTimeout(handleType, isDeleting ? 30 : 60);
    return () => clearTimeout(timer);
  }, [currentText, isDeleting, promptIndex]);

  const fetchSavedTools = async (userId: string) => {
    const { data } = await supabase.from('saved_tools').select('*').eq('user_id', userId);
    if (data) setSavedTools(data as any);
  };

  const handleSaveTool = async (tool: ToolRecommendation) => {
    if (!user) { setIsAuthModalOpen(true); return; }
    
    const isAlreadySaved = savedTools.some(t => t.name === tool.name);
    if (isAlreadySaved) {
      setSavedTools(prev => prev.filter(t => t.name !== tool.name));
      await supabase.from('saved_tools').delete().match({ user_id: user.id, name: tool.name });
    } else {
      setSavedTools(prev => [...prev, tool]);
      await supabase.from('saved_tools').insert([{ user_id: user.id, ...tool }]);
      setIsSidebarOpen(true);
    }
  };

  const handleAnalyzeWorkflow = async (tool: ToolRecommendation) => {
    if (!user) { setIsAuthModalOpen(true); return; }
    setActiveWorkflowTool(tool);
    setIsWorkflowLoading(true);
    setWorkflowPlan(null);
    
    setTimeout(() => {
      workflowRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);

    try {
      const response = await fetch("/api/workflow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ problem: query, tool }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Workflow analysis failed");
      setWorkflowPlan(data.plan);
    } catch (err: any) {
      setError("Failed to build workflow plan.");
    } finally {
      setIsWorkflowLoading(false);
    }
  };

  const handleSearch = async (searchQuery: string) => {
    if (!user) {
      const nextCount = searchCount + 1;
      setSearchCount(nextCount);
      if (nextCount > 2) {
        setIsAuthModalOpen(true);
        return;
      }
    }

    setQuery(searchQuery);
    setLoading(true);
    setError(null);
    setResults(null);
    setWorkflowPlan(null);
    setActiveWorkflowTool(null);
    setActiveView('search');
    
    try {
      const response = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: searchQuery }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Search failed");
      setResults(data.result.recommendations);
      setSources(data.result.sources);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const switchView = (view: AppView) => {
    if (!user && (view === 'feed')) {
      setIsAuthModalOpen(true);
      return;
    }
    setActiveView(view);
  };

  const handleGoogleAuthAction = async () => {
    try {
      const { error } = await (supabase.auth as any).signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: 'https://aineed.in/auth/callback',
        },
      });
      if (error) throw error;
    } catch (err: any) {
      console.error(err.message);
    }
  };

  return (
    <div className={`min-h-screen bg-white text-slate-800 font-sans transition-all duration-700 relative`}>
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />

      {/* Cinematic Overlay */}
      <div className={`
        fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] z-[55] pointer-events-none transition-opacity duration-700
        ${isFocused ? 'opacity-100' : 'opacity-0'}
      `} />

      {/* Floating Island Nav */}
      <div className="fixed top-6 inset-x-0 z-[50] flex justify-center px-4">
        <nav className={`
          w-full max-w-5xl bg-white/70 backdrop-blur-2xl border border-slate-200/50 rounded-2xl shadow-premium px-6 h-16 flex items-center justify-between transition-all duration-500
          ${isStickySearch ? 'scale-[0.98]' : ''}
        `}>
          <div className="flex items-center gap-10">
            <div className={`flex items-center gap-3 cursor-pointer group transition-all duration-500 ${isStickySearch ? 'scale-90 opacity-0 -translate-x-10 pointer-events-none' : ''}`} onClick={() => switchView('search')}>
              <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center text-white shadow-glow group-hover:rotate-12 transition-all duration-500">
                <SparklesIcon className="w-5 h-5" />
              </div>
              <span className="text-xl font-black tracking-tighter text-slate-900 hidden sm:inline-block">aineed.in</span>
            </div>

            {/* Sticky Search bar morph position */}
            <div className={`absolute inset-0 flex items-center justify-center pointer-events-none transition-all duration-500 ${isStickySearch ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95'}`}>
               <div className="w-full max-w-lg pointer-events-auto">
                 {isStickySearch && (
                    <SearchInput 
                      onSearch={handleSearch} 
                      onShowAuth={() => setIsAuthModalOpen(true)}
                      isLoading={loading} 
                      user={user}
                      isSticky={true}
                      onFocusChange={setIsFocused}
                    />
                 )}
               </div>
            </div>

            <div className={`flex items-center gap-2 transition-all duration-500 ${isStickySearch ? 'opacity-0 pointer-events-none' : ''}`}>
              <button 
                onClick={() => switchView('search')}
                className={`relative px-4 py-2 rounded-xl text-[13px] font-bold transition-all ${activeView === 'search' ? 'text-slate-900 bg-slate-50' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50/50'}`}
              >
                Find AI
                {activeView === 'search' && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-primary rounded-full shadow-glow" />
                )}
              </button>
              <button 
                onClick={() => switchView('how-it-works')}
                className={`relative px-4 py-2 rounded-xl text-[13px] font-bold transition-all ${activeView === 'how-it-works' ? 'text-slate-900 bg-slate-50' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50/50'}`}
              >
                The Process
                {activeView === 'how-it-works' && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-primary rounded-full shadow-glow" />
                )}
              </button>
            </div>
          </div>

          <div className={`flex items-center space-x-3 transition-all duration-500 ${isStickySearch ? 'opacity-0 pointer-events-none' : ''}`}>
            
            {!user && !authChecking && (
              <button 
                onClick={handleGoogleAuthAction}
                className="hidden md:flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:border-primary/40 rounded-xl text-[12px] font-bold text-slate-600 hover:text-primary transition-all group"
              >
                <GoogleIcon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span>Start with Google</span>
              </button>
            )}

            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="relative p-2.5 text-slate-400 hover:text-primary transition-all duration-300 hover:bg-primary/5 rounded-xl"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v1"></path></svg>
              {savedTools.length > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full ring-2 ring-white animate-pulse"></span>}
            </button>
            
            {user ? (
              <div className="flex items-center gap-3">
                <button onClick={() => (supabase.auth as any).signOut()} className="text-[12px] font-bold text-slate-400 hover:text-slate-600 transition-colors px-3 py-2">Sign Out</button>
                <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 font-bold text-xs uppercase shadow-sm">
                  {user.email?.charAt(0)}
                </div>
              </div>
            ) : !authChecking ? (
              <button 
                onClick={() => setIsAuthModalOpen(true)} 
                className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-[12px] font-black hover:bg-slate-800 transition-all shadow-glow active:scale-95"
              >
                Sign Up
              </button>
            ) : null}
          </div>
        </nav>
      </div>

      <main className="container mx-auto px-6 pt-32 pb-32 flex flex-col items-center">
        {activeView === 'search' && (
          <div className="w-full flex flex-col items-center animate-in fade-in duration-1000">
            <div ref={heroRef} className="relative w-full max-w-4xl flex flex-col items-center pt-10">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] hero-glow pointer-events-none -z-10" />

              <div className={`w-full text-center transition-all duration-1000 ${results ? 'mb-16 scale-[0.98]' : 'mb-32'}`}>
                
                <h1 className="text-6xl md:text-8xl font-black mb-10 leading-[1.05] tracking-tight text-slate-900 drop-shadow-sm">
                  Fix your bottlenecks. <br/>
                  <span className="text-primary bg-clip-text text-transparent bg-gradient-to-r from-primary to-indigo-500">Find the exact AI.</span>
                </h1>

                <div className="h-14 flex items-center justify-center mb-10 overflow-hidden">
                  <p className="text-xl md:text-2xl text-slate-400 font-medium tracking-wide">
                    Try: <span className="text-primary border-r-2 border-primary/30 pr-2 animate-pulse font-bold">{currentText}</span>
                  </p>
                </div>

                <div className={`transition-all duration-500 ${isStickySearch ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'}`}>
                  <SearchInput 
                    onSearch={handleSearch} 
                    onShowAuth={() => setIsAuthModalOpen(true)}
                    isLoading={loading} 
                    user={user}
                    onFocusChange={setIsFocused}
                  />
                </div>

                <div className={`mt-20 w-full transition-opacity duration-500 ${isStickySearch ? 'opacity-0' : 'opacity-100'}`}>
                  <div className="mb-8 flex items-center justify-center gap-4">
                    <div className="h-px w-16 bg-slate-100" />
                    <span className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400">Curated Categories</span>
                    <div className="h-px w-16 bg-slate-100" />
                  </div>
                  <div className="flex flex-wrap justify-center gap-4 max-w-4xl mx-auto">
                    {CATEGORIES.map((cat, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSearch(cat === "All Tools" ? "Latest trending AI tools" : `Best AI tools for ${cat}`)}
                        className="px-6 py-3.5 rounded-2xl text-[13px] font-bold border border-slate-200 bg-white hover:border-primary/40 hover:text-primary hover:shadow-soft transition-all duration-300 active:scale-95"
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="w-full max-w-7xl">
              {loading ? (
                <div className="w-full flex justify-center mt-20">
                  <SkeletonGrid />
                </div>
              ) : error ? (
                <div className="bg-red-50 p-16 rounded-[48px] border border-red-100 text-red-600 text-center flex flex-col items-center animate-in zoom-in-95">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
                    <XIcon className="w-8 h-8" />
                  </div>
                  <p className="font-bold text-xl mb-8">{error}</p>
                  <button onClick={() => handleSearch(query)} className="px-10 py-4 bg-white border border-red-200 rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-red-50 transition-all shadow-sm">Try Again</button>
                </div>
              ) : results ? (
                <div className="animate-in fade-in slide-in-from-bottom-12 duration-1000 mt-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                    {results.map((tool, idx) => (
                      <ResultCard 
                        key={idx} 
                        tool={tool} 
                        index={idx} 
                        onSave={handleSaveTool}
                        onAnalyze={handleAnalyzeWorkflow}
                        isSaved={savedTools.some(t => t.name === tool.name)}
                      />
                    ))}
                  </div>
                  <div ref={workflowRef} className="mt-20">
                    <WorkflowCanvas 
                      plan={workflowPlan} 
                      isLoading={isWorkflowLoading} 
                      activeTool={activeWorkflowTool}
                      onClear={() => {
                        setWorkflowPlan(null);
                        setActiveWorkflowTool(null);
                      }}
                    />
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
