"use client";

import React from 'react';
import { ArrowRight, ArrowLeftRight, Layers, Users, Zap, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  // Animation Variants
  const fadeUpVariant = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' as const } }
  } as const;

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  } as const;

  const scaleIn = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: 'easeOut' as const } }
  } as const;

  return (
    <div className="min-h-screen bg-[#090e0b] text-white font-sans selection:bg-[#f28b50] selection:text-black overflow-x-hidden">
      
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white rounded flex items-center justify-center">
            <div className="text-black font-bold text-xs tracking-tighter">SparQ</div>
          </div>
          <span className="text-xl font-semibold tracking-tight hidden sm:block">SparQ</span>
        </div>
        <button 
          onClick={() => router.push('/feed?guest=true')}
          className="text-sm font-semibold text-[#88948d] hover:text-white transition-colors border border-[#1a261f] hover:border-[#f28b50] bg-[#111914] hover:bg-[#152019] px-4 py-2 rounded-lg"
        >
          Explore as Guest
        </button>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 max-w-5xl mx-auto flex flex-col items-center text-center">
        {/* Subtle radial gradient background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-[#152019]/40 to-transparent rounded-full blur-[80px] pointer-events-none"></div>
        
        <motion.h1 
          initial="hidden"
          animate="visible"
          variants={fadeUpVariant}
          className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 z-10 leading-[1.1]"
        >
          Trade Knowledge.<br/>
          <span className="text-[#f28b50] italic">Keep Your Cash.</span>
        </motion.h1>
        
        <motion.p 
          initial="hidden"
          animate="visible"
          variants={fadeUpVariant}
          transition={{ delay: 0.1 }}
          className="text-[#a0ada6] max-w-2xl text-lg md:text-xl mb-10 z-10 leading-relaxed font-medium"
        >
          The peer-to-peer barter platform where college students trade 3D
          modeling, coding, design, and audio skills. Zero cash, 100% student-powered.
        </motion.p>
        
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={fadeUpVariant}
          transition={{ delay: 0.2 }}
          className="flex flex-col sm:flex-row gap-4 z-10"
        >
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push('/register')}
            className="flex items-center justify-center gap-2 bg-[#f28b50] hover:bg-[#e0773b] text-black font-semibold px-8 py-3.5 rounded-lg transition-colors"
          >
            Get Started (Sign Up) <ArrowRight className="w-5 h-5" />
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push('/login')}
            className="flex items-center justify-center gap-2 bg-[#111914] hover:bg-[#1a261f] border border-[#1a261f] text-white font-semibold px-8 py-3.5 rounded-lg transition-colors"
          >
            Login
          </motion.button>
        </motion.div>
      </section>

      {/* Swap Visualization Section */}
      <section className="py-24 px-6 bg-[#090e0b]">
        <div className="max-w-5xl mx-auto flex flex-col items-center">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeUpVariant}
            className="text-center mb-16"
          >
            <p className="text-[#f28b50] text-[11px] font-bold tracking-[0.2em] uppercase mb-4">Real-Time Campus Matching</p>
            <h2 className="text-3xl md:text-[40px] font-bold mb-4 tracking-tight">How a SparQ Barter Works</h2>
            <p className="text-[#a0ada6] font-medium">Equitable, hour-for-hour knowledge trading with zero currency exchanged.</p>
          </motion.div>

          <div className="relative w-full max-w-[900px] bg-[#0d1410] border border-[#1a261f] rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 shadow-2xl">
            
            {/* Left Card */}
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="flex-1 w-full bg-[#111914] border border-[#1a261f] rounded-xl p-5 md:p-6 shadow-lg relative group"
            >
              <div className="flex justify-between items-start mb-6">
                <span className="bg-[#11241a] text-[#4ade80] text-xs font-semibold px-2.5 py-1 rounded border border-[#1e3b2a]">Offering Skill</span>
                <span className="text-xs text-[#a0ada6]">Stanford &middot; Class of &apos;26</span>
              </div>
              
              <div className="flex items-center gap-3 mb-6">
                <div className="w-11 h-11 rounded-full bg-[#1a261f] flex items-center justify-center text-sm font-bold text-[#d0ddd5]">EV</div>
                <div>
                  <p className="text-[15px] font-bold">Elena V.</p>
                  <p className="text-[13px] text-[#a0ada6]">Product Design & 3D</p>
                </div>
              </div>

              <div className="bg-[#152019] p-5 rounded-lg border border-[#1a261f] group-hover:border-[#4ade80]/30 transition-colors">
                <p className="text-[#f28b50] text-[10px] font-bold tracking-widest mb-2.5 uppercase">Skill Offered</p>
                <p className="font-semibold text-[15px] mb-2 leading-snug">Blender 3D Modeling & Topology</p>
                <p className="text-[13px] text-[#a0ada6] leading-relaxed">Geometry nodes optimization and critique for interactive web runtimes.</p>
              </div>
            </motion.div>

            {/* Swap Icon Middle */}
            <motion.div 
              initial={{ scale: 0, rotate: -180 }}
              whileInView={{ scale: 1, rotate: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.3 }}
              className="flex-shrink-0 z-10 bg-[#152019] border-4 border-[#0d1410] rounded-full p-4 shadow-xl relative -my-4 md:-mx-4 md:my-0"
            >
              <ArrowLeftRight className="w-6 h-6 text-[#f28b50]" />
              <p className="text-[10px] text-center font-bold text-[#a0ada6] mt-1 uppercase tracking-wider absolute -bottom-6 left-1/2 -translate-x-1/2 w-max">1:1 Swap</p>
            </motion.div>

            {/* Right Card */}
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
              className="flex-1 w-full bg-[#111914] border border-[#1a261f] rounded-xl p-5 md:p-6 shadow-lg group"
            >
              <div className="flex justify-between items-start mb-6">
                <span className="bg-[#2a170d] text-[#f28b50] text-xs font-semibold px-2.5 py-1 rounded border border-[#3f2214]">Exchanging For</span>
                <span className="text-xs text-[#a0ada6]">MIT &middot; Class of &apos;25</span>
              </div>
              
              <div className="flex items-center gap-3 mb-6">
                <div className="w-11 h-11 rounded-full bg-[#1a261f] flex items-center justify-center text-sm font-bold text-[#d0ddd5]">DK</div>
                <div>
                  <p className="text-[15px] font-bold">Devlin K.</p>
                  <p className="text-[13px] text-[#a0ada6]">EECS & Systems</p>
                </div>
              </div>

              <div className="bg-[#152019] p-5 rounded-lg border border-[#1a261f] group-hover:border-[#f28b50]/30 transition-colors">
                <p className="text-[#f28b50] text-[10px] font-bold tracking-widest mb-2.5 uppercase">Skill Returned</p>
                <p className="font-semibold text-[15px] mb-2 leading-snug">Rust Systems & Async Concurrency</p>
                <p className="text-[13px] text-[#a0ada6] leading-relaxed">Memory profiling with Valgrind, Tokio async tuning, and compiler guidance.</p>
              </div>
            </motion.div>

            {/* Footer of Card Container */}
            <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6 }}
              className="absolute bottom-4 left-6 right-6 pt-4 border-t border-[#1a261f] flex flex-col md:flex-row justify-between items-center gap-4 text-[11px] font-medium text-[#a0ada6] opacity-0 md:opacity-100 hidden md:flex"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-1.5 h-1.5 rounded-full bg-[#4ade80] animate-pulse"></div>
                Direct 2-hour synchronous session verified by both students
              </div>
              <div>
                Cost: <span className="text-[#f28b50]">$0.00</span> - Zero transaction fees
              </div>
            </motion.div>
            
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6 bg-[#090e0b]">
        <div className="max-w-[1100px] mx-auto">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeUpVariant}
            className="mb-16 md:ml-4"
          >
            <p className="text-[#f28b50] text-[11px] font-bold tracking-[0.2em] uppercase mb-4">Designed for Campus Life</p>
            <h2 className="text-3xl md:text-[44px] font-bold mb-6 max-w-2xl leading-[1.1] tracking-tight">Three Powerful Ways to Barter</h2>
            <p className="text-[#a0ada6] max-w-2xl text-[17px] leading-relaxed font-medium">
              No convoluted point schemes or monetary tokens. Just simple, student-first mechanics built for real collaboration.
            </p>
          </motion.div>

          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {/* Feature 1 */}
            <motion.div variants={fadeUpVariant} className="bg-[#0f1712] border border-[#1a261f] rounded-2xl p-8 flex flex-col h-full hover:border-[#2a3c31] transition-all hover:-translate-y-2 shadow-lg">
              <div className="w-12 h-12 bg-[#152019] border border-[#1a261f] rounded-xl flex items-center justify-center mb-6 shadow-sm">
                <Layers className="w-5 h-5 text-[#f28b50]" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#a0ada6] bg-[#152019] border border-[#1a261f] px-2.5 py-1 rounded w-max mb-5">Card Format</span>
              <h3 className="text-[22px] font-bold mb-4 tracking-tight">Concept Decks</h3>
              <p className="text-[#88948d] text-[15px] leading-relaxed mb-8 font-medium">
                Swipeable skill cards designed for effortless browsing. Bundle what you can teach and what you want to learn into sleek modular cards.
              </p>
              
              <ul className="space-y-3.5 mb-10 mt-auto">
                <li className="flex items-start gap-3 text-[14px] text-[#a0ada6] font-medium">
                  <CheckCircle2 className="w-4 h-4 text-[#f28b50] flex-shrink-0 mt-0.5" />
                  <span>Instant card creation with clear specs</span>
                </li>
                <li className="flex items-start gap-3 text-[14px] text-[#a0ada6] font-medium">
                  <CheckCircle2 className="w-4 h-4 text-[#f28b50] flex-shrink-0 mt-0.5" />
                  <span>Auto-matches with compatible campus needs</span>
                </li>
                <li className="flex items-start gap-3 text-[14px] text-[#a0ada6] font-medium">
                  <CheckCircle2 className="w-4 h-4 text-[#f28b50] flex-shrink-0 mt-0.5" />
                  <span>Verified portfolio link previews</span>
                </li>
              </ul>
              
              <div className="pt-6 border-t border-[#1a261f] flex items-center justify-between mt-auto">
                <span className="text-[13px] text-[#88948d] font-medium">Async or in-person</span>
                <a href="#" className="text-[13px] font-semibold text-white hover:text-[#f28b50] transition-colors flex items-center gap-1.5">
                  Learn more <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </motion.div>

            {/* Feature 2 */}
            <motion.div variants={fadeUpVariant} className="bg-[#0f1712] border border-[#1a261f] rounded-2xl p-8 flex flex-col h-full hover:border-[#2a3c31] transition-all hover:-translate-y-2 shadow-lg">
              <div className="w-12 h-12 bg-[#152019] border border-[#1a261f] rounded-xl flex items-center justify-center mb-6 shadow-sm">
                <Users className="w-5 h-5 text-[#f28b50]" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#a0ada6] bg-[#152019] border border-[#1a261f] px-2.5 py-1 rounded w-max mb-5">Live & Collaborative</span>
              <h3 className="text-[22px] font-bold mb-4 tracking-tight">Scheduled Workshops</h3>
              <p className="text-[#88948d] text-[15px] leading-relaxed mb-8 font-medium">
                Live peer study lounges, design critiques, and late-night studio rooms. Host a group session or hop into someone else&apos;s open room.
              </p>
              
              <ul className="space-y-3.5 mb-10 mt-auto">
                <li className="flex items-start gap-3 text-[14px] text-[#a0ada6] font-medium">
                  <CheckCircle2 className="w-4 h-4 text-[#f28b50] flex-shrink-0 mt-0.5" />
                  <span>Audio & screen-sharing co-working tables</span>
                </li>
                <li className="flex items-start gap-3 text-[14px] text-[#a0ada6] font-medium">
                  <CheckCircle2 className="w-4 h-4 text-[#f28b50] flex-shrink-0 mt-0.5" />
                  <span>Library & dorm geofenced broadcast alerts</span>
                </li>
                <li className="flex items-start gap-3 text-[14px] text-[#a0ada6] font-medium">
                  <CheckCircle2 className="w-4 h-4 text-[#f28b50] flex-shrink-0 mt-0.5" />
                  <span>Group critiques for finals & portfolio review</span>
                </li>
              </ul>
              
              <div className="pt-6 border-t border-[#1a261f] flex items-center justify-between mt-auto">
                <span className="text-[13px] text-[#88948d] font-medium">Up to 10 peers</span>
                <a href="#" className="text-[13px] font-semibold text-white hover:text-[#f28b50] transition-colors flex items-center gap-1.5">
                  Learn more <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </motion.div>

            {/* Feature 3 */}
            <motion.div variants={fadeUpVariant} className="bg-[#0f1712] border border-[#1a261f] rounded-2xl p-8 flex flex-col h-full hover:border-[#2a3c31] transition-all hover:-translate-y-2 shadow-lg">
              <div className="w-12 h-12 bg-[#152019] border border-[#1a261f] rounded-xl flex items-center justify-center mb-6 shadow-sm">
                <Zap className="w-5 h-5 text-[#f28b50]" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#a0ada6] bg-[#152019] border border-[#1a261f] px-2.5 py-1 rounded w-max mb-5">Coming Soon</span>
              <h3 className="text-[22px] font-bold mb-4 tracking-tight">Domain Duels</h3>
              <p className="text-[#88948d] text-[15px] leading-relaxed mb-8 font-medium">
                60-second micro-challenges and fast peer icebreakers to confirm domain proficiency before kicking off a collaborative project.
              </p>
              
              <ul className="space-y-3.5 mb-10 mt-auto">
                <li className="flex items-start gap-3 text-[14px] text-[#a0ada6] font-medium">
                  <CheckCircle2 className="w-4 h-4 text-[#f28b50] flex-shrink-0 mt-0.5" />
                  <span>Quick 1-minute blind problem solving</span>
                </li>
                <li className="flex items-start gap-3 text-[14px] text-[#a0ada6] font-medium">
                  <CheckCircle2 className="w-4 h-4 text-[#f28b50] flex-shrink-0 mt-0.5" />
                  <span>Earn verifiable peer recommendation badges</span>
                </li>
                <li className="flex items-start gap-3 text-[14px] text-[#a0ada6] font-medium">
                  <CheckCircle2 className="w-4 h-4 text-[#f28b50] flex-shrink-0 mt-0.5" />
                  <span>Zero pressure, collaborative learning formats</span>
                </li>
              </ul>
              
              <div className="pt-6 border-t border-[#1a261f] flex items-center justify-between mt-auto">
                <span className="text-[13px] text-[#88948d] font-medium">Instant badge rating</span>
                <a href="#" className="text-[13px] font-semibold text-white hover:text-[#f28b50] transition-colors flex items-center gap-1.5">
                  Learn more <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </motion.div>
            
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="pt-32 pb-40 px-6 bg-[#090e0b] flex flex-col items-center text-center">
        <motion.h2 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={scaleIn}
          className="text-3xl md:text-[40px] font-bold mb-6 max-w-2xl leading-[1.15] tracking-tight"
        >
          Ready to trade skills without spending a dime?
        </motion.h2>
        <motion.p 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUpVariant}
          transition={{ delay: 0.1 }}
          className="text-[#a0ada6] max-w-xl text-[17px] mb-10 leading-relaxed font-medium"
        >
          Join thousands of university peers sharing mastery across computer science, engineering, visual arts, music, and writing.
        </motion.p>
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUpVariant}
          transition={{ delay: 0.2 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push('/register')}
            className="bg-[#f28b50] hover:bg-[#e0773b] text-black font-semibold px-8 py-3.5 rounded-lg transition-colors text-[15px]"
          >
            Create Your Student Profile
          </motion.button>
        </motion.div>
      </section>
      
    </div>
  );
}
