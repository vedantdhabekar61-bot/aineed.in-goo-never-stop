
'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { FeedPost } from '../types';
import { SparklesIcon, NewspaperIcon, LoaderIcon, ArrowRightIcon } from './Icons';

export const Feed: React.FC = () => {
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeed();
  }, []);

  const fetchFeed = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('feed_posts')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) setPosts(data);
    setLoading(false);
  };

  const handleLike = async (postId: string) => {
    // Optimistic UI update or real update logic here
    console.log('Liked post:', postId);
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center">
        <LoaderIcon className="w-10 h-10 text-[#5D5CDE] animate-spin mb-4" />
        <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Loading Intelligence...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto w-full px-4 animate-in fade-in slide-in-from-bottom-8 duration-500">
      <div className="mb-12 text-center">
        <h2 className="text-3xl font-black text-slate-900 mb-2">The AI Pulse</h2>
        <p className="text-slate-500 font-medium">Daily workflows, automations, and directory updates.</p>
      </div>

      <div className="relative border-l-2 border-slate-100 ml-4 md:ml-0 md:pl-0 pl-8 space-y-12 pb-20">
        {posts.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-slate-100 rounded-3xl">
             <NewspaperIcon className="w-12 h-12 text-slate-200 mx-auto mb-4" />
             <p className="text-slate-400 font-bold uppercase tracking-wider text-xs">No updates in the pulse yet.</p>
          </div>
        ) : (
          posts.map((post, idx) => (
            <div key={post.id} className="relative pl-8 group">
              {/* Dot */}
              <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-white border-2 border-[#5D5CDE] group-hover:scale-125 transition-transform" />
              
              <div className="mb-1 text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                {new Date(post.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                <span className="w-1 h-1 bg-slate-200 rounded-full" />
                <span className={`
                  ${post.type === 'workflow' ? 'text-indigo-500' : ''}
                  ${post.type === 'automation' ? 'text-emerald-500' : ''}
                  ${post.type === 'announcement' ? 'text-amber-500' : ''}
                `}>
                  {post.type}
                </span>
              </div>

              <div className="bg-white border border-slate-100 rounded-3xl p-6 md:p-8 hover:border-[#5D5CDE]/30 transition-all duration-300 hover:shadow-[0_20px_50px_rgba(0,0,0,0.03)]">
                <h3 className="text-xl font-bold text-slate-900 mb-4">{post.title}</h3>
                <div className="text-slate-600 font-medium leading-relaxed mb-6 whitespace-pre-wrap text-sm">
                  {post.content}
                </div>

                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => handleLike(post.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-50 hover:bg-red-50 hover:text-red-500 text-slate-500 rounded-xl text-xs font-bold transition-all border border-slate-100 hover:border-red-100"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                    Like
                  </button>
                  <button 
                    onClick={() => navigator.clipboard.writeText(post.content)}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-50 hover:bg-indigo-50 hover:text-[#5D5CDE] text-slate-500 rounded-xl text-xs font-bold transition-all border border-slate-100 hover:border-indigo-100"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                    Copy content
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
