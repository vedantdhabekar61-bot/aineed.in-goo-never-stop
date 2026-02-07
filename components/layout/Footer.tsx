
import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="py-24 border-t border-slate-100 bg-white">
      <div className="container mx-auto px-6 flex flex-col items-center">
        <p className="text-[11px] font-black text-slate-300 mb-10 tracking-[0.4em] uppercase">The AI Search Authority</p>
        <p className="text-[12px] text-slate-400">© 2025 aineed.in. Powered by Google Cloud Intelligence.</p>
      </div>
    </footer>
  );
};
