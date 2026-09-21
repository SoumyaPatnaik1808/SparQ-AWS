"use client";

import React, { useState } from 'react';
import { Eye, EyeOff, Plus, Check, ArrowRight, CheckCircle2, GraduationCap, Lock } from 'lucide-react';
import { signUpUser } from '../actions/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const TEACH_SKILLS = ["Blender 3D", "Figma UI/UX", "SolidWorks", "PyTorch"];
const LEARN_SKILLS = ["React Native", "WebGL Shaders", "Rust Systems", "Smart Contracts"];

export default function Register() {
  const router = useRouter();
  const [intent, setIntent] = useState<'learn' | 'teach'>('learn');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [selectedTeachSkills, setSelectedTeachSkills] = useState<string[]>(['Blender 3D', 'Figma UI/UX']);
  const [selectedLearnSkills, setSelectedLearnSkills] = useState<string[]>(['React Native', 'WebGL Shaders']);

  const toggleSkill = (skill: string, type: 'teach' | 'learn') => {
    if (type === 'teach') {
      setSelectedTeachSkills(prev =>
        prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
      );
    } else {
      setSelectedLearnSkills(prev =>
        prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
      );
    }
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    formData.append('intent', intent);
    formData.append('skillsToTeach', JSON.stringify(selectedTeachSkills));
    formData.append('skillsToLearn', JSON.stringify(selectedLearnSkills));

    const res = await signUpUser(formData);

    if (res.error) {
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
              Trade craft,<br />not dollars.
            </h1>
            <p className="text-[#88948d] text-[15px] leading-relaxed font-medium">
              The collegiate peer-to-peer knowledge exchange.<br />
              Barter code reviews, 3D renders, and design<br />
              critiques without spending a single dime of fiat<br />
              currency.
            </p>
          </div>
        </div>

        <div className="w-full md:w-[55%] p-8 md:p-12 relative">
          <div className="flex bg-[#111914] border border-[#1a261f] rounded-lg p-1 w-max mx-auto md:mx-0 mb-8">
            <button
              type="button"
              onClick={() => setIntent('learn')}
              className={`px-6 py-2 text-sm font-medium rounded-md transition-colors ${intent === 'learn' ? 'bg-[#1a261f] text-white shadow-sm' : 'text-[#88948d] hover:text-white'}`}
            >
              Learn a skill
            </button>
            <button
              type="button"
              onClick={() => setIntent('teach')}
              className={`px-6 py-2 text-sm font-medium rounded-md transition-colors ${intent === 'teach' ? 'bg-[#1a261f] text-white shadow-sm' : 'text-[#88948d] hover:text-white'}`}
            >
              Teach a skill
            </button>
          </div>

          <div className="flex items-center gap-3 mb-6">
            <div className="h-px bg-[#1a261f] flex-1"></div>
            <span className="text-[10px] font-bold text-[#5e6a63] tracking-widest uppercase">Or register with university credentials</span>
            <div className="h-px bg-[#1a261f] flex-1"></div>
          </div>

          {error && <div className="mb-4 text-red-500 text-sm font-medium text-center bg-red-500/10 py-2 rounded">{error}</div>}

          <form onSubmit={handleRegister} className="space-y-5">
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-[11px] font-bold text-[#5e6a63] tracking-widest uppercase mb-2">First Name</label>
                <input
                  type="text"
                  name="firstName"
                  className="w-full bg-[#0a0f0c] border border-[#1a261f] rounded-lg px-4 py-3 text-[14px] text-white focus:outline-none focus:border-[#f28b50] transition-colors"
                  required
                />
              </div>
              <div className="flex-1">
                <label className="block text-[11px] font-bold text-[#5e6a63] tracking-widest uppercase mb-2">Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  className="w-full bg-[#0a0f0c] border border-[#1a261f] rounded-lg px-4 py-3 text-[14px] text-white focus:outline-none focus:border-[#f28b50] transition-colors"
                  required
                />
              </div>
            </div>

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
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                  <CheckCircle2 className="w-4 h-4 text-[#4ade80]" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#5e6a63] tracking-widest uppercase mb-2">Password</label>
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

            <div className="pt-4">
              <div className="flex justify-between items-center mb-3">
                <span className="text-[10px] font-bold text-[#f28b50] tracking-widest uppercase">Skills I can teach (Outgoing Barter)</span>
                <span className="text-[11px] text-[#5e6a63]">{selectedTeachSkills.length} selected</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {TEACH_SKILLS.map(skill => (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => toggleSkill(skill, 'teach')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-[13px] font-medium border transition-colors ${
                      selectedTeachSkills.includes(skill)
                        ? 'bg-[#f28b50] text-black border-[#f28b50]'
                        : 'bg-[#111914] text-[#88948d] border-[#1a261f] hover:border-[#3a4640]'
                    }`}
                  >
                    {skill} {selectedTeachSkills.includes(skill) ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                  </button>
                ))}
                <button type="button" className="flex items-center gap-1.5 px-3 py-1.5 rounded text-[13px] font-medium border bg-[#111914] text-[#88948d] border-[#1a261f] hover:border-[#3a4640] border-dashed">
                  <Plus className="w-3.5 h-3.5" /> Add
                </button>
              </div>
            </div>

            <div className="pb-4">
              <div className="flex justify-between items-center mb-3">
                <span className="text-[10px] font-bold text-white tracking-widest uppercase">Skills I want to learn (Incoming Desired)</span>
                <span className="text-[11px] text-[#5e6a63]">{selectedLearnSkills.length} selected</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {LEARN_SKILLS.map(skill => (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => toggleSkill(skill, 'learn')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-[13px] font-medium border transition-colors ${
                      selectedLearnSkills.includes(skill)
                        ? 'bg-[#111914] text-white border-[#f28b50]'
                        : 'bg-[#111914] text-[#88948d] border-[#1a261f] hover:border-[#3a4640]'
                    }`}
                  >
                    {skill} {selectedLearnSkills.includes(skill) ? <Check className="w-3.5 h-3.5 text-[#f28b50]" /> : <Plus className="w-3.5 h-3.5" />}
                  </button>
                ))}
                <button type="button" className="flex items-center gap-1.5 px-3 py-1.5 rounded text-[13px] font-medium border bg-[#111914] text-[#88948d] border-[#1a261f] hover:border-[#3a4640] border-dashed">
                  <Plus className="w-3.5 h-3.5" /> Add
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#f28b50] hover:bg-[#e0773b] text-black py-4 rounded-lg text-[15px] font-semibold transition-colors flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
            >
              {loading ? 'Processing...' : (
                <>
                  Complete Registration <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <p className="text-center text-[#88948d] text-sm pt-1">
              Already have an account?{' '}
              <Link href="/login" className="text-[#f28b50] hover:underline">Sign in</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
