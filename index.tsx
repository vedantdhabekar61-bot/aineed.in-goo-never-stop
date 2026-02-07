
import React, { useState, useEffect, useRef, KeyboardEvent } from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleGenAI } from "@google/genai";
import { createClient } from "@supabase/supabase-js";

// --- Types ---
export interface ToolRecommendation {
  id?: string;
  name: string;
  description: string;
  url: string;
  reasoning?: string;
}

export interface WorkflowPlan {
  toolName: string;
  steps: {
    action: string;
    description: string;
  }[];
  uploadGuide: string;
  promptTemplate: string;
}

export interface GroundingSource {
  title: string;
  uri: string;
}

// --- Icons ---
const SearchIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
);

const SparklesIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"></path>
  </svg>
);

const ExternalLinkIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
    <polyline points="15 3 21 3 21 9"></polyline>
    <line x1="10" y1="14" x2="21" y2="3"></line>
  </svg>
);

const LoaderIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
  </svg>
);

const ArrowRightIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="5" y1="12" x2="19" y2="12"></line>
    <polyline points="12 5 19 12 12 19"></polyline>
  </svg>
);

const XIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

// --- Constants ---
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
  "create AI influencers for Instagram",
  "automate my YouTube clip creation",
  "write code from screenshots",
  "grow my SaaS with AI SEO",
  "automate complex Excel workflows"
];

// --- Supabase Client (Optional fallback) ---
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

// --- Gemini Client ---
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

// --- Components ---

const SearchInput: React.FC<{
  onSearch: (query: string) => void;
  isLoading: boolean;
  isSticky?: boolean;
  onFocusChange?: (isFocused: boolean) => void;
}> = ({ onSearch, isLoading, isSticky = false, onFocusChange }) => {
  const [value, setValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleAction = () => {
    if (value.trim() && !isLoading) {
      onSearch(value.trim());
      inputRef.current?.blur();
    }
  };

  return (
    <div className={`w-full transition-all duration-700 ease-out z-[60] ${isSticky ? 'max-w-xl' : 'max-w-3xl'} mx-auto relative group`}>
      <div className={`relative flex items-center bg-white/70 backdrop-blur-2xl rounded-2xl border transition-all duration-500 overflow-hidden ${isSticky ? 'p-1 shadow-premium' : 'p-2 shadow-soft'} ${isFocused ? 'border-primary ring-4 ring-primary/10 shadow-glow scale-[1.02]' : 'border-slate-200/60 hover:border-primary/40'}`}>
        <div className={`pl-5 pointer-events-none transition-all duration-300 ${isFocused ? 'opacity-100 scale-110' : 'opacity-40'}`}>
          <SearchIcon className={`w-6 h-6 ${isFocused ? 'text-primary' : 'text-slate-400'}`} />
        </div>
        <input
          ref={inputRef}
          type="text"
          className={`w-full bg-transparent text-slate-900 p-4 pl-3 focus:outline-none placeholder-slate-400 font-medium tracking-wide transition-all ${isSticky ? 'text-sm' : 'text-lg'}`}
          placeholder={isSticky ? "Find AI tools..." : "e.g., How can I automate my SaaS email outreach?"}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAction()}
          onFocus={() => { setIsFocused(true); onFocusChange?.(true); }}
          onBlur={() => { setIsFocused(false); onFocusChange?.(false); }}
          disabled={isLoading}
        />
        <button
          onClick={handleAction}
          disabled={isLoading || !value.trim()}
          className={`flex items-center space-x-2 rounded-xl font-bold transition-all duration-300 shrink-0 ${isSticky ? 'px-5 py-2.5 text-xs' : 'px-8 py-4'} ${value.trim() && !isLoading ? 'bg-slate-900 hover:bg-slate-800 text-white shadow-lg active:scale-95' : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'}`}
        >
          {isLoading ? <LoaderIcon className="w-5 h-5 animate-spin" /> : <span>{isSticky ? 'Search' : 'Find Solution'}</span>}
        </button>
      </div>
    </div>
  );
};

