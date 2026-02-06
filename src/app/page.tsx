
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';
import { ToolRecommendation, GroundingSource, WorkflowPlan } from '../types';
import SearchInput from '../components/SearchInput';
import ResultCard from '../components/ResultCard';
import AuthModal from '../components/AuthModal';
import WorkflowCanvas from '../components/WorkflowCanvas';
import { SkeletonGrid } from '../components/SkeletonLoader';
import { Feed } from '../components/Feed';
import { SparklesIcon, NewspaperIcon, XIcon, ExternalLinkIcon, SearchIcon, ArrowRightIcon, GoogleIcon } from '../components/Icons';

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

  const handleGoogleAuthAction = async () => {
    try {
      const { error } = await (supabase.auth as any).signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: typeof window !== 'undefined' ? window.location.origin : undefined,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      console.error(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-800 font-sans selection:bg-primary selection:text-white relative">
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />

      {/* Floating Island Nav */}
      <div className="fixed top-6 inset-x-0 z-[50] flex justify-center px-4">
        <nav className="w-full max-w-5xl bg-white/70 backdrop-blur-2xl border border-slate-200/50 rounded-2xl shadow-premium px-6 h-16 flex items-center justify-between transition-all duration-300">
          <div className="flex items-center gap-10">
            <div className="flex items-center gap-3 cursor-pointer group" onClick={() => switchView('search')}>
              <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center text-white shadow-glow group-hover:rotate-12 transition-all duration-500">
                <SparklesIcon className="w-5 h-5" />
              </div>
              <span className="text-xl font-black tracking-tighter text-slate-900 hidden sm:inline-block">aineed.in</span>
            </div>

            <div className="flex items-center gap-2">
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
              {user && (
                <button 
                  onClick={() => switchView('feed')}
                  className={`relative px-4 py-2 rounded-xl text-[13px] font-bold transition-all flex items-center gap-2 ${activeView === 'feed' ? 'text-primary bg-primary/5' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50/50'}`}
                >
                  <NewspaperIcon className="w-4 h-4" />
                  Pulse
                  {activeView === 'feed' && (
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-primary rounded-full shadow-glow" />
                  )}
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-5">
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
                className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-[13px] font-black hover:bg-slate-800 transition-all shadow-glow active:scale-95"
              >
                Sign Up
              </button>
            ) : null}
          </div>
        </nav>
      </div>

      {/* Toolkit Sidebar */}
      <div className={`fixed inset-y-0 right-0 w-80 bg-white border-l border-slate-100 shadow-premium z-[60] transition-transform duration-500 ease-in-out transform ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-8 h-full flex flex-col">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-xl font-bold flex items-center gap-3 text-slate-900">
              <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse shadow-glow" />
              My AI Toolkit
            </h2>
            <button onClick={() => setIsSidebarOpen(false)} className="p-2.5 hover:bg-slate-50 rounded-xl transition-all">
              <XIcon className="w-5 h-5 text-slate-400" />
            </button>
          </div>
          
          <div className="flex-grow overflow-y-auto space-y-5 pr-2 custom-scrollbar">
            {savedTools.length === 0 ? (
              <div className="text-center py-24 text-slate-300">
                <SparklesIcon className="w-12 h-12 mx-auto mb-6 opacity-20 animate-float" />
                <p className="text-sm font-medium">Save tools to build your custom AI workflow.</p>
              </div>
            ) : (
              savedTools.map((tool, i) => (
                <div key={i} className="p-5 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-white hover:shadow-card transition-all group animate-in slide-in-from-right-4 duration-300" style={{animationDelay: `${i*50}ms`}}>
                  <div className="flex justify-between items-start mb-3">
                    <span className="font-bold text-sm text-slate-900 truncate max-w-[150px]">{tool.name}</span>
                    <button onClick={() => handleSaveTool(tool)} className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 transition-all p-1">
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
            {/* Hero Section */}
            <div className="relative w-full max-w-4xl flex flex-col items-center">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] hero-glow pointer-events-none -z-10" />

              <div className={`w-full text-center transition-all duration-1000 ${results ? 'mb-16 scale-[0.98]' : 'mb-32'}`}>
                
                {/* Start with the Google button */}
                {!user && !loading && !results && (
                  <button 
                    onClick={handleGoogleAuthAction}
                    className="inline-flex items-center gap-3 px-8 py-3.5 mb-12 bg-white border border-slate-200 hover:border-primary/40 rounded-full text-sm font-bold text-slate-600 hover:text-primary shadow-soft hover:shadow-glow transition-all duration-500 group animate-in slide-in-from-top-4"
                  >
                    <GoogleIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    Start with Google
                    <ArrowRightIcon className="w-4 h-4 opacity-50 group-hover:translate-x-1 transition-transform" />
                  </button>
                )}

                <h1 className="text-6xl md:text-8xl font-black mb-10 leading-[1.05] tracking-tight text-slate-900 drop-shadow-sm">
                  Fix your bottlenecks. <br/>
                  <span className="text-primary bg-clip-text text-transparent bg-gradient-to-r from-primary to-indigo-500">Find the exact AI.</span>
                </h1>

                <div className="h-14 flex items-center justify-center mb-12 overflow-hidden">
                  <p className="text-xl md:text-2xl text-slate-400 font-medium tracking-wide">
                    Try: <span className="text-primary border-r-2 border-primary/30 pr-2 animate-pulse font-bold">{currentText}</span>
                  </p>
                </div>

                <SearchInput 
                  onSearch={handleSearch} 
                  onShowAuth={() => setIsAuthModalOpen(true)}
                  isLoading={loading} 
                  user={user}
                />

                <div className="mt-20 w-full">
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
                    <button 
                      onClick={() => handleSearch("Highly rated AI tools")}
                      className="px-6 py-3.5 rounded-2xl text-[13px] font-black border border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 transition-all duration-300 group"
                    >
                      View Trending <SparklesIcon className="w-4 h-4 ml-1 inline group-hover:rotate-12 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Results Area */}
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
                  <div className="flex flex-col md:flex-row md:items-center justify-between mb-20 border-b border-slate-100 pb-12 gap-8">
                    <div>
                      <h2 className="text-4xl font-black text-slate-900 mb-3 tracking-tight">Intelligence Matches</h2>
                      <p className="text-slate-500 font-medium text-lg">Optimized recommendations grounded in real-world performance data.</p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                       {sources?.slice(0, 3).map((s, i) => (
                         <a key={i} href={s.uri} target="_blank" className="px-5 py-3 bg-white border border-slate-200 rounded-2xl text-[11px] font-bold text-slate-500 hover:bg-slate-50 hover:text-primary transition-all truncate max-w-[200px] shadow-soft flex items-center gap-2">
                           <ExternalLinkIcon className="w-3.5 h-3.5 opacity-40" />
                           {s.title}
                         </a>
                       ))}
                    </div>
                  </div>
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

        {activeView === 'feed' && <Feed />}

        {activeView === 'how-it-works' && (
          <div className="max-w-6xl mx-auto py-20 animate-in fade-in zoom-in-95 duration-700">
            <div className="text-center mb-24">
              <h2 className="text-6xl font-black text-slate-900 mb-10 tracking-tighter">Precision <span className="text-primary underline decoration-indigo-200 decoration-8 underline-offset-8">Automation.</span></h2>
              <p className="text-2xl text-slate-500 font-medium max-w-3xl mx-auto leading-relaxed">How we turn complex operational bottlenecks into streamlined, AI-driven workflows.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {[
                {
                  title: "1. Semantic Mapping",
                  desc: "Detail your manual processes. Our AI deconstructs the logic to identify exactly where efficiency is leaking.",
                  icon: <SearchIcon className="w-8 h-8" />
                },
                {
                  title: "2. Grounded Matching",
                  desc: "We scan the live ecosystem to pinpoint specialized tools that resolve your exact operational edge cases.",
                  icon: <SparklesIcon className="w-8 h-8" />
                },
                {
                  title: "3. Blueprint Export",
                  desc: "Receive a full execution plan including configuration prompts and setup steps to deploy instantly.",
                  icon: <ArrowRightIcon className="w-8 h-8" />
                }
              ].map((step, i) => (
                <div key={i} className="group p-12 bg-white border border-slate-100 rounded-[48px] hover:border-primary/40 transition-all duration-500 hover:shadow-premium relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full blur-[80px] group-hover:bg-primary/10 transition-all" />
                  <div className="w-20 h-20 bg-slate-50 text-primary rounded-[28px] flex items-center justify-center mb-12 border border-slate-100 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-sm">
                    {step.icon}
                  </div>
                  <h3 className="text-3xl font-bold mb-8 text-slate-900 tracking-tight">{step.title}</h3>
                  <p className="text-slate-500 text-lg leading-relaxed font-medium">{step.desc}</p>
                </div>
              ))}
            </div>

            <div className="mt-32 text-center">
              <button onClick={() => switchView('search')} className="px-16 py-6 bg-slate-900 text-white rounded-[32px] font-black text-lg shadow-glow hover:bg-slate-800 hover:scale-105 active:scale-95 transition-all tracking-widest uppercase">
                Launch Search Engine
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Pulse Feed FAB */}
      <button 
        onClick={() => switchView('feed')}
        className="fixed bottom-10 right-10 z-50 w-20 h-20 bg-white border border-slate-200 hover:border-primary/50 text-slate-900 rounded-3xl shadow-premium flex items-center justify-center transition-all duration-500 hover:scale-110 hover:-rotate-3 active:scale-95 group overflow-hidden"
        title="AI Feed"
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <NewspaperIcon className="w-9 h-9 transition-transform group-hover:scale-110 text-primary relative z-10" />
        <span className="absolute right-full mr-6 bg-slate-900 text-white text-[11px] font-black py-2.5 px-5 rounded-2xl opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0 whitespace-nowrap shadow-2xl tracking-widest uppercase">
          AI Pulse Feed
        </span>
      </button>

      <footer className="py-32 border-t border-slate-100 bg-white relative overflow-hidden">
        <div className="container mx-auto px-6 text-center">
          <p className="text-[11px] font-black text-slate-300 mb-12 tracking-[0.5em] uppercase">The Intelligent Tool Index</p>
          <div className="flex justify-center space-x-20 text-[14px] font-bold text-slate-400">
            <a href="#" className="hover:text-primary transition-all duration-300 tracking-wide">Legal</a>
            <a href="#" className="hover:text-primary transition-all duration-300 tracking-wide">Infrastructure</a>
            <a href="#" className="hover:text-primary transition-all duration-300 tracking-wide">Contact</a>
          </div>
          <div className="mt-16 flex flex-col items-center gap-6">
             <div className="flex items-center gap-3 px-5 py-2.5 bg-emerald-50 rounded-full border border-emerald-100">
                <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                <p className="text-[12px] text-emerald-600 font-black uppercase tracking-widest">Global Status: Active</p>
             </div>
             <p className="text-[12px] text-slate-400 font-medium">© 2025 aineed.in. Built on Vertex AI & Google Cloud Intelligence.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
