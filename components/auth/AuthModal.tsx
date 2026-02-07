
'use client';

import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { XIcon, LoaderIcon, GoogleIcon } from '../common/Icons';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleGoogleAuth = async () => {
    setLoading(true);
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: typeof window !== 'undefined' ? window.location.origin : undefined }
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white rounded-[32px] shadow-premium p-10 border border-slate-100 animate-in zoom-in-95">
        <button onClick={onClose} className="absolute top-8 right-8 p-2 text-slate-300 hover:text-slate-900 transition-all">
          <XIcon className="w-5 h-5" />
        </button>
        <div className="text-center mb-10">
          <h2 className="text-2xl font-black text-slate-900 mb-2">Join aineed.in</h2>
          <p className="text-slate-500 text-sm">Start building your automated AI toolkit today.</p>
        </div>
        <button
          onClick={handleGoogleAuth}
          disabled={loading}
          className="w-full flex items-center justify-center space-x-3 py-4 bg-white border border-slate-200 hover:border-primary/30 rounded-2xl font-bold text-slate-700 transition-all"
        >
          {loading ? <LoaderIcon className="animate-spin" /> : (
            <><GoogleIcon className="w-5 h-5" /> <span>Continue with Google</span></>
          )}
        </button>
      </div>
    </div>
  );
};