const ResultCard: React.FC<{
  tool: ToolRecommendation;
  index: number;
  onAnalyze: (tool: ToolRecommendation) => void;
}> = ({ tool, index, onAnalyze }) => {
  return (
    <div className="group relative bg-white border border-slate-100 rounded-3xl p-8 hover:border-primary/30 transition-all duration-500 hover:shadow-soft flex flex-col h-full overflow-hidden hover:-translate-y-2 shadow-card animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: `${index * 100}ms` }}>
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl pointer-events-none group-hover:bg-primary/10 transition-colors" />
      <div className="flex items-start mb-8">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-500 shadow-sm">
            <SparklesIcon className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 leading-tight tracking-tight">{tool.name}</h3>
        </div>
      </div>
      <p className="text-slate-500 mb-8 flex-grow leading-relaxed font-medium text-[15px]">{tool.description}</p>
      {tool.reasoning && (
        <div className="mb-10 p-5 bg-primary/5 border border-primary/10 rounded-2xl relative overflow-hidden group/logic">
          <div className="absolute top-0 left-0 w-1 h-full bg-primary/50" />
          <p className="text-[13px] text-slate-600 leading-relaxed tracking-wide">
            <span className="font-black uppercase tracking-[0.1em] text-[10px] text-primary/70 block mb-2">AI Reasoning</span>
            {tool.reasoning}
          </p>
        </div>
      )}
      <div className="mt-auto space-y-3">
        <button onClick={() => onAnalyze(tool)} className="w-full py-4 px-4 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-2xl transition-all duration-300 font-bold text-[13px] flex items-center justify-center gap-2 border border-slate-100">
          <span>Execution Blueprint</span>
          <ArrowRightIcon className="w-4 h-4 opacity-50 group-hover:translate-x-1 transition-transform" />
        </button>
        <a href={tool.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center w-full py-4 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl transition-all duration-300 font-black text-[13px] shadow-soft">
          <span>Launch Tool</span>
          <ExternalLinkIcon className="w-4 h-4 ml-2" />
        </a>
      </div>
    </div>
  );
};

const WorkflowCanvas: React.FC<{
  plan: WorkflowPlan | null;
  isLoading: boolean;
  onClear: () => void;
  activeTool: ToolRecommendation | null;
}> = ({ plan, isLoading, onClear, activeTool }) => {
  if (!activeTool && !isLoading) return null;
  return (
    <div className="w-full mt-24 animate-in fade-in slide-in-from-bottom-12 duration-1000">
      <div className="relative p-1 border-2 border-dashed border-slate-100 rounded-[48px] bg-slate-50/50">
        <div className="bg-white rounded-[42px] shadow-premium overflow-hidden border border-slate-100">
          <div className="px-10 py-8 bg-white border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-5">
              <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center text-white shadow-glow"><SparklesIcon className="w-5 h-5" /></div>
              <h2 className="text-xl font-bold tracking-tight text-slate-900">Blueprint: <span className="text-primary/80">{activeTool?.name}</span></h2>
            </div>
            <button onClick={onClear} className="px-5 py-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-600 transition-all text-[12px] font-black uppercase border border-slate-200">Dismiss</button>
          </div>
          <div className="p-10 md:p-16">
            {isLoading ? (
              <div className="py-24 flex flex-col items-center justify-center">
                <LoaderIcon className="w-16 h-16 text-primary animate-spin opacity-50" />
                <p className="mt-8 text-slate-400 font-black animate-pulse uppercase tracking-widest text-[11px]">Architecting Solution...</p>
              </div>
            ) : plan ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
                <div className="lg:col-span-2 space-y-12">
                  <span className="px-3 py-1 bg-primary/5 text-primary text-[11px] font-black uppercase tracking-[0.1em] rounded-lg border border-primary/10">Implementation Steps</span>
                  {plan.steps.map((step, i) => (
                    <div key={i} className="flex gap-10 group">
                      <div className="flex flex-col items-center">
                        <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 flex items-center justify-center font-bold text-lg shrink-0 group-hover:bg-primary group-hover:text-white transition-all duration-500 shadow-sm">{i + 1}</div>
                        {i < 2 && <div className="w-[1px] h-full bg-slate-100 my-4" />}
                      </div>
                      <div className="pt-2 pb-6">
                        <h4 className="text-lg font-bold text-slate-900 mb-3 tracking-tight group-hover:text-primary transition-colors">{step.action}</h4>
                        <p className="text-[15px] text-slate-500 leading-relaxed font-medium">{step.description}</p>
                      </div>
                    </div>
                  ))}
                  <div className="mt-16 p-8 bg-slate-50 rounded-3xl border border-slate-100 border-dashed">
                    <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Input & Resources</h5>
                    <p className="text-[15px] text-slate-600 font-bold leading-relaxed">{plan.uploadGuide}</p>
                  </div>
                </div>
                <div className="lg:col-span-1">
                  <div className="sticky top-12 bg-white border border-slate-200 rounded-[40px] p-8 shadow-soft">
                    <h5 className="text-[10px] font-black text-primary uppercase tracking-widest mb-6 flex items-center gap-2"><SparklesIcon className="w-4 h-4" /> Optimization Prompt</h5>
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 mb-8 shadow-inner relative z-10">
                      <p className="text-[13px] text-slate-700 font-mono leading-relaxed whitespace-pre-wrap">{plan.promptTemplate}</p>
                    </div>
                    <button 
                      onClick={() => navigator.clipboard.writeText(plan.promptTemplate)} 
                      className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-[13px] font-black uppercase shadow-lg transition-all active:scale-95 flex items-center justify-center gap-3"
                    >
                      Copy Logic <ExternalLinkIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Main Page ---

const App = () => {
  const [activeView, setActiveView] = useState<'search' | 'how-it-works'>('search');
  const [isStickySearch, setIsStickySearch] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ToolRecommendation[] | null>(null);
  const [sources, setSources] = useState<GroundingSource[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [workflowPlan, setWorkflowPlan] = useState<WorkflowPlan | null>(null);
  const [isWorkflowLoading, setIsWorkflowLoading] = useState(false);
  const [activeWorkflowTool, setActiveWorkflowTool] = useState<ToolRecommendation | null>(null);

  const [promptIndex, setPromptIndex] = useState(0);
  const [currentText, setCurrentText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const heroRef = useRef<HTMLDivElement>(null);
  const workflowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (heroRef.current) {
        const threshold = heroRef.current.offsetTop + heroRef.current.offsetHeight - 150;
        setIsStickySearch(window.scrollY > threshold);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleType = () => {
      const fullText = PROMPTS[promptIndex];
      setCurrentText(isDeleting ? fullText.substring(0, currentText.length - 1) : fullText.substring(0, currentText.length + 1));
      if (!isDeleting && currentText === fullText) {
        setTimeout(() => setIsDeleting(true), 2500);
      } else if (isDeleting && currentText === "") {
        setIsDeleting(false);
        setPromptIndex((prev) => (prev + 1) % PROMPTS.length);
      }
    };
    const timer = setTimeout(handleType, isDeleting ? 25 : 50);
    return () => clearTimeout(timer);
  }, [currentText, isDeleting, promptIndex]);

  const handleSearch = async (searchQuery: string) => {
    setQuery(searchQuery);
    setLoading(true);
    setError(null);
    setResults(null);
    setSources(null);
    setWorkflowPlan(null);
    setActiveWorkflowTool(null);
    setActiveView('search');

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `User Problem: "${searchQuery}"
        Search for real-world AI tools. Return a JSON object: { "recommendations": [{ "name": "Tool Name", "description": "1-sentence description", "reasoning": "Detailed reasoning based on user input", "url": "https://tool-website.com" }] }
        Only return the raw JSON. No markdown. No reasoning outside the JSON.`,
        config: {
          tools: [{ googleSearch: {} }],
        },
      });

      const text = response.text || "";
      const cleaned = text.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(cleaned);
      setResults(parsed.recommendations);

      const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      if (groundingChunks) {
        const sourcesList: GroundingSource[] = groundingChunks
          .filter((c: any) => c.web)
          .map((c: any) => ({ title: c.web.title || "Source", uri: c.web.uri || "#" }));
        setSources(sourcesList);
      }
    } catch (err: any) {
      setError("AI Search failed. Please try a more specific operational bottleneck.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyzeWorkflow = async (tool: ToolRecommendation) => {
    setActiveWorkflowTool(tool);
    setIsWorkflowLoading(true);
    setWorkflowPlan(null);
    
    setTimeout(() => workflowRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Original Problem: "${query}"
        Tool: "${tool.name} (${tool.url})"
        Create a 3-step execution plan in JSON: { "toolName": "${tool.name}", "steps": [{ "action": "Step Title", "description": "Instructions" }], "uploadGuide": "Files/Data needed", "promptTemplate": "Internal tool prompt" }
        Raw JSON only.`,
      });
      const text = response.text?.replace(/```json|```/g, '').trim();
      setWorkflowPlan(JSON.parse(text || "{}"));
    } catch (err) {
      setError("Failed to generate blueprint.");
    } finally {
      setIsWorkflowLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-800 selection:bg-primary selection:text-white">
      {/* Background Glow */}
      <div className={`fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] z-[55] pointer-events-none transition-opacity duration-700 ${isFocused ? 'opacity-100' : 'opacity-0'}`} />

      {/* Navigation */}
      <div className="fixed top-6 inset-x-0 z-[60] flex justify-center px-4">
        <nav className={`w-full max-w-5xl bg-white/80 backdrop-blur-2xl border border-slate-200/50 rounded-2xl shadow-premium px-6 h-16 flex items-center justify-between transition-all duration-500 ${isStickySearch ? 'scale-[0.98]' : ''}`}>
          <div className="flex items-center gap-10">
            <div className={`flex items-center gap-3 cursor-pointer group transition-all duration-500 ${isStickySearch ? 'scale-90 opacity-0 -translate-x-10 pointer-events-none' : ''}`} onClick={() => { setResults(null); setActiveView('search'); }}>
              <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center text-white shadow-glow group-hover:rotate-12 transition-transform"><SparklesIcon className="w-5 h-5" /></div>
              <span className="text-xl font-black tracking-tighter text-slate-900">aineed.in</span>
            </div>
            
            <div className={`absolute inset-0 flex items-center justify-center pointer-events-none transition-all duration-500 ${isStickySearch ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
               <div className="w-full max-w-lg pointer-events-auto">
                 {isStickySearch && <SearchInput onSearch={handleSearch} isLoading={loading} isSticky={true} onFocusChange={setIsFocused} />}
               </div>
            </div>

            <div className={`flex items-center gap-4 transition-all duration-500 ${isStickySearch ? 'opacity-0' : ''}`}>
              <button onClick={() => setActiveView('search')} className={`text-[13px] font-bold px-4 py-2 rounded-xl transition-all ${activeView === 'search' ? 'bg-slate-50 text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}>Directory</button>
              <button onClick={() => setActiveView('how-it-works')} className={`text-[13px] font-bold px-4 py-2 rounded-xl transition-all ${activeView === 'how-it-works' ? 'bg-slate-50 text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}>Methodology</button>
            </div>
          </div>
          <div className={`flex items-center gap-4 transition-opacity duration-500 ${isStickySearch ? 'opacity-0' : ''}`}>
             <button className="hidden sm:block px-5 py-2.5 bg-slate-900 text-white rounded-xl text-[12px] font-black hover:bg-slate-800 transition-all shadow-glow active:scale-95">Expert Consultation</button>
          </div>
        </nav>
      </div>

      <main className="container mx-auto px-6 pt-40 pb-32">
        {activeView === 'search' ? (
          <div className="flex flex-col items-center">
            {/* Hero */}
            <div ref={heroRef} className={`w-full max-w-4xl text-center transition-all duration-1000 ${results ? 'mb-16 scale-95 opacity-50' : 'mb-32'}`}>
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] hero-glow pointer-events-none -z-10" />
              <h1 className="text-6xl md:text-8xl font-black mb-10 leading-[1.05] tracking-tight text-slate-900">
                Fix your bottlenecks. <br/>
                <span className="text-primary bg-clip-text text-transparent bg-gradient-to-r from-primary to-indigo-500">Find the exact AI.</span>
              </h1>
              <div className="h-10 flex items-center justify-center mb-10 overflow-hidden">
                <p className="text-xl md:text-2xl text-slate-400 font-medium">Try: <span className="text-primary border-r-2 border-primary/30 pr-2 animate-pulse font-bold">{currentText}</span></p>
              </div>
              <div className={`transition-all duration-500 ${isStickySearch ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
                <SearchInput onSearch={handleSearch} isLoading={loading} onFocusChange={setIsFocused} />
                <div className="mt-16 flex flex-wrap justify-center gap-3 max-w-3xl mx-auto">
                   {CATEGORIES.slice(1).map((cat, i) => (
                     <button key={i} onClick={() => handleSearch(`Best AI tools for ${cat}`)} className="px-5 py-3 rounded-2xl text-[12px] font-bold border border-slate-200 bg-white hover:border-primary/40 hover:text-primary hover:shadow-soft transition-all active:scale-95">{cat}</button>
                   ))}
                </div>
              </div>
            </div>

            {/* Results */}
            <div className="w-full max-w-7xl">
              {error ? (
                <div className="bg-red-50 p-16 rounded-[48px] border border-red-100 text-red-600 text-center flex flex-col items-center">
                  <XIcon className="w-12 h-12 mb-6" />
                  <p className="font-bold text-xl mb-4">{error}</p>
                  <button onClick={() => handleSearch(query)} className="px-10 py-4 bg-white border border-red-200 rounded-2xl text-sm font-black uppercase shadow-sm">Retry Search</button>
                </div>
              ) : results ? (
                <div className="animate-in fade-in slide-in-from-bottom-12 duration-1000">
                  <div className="flex flex-col md:flex-row md:items-center justify-between mb-16 pb-12 border-b border-slate-100 gap-8">
                    <div>
                      <h2 className="text-4xl font-black text-slate-900 mb-2">Verified Matches</h2>
                      <p className="text-slate-500 font-medium text-lg">Cross-referenced with live operational data.</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                       {sources?.slice(0, 3).map((s, i) => (
                         <a key={i} href={s.uri} target="_blank" className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-[11px] font-bold text-slate-500 hover:text-primary transition-all flex items-center gap-2 shadow-soft truncate max-w-[180px]">
                           <ExternalLinkIcon className="w-3 h-3" /> {s.title}
                         </a>
                       ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {results.map((tool, idx) => (
                      <ResultCard key={idx} tool={tool} index={idx} onAnalyze={handleAnalyzeWorkflow} />
                    ))}
                  </div>
                  <div ref={workflowRef}>
                    <WorkflowCanvas plan={workflowPlan} isLoading={isWorkflowLoading} activeTool={activeWorkflowTool} onClear={() => { setWorkflowPlan(null); setActiveWorkflowTool(null); }} />
                  </div>
                </div>
              ) : loading && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="bg-white border border-slate-100 rounded-3xl p-8 animate-pulse">
                      <div className="flex items-center gap-4 mb-8">
                        <div className="w-14 h-14 bg-slate-100 rounded-2xl" />
                        <div className="h-6 w-32 bg-slate-100 rounded-lg" />
                      </div>
                      <div className="space-y-3 mb-10">
                        <div className="h-4 w-full bg-slate-100 rounded-md" />
                        <div className="h-4 w-5/6 bg-slate-100 rounded-md" />
                      </div>
                      <div className="h-12 w-full bg-slate-100 rounded-2xl" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="max-w-5xl mx-auto py-20 text-center">
            <h2 className="text-5xl font-black text-slate-900 mb-10">The Methodology.</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-left">
              <div className="p-10 bg-slate-50 rounded-[48px] border border-slate-100">
                <div className="w-16 h-16 bg-primary text-white rounded-2xl flex items-center justify-center mb-10 shadow-glow"><SearchIcon className="w-8 h-8" /></div>
                <h3 className="text-2xl font-bold mb-4">Semantic Decoding</h3>
                <p className="text-slate-500 leading-relaxed">We break down your prompt into core logical units to understand the technical requirements of the solution.</p>
              </div>
              <div className="p-10 bg-slate-50 rounded-[48px] border border-slate-100">
                <div className="w-16 h-16 bg-primary text-white rounded-2xl flex items-center justify-center mb-10 shadow-glow"><SparklesIcon className="w-8 h-8" /></div>
                <h3 className="text-2xl font-bold mb-4">Grounded Analysis</h3>
                <p className="text-slate-500 leading-relaxed">Gemini 3 Flash with Google Search indexing matches real tools against your specific operational edge cases.</p>
              </div>
              <div className="p-10 bg-slate-50 rounded-[48px] border border-slate-100">
                <div className="w-16 h-16 bg-primary text-white rounded-2xl flex items-center justify-center mb-10 shadow-glow"><ArrowRightIcon className="w-8 h-8" /></div>
                <h3 className="text-2xl font-bold mb-4">Execution Blueprints</h3>
                <p className="text-slate-500 leading-relaxed">Instead of just a list, we provide a step-by-step roadmap and internal prompt templates for immediate deployment.</p>
              </div>
            </div>
            <button onClick={() => setActiveView('search')} className="mt-24 px-12 py-5 bg-slate-900 text-white rounded-3xl font-black uppercase tracking-widest shadow-premium hover:bg-slate-800 transition-all active:scale-95">Back to Directory</button>
          </div>
        )}
      </main>

      <footer className="py-24 border-t border-slate-100 bg-white">
        <div className="container mx-auto px-6 flex flex-col items-center">
          <p className="text-[11px] font-black text-slate-300 mb-10 tracking-[0.4em] uppercase">The AI Search Authority</p>
          <div className="flex gap-12 text-sm font-bold text-slate-400 mb-16">
            <a href="#" className="hover:text-primary transition-colors">Infrastructure</a>
            <a href="#" className="hover:text-primary transition-colors">Privacy Logic</a>
            <a href="#" className="hover:text-primary transition-colors">API Access</a>
          </div>
          <p className="text-[12px] text-slate-400">© 2025 aineed.in. Powered by Google Cloud Intelligence.</p>
        </div>
      </footer>
    </div>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
