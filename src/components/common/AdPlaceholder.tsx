
'use client';

import React from 'react';
import Link from 'next/link';
import { SparklesIcon } from './Icons';

export const AdPlaceholder = () => {
    return (
        <div className="group relative bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl p-8 hover:border-primary/50 transition-all duration-300 flex flex-col items-center justify-center text-center h-full hover:bg-white animate-in fade-in zoom-in-95">
            <div className="w-14 h-14 bg-primary/5 rounded-2xl flex items-center justify-center mb-6 border border-primary/10 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
                <SparklesIcon className="w-7 h-7 text-primary" />
            </div>
            <h4 className="text-lg font-bold text-slate-800 mb-2">Promote Your AI Tool</h4>
            <p className="text-slate-500 mb-6 font-medium">Get your solution in front of thousands of builders and innovators.</p>
            <Link href="/submit" className="px-6 py-3 bg-primary text-white rounded-xl text-[13px] font-black tracking-widest uppercase hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">
                Advertise Here
            </Link>
        </div>
    );
};
