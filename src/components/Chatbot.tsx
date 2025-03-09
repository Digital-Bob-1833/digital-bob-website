'use client';

import React, { useState, useRef, useEffect } from 'react';

interface Message {
  text: string;
  sender: 'user' | 'bot';
}

const Chatbot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      text: "Hi! I'm Digital Bob, your AI assistant. I can tell you about Bob's professional experience, technical leadership, and achievements. What would you like to know?",
      sender: 'bot'
    }
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getBotResponse = (userInput: string): string => {
    const input = userInput.toLowerCase();
    
    if (input.includes('experience') || input.includes('background') || input.includes('work')) {
      return "I have over 25 years of Technology leadership experience. Currently, I'm the CTO/CPO for Perfectserve, a healthcare SaaS company. In my first year, we achieved a 78% gross margin and improved Adj. EBITDA to 39%, enabling the largest ARR growth in company history of $14M. I've also held leadership positions at SitusAMC and DaVita, where I drove significant technological transformations and cost optimizations.";
    }
    
    if (input.includes('current') || input.includes('perfectserve') || input.includes('role')) {
      return "As CTO/CPO at Perfectserve, I've led initiatives that drove R&D velocity up by 133% via offshore staffing to 73%. We achieved a gross margin of 78% vs. a forecast of 77% and improved Adj. EBITDA by 1% over forecast to 39%. This resulted in the largest ARR growth in the company's history of $14M.";
    }
    
    if (input.includes('achievements') || input.includes('accomplishments')) {
      return "Some key achievements include: reducing IT operating costs by $1.9M in six months at SitusAMC, growing DaVita's Project Portfolio from $5M to $64M, shortening SaaS application time to cash from 12 to 3 months, and creating DevOps teams across various service areas. I've also led SOX compliance teams for 13 years in the telecom industry.";
    }
    
    if (input.includes('military') || input.includes('marine') || input.includes('service')) {
      return "I served as a United States Marine, an experience that instilled in me a deep dedication to helping others achieve their full potential. This background has strongly influenced my leadership style, emphasizing teamwork, collaboration, and a commitment to excellence.";
    }
    
    if (input.includes('skills') || input.includes('expertise') || input.includes('technical')) {
      return "My technical expertise includes: DevOps implementation, AWS security and compliance, NIST SP 800-53 Rev. 5 implementation, clinical systems transformation, telecom systems (WIN/Camel II, IS-41EE), and infrastructure management. I've managed international programs across 8 countries and led major digital transformations in healthcare and financial services.";
    }
    
    if (input.includes('leadership') || input.includes('management') || input.includes('style')) {
      return "My leadership philosophy centers on empowering others to enhance their skills, processes, and capabilities. I believe in creating supportive, familial work cultures while driving technological innovation and operational efficiency. This approach has helped me successfully lead large-scale transformations and build high-performing teams.";
    }
    
    if (input.includes('security') || input.includes('compliance')) {
      return "I've established 'SCP' (Secure Contain Protect) to evaluate AWS accounts and workloads, created security strategic roadmaps aligned with NIST SP 800-53 Rev. 5, and led SOX compliance teams. Security and compliance are fundamental aspects of my technical leadership approach.";
    }

    if (input.includes('hello') || input.includes('hi') || input.includes('hey')) {
      return "Hello! I'm Digital Bob. I can tell you about my experience as a technology leader, my current role as CTO/CPO at Perfectserve, or my background in healthcare, financial services, and telecommunications. What would you like to know?";
    }

    return "I can tell you about my experience as CTO/CPO, my technical leadership background, military service, or specific achievements in healthcare and financial services. What aspect would you like to know more about?";
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = {
      text: input,
      sender: 'user'
    };

    const botMessage: Message = {
      text: getBotResponse(input),
      sender: 'bot'
    };

    setMessages([...messages, userMessage, botMessage]);
    setInput('');
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
      <div className="p-4 bg-blue-50">
        <div className="h-[400px] overflow-y-auto mb-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`mb-4 ${
                message.sender === 'user' ? 'text-right' : 'text-left'
              }`}
            >
              <div
                className={`inline-block p-3 rounded-lg ${
                  message.sender === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-800'
                }`}
              >
                {message.text}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            placeholder="Ask me anything about Bob's experience..."
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chatbot; 