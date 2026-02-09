
'use client';

import React from 'react';
import { SparklesIcon, StarIcon } from '../../components/Icons';
import Link from 'next/link';

const PricingTier = ({ title, price, description, features, isFeatured = false }: any) => (
    <div className={`relative p-8 md:p-10 rounded-3xl border transition-all duration-300 ${isFeatured ? 'bg-primary/5 border-primary/50 shadow-soft' : 'bg-white border-slate-200'}`}>
        {isFeatured && (
            <div className="absolute top-0 right-8 -translate-y-1/2 bg-primary text-white px-5 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest shadow-glow">
                Most Popular
            </div>
        )}
        <h3 className="text-2xl font-bold text-slate-900 mb-2">{title}</h3>
        <p className={`mb-8 font-medium ${isFeatured ? 'text-primary' : 'text-slate-500'}`}>{description}</p>
        
        <div className="mb-10">
            <span className="text-5xl font-black text-slate-900 tracking-tight">{price}</span>
            {title !== 'Free' && <span className="text-slate-400 font-medium">/ submission</span>}
        </div>

        <ul className="space-y-4 mb-12">
            {features.map((feature: string, i: number) => (
                <li key={i} className="flex items-center gap-3">
                    <div className={`w-5 h-5 flex items-center justify-center rounded-full shrink-0 ${isFeatured ? 'bg-primary/20' : 'bg-slate-100'}`}>
                        <svg className={`w-3.5 h-3.5 ${isFeatured ? 'text-primary' : 'text-slate-500'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6 9 17l-5-5"></path></svg>
                    </div>
                    <span className="font-medium text-slate-600">{feature}</span>
                </li>
            ))}
        </ul>
        
        <a 
            href="mailto:submissions@aineed.in" 
            className={`w-full block text-center py-4 rounded-2xl font-bold text-[13px] transition-all shadow-lg ${isFeatured ? 'bg-primary text-white hover:bg-primary/90 shadow-primary/20' : 'bg-slate-900 text-white hover:bg-slate-800 shadow-slate-200'}`}
        >
            {isFeatured ? 'Get Fast Tracked' : 'Submit for Review'}
        </a>
    </div>
);

export default function SubmitPage() {
    return (
        <div className="min-h-screen bg-white">
            {/* Simple Nav */}
            <nav className="fixed top-6 inset-x-0 z-50 flex justify-center px-4">
                <div className="w-full max-w-5xl bg-white/70 backdrop-blur-2xl border border-slate-200/50 rounded-2xl shadow-premium px-6 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center text-white shadow-glow group-hover:rotate-12 transition-all duration-500">
                            <SparklesIcon className="w-5 h-5" />
                        </div>
                        <span className="text-xl font-black tracking-tighter text-slate-900">aineed.in</span>
                    </Link>
                </div>
            </nav>

            <main className="container mx-auto px-6 pt-48 pb-32 flex flex-col items-center">
                <div className="text-center mb-20 max-w-4xl">
                    <h1 className="text-6xl md:text-8xl font-black text-slate-900 mb-6 tracking-tighter">
                       Get Featured.
                    </h1>
                    <p className="text-lg md:text-xl text-slate-500 font-medium mx-auto leading-relaxed">
                       Submit your AI tool to our directory. Reach thousands of developers, founders, and innovators actively looking for solutions like yours.
                    </p>
                </div>

                <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8">
                    <PricingTier
                        title="Standard Review"
                        price="Free"
                        description="Get listed in our directory after a standard review process."
                        features={[
                            "Basic directory listing",
                            "Standard review queue",
                            "Wait time: 2-4 weeks",
                        ]}
                    />
                     <PricingTier
                        title="Fast Track"
                        price="$9"
                        description="Expedite your review and get premium placement."
                        features={[
                            "Guaranteed 24-hour review",
                            "Featured on AI Pulse for 7 days",
                            "Top placement in relevant searches",
                            "Direct feedback from our team",
                        ]}
                        isFeatured={true}
                    />
                </div>
            </main>
        </div>
    );
}
