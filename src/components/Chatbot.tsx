'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';

interface Message {
  text: string;
  sender: 'user' | 'bot';
  image?: {
    src: string;
    alt: string;
  };
}

// Map topics to relevant images
const getImageForResponse = (userInput: string, botResponse: string): { src: string; alt: string } | null => {
  const input = (userInput + ' ' + botResponse).toLowerCase();
  
  // Military / Marine / USMC - use Marine pictures (removed "service" - too generic, conflicts with IaaS/PaaS/SaaS)
  if (input.includes('usmc') || input.includes('marine') || input.includes('military') || input.includes('navy achievement') || input.includes('veteran') || input.includes('overseas deployment')) {
    return { src: '/images/Marine Vehicle.jpg', alt: 'Bob Hackney - USMC Marine' };
  }
  
  // Playbook / Transformation / Business strategy - use leadership photo
  if (input.includes('playbook') || input.includes('transform') || input.includes('private equity') || input.includes('strategy')) {
    return { src: '/images/Perfectserve leadership.jpeg', alt: 'Bob Hackney - Leadership & Strategy' };
  }
  
  // Perfectserve - use Perfectserve pictures
  if (input.includes('perfectserve') || input.includes('perfect serve')) {
    // Use leadership photo for leadership/company topics
    if (input.includes('leadership') || input.includes('leader') || input.includes('company') || input.includes('cto')) {
      return { src: '/images/Perfectserve leadership.jpeg', alt: 'Bob Hackney - Perfectserve Leadership' };
    }
    // Use team photo for team/engineering topics
    return { src: '/images/Perfectserve-tech-team.jpeg', alt: 'Bob Hackney with Perfectserve Tech Team' };
  }
  
  // Team / Engineers / Developers
  if (input.includes('team') || input.includes('engineers') || input.includes('developers') || input.includes('staff')) {
    return { src: '/images/Perfectserve-tech-team.jpeg', alt: 'Bob Hackney with Perfectserve Tech Team' };
  }
  
  // Family
  if (input.includes('family') || input.includes('children') || input.includes('kids') || input.includes('mel') || input.includes('greg') || input.includes('robby') || input.includes('hannah') || input.includes('nathan')) {
    return { src: '/images/bob-family.jpg', alt: 'Bob Hackney with Family' };
  }
  
  // Dawn / Wife
  if (input.includes('dawn') || input.includes('wife') || input.includes('spouse')) {
    return { src: '/images/bob-dawn.jpeg', alt: 'Bob Hackney with Dawn' };
  }
  
  // Professional / CTO / Leadership (general)
  if (input.includes('professional') || input.includes('headshot') || input.includes('cto') || input.includes('leader') || input.includes('leadership')) {
    return { src: '/images/Perfectserve leadership.jpeg', alt: 'Bob Hackney - Leadership' };
  }
  
  return null;
};

const Chatbot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      text: "Hey, I'm Bob Hackney - CTO, former Marine, and proud family man. I don't waste time with small talk, so let's get to it. What do you want to know about my experience, leadership approach, or what we're building at Perfectserve?",
      sender: 'bot',
      image: {
        src: '/images/bob-professional.jpg',
        alt: 'Bob Hackney - Professional'
      }
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      text: input,
      sender: 'user'
    };

    const currentInput = input;
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: currentInput,
          conversationHistory: messages,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        const image = getImageForResponse(currentInput, data.response);
        const botMessage: Message = {
          text: data.response,
          sender: 'bot',
          image: image || undefined,
        };
        setMessages(prev => [...prev, botMessage]);
      } else {
        const errorMessage: Message = {
          text: "Look, there's a technical issue. Let's try that again.",
          sender: 'bot',
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error('Error:', error);
      const errorMessage: Message = {
        text: "Connection issue. I don't have time for technical problems - let's try again.",
        sender: 'bot',
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-4 flex items-center gap-4">
        <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-md">
          <Image
            src="/bob-3d-avatar.png"
            alt="Bob Hackney"
            fill
            className="object-cover"
          />
        </div>
        <div>
          <h3 className="text-white font-bold text-lg">Digital Bob</h3>
          <p className="text-blue-200 text-sm">CTO • Direct • Results-Driven</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
          <span className="text-green-300 text-sm">Online</span>
        </div>
      </div>

      {/* Messages */}
      <div className="h-[450px] overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] p-4 rounded-2xl ${
                message.sender === 'user'
                  ? 'bg-blue-600 text-white rounded-br-md'
                  : 'bg-white text-gray-800 shadow-md rounded-bl-md border border-gray-100'
              }`}
            >
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>
              {message.image && (
                <div className="mt-3 relative w-full h-48 rounded-lg overflow-hidden">
                  <Image
                    src={message.image.src}
                    alt={message.image.alt}
                    fill
                    className="object-cover"
                    onError={(e) => {
                      // Hide broken images
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white p-4 rounded-2xl rounded-bl-md shadow-md border border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 bg-white border-t border-gray-200">
        <div className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            className="flex-1 p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm disabled:bg-gray-100"
            placeholder="Ask me anything..."
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? '...' : 'Send'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Chatbot;
