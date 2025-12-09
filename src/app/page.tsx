'use client';

import Image from 'next/image';
import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// Lazy load the Chatbot for faster initial page load
const Chatbot = dynamic(() => import('../components/Chatbot'), {
  loading: () => (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 h-[600px] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-600">Loading Digital Bob...</p>
      </div>
    </div>
  ),
  ssr: false
});

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
      <div className="relative z-10 flex min-h-screen">
        {/* Left side - Digital Bob Avatar */}
        <div className="hidden lg:flex w-[400px] flex-col items-center justify-center p-8 border-r border-white/10">
          {/* Avatar with glow effect */}
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition duration-500"></div>
            <div className="relative w-[280px] h-[350px] rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl">
              <Image
                src="/bob-3d-avatar.png"
                alt="Digital Bob"
                fill
                className="object-cover"
                priority
                sizes="280px"
              />
            </div>
          </div>
          
          {/* Name and title */}
          <div className="mt-6 text-center">
            <h1 className="text-3xl font-bold text-white tracking-tight">Digital Bob</h1>
            <p className="text-blue-300 mt-1">Bob Hackney</p>
            <div className="flex items-center justify-center gap-2 mt-3 flex-wrap">
              <span className="px-3 py-1 bg-blue-500/20 text-blue-300 text-sm rounded-full border border-blue-500/30">CTO/CPO</span>
              <span className="px-3 py-1 bg-green-500/20 text-green-300 text-sm rounded-full border border-green-500/30">US Marine</span>
            </div>
            <p className="text-slate-400 text-sm mt-4 max-w-[280px]">
              2025 ORBIE Finalist • 25+ years tech leadership
            </p>
          </div>

          {/* Expertise areas */}
          <div className="mt-6 space-y-2 w-full max-w-[300px]">
            <div className="flex items-start gap-2 text-left">
              <span className="text-cyan-400 mt-0.5">▸</span>
              <p className="text-slate-300 text-sm">Value Creation in PE-backed organizations</p>
            </div>
            <div className="flex items-start gap-2 text-left">
              <span className="text-cyan-400 mt-0.5">▸</span>
              <p className="text-slate-300 text-sm">15+ Data Center migrations into AWS & GCP</p>
            </div>
            <div className="flex items-start gap-2 text-left">
              <span className="text-cyan-400 mt-0.5">▸</span>
              <p className="text-slate-300 text-sm">Cloud Operational Transformation</p>
            </div>
            <div className="flex items-start gap-2 text-left">
              <span className="text-cyan-400 mt-0.5">▸</span>
              <p className="text-slate-300 text-sm">SRE & FinOps Evangelist</p>
            </div>
          </div>

          {/* Quick stats */}
          <div className="mt-6 grid grid-cols-3 gap-3 w-full max-w-[300px]">
            <div className="bg-white/5 rounded-lg p-3 text-center border border-white/10">
              <p className="text-2xl font-bold text-white">133%</p>
              <p className="text-xs text-slate-400">R&D Velocity</p>
            </div>
            <div className="bg-white/5 rounded-lg p-3 text-center border border-white/10">
              <p className="text-2xl font-bold text-white">15+</p>
              <p className="text-xs text-slate-400">Cloud Migrations</p>
            </div>
            <div className="bg-white/5 rounded-lg p-3 text-center border border-white/10">
              <p className="text-2xl font-bold text-white">25+</p>
              <p className="text-xs text-slate-400">Years Leadership</p>
            </div>
          </div>
        </div>

        {/* Right side - Chat Interface */}
        <div className="flex-1 flex flex-col items-center justify-center p-4 lg:p-8">
          {/* Mobile header */}
          <div className="lg:hidden flex items-center gap-4 mb-4">
            <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-blue-400 shadow-lg">
              <Image 
                src="/bob-3d-avatar.png" 
                alt="Digital Bob" 
                fill
                className="object-cover"
                priority
                sizes="64px"
              />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Digital Bob</h1>
              <p className="text-blue-300 text-sm">CTO/CPO • US Marine • PE Value Creator</p>
            </div>
          </div>

          {/* Chat container */}
          <div className="w-full max-w-2xl">
            <Suspense fallback={
              <div className="w-full bg-white rounded-xl shadow-lg h-[600px] flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            }>
          <Chatbot />
            </Suspense>
          </div>

          {/* Quick prompts */}
          <div className="mt-4 flex flex-wrap justify-center gap-2 max-w-2xl">
            <QuickPrompt text="Tell me about your leadership style" />
            <QuickPrompt text="What's your playbook?" />
            <QuickPrompt text="ORBIE Award" />
            <QuickPrompt text="Your family" />
          </div>
        </div>
      </div>
    </main>
  );
} 

function QuickPrompt({ text }: { text: string }) {
  const handleClick = () => {
    const input = document.getElementById('chat-input') as HTMLInputElement;
    if (input) {
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
      nativeInputValueSetter?.call(input, text);
      input.dispatchEvent(new Event('input', { bubbles: true }));
      
      setTimeout(() => {
        const submitBtn = document.querySelector('button[type="submit"]') as HTMLButtonElement;
        if (submitBtn && !submitBtn.disabled) submitBtn.click();
      }, 150);
    }
  };

  return (
    <button
      onClick={handleClick}
      className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white/80 hover:text-white text-sm rounded-full border border-white/20 transition-all duration-200 hover:scale-105"
    >
      {text}
    </button>
  );
}
