'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';

// Generate or retrieve session ID
const getSessionId = (): string => {
  if (typeof window === 'undefined') return 'server';
  let sessionId = sessionStorage.getItem('bob_session_id');
  if (!sessionId) {
    sessionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('bob_session_id', sessionId);
  }
  return sessionId;
};

// Track analytics event
const trackEvent = async (type: string, data?: Record<string, unknown>) => {
  try {
    await fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type,
        sessionId: getSessionId(),
        data,
      }),
    });
  } catch (error) {
    console.error('Analytics tracking error:', error);
  }
};

interface Message {
  text: string;
  sender: 'user' | 'bot';
  image?: {
    src: string;
    alt: string;
  };
  video?: string; // D-ID talking avatar video URL
}

// Photo collections organized by topic
const photoCollections = {
  marine: [
    '/images/Marine/Marine Vehicle.jpg',
    '/images/Marine/bob USMC.JPG',
    '/images/Marine/IMG_3094.jpeg',
  ],
  davita: [
    '/images/DaVita/IMG_0894.JPG',
    '/images/DaVita/IMG_3037.jpeg',
    '/images/DaVita/Jerry and Bob.JPG',
  ],
  perfectserve: [
    '/images/Perfectserve/Perfectserve leadership.jpeg',
    '/images/Perfectserve/Perfectserve-tech-team.jpeg',
    '/images/Perfectserve/IMG_3639.jpeg',
    '/images/Perfectserve/IMG_5704.jpeg',
    '/images/Perfectserve/2117762790038193511.jpg',
    '/images/Perfectserve/435685396061504320.jpg',
  ],
  family: [
    '/images/Family/bob-family.jpg',
    '/images/Family/bob-dawn.jpeg',
    '/images/Family/Bob & Dawn.jpg',
    '/images/Family/IMG_2507.jpeg',
    '/images/Family/IMG_8861.jpeg',
  ],
  professional: [
    '/images/Professional/bob-professional.jpg',
    '/images/Professional/cold-bob.jpeg',
  ],
};

// Get random photo from a collection
const getRandomPhoto = (collection: string[]): string => {
  return collection[Math.floor(Math.random() * collection.length)];
  };

// Map topics to relevant images
const getImageForResponse = (userInput: string, botResponse: string): { src: string; alt: string } | null => {
  const input = (userInput + ' ' + botResponse).toLowerCase();
  
  if (input.includes('usmc') || input.includes('marine') || input.includes('military') || input.includes('navy achievement') || input.includes('veteran') || input.includes('overseas deployment')) {
    return { src: getRandomPhoto(photoCollections.marine), alt: 'Bob Hackney - USMC Marine' };
  }
  
  if (input.includes('davita') || input.includes('da vita') || input.includes('dialysis') || input.includes('cwow') || input.includes('clinical systems') || input.includes('jerry')) {
    return { src: getRandomPhoto(photoCollections.davita), alt: 'Bob Hackney - DaVita' };
  }
  
  if (input.includes('situsamc') || input.includes('situs') || input.includes('stonepoint') || input.includes('real estate finance')) {
    return { src: getRandomPhoto(photoCollections.professional), alt: 'Bob Hackney - SitusAMC' };
  }
  
  if (input.includes('telecom') || input.includes('billing') || input.includes('ericsson') || input.includes('nortel') || input.includes('motorola') || input.includes('prepaid')) {
    return { src: getRandomPhoto(photoCollections.professional), alt: 'Bob Hackney - Telecom' };
  }
  
  if (input.includes('playbook') || input.includes('transform') || input.includes('private equity') || input.includes('strategy')) {
    return { src: '/images/Perfectserve/Perfectserve leadership.jpeg', alt: 'Bob Hackney - Leadership & Strategy' };
  }
  
  if (input.includes('perfectserve') || input.includes('perfect serve') || input.includes('k1') || input.includes('arr') || input.includes('ebitda')) {
    return { src: getRandomPhoto(photoCollections.perfectserve), alt: 'Bob Hackney - Perfectserve' };
  }
  
  if (input.includes('team') || input.includes('engineers') || input.includes('developers') || input.includes('staff') || input.includes('offshore') || input.includes('albania')) {
    return { src: '/images/Perfectserve/Perfectserve-tech-team.jpeg', alt: 'Bob Hackney with Tech Team' };
  }
  
  if (input.includes('family') || input.includes('children') || input.includes('kids') || input.includes('mel') || input.includes('greg') || input.includes('robby') || input.includes('hannah') || input.includes('nathan') || input.includes('grandchildren') || input.includes('grandkids')) {
    return { src: '/images/Family/Family.jpg', alt: 'Bob Hackney with Family' };
  }
  
  if (input.includes('dawn') || input.includes('wife') || input.includes('spouse')) {
    return { src: '/images/Family/Bob & Dawn.jpg', alt: 'Bob Hackney with Dawn' };
  }
  
  if (input.includes('professional') || input.includes('headshot') || input.includes('cto') || input.includes('leader') || input.includes('leadership')) {
    return { src: getRandomPhoto(photoCollections.professional), alt: 'Bob Hackney - Professional' };
  }
  
  if (input.includes('ai') || input.includes('cursor') || input.includes('llm') || input.includes('machine learning') || input.includes('automation')) {
    return { src: getRandomPhoto(photoCollections.perfectserve), alt: 'Bob Hackney - Technology' };
  }
  
  return null;
};

