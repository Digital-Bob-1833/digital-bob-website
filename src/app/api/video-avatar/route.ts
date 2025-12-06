import { NextRequest, NextResponse } from 'next/server';

// D-ID API credentials
const DID_API_KEY = 'aGFja25leWJvYkBob3RtYWlsLmNvbQ:t5lcjnp_PsHpHWTgL1xre';

// Bob's photo URL (must be publicly accessible)
const BOB_PHOTO_URL = 'https://digital-bob-website.vercel.app/images/Professional/bob-professional.jpg';

// Bob's ElevenLabs voice ID
const VOICE_ID = 'WFGF6T2y4O5nZcJU5zAV';

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    // Create a talk video using D-ID
    const createResponse = await fetch('https://api.d-id.com/talks', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${DID_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        source_url: BOB_PHOTO_URL,
        script: {
          type: 'text',
          input: text,
          provider: {
            type: 'elevenlabs',
            voice_id: VOICE_ID,
          },
        },
        config: {
          fluent: true,
          pad_audio: 0.0,
        },
      }),
    });

    if (!createResponse.ok) {
      const errorText = await createResponse.text();
      console.error('D-ID create error:', createResponse.status, errorText);
      return NextResponse.json(
        { error: `D-ID error: ${createResponse.status}` },
        { status: 500 }
      );
    }

    const createData = await createResponse.json();
    const talkId = createData.id;

    // Poll for video completion (D-ID processes async)
    let videoUrl = null;
    let attempts = 0;
    const maxAttempts = 30; // 30 seconds max wait

    while (!videoUrl && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
      
      const statusResponse = await fetch(`https://api.d-id.com/talks/${talkId}`, {
        headers: {
          'Authorization': `Basic ${DID_API_KEY}`,
        },
      });

      if (statusResponse.ok) {
        const statusData = await statusResponse.json();
        
        if (statusData.status === 'done') {
          videoUrl = statusData.result_url;
          break;
        } else if (statusData.status === 'error') {
          console.error('D-ID processing error:', statusData);
          return NextResponse.json(
            { error: 'Video generation failed' },
            { status: 500 }
          );
        }
      }
      
      attempts++;
    }

    if (!videoUrl) {
      return NextResponse.json(
        { error: 'Video generation timed out' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      videoUrl,
      talkId,
    });

  } catch (error) {
    console.error('Video avatar error:', error);
    return NextResponse.json(
      { error: 'Failed to generate video' },
      { status: 500 }
    );
  }
}

