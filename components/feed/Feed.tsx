
'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { FeedPost } from '../../types/index';
import { NewspaperIcon, LoaderIcon } from '../common/Icons';

export const Feed: React.FC = () => {
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeed = async () => {
      setLoading(true);
      const { data } = await supabase
        .from('feed_posts')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (data) setPosts(data);
      setLoading(false);
    };
    fetchFeed();
  }, []);

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center">
        <LoaderIcon className="w-10 h-10 text-primary animate-spin mb-4" />
        <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.3em]">Loading Intelligence...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto w-full px-4 animate-in fade-in slide-in-from-bottom-8 duration-500">
      <div className="mb-12 text-center">
        <h2 className="text-3xl font-black text-slate-900 mb-2">The AI Pulse</h2>
        <p className="text-slate-500 font-medium">Daily workflows, automations, and directory updates.</p>
      </div>

      <div className="space-y-12 pb-20">
        {posts.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-slate-100 rounded-3xl bg-slate-50/30">
             <NewspaperIcon className="w-12 h-12 text-slate-200 mx-auto mb-4" />
             <p className="text-slate-300 font-bold uppercase tracking-wider text-[10px]">No updates available yet.</p>
          </div>
        ) : (
          posts.map((post) => (
            <div key={post.id} className="bg-white border border-slate-100 rounded-3xl p-8 hover:border-primary/20 transition-all duration-300 shadow-sm">
              <h3 className="text-xl font-bold text-slate-900 mb-4">{post.title}</h3>
              <p className="text-slate-600 leading-relaxed mb-6">{post.content}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
