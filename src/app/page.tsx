
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
import { SparklesIcon, ExternalLinkIcon, XIcon, NewspaperIcon } from '../components/Icons';

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

export default function Page() {
  const [user, setUser] = useState<User | null>(null);
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

  // Workflow Canvas state
  const [workflowPlan, setWorkflowPlan] = useState<WorkflowPlan | null>(null);
  const [isWorkflowLoading, setIsWorkflowLoading] = useState(false);
  const [activeWorkflowTool, setActiveWorkflowTool] = useState<ToolRecommendation | null>(null);
  const workflowRef = useRef<HTMLDivElement>(null);

  // Typewriter effect state
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

  return (
    <div className="min-h-screen bg-[#FDFDFF] text-slate-900 font-sans selection:bg-[#5D5CDE] selection:text-white relative">
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />

      {/* FAB - Feed Button */}
      <button 
        className="fixed bottom-8 right-8 z-50 w-14 h-14 bg-slate-900 hover:bg-[#5D5CDE] text-white rounded-2xl shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 group shadow-indigo-500/20"
        title="AI Feed"
      >
        <NewspaperIcon className="w-6 h-6 transition-transform group-hover:rotate-6" />
        <span className="absolute right-full mr-4 bg-slate-900 text-white text-[10px] font-bold py-1.5 px-3 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          View AI Feed
        </span>
      </button>

      {/* Persistence Sidebar (Toolkit) */}
      <div className={`fixed inset-y-0 right-0 w-80 bg-white border-l border-slate-100 shadow-2xl z-50 transition-transform duration-500 ease-in-out transform ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-6 h-full flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              My AI Toolkit
            </h2>
            <button onClick={() => setIsSidebarOpen(false)} className="p-2 hover:bg-slate-50 rounded-full transition-colors">
              <XIcon className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex-grow overflow-y-auto space-y-4 pr-2 custom-scrollbar">
            {savedTools.length === 0 ? (
              <div className="text-center py-20 text-slate-400">
                <SparklesIcon className="w-10 h-10 mx-auto mb-4 opacity-20" />
                <p className="text-sm">Save tools from results to build your workflow.</p>
              </div>
            ) : (
              savedTools.map((tool, i) => (
                <div key={i} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-white transition-all group animate-in slide-in-from-right-4 duration-300" style={{animationDelay: `${i*50}ms`}}>
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-bold text-sm text-slate-900 truncate max-w-[150px]">{tool.name}</span>
                    <button onClick={() => handleSaveTool(tool)} className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-500 transition-opacity p-1">
                      <XIcon className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center gap-3">
                    <a href={tool.url} target="_blank" className="text-[11px] font-bold text-[#5D5CDE] hover:underline flex items-center">
                      Launch <ExternalLinkIcon className="w-2 h-2 ml-1" />
                    </a>
                  </div>
                </div>
              ))
            )}
          </div>
          
          <button className="mt-8 w-full py-3 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200">
            Export My Stack (.csv)
          </button>
        </div>
      </div>

      <nav className="w-full border-b border-slate-100/50 bg-white/70 backdrop-blur-xl sticky top-0 z-40">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer group" onClick={() => window.location.reload()}>
            <div className="w-9 h-9 bg-[#5D5CDE] rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 group-hover:rotate-12 transition-transform duration-300">
              <SparklesIcon className="w-5 h-5" />
            </div>
            <span className="text-xl font-black tracking-tight text-slate-900">aineed.in</span>
          </div>

          <div className="flex items-center space-x-6">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="relative p-2 text-slate-600 hover:text-[#5D5CDE] transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>
              {savedTools.length > 0 && <span className="absolute top-1 right-1 w-2 h-2 bg-[#5D5CDE] rounded-full ring-2 ring-white animate-ping"></span>}
              {savedTools.length > 0 && <span className="absolute top-1 right-1 w-2 h-2 bg-[#5D5CDE] rounded-full ring-2 ring-white"></span>}
            </button>
            {user && (
              <button onClick={() => supabase.auth.signOut()} className="text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors">Sign Out</button>
            )}
            {!user && !authChecking && (
              <button onClick={() => setIsAuthModalOpen(true)} className="px-6 py-2.5 bg-slate-900 text-white rounded-full text-sm font-bold hover:shadow-xl transition-all hover:bg-slate-800">Join for Free</button>
            )}
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-20 flex flex-col items-center">
        {/* Glass Hero */}
        <div className={`relative w-full max-w-4xl p-10 md:p-16 rounded-[40px] border border-slate-200/60 bg-white/40 backdrop-blur-2xl shadow-[0_32px_120px_-20px_rgba(0,0,0,0.08)] text-center transition-all duration-1000 ${results ? 'mb-12 scale-[0.95]' : 'mb-24'}`}>
          <div className="absolute -top-12 -left-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute -bottom-12 -right-12 w-64 h-64 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />

          <h1 className="text-4xl md:text-6xl font-black mb-8 leading-[1.1] tracking-tight text-slate-900">
            Fix your bottlenecks. <br/>
            <span className="text-[#5D5CDE]">Find the exact AI.</span>
          </h1>

          <div className="h-12 flex items-center justify-center mb-10 overflow-hidden">
            <p className="text-lg md:text-xl text-slate-400 font-medium">
              Try: <span className="text-[#5D5CDE] border-r-2 border-[#5D5CDE] pr-1 animate-pulse">{currentText}</span>
            </p>
          </div>

          <SearchInput 
            onSearch={handleSearch} 
            onShowAuth={() => setIsAuthModalOpen(true)}
            isLoading={loading} 
            user={user}
          />

          <div className="mt-14 w-full">
            <div className="mb-4 text-center">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Explore Categories</span>
            </div>
            <div className="flex flex-wrap justify-center gap-2.5 max-w-3xl mx-auto">
              {CATEGORIES.map((cat, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSearch(cat === "All Tools" ? "Latest trending AI tools" : `Best AI tools for ${cat}`)}
                  className="px-5 py-2.5 rounded-full text-[12px] font-bold border border-slate-200 bg-white/50 backdrop-blur-sm hover:border-[#5D5CDE] hover:text-[#5D5CDE] hover:bg-white transition-all duration-300 hover:shadow-md active:scale-95"
                >
                  {cat}
                </button>
              ))}
              <button 
                onClick={() => handleSearch("Most popular AI tools today")}
                className="px-5 py-2.5 rounded-full text-[12px] font-bold border border-indigo-100 bg-indigo-50/30 text-[#5D5CDE] hover:bg-indigo-50 transition-all duration-300"
              >
                View All ✨
              </button>
            </div>
          </div>
        </div>

        {/* Results Area */}
        <div className="w-full max-w-6xl">
          {loading ? (
            <SkeletonGrid />
          ) : error ? (
            <div className="bg-red-50 p-8 rounded-3xl border border-red-100 text-red-600 text-center flex flex-col items-center">
              <p className="font-bold mb-4">{error}</p>
              <button 
                onClick={() => handleSearch(query)} 
                className="px-6 py-2 bg-white border border-red-200 rounded-full text-xs font-bold hover:bg-red-50 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : results ? (
            <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 border-b border-slate-100 pb-6 gap-4">
                <h2 className="text-2xl font-black">Identified Solutions</h2>
                <div className="flex flex-wrap gap-2">
                   {sources?.slice(0, 3).map((s, i) => (
                     <a key={i} href={s.uri} target="_blank" className="px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-lg text-[10px] font-bold text-slate-500 hover:bg-indigo-50 hover:text-[#5D5CDE] hover:border-indigo-100 transition-all truncate max-w-[150px]">{s.title}</a>
                   ))}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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

              {/* Workflow Canvas Zone */}
              <div ref={workflowRef}>
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
      </main>

      <footer className="py-20 border-t border-slate-100 bg-white mt-40">
        <div className="container mx-auto px-6 text-center">
          <p className="text-sm font-bold text-slate-300 mb-6 tracking-widest uppercase">The Intelligent Directory</p>
          <div className="flex justify-center space-x-12 text-sm font-bold text-slate-400">
            <a href="#" className="hover:text-slate-900 transition-all duration-300">Privacy Policy</a>
            <a href="#" className="hover:text-slate-900 transition-all duration-300">Twitter (X)</a>
            <a href="#" className="hover:text-slate-900 transition-all duration-300">Contact Support</a>
          </div>
          <p className="mt-8 text-[11px] text-slate-300 font-medium">© 2025 aineed.in. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
