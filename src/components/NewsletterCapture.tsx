
'use client';

import React, { useState } from 'react';
import { ArrowRightIcon } from './Icons';

export const NewsletterCapture = () => {
    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [visible, setVisible] = useState(true);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Here you would integrate with your newsletter service (e.g., ConvertKit, Mailchimp)
        console.log('Newsletter subscription for:', email);
        setSubmitted(true);
        setTimeout(() => setVisible(false), 2000);
    };

    if (!visible) return null;

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] w-full max-w-lg px-4 animate-in slide-in-from-bottom-10 duration-500">
            <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-premium">
                {submitted ? (
                     <div className="text-center p-4 text-white font-bold">
                        🎉 Thanks for subscribing!
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="flex items-center gap-4">
                        <div className="flex-grow">
                            <label htmlFor="email-subscribe" className="sr-only">Email address</label>
                            <input
                                type="email"
                                id="email-subscribe"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full bg-transparent text-white placeholder:text-slate-400 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50 rounded-lg"
                                placeholder="Get the top 5 new AI tools weekly"
                            />
                        </div>
                        <button 
                            type="submit"
                            className="p-3 bg-primary text-white rounded-xl hover:bg-primary/80 transition-all active:scale-95 disabled:bg-slate-700"
                            disabled={!email}
                            aria-label="Subscribe to newsletter"
                        >
                            <ArrowRightIcon className="w-5 h-5" />
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};
