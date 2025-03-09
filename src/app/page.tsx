'use client';

import Chatbot from '../components/Chatbot';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gradient-to-b from-blue-100 to-white">
      <div className="z-10 max-w-7xl w-full items-center justify-between font-mono text-sm flex flex-row gap-8">
        {/* Left side - Profile section */}
        <div className="flex flex-col items-center gap-6 flex-1">
          <h1 className="text-4xl font-bold text-blue-800">Welcome to Bob's Website</h1>
          <div className="flex flex-col items-center gap-6">
            <h2 className="text-2xl text-blue-700">Digital Bob</h2>
            <div className="relative w-[300px] h-[400px] rounded-xl overflow-hidden shadow-2xl border-4 border-blue-200 transition-transform hover:scale-105">
              <img
                src="/cold-bob.jpg"
                alt="Cold Bob bundled up in winter gear"
                className="object-cover w-full h-full"
                style={{ objectPosition: 'center center' }}
              />
            </div>
          </div>
          <p className="text-xl text-blue-700">Bob Hackney</p>
          <p className="text-lg text-blue-600">CTO</p>
        </div>

        {/* Right side - Chatbot */}
        <div className="flex-1">
          <Chatbot />
        </div>
      </div>
    </main>
  );
} 