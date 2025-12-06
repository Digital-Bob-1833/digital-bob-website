import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    hasOpenAIKey: !!process.env.OPENAI_API_KEY,
    hasElevenLabsKey: !!process.env.ELEVENLABS_API_KEY,
    hasVoiceId: !!process.env.ELEVENLABS_VOICE_ID,
    voiceIdValue: process.env.ELEVENLABS_VOICE_ID || 'NOT SET',
    elevenLabsKeyLength: process.env.ELEVENLABS_API_KEY?.length || 0,
    message: 'If all show true and voiceIdValue shows your ID, env vars are working!'
  });
}

