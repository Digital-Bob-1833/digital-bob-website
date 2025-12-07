'use client';

import Chatbot from '../components/Chatbot';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%239C92AC%22 fill-opacity=%220.05%22%3E%3Cpath d=%22M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40"></div>
      
      <div className="relative z-10 flex min-h-screen">
        {/* Left side - Digital Bob Avatar */}
        <div className="hidden lg:flex w-[400px] flex-col items-center justify-center p-8 border-r border-white/10">
          {/* Avatar with glow effect */}
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition duration-500"></div>
            <div className="relative w-[280px] h-[350px] rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl">
              <img
                src="/bob-3d-avatar.png"
                alt="Digital Bob"
                className="object-cover w-full h-full"
              />
            </div>
          </div>
          
          {/* Name and title */}
          <div className="mt-6 text-center">
            <h1 className="text-3xl font-bold text-white tracking-tight">Digital Bob</h1>
            <p className="text-blue-300 mt-1">Bob Hackney</p>
            <div className="flex items-center justify-center gap-2 mt-3">
              <span className="px-3 py-1 bg-blue-500/20 text-blue-300 text-sm rounded-full border border-blue-500/30">CTO</span>
              <span className="px-3 py-1 bg-green-500/20 text-green-300 text-sm rounded-full border border-green-500/30">Marine</span>
            </div>
            <p className="text-slate-400 text-sm mt-4 max-w-[250px]">
              2025 ORBIE Finalist • 25+ years tech leadership
            </p>
          </div>

          {/* Quick stats */}
          <div className="mt-8 grid grid-cols-2 gap-3 w-full max-w-[280px]">
            <div className="bg-white/5 rounded-lg p-3 text-center border border-white/10">
              <p className="text-2xl font-bold text-white">$103M</p>
              <p className="text-xs text-slate-400">ARR Growth</p>
            </div>
            <div className="bg-white/5 rounded-lg p-3 text-center border border-white/10">
              <p className="text-2xl font-bold text-white">133%</p>
              <p className="text-xs text-slate-400">R&D Velocity</p>
            </div>
          </div>
        </div>

        {/* Right side - Chat Interface */}
        <div className="flex-1 flex flex-col items-center justify-center p-4 lg:p-8">
          {/* Mobile header */}
          <div className="lg:hidden flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-blue-400 shadow-lg">
              <img src="/bob-3d-avatar.png" alt="Digital Bob" className="object-cover w-full h-full" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Digital Bob</h1>
              <p className="text-blue-300 text-sm">CTO • Marine • Leader</p>
            </div>
          </div>

          {/* Chat container */}
          <div className="w-full max-w-2xl">
            <Chatbot />
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
      // Set value using native setter to trigger React's onChange
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
      nativeInputValueSetter?.call(input, text);
      input.dispatchEvent(new Event('input', { bubbles: true }));
      
      // Submit after state updates
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
