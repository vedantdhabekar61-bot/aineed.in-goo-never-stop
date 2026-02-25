
'use client';

import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { XIcon, LoaderIcon, GoogleIcon } from './Icons';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGoogleAuth = async () => {
    setGoogleLoading(true);
    setError(null);
    try {
      // Cast supabase.auth to any to bypass "Property 'signInWithOAuth' does not exist" type errors
      const { error } = await (supabase.auth as any).signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: typeof window !== 'undefined' ? window.location.origin : undefined,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message);
      setGoogleLoading(false);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (isSignUp) {
        // Cast supabase.auth to any to bypass "Property 'signUp' does not exist" type errors
        const { error } = await (supabase.auth as any).signUp({
          email,
          password,
        });
        if (error) throw error;
        setMessage("Check your email for the confirmation link!");
      } else {
        // Cast supabase.auth to any to bypass "Property 'signInWithPassword' does not exist" type errors
        const { error } = await (supabase.auth as any).signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        onClose();
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Premium Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-md bg-white rounded-[32px] shadow-premium p-10 animate-in fade-in zoom-in-95 duration-300 border border-slate-100">
        <button 
          onClick={onClose}
          className="absolute top-8 right-8 p-2 text-slate-300 hover:text-slate-900 transition-all rounded-xl hover:bg-slate-50"
        >
          <XIcon className="w-5 h-5" />
        </button>

        <div className="text-center mb-10">
          <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mx-auto mb-6">
             <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">
            {isSignUp ? "Join aineed.in" : "Welcome Back"}
          </h2>
          <p className="text-slate-500 text-sm font-medium">
            {isSignUp 
              ? "Start building your automated AI toolkit today." 
              : "Sign in to access your saved tools and custom workflows."}
          </p>
        </div>

        {/* Social Auth */}
        <div className="space-y-4 mb-10">
          <button
            onClick={handleGoogleAuth}
            disabled={googleLoading || loading}
            className="w-full flex items-center justify-center space-x-3 py-4 px-4 bg-white border border-slate-200 hover:border-primary/30 hover:bg-slate-50 rounded-2xl font-bold text-slate-700 transition-all shadow-sm disabled:opacity-70 group"
          >
            {googleLoading ? (
              <LoaderIcon className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <GoogleIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span>{isSignUp ? "Sign up with Google" : "Sign in with Google"}</span>
              </>
            )}
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-100"></span>
            </div>
            <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-[0.2em]">
              <span className="bg-white px-4 text-slate-400">or with email</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Work Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all text-slate-900 placeholder-slate-300 bg-slate-50 focus:bg-white font-medium"
              placeholder="name@company.com"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all text-slate-900 placeholder-slate-300 bg-slate-50 focus:bg-white font-medium"
              placeholder="••••••••"
              minLength={6}
            />
          </div>

          {error && (
            <div className="p-4 bg-red-50 text-red-600 text-[13px] rounded-2xl border border-red-100 font-bold animate-in fade-in slide-in-from-top-2">
              {error}
            </div>
          )}

          {message && (
            <div className="p-4 bg-emerald-50 text-emerald-600 text-[13px] rounded-2xl border border-emerald-100 font-bold animate-in fade-in slide-in-from-top-2">
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || googleLoading}
            className="w-full py-4 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-black text-[13px] tracking-widest uppercase shadow-lg shadow-slate-200 transition-all flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed active:scale-[0.98]"
          >
            {loading ? (
              <LoaderIcon className="w-5 h-5 animate-spin" />
            ) : (
              isSignUp ? "Create My Account" : "Enter Dashboard"
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-[13px] text-slate-400 font-medium">
          {isSignUp ? "Already a member?" : "New to the directory?"}
          <button 
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError(null);
              setMessage(null);
            }}
            className="ml-2 text-primary font-black hover:text-primary/80 transition-colors underline decoration-2 underline-offset-4"
          >
            {isSignUp ? "Log In" : "Sign Up Free"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