// Speech recognition types
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface ISpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: Event) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

declare global {
  interface Window {
    SpeechRecognition: new () => ISpeechRecognition;
    webkitSpeechRecognition: new () => ISpeechRecognition;
  }
}

const Chatbot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      text: "Hey, I'm Bob Hackney - CTO, Marine, and proud family man. I don't waste time with small talk, so let's get to it. What do you want to know about my experience, leadership approach, or what we're building at Perfectserve?",
      sender: 'bot',
      image: {
        src: '/images/Professional/bob-professional.jpg',
        alt: 'Bob Hackney - Professional'
      }
    }
  ]);
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [videoAvatarEnabled, setVideoAvatarEnabled] = useState(false);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<ISpeechRecognition | null>(null);
  const submitButtonRef = useRef<HTMLButtonElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Track page view on mount
  useEffect(() => {
    trackEvent('page_view');
  }, []);

  // Initialize speech recognition with auto-submit
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = 'en-US';

        recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
          const transcript = event.results[0][0].transcript;
          setInput(transcript);
          setIsListening(false);
          
          // Auto-submit after a short delay
          setTimeout(() => {
            if (submitButtonRef.current) {
              submitButtonRef.current.click();
            }
          }, 600);
        };

        recognitionRef.current.onerror = () => {
          setIsListening(false);
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
        };
      }
    }
  }, []);

  // Text-to-speech using ElevenLabs
  const speakText = useCallback(async (text: string) => {
    if (!voiceEnabled || typeof window === 'undefined') return;
    
    setIsSpeaking(true);
    trackEvent('tts_played');
    
    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        console.error('ElevenLabs TTS failed:', data.error);
        throw new Error(data.error || 'TTS request failed');
      }
      
      // Create audio from base64
      const audio = new Audio(`data:audio/mpeg;base64,${data.audio}`);
      
      audio.onended = () => setIsSpeaking(false);
      audio.onerror = (e) => {
        console.error('Audio playback error:', e);
        setIsSpeaking(false);
      };
      
      // Store audio reference for stop functionality
      (window as Window & { currentAudio?: HTMLAudioElement }).currentAudio = audio;
      
      // Try to play - Safari may block this
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.log('Autoplay blocked by browser:', error.message);
          setIsSpeaking(false);
          // Don't fall back to browser TTS - just show the text response
        });
    }

    } catch (error) {
      console.error('ElevenLabs TTS error:', error);
      setIsSpeaking(false);
    }
  }, [voiceEnabled]);

  // Fallback browser TTS
  const fallbackBrowserTTS = (text: string) => {
    if (typeof window === 'undefined') return;
    
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.05;
    utterance.pitch = 0.75;
    utterance.volume = 1.0;
    
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(voice => 
      voice.name.includes('Aaron') || voice.name.includes('Daniel') || voice.lang === 'en-US'
    );
    if (preferredVoice) utterance.voice = preferredVoice;
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    window.speechSynthesis.speak(utterance);
  };

  // Toggle listening
  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in your browser. Try Chrome or Edge.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
      trackEvent('voice_input');
    }
  };

  // Stop speaking
  const stopSpeaking = () => {
    if (typeof window !== 'undefined') {
      const currentAudio = (window as Window & { currentAudio?: HTMLAudioElement }).currentAudio;
      if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
      }
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

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

    // Add placeholder bot message for streaming
    const botMessageIndex = messages.length + 1;
    setMessages(prev => [...prev, { text: '', sender: 'bot' }]);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: currentInput,
          conversationHistory: messages.slice(-6), // Only send recent history
          stream: true,
        }),
      });

      if (!response.ok) {
        throw new Error('Response not ok');
      }

      // Handle streaming response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullResponse = '';
      setIsStreaming(true);

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') continue;
              
              try {
                const parsed = JSON.parse(data);
                if (parsed.content) {
                  fullResponse += parsed.content;
                  // Update the bot message in real-time
                  setMessages(prev => {
                    const updated = [...prev];
                    updated[botMessageIndex] = { 
                      text: fullResponse, 
                      sender: 'bot' 
                    };
                    return updated;
                  });
                }
              } catch {
                // Skip malformed JSON chunks
              }
            }
          }
        }
      }

      setIsStreaming(false);
      
      // After streaming is complete, add image and trigger TTS
      const image = getImageForResponse(currentInput, fullResponse);
      
      // Try to generate video avatar if enabled
      let videoUrl: string | undefined;
      if (videoAvatarEnabled && voiceEnabled && fullResponse) {
        setIsGeneratingVideo(true);
        try {
          const videoResponse = await fetch('/api/video-avatar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: fullResponse }),
          });
          
          if (videoResponse.ok) {
            const videoData = await videoResponse.json();
            videoUrl = videoData.videoUrl;
          }
        } catch (videoError) {
          console.error('Video avatar error:', videoError);
        }
        setIsGeneratingVideo(false);
      }

      // Final update with image/video
      setMessages(prev => {
        const updated = [...prev];
        updated[botMessageIndex] = { 
          text: fullResponse || "Let's try that again.",
          sender: 'bot',
          image: !videoUrl ? (image || undefined) : undefined,
          video: videoUrl,
        };
        return updated;
      });
      
      // Only speak if no video (video has its own audio)
      if (!videoUrl && fullResponse) {
        speakText(fullResponse);
      }

      // Track the chat interaction
      trackEvent('chat_message', {
        question: currentInput,
        responsePreview: fullResponse.substring(0, 100),
      });

    } catch (error) {
      console.error('Error:', error);
      setIsStreaming(false);
      setMessages(prev => {
        const updated = [...prev];
        updated[botMessageIndex] = {
          text: "Connection issue. Let's try again.",
          sender: 'bot',
        };
        return updated;
      });
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
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
        <div className="ml-auto flex items-center gap-3">
          {/* Video avatar toggle button */}
          <button
            onClick={() => setVideoAvatarEnabled(!videoAvatarEnabled)}
            className={`p-2 rounded-full transition-all ${
              videoAvatarEnabled 
                ? 'bg-purple-500 hover:bg-purple-600' 
                : 'bg-gray-500 hover:bg-gray-600'
            }`}
            title={videoAvatarEnabled ? 'Video avatar ON - click to disable' : 'Video avatar OFF - click to enable'}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </button>
          {/* Voice toggle button */}
          <button
            onClick={() => setVoiceEnabled(!voiceEnabled)}
            className={`p-2 rounded-full transition-all ${
              voiceEnabled 
                ? 'bg-green-500 hover:bg-green-600' 
                : 'bg-gray-500 hover:bg-gray-600'
            }`}
            title={voiceEnabled ? 'Voice enabled - click to mute' : 'Voice muted - click to enable'}
          >
            {voiceEnabled ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" clipRule="evenodd" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
              </svg>
            )}
          </button>
          {/* Speaking indicator */}
          {isSpeaking && (
            <button
              onClick={stopSpeaking}
              className="p-2 rounded-full bg-red-500 hover:bg-red-600 animate-pulse"
              title="Click to stop speaking"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
              </svg>
            </button>
          )}
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
              {message.video && (
                <div className="mt-3 rounded-lg overflow-hidden">
                  <video 
                    src={message.video} 
                    autoPlay 
                    controls
                    className="w-full max-h-64 rounded-lg"
                    onEnded={() => setIsSpeaking(false)}
                    onPlay={() => setIsSpeaking(true)}
                  />
                </div>
              )}
              {message.image && !message.video && (
                <div className="mt-3 relative w-full aspect-[4/3] max-h-64 rounded-lg overflow-hidden">
                    <Image
                      src={message.image.src}
                      alt={message.image.alt}
                    fill
                    className="object-contain bg-gray-100"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                    />
                  </div>
                )}
            </div>
                  </div>
        ))}
        
        {isLoading && !isStreaming && (
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
        
        {isGeneratingVideo && (
          <div className="flex justify-start">
            <div className="bg-white p-3 rounded-xl shadow-sm border border-purple-200">
              <p className="text-xs text-purple-600 animate-pulse">🎬 Generating video avatar...</p>
            </div>
          </div>
        )}
        
          <div ref={messagesEndRef} />
        </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 bg-white border-t border-gray-200">
        <div className="flex gap-3">
          {/* Microphone button */}
          <button
            type="button"
            onClick={toggleListening}
            disabled={isLoading}
            className={`p-3 rounded-xl transition-all ${
              isListening 
                ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                : 'bg-gray-200 hover:bg-gray-300'
            } disabled:opacity-50`}
            title={isListening ? 'Listening... Click to stop' : 'Click to speak'}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${isListening ? 'text-white' : 'text-gray-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </button>
          
          <input
            ref={inputRef}
            type="text"
            id="chat-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            className="flex-1 p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm disabled:bg-gray-100"
            placeholder={isListening ? "Listening..." : "Ask me anything..."}
          />
          <button
            ref={submitButtonRef}
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? '...' : 'Send'}
          </button>
        </div>
        {isListening && (
          <p className="text-center text-sm text-red-500 mt-2 animate-pulse">
            🎤 Listening... Speak now
          </p>
        )}
        </form>
    </div>
  );
};

export default Chatbot; 
