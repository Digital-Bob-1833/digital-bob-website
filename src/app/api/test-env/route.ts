import { NextResponse } from 'next/server';

export async function GET() {
  // List ALL environment variable names (not values) to debug
  const allEnvNames = Object.keys(process.env).filter(key => 
    key.includes('ELEVEN') || key.includes('OPENAI') || key.includes('API')
  );
  
  return NextResponse.json({
    hasOpenAIKey: !!process.env.OPENAI_API_KEY,
    hasElevenLabsKey: !!process.env.ELEVENLABS_API_KEY,
    hasAltKey: !!process.env.ELEVEN_API_KEY,
    hasVoiceId: !!process.env.ELEVENLABS_VOICE_ID,
    hasAltVoiceId: !!process.env.ELEVEN_VOICE_ID,
    voiceIdValue: process.env.ELEVENLABS_VOICE_ID || process.env.ELEVEN_VOICE_ID || 'NOT SET',
    elevenLabsKeyLength: (process.env.ELEVENLABS_API_KEY || process.env.ELEVEN_API_KEY || '').length,
    relevantEnvNames: allEnvNames,
    message: 'Check relevantEnvNames to see what variables Vercel actually has!'
  });
}

