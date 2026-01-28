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
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: typeof window !== 'undefined' ? window.location.origin : undefined,
        },
      });
      if (error) throw error;
      // Note: Redirect happens automatically
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
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        setMessage("Check your email for the confirmation link!");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
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
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 animate-in fade-in zoom-in-95 duration-200">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 transition-colors rounded-full hover:bg-slate-50"
        >
          <XIcon className="w-5 h-5" />
        </button>

        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            {isSignUp ? "Create an Account" : "Welcome Back"}
          </h2>
          <p className="text-slate-500 text-sm">
            {isSignUp 
              ? "Join aineed.in to find the best AI tools." 
              : "Sign in to access the AI directory assistant."}
          </p>
        </div>

        {/* Social Auth */}
        <div className="space-y-4 mb-8">
          <button
            onClick={handleGoogleAuth}
            disabled={googleLoading || loading}
            className="w-full flex items-center justify-center space-x-3 py-3.5 px-4 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 rounded-xl font-semibold text-slate-700 transition-all shadow-sm disabled:opacity-70"
          >
            {googleLoading ? (
              <LoaderIcon className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <GoogleIcon className="w-5 h-5" />
                <span>Continue with Google</span>
              </>
            )}
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-100"></span>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-4 text-slate-400 font-medium tracking-wider">or with email</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5 ml-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#5D5CDE] focus:ring-4 focus:ring-[#5D5CDE]/5 outline-none transition-all text-slate-800 placeholder-slate-400 bg-slate-50 focus:bg-white"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5 ml-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#5D5CDE] focus:ring-4 focus:ring-[#5D5CDE]/5 outline-none transition-all text-slate-800 placeholder-slate-400 bg-slate-50 focus:bg-white"
              placeholder="••••••••"
              minLength={6}
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-xs rounded-lg border border-red-100 font-medium">
              {error}
            </div>
          )}

          {message && (
            <div className="p-3 bg-green-50 text-green-600 text-xs rounded-lg border border-green-100 font-medium">
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || googleLoading}
            className="w-full py-3.5 px-4 bg-[#5D5CDE] hover:bg-[#4b4ac2] text-white rounded-xl font-bold shadow-lg shadow-indigo-500/30 transition-all flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <LoaderIcon className="w-5 h-5 animate-spin" />
            ) : (
              isSignUp ? "Create Account" : "Sign In"
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-slate-500">
          {isSignUp ? "Already have an account?" : "Don't have an account yet?"}
          <button 
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError(null);
              setMessage(null);
            }}
            className="ml-2 text-[#5D5CDE] font-bold hover:underline underline-offset-4"
          >
            {isSignUp ? "Sign In" : "Sign Up for Free"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
