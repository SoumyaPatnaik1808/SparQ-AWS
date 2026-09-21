"use client";

import React, { useState } from 'react';
import { Eye, EyeOff, ArrowRight, CheckCircle2, GraduationCap, Lock } from 'lucide-react';
import { loginUser } from '../actions/login';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Login() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const res = await loginUser(formData);

    if (res && 'error' in res && res.error) {
      setError(res.error);
      setLoading(false);
      return;
    }

    setLoading(false);
    router.push('/feed');
  };

  return (
    <div className="min-h-screen bg-[#060907] flex items-center justify-center p-4 sm:p-8 font-sans text-white">
      <div className="max-w-[1000px] w-full bg-[#0d1410] border border-[#1a261f] rounded-2xl flex flex-col md:flex-row overflow-hidden shadow-2xl">
        <div className="w-full md:w-[45%] bg-[#0a0f0c] p-8 md:p-12 border-r border-[#1a261f] flex flex-col relative">
          <Link href="/" className="flex items-center gap-2 mb-12">
            <div className="w-8 h-8 bg-white rounded flex items-center justify-center">
              <div className="text-black font-bold text-xs tracking-tighter">SparQ</div>
            </div>
            <span className="text-xl font-semibold tracking-tight">SparQ</span>
          </Link>

          <div className="mt-auto md:mt-20">
            <h1 className="text-4xl md:text-[40px] font-bold tracking-tight leading-[1.1] mb-6">
              Welcome back to<br />the exchange.
            </h1>
            <p className="text-[#88948d] text-[15px] leading-relaxed font-medium">
              Continue your peer-to-peer barter journey.<br />
              Access your upcoming sessions, review new matches, and keep trading skills.
            </p>
          </div>
        </div>

        <div className="w-full md:w-[55%] p-8 md:p-12 relative flex flex-col justify-center">
          <div className="mb-8">
            <h2 className="text-2xl font-bold tracking-tight mb-2">Login to SparQ</h2>
            <p className="text-[#88948d] text-sm">
              Don&apos;t have an account?{' '}
              <Link href="/register" className="text-[#f28b50] hover:underline">Sign up</Link>
            </p>
          </div>

          <div className="flex items-center gap-3 mb-6">
            <div className="h-px bg-[#1a261f] flex-1"></div>
            <span className="text-[10px] font-bold text-[#5e6a63] tracking-widest uppercase">Or login with university credentials</span>
            <div className="h-px bg-[#1a261f] flex-1"></div>
          </div>

          {error && <div className="mb-4 text-red-500 text-sm font-medium text-center bg-red-500/10 py-2 rounded">{error}</div>}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-[11px] font-bold text-[#5e6a63] tracking-widest uppercase mb-2">Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <GraduationCap className="w-4 h-4 text-[#88948d]" />
                </div>
                <input
                  type="email"
                  name="email"
                  className="w-full bg-[#0a0f0c] border border-[#1a261f] rounded-lg pl-10 pr-10 py-3 text-[14px] text-white focus:outline-none focus:border-[#f28b50] transition-colors"
                  required
                />
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none opacity-100 transition-opacity">
                  <CheckCircle2 className="w-4 h-4 text-[#4ade80]" />
                </div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-[11px] font-bold text-[#5e6a63] tracking-widest uppercase">Password</label>
                <a href="#" className="text-[11px] text-[#f28b50] hover:underline">Forgot password?</a>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="w-4 h-4 text-[#88948d]" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  className="w-full bg-[#0a0f0c] border border-[#1a261f] rounded-lg pl-10 pr-10 py-3 text-[14px] text-white focus:outline-none focus:border-[#f28b50] transition-colors"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center"
                >
                  {showPassword ? <EyeOff className="w-4 h-4 text-[#88948d] hover:text-white transition-colors" /> : <Eye className="w-4 h-4 text-[#88948d] hover:text-white transition-colors" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#f28b50] hover:bg-[#e0773b] text-black py-4 rounded-lg text-[15px] font-semibold transition-colors flex items-center justify-center gap-2 mt-6 disabled:opacity-50"
            >
              {loading ? 'Logging in...' : (
                <>
                  Login <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
