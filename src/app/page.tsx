
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';
import { User } from '@supabase/supabase-js';
import { ToolRecommendation, GroundingSource, WorkflowPlan } from '../types';
import SearchInput from '../components/SearchInput';
import ResultCard from '../components/ResultCard';
import AuthModal from '../components/AuthModal';
import WorkflowCanvas from '../components/WorkflowCanvas';
import { SkeletonGrid } from '../components/SkeletonLoader';
import { Feed } from '../components/Feed';
import { SparklesIcon, ExternalLinkIcon, XIcon, NewspaperIcon, SearchIcon, ArrowRightIcon } from '../components/Icons';

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
  const [user, setUser] = useState<User | null>(null);
  const [activeView, setActiveView] = useState<AppView>('search');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);
  
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

  const [promptIndex, setPromptIndex] = useState(0);
  const [currentText, setCurrentText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setAuthChecking(false);
      if (session?.user) fetchSavedTools(session.user.id);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchSavedTools(session.user.id);
      else setSavedTools([]);
    });

    return () => subscription.unsubscribe();
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

  return (
    <div className="min-h-screen bg-surface text-slate-200 font-sans selection:bg-primary selection:text-white relative">
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />

      {/* Floating Island Nav */}
      <div className="fixed top-6 inset-x-0 z-[50] flex justify-center px-4">
        <nav className="w-full max-w-4xl bg-[#121214]/80 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3 cursor-pointer group" onClick={() => switchView('search')}>
              <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center text-white shadow-glow group-hover:rotate-12 transition-all duration-500">
                <SparklesIcon className="w-5 h-5" />
              </div>
              <span className="text-lg font-black tracking-tighter text-slate-100 hidden sm:inline-block">aineed.in</span>
            </div>

            <div className="flex items-center gap-1">
              <button 
                onClick={() => switchView('search')}
                className={`relative px-4 py-2 rounded-xl text-[13px] font-bold transition-all ${activeView === 'search' ? 'text-slate-100' : 'text-slate-500 hover:text-slate-300'}`}
              >
                Find AI
                {activeView === 'search' && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full shadow-[0_0_8px_#8B5CF6]" />
                )}
              </button>
              <button 
                onClick={() => switchView('how-it-works')}
                className={`relative px-4 py-2 rounded-xl text-[13px] font-bold transition-all ${activeView === 'how-it-works' ? 'text-slate-100' : 'text-slate-500 hover:text-slate-300'}`}
              >
                How it works
                {activeView === 'how-it-works' && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full shadow-[0_0_8px_#8B5CF6]" />
                )}
              </button>
              {user && (
                <button 
                  onClick={() => switchView('feed')}
                  className={`relative px-4 py-2 rounded-xl text-[13px] font-bold transition-all flex items-center gap-2 ${activeView === 'feed' ? 'text-primary' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  <NewspaperIcon className="w-4 h-4" />
                  Pulse Feed
                  {activeView === 'feed' && (
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full shadow-[0_0_8px_#8B5CF6]" />
                  )}
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="relative p-2 text-slate-400 hover:text-primary transition-all duration-300"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>
              {savedTools.length > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full ring-2 ring-[#121214] animate-pulse"></span>}
            </button>
            {user ? (
              <button onClick={() => supabase.auth.signOut()} className="text-[12px] font-bold text-slate-500 hover:text-slate-300 transition-colors px-3 py-2">Sign Out</button>
            ) : !authChecking ? (
              <button onClick={() => setIsAuthModalOpen(true)} className="px-5 py-2.5 bg-white text-slate-900 rounded-xl text-[13px] font-black hover:bg-slate-200 transition-all">Sign Up</button>
            ) : null}
          </div>
        </nav>
      </div>

      {/* Persistence Sidebar (Toolkit) */}
      <div className={`fixed inset-y-0 right-0 w-80 bg-card border-l border-white/5 shadow-2xl z-[60] transition-transform duration-500 ease-in-out transform ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-8 h-full flex flex-col">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-xl font-bold flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse shadow-[0_0_10px_#8B5CF6]" />
              My AI Toolkit
            </h2>
            <button onClick={() => setIsSidebarOpen(false)} className="p-2.5 hover:bg-white/5 rounded-xl transition-all">
              <XIcon className="w-5 h-5 text-slate-500" />
            </button>
          </div>
          
          <div className="flex-grow overflow-y-auto space-y-5 pr-2 custom-scrollbar">
            {savedTools.length === 0 ? (
              <div className="text-center py-24 text-slate-600">
                <SparklesIcon className="w-12 h-12 mx-auto mb-6 opacity-20" />
                <p className="text-sm font-medium">Save tools to build your custom AI workflow.</p>
              </div>
            ) : (
              savedTools.map((tool, i) => (
                <div key={i} className="p-5 rounded-2xl border border-white/5 bg-white/5 hover:bg-white/10 transition-all group animate-in slide-in-from-right-4 duration-300" style={{animationDelay: `${i*50}ms`}}>
                  <div className="flex justify-between items-start mb-3">
                    <span className="font-bold text-sm text-slate-100 truncate max-w-[150px]">{tool.name}</span>
                    <button onClick={() => handleSaveTool(tool)} className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 transition-all p-1">
                      <XIcon className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center gap-3">
                    <a href={tool.url} target="_blank" className="text-[11px] font-black text-primary hover:text-primary/80 flex items-center tracking-wider uppercase">
                      Launch <ExternalLinkIcon className="w-2.5 h-2.5 ml-1.5" />
                    </a>
                  </div>
                </div>
              ))
            )}
          </div>
          
          <button className="mt-10 w-full py-4 bg-primary text-white rounded-2xl text-[13px] font-black tracking-widest uppercase hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">
            Export Toolkit (.csv)
          </button>
        </div>
      </div>

      <main className="container mx-auto px-6 pt-40 pb-32 flex flex-col items-center">
        {activeView === 'search' && (
          <div className="w-full flex flex-col items-center animate-in fade-in duration-1000">
            {/* Hero Section with Glow Backdrop */}
            <div className="relative w-full max-w-4xl flex flex-col items-center">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] hero-glow pointer-events-none -z-10 opacity-60" />

              <div className={`w-full text-center transition-all duration-1000 ${results ? 'mb-16 scale-[0.98]' : 'mb-32'}`}>
                <h1 className="text-5xl md:text-7xl font-black mb-10 leading-[1.05] tracking-tight text-slate-100">
                  Fix your bottlenecks. <br/>
                  <span className="text-primary drop-shadow-[0_0_15px_rgba(139,92,246,0.3)]">Find the exact AI.</span>
                </h1>

                <div className="h-14 flex items-center justify-center mb-12 overflow-hidden">
                  <p className="text-xl md:text-2xl text-slate-500 font-medium tracking-wide">
                    Try: <span className="text-primary border-r-2 border-primary/50 pr-2 animate-pulse font-bold">{currentText}</span>
                  </p>
                </div>

                <SearchInput 
                  onSearch={handleSearch} 
                  onShowAuth={() => setIsAuthModalOpen(true)}
                  isLoading={loading} 
                  user={user}
                />

                <div className="mt-20 w-full">
                  <div className="mb-6 flex items-center justify-center gap-4">
                    <div className="h-px w-10 bg-white/5" />
                    <span className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">Explore Categories</span>
                    <div className="h-px w-10 bg-white/5" />
                  </div>
                  <div className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto">
                    {CATEGORIES.map((cat, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSearch(cat === "All Tools" ? "Latest trending AI tools" : `Best AI tools for ${cat}`)}
                        className="px-6 py-3 rounded-full text-[13px] font-bold border border-white/5 bg-white/5 backdrop-blur-md hover:border-primary/40 hover:text-slate-100 hover:bg-white/10 transition-all duration-300 active:scale-95"
                      >
                        {cat}
                      </button>
                    ))}
                    <button 
                      onClick={() => handleSearch("Highly rated AI tools")}
                      className="px-6 py-3 rounded-full text-[13px] font-black border border-primary/20 bg-primary/10 text-primary hover:bg-primary/20 transition-all duration-300"
                    >
                      View Trending ✨
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Results Area */}
            <div className="w-full max-w-7xl">
              {loading ? (
                <div className="w-full flex justify-center">
                  <SkeletonGrid />
                </div>
              ) : error ? (
                <div className="bg-red-500/5 p-12 rounded-[40px] border border-red-500/10 text-red-400 text-center flex flex-col items-center">
                  <p className="font-bold text-lg mb-6">{error}</p>
                  <button onClick={() => handleSearch(query)} className="px-8 py-3 bg-white/5 border border-white/10 rounded-xl text-sm font-bold hover:bg-white/10 transition-all text-slate-300">Try Again</button>
                </div>
              ) : results ? (
                <div className="animate-in fade-in slide-in-from-bottom-12 duration-1000">
                  <div className="flex flex-col md:flex-row md:items-center justify-between mb-16 border-b border-white/5 pb-10 gap-6">
                    <div>
                      <h2 className="text-3xl font-black text-slate-100 mb-2">Identified Solutions</h2>
                      <p className="text-slate-500 font-medium">Real-time intelligence based on your bottleneck.</p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                       {sources?.slice(0, 3).map((s, i) => (
                         <a key={i} href={s.uri} target="_blank" className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[11px] font-bold text-slate-400 hover:bg-primary/10 hover:text-primary transition-all truncate max-w-[180px] shadow-glass">{s.title}</a>
                       ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
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

                  <div ref={workflowRef} className="mt-10">
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

        {activeView === 'feed' && <Feed />}

        {activeView === 'how-it-works' && (
          <div className="max-w-5xl mx-auto py-12 animate-in fade-in zoom-in-95 duration-700">
            <div className="text-center mb-20">
              <h2 className="text-5xl font-black text-slate-100 mb-8 tracking-tighter">Engineered for <span className="text-primary">Clarity.</span></h2>
              <p className="text-xl text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed">We bypass generic listings to build you a custom execution path.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {[
                {
                  title: "1. Problem Input",
                  desc: "Describe your manual work or technical hurdle. Our system analyzes the root cause of your slowdown.",
                  icon: <SearchIcon className="w-7 h-7" />
                },
                {
                  title: "2. Grounded Matching",
                  desc: "Our engine utilizes real-time search grounding to pinpoint specialized AI solutions that bypass generic listings to resolve your exact operational bottleneck.",
                  icon: <SparklesIcon className="w-7 h-7" />
                },
                {
                  title: "3. Execution Blueprint",
                  desc: "We don't just send you to a URL. We generate a 3-step setup guide and the exact prompt you need to use.",
                  icon: <ArrowRightIcon className="w-7 h-7" />
                }
              ].map((step, i) => (
                <div key={i} className="group p-10 bg-card border border-white/5 rounded-[40px] hover:border-primary/30 transition-all duration-500 hover:shadow-glow shadow-glass">
                  <div className="w-16 h-16 bg-white/5 text-primary rounded-[24px] flex items-center justify-center mb-10 border border-white/5 shadow-glass group-hover:scale-110 transition-transform duration-500">
                    {step.icon}
                  </div>
                  <h3 className="text-2xl font-bold mb-6 text-slate-100 tracking-tight">{step.title}</h3>
                  <p className="text-slate-400 text-[15px] leading-relaxed font-medium">{step.desc}</p>
                </div>
              ))}
            </div>

            <div className="mt-24 text-center">
              <button onClick={() => switchView('search')} className="px-12 py-5 bg-primary text-white rounded-[24px] font-black text-[15px] shadow-2xl shadow-primary/30 hover:shadow-primary/50 hover:scale-105 active:scale-95 transition-all tracking-wider uppercase">
                Launch Search Engine
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Pulse Feed FAB */}
      <button 
        onClick={() => switchView('feed')}
        className="fixed bottom-8 right-8 z-50 w-16 h-16 bg-card border border-white/10 hover:border-primary/50 text-slate-100 rounded-2xl shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 group shadow-indigo-500/20"
        title="AI Feed"
      >
        <NewspaperIcon className="w-7 h-7 transition-transform group-hover:rotate-6" />
        <span className="absolute right-full mr-4 bg-primary text-white text-[10px] font-bold py-2 px-3 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-glow">
          Pulse Feed
        </span>
      </button>

      <footer className="py-24 border-t border-white/5 bg-[#050505] relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
        <div className="container mx-auto px-6 text-center">
          <p className="text-[11px] font-black text-slate-600 mb-10 tracking-[0.4em] uppercase">The Intelligent Tool Index</p>
          <div className="flex justify-center space-x-16 text-[13px] font-bold text-slate-400">
            <a href="#" className="hover:text-primary transition-all duration-300 tracking-wide">Legal</a>
            <a href="#" className="hover:text-primary transition-all duration-300 tracking-wide">Developer API</a>
            <a href="#" className="hover:text-primary transition-all duration-300 tracking-wide">Twitter</a>
          </div>
          <p className="mt-12 text-[12px] text-slate-700 font-medium">© 2025 aineed.in. All systems operational.</p>
        </div>
      </footer>
    </div>
  );
}
