
'use client';

import React from 'react';
import { XIcon } from '../common/Icons';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  return (
    <div className={`fixed inset-y-0 right-0 w-80 bg-white border-l border-slate-100 shadow-premium z-[70] transition-transform duration-500 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
      <div className="p-8 h-full flex flex-col">
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-xl font-bold">Saved Tools</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-xl"><XIcon /></button>
        </div>
        <div className="flex-grow text-center py-20 text-slate-300">
          <p className="text-sm">Save tools to build your custom AI workflow.</p>
        </div>
      </div>
    </div>
  );
};
