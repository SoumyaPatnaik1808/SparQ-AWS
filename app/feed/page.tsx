"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle2, Star, ArrowLeftRight, X, Layers } from 'lucide-react';
import { getFeedPosts } from '../actions/feed';

interface Post {
  id: string;
  authorName: string;
  authorTitle: string;
  authorImage: string;
  rating: number;
  swaps: number;
  postTitle: string;
  postDescription: string;
  tags: string[];
  learnItems: string[];
  lookingFor: string;
  barterType: string;
}

function normalizePost(post: Record<string, unknown>): Post {
  return {
    id: String(post.id ?? ''),
    authorName: String(post.authorName ?? ''),
    authorTitle: String(post.authorTitle ?? ''),
    authorImage: String(post.authorImage ?? ''),
    rating: Number(post.rating ?? 0),
    swaps: Number(post.swaps ?? 0),
    postTitle: String(post.postTitle ?? ''),
    postDescription: String(post.postDescription ?? ''),
    tags: Array.isArray(post.tags) ? post.tags.map(String) : [],
    learnItems: Array.isArray(post.learnItems) ? post.learnItems.map(String) : [],
    lookingFor: String(post.lookingFor ?? ''),
    barterType: String(post.barterType ?? ''),
  };
}

function FeedPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const isGuest = searchParams.get('guest') === 'true';

  const [posts, setPosts] = useState<Post[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [matchAnimation, setMatchAnimation] = useState(false);
  const [showGuestModal, setShowGuestModal] = useState(false);
  const [showCommunityDropdown, setShowCommunityDropdown] = useState(false);

  const handlePass = () => {
    setCurrentIndex(prev => prev + 1);
  };

  const handleMatch = () => {
    if (isGuest) {
      setShowGuestModal(true);
    } else {
      setMatchAnimation(true);
      setTimeout(() => {
        setMatchAnimation(false);
        setShowCommunityDropdown(true);
      }, 1000);
    }
  };

  useEffect(() => {
    async function loadPosts() {
      const data = await getFeedPosts();
      setPosts(data.map((post) => normalizePost(post as Record<string, unknown>)));
      setLoading(false);
    }
    loadPosts();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showGuestModal || showCommunityDropdown || matchAnimation) return;
      if (e.key === 'a' || e.key === 'A') handlePass();
      if (e.key === 'd' || e.key === 'D') handleMatch();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleDragEnd = (e: any, info: any) => {
    if (info.offset.x > 100) {
      handleMatch();
    } else if (info.offset.x < -100) {
      handlePass();
    }
  };

  const onJoinCommunity = () => {
    setShowCommunityDropdown(false);
    setCurrentIndex(prev => prev + 1);
  };

  if (loading) {
    return <div className="min-h-screen bg-[#090e0b] flex items-center justify-center text-[#f28b50]">Loading Feed...</div>;
  }

  const currentPost = posts[currentIndex];

  return (
    <div className="min-h-screen bg-[#090e0b] text-white font-sans overflow-hidden flex flex-col relative">
      
      {/* Match Animation Overlay */}
      <AnimatePresence>
        {matchAnimation && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-[#4ade80]/20 flex items-center justify-center pointer-events-none"
          >
            <motion.div 
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.5, opacity: 0 }}
              className="text-5xl md:text-7xl font-black text-[#4ade80] drop-shadow-[0_0_15px_rgba(74,222,128,0.5)] tracking-tighter"
            >
              IT&apos;S A MATCH!
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Guest Modal */}
      <AnimatePresence>
        {showGuestModal && (
          <div className="absolute inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="bg-[#0d1410] border border-[#1a261f] p-8 rounded-2xl max-w-sm w-full shadow-2xl relative text-center"
            >
              <button onClick={() => setShowGuestModal(false)} className="absolute top-4 right-4 text-[#88948d] hover:text-white">
                <X className="w-5 h-5" />
              </button>
              <h3 className="text-2xl font-bold mb-3">Join SparQ to Match</h3>
              <p className="text-[#a0ada6] text-sm mb-6">Create an account or log in to barter skills and join this creator&apos;s community.</p>
              <div className="flex flex-col gap-3">
                <button onClick={() => router.push('/register')} className="bg-[#f28b50] text-black font-semibold py-3 rounded-lg w-full">Sign Up</button>
                <button onClick={() => router.push('/login')} className="bg-[#111914] border border-[#1a261f] text-white font-semibold py-3 rounded-lg w-full">Login</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Community Dropdown Modal */}
      <AnimatePresence>
        {showCommunityDropdown && (
          <div className="absolute inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#111914] border border-[#4ade80]/30 p-8 rounded-2xl max-w-md w-full shadow-[0_0_40px_rgba(74,222,128,0.1)] text-center"
            >
              <div className="w-16 h-16 bg-[#1a261f] rounded-full flex items-center justify-center mx-auto mb-4 border border-[#4ade80]/50">
                <CheckCircle2 className="w-8 h-8 text-[#4ade80]" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Match Successful!</h3>
              <p className="text-[#a0ada6] text-sm mb-8">You are now ready to join {currentPost?.authorName}&apos;s community to start the barter.</p>
              <div className="flex gap-4">
                <button onClick={() => setShowCommunityDropdown(false)} className="flex-1 bg-[#1a261f] text-white font-semibold py-3 rounded-lg">Maybe Later</button>
                <button onClick={onJoinCommunity} className="flex-1 bg-[#4ade80] text-black font-semibold py-3 rounded-lg">Join Community</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Navbar */}
      <header className="border-b border-[#1a261f] bg-[#0d1410] px-6 flex items-center justify-between h-[72px] shrink-0 z-10">
        <div className="flex items-center gap-10 h-full">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push('/')}>
            <div className="text-xl font-bold tracking-tight">SparQ</div>
          </div>
          <nav className="hidden md:flex items-center gap-8 h-full">
            <a href="#" className="text-[#f28b50] font-medium border-b-2 border-[#f28b50] h-full flex items-center">Feed</a>
            <a href="#" className="text-[#88948d] hover:text-white font-medium transition-colors">Community</a>
            <a href="#" className="text-[#88948d] hover:text-white font-medium transition-colors">Calendar</a>
            <a href="#" className="text-[#88948d] hover:text-white font-medium transition-colors">Profile</a>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          {isGuest ? (
            <button onClick={() => router.push('/login')} className="text-sm font-semibold text-white bg-[#1a261f] hover:bg-[#233329] px-4 py-2 rounded-lg transition-colors">
              Login
            </button>
          ) : (
            <div className="w-10 h-10 rounded-full bg-[#1a261f] border border-[#2a3c31] overflow-hidden flex items-center justify-center">
               <span className="text-xs font-bold text-[#88948d]">ME</span>
            </div>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 relative overflow-hidden">
        {currentPost ? (
          <AnimatePresence mode="popLayout">
            <motion.div
              key={currentPost.id}
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, x: -300 }} // Generic exit if needed, usually drag handles it
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              onDragEnd={handleDragEnd}
              whileDrag={{ scale: 1.02, cursor: "grabbing" }}
              className="w-full max-w-[480px] bg-[#0d1410] border border-[#1a261f] rounded-[24px] shadow-2xl overflow-hidden cursor-grab flex flex-col max-h-[80vh]"
            >
              {/* Card Header (Author Info) */}
              <div className="p-4 flex items-center justify-between border-b border-[#1a261f]">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-11 h-11 rounded-full bg-[#1a261f] flex items-center justify-center font-bold">
                      {currentPost.authorName.charAt(0)}
                    </div>
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#4ade80] border-2 border-[#0d1410] rounded-full"></div>
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-[15px]">{currentPost.authorName}</span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#f28b50]" />
                    </div>
                    <span className="text-xs text-[#88948d] font-medium">{currentPost.authorTitle}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 bg-[#111914] border border-[#1a261f] px-2.5 py-1 rounded-full">
                  <Star className="w-3.5 h-3.5 text-[#f28b50] fill-[#f28b50]" />
                  <span className="text-xs font-bold">{currentPost.rating} <span className="text-[#5e6a63] font-normal">({currentPost.swaps} swaps)</span></span>
                </div>
              </div>

              {/* Card Body - Scrollable */}
              <div className="flex-1 overflow-y-auto no-scrollbar pb-6">
                
                {/* Hero Image / Visualization */}
                <div className="h-48 md:h-56 bg-gradient-to-br from-[#152019] to-[#0a0f0c] relative flex items-center justify-center p-6 border-b border-[#1a261f]">
                  <div className="w-full h-full relative opacity-60 flex items-center justify-center">
                    {/* Abstract placeholder for the 3D model image from screenshot */}
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(242,139,80,0.1)_0%,transparent_70%)]"></div>
                    <Layers className="w-16 h-16 text-[#f28b50] opacity-50" />
                  </div>
                  <div className="absolute bottom-3 left-3 bg-[#0d1410]/80 backdrop-blur-md border border-[#1a261f] px-2.5 py-1 rounded text-[10px] font-bold text-[#a0ada6] uppercase tracking-wider flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#f28b50]"></div>
                    {currentPost.tags[0] || "Skill Highlight"}
                  </div>
                </div>

                <div className="p-6">
                  <h2 className="text-2xl font-bold tracking-tight leading-tight mb-3">
                    {currentPost.postTitle}
                  </h2>
                  <p className="text-[#a0ada6] text-[14px] leading-relaxed mb-6 font-medium">
                    {currentPost.postDescription}
                  </p>

                  <div className="mb-6">
                    <h3 className="text-[10px] font-bold text-[#5e6a63] uppercase tracking-[0.2em] mb-3">What You&apos;ll Learn</h3>
                    <ul className="space-y-2.5">
                      {currentPost.learnItems?.map((item: string, i: number) => (
                        <li key={i} className="flex items-start gap-2.5 text-[14px] text-[#d0ddd5] font-medium">
                          <CheckCircle2 className="w-4 h-4 text-[#f28b50] shrink-0 mt-0.5" />
                          <span className="leading-snug">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-[#111914] border border-[#1e2d24] rounded-xl p-4 flex items-center justify-between">
                    <div>
                      <h3 className="text-[9px] font-bold text-[#4ade80] uppercase tracking-widest mb-1">Looking to learn in return</h3>
                      <p className="font-semibold text-[14px] text-white">{currentPost.lookingFor}</p>
                    </div>
                    <div className="bg-[#11241a] border border-[#1e3b2a] text-[#4ade80] text-[11px] font-bold px-2.5 py-1 rounded-md flex items-center gap-1.5">
                      {currentPost.barterType}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        ) : (
          <div className="text-center">
            <div className="w-16 h-16 bg-[#111914] rounded-full flex items-center justify-center mx-auto mb-4 border border-[#1a261f]">
              <ArrowLeftRight className="w-6 h-6 text-[#88948d]" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">You&apos;re all caught up!</h3>
            <p className="text-[#a0ada6] text-sm">Check back later for more barter opportunities.</p>
          </div>
        )}

        {/* Action Buttons */}
        {currentPost && (
          <div className="mt-8 flex flex-col items-center gap-4 w-full max-w-[480px]">
            <div className="flex gap-4 w-full">
              <button 
                onClick={handlePass}
                className="flex-1 bg-[#ef4444] hover:bg-[#dc2626] text-white font-bold py-4 rounded-xl text-[16px] transition-colors shadow-[0_4px_14px_rgba(239,68,68,0.2)]"
              >
                Pass
              </button>
              <button 
                onClick={handleMatch}
                className="flex-1 bg-[#f28b50] hover:bg-[#e0773b] text-black font-bold py-4 rounded-xl text-[16px] transition-colors shadow-[0_4px_14px_rgba(242,139,80,0.2)]"
              >
                Match
              </button>
            </div>
            <div className="hidden md:flex items-center gap-4 text-[11px] font-medium text-[#5e6a63]">
              <span>Press <strong className="text-[#88948d] px-1 bg-[#1a261f] rounded border border-[#2a3c31] ml-1">[A]</strong> to Pass</span>
              <span className="w-1 h-1 rounded-full bg-[#2a3c31]"></span>
              <span><strong className="text-[#88948d] px-1 bg-[#1a261f] rounded border border-[#2a3c31] mr-1">[D]</strong> to Match</span>
            </div>
          </div>
        )}
      </main>
      
      {/* Custom styles for hiding scrollbar */}
      <style dangerouslySetInnerHTML={{__html: `
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />
    </div>
  );
}

export default function FeedPageWrapper() {
  return (
    <React.Suspense fallback={<div className="min-h-screen bg-[#090e0b] flex items-center justify-center text-[#f28b50]">Loading Feed...</div>}>
      <FeedPage />
    </React.Suspense>
  );
}
