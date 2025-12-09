import { NextRequest } from 'next/server';
import OpenAI from 'openai';

// Lazy initialization to prevent build errors
let openai: OpenAI | null = null;

function getOpenAI() {
  if (!openai && process.env.OPENAI_API_KEY) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openai;
}

// Condensed system prompt for faster responses (key info only)
const BOB_SYSTEM_PROMPT_CONDENSED = `You are Digital Bob, an AI representation of Bob Hackney - CTO/CPO at Perfectserve (K1-backed healthcare SaaS).

PERSONALITY: Direct, confident, results-driven. Former Marine. Impatient with complexity, focused on outcomes. Warm about family but professionally efficient.

KEY FACTS:
- 25+ years tech leadership (healthcare, finance, telecom)
- Marine Corps veteran - Navy Achievement Medal
- Current: CTO/CPO Perfectserve - 133% R&D velocity increase, P1 outages 19→4, 78% gross margin
- Previous: SitusAMC (PE-backed, $8M cost savings), DaVita (76K employees, $64M portfolio)
- Family: Wife Dawn, 5 kids (Mel, Greg, Robby, Hannah, Nathan), grandchildren
- 2025 Colorado ORBIE Finalist

PLAYBOOK: Transform PE-backed companies via offshore optimization (Albania), DevOps/SAFe, cloud-native (AWS/GCP), AI/LLM integration, FinOps.

ACHIEVEMENTS: $1.2M AI cost savings, 98% IVA effectiveness, Best in KLAS awards, 93% Fit & Belonging score.

Respond as Bob - first person, concise, direct. Cite specific numbers when relevant.`;

export async function POST(request: NextRequest) {
  try {
    // Check if API key is configured
    if (!process.env.OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY is not set');
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { message, conversationHistory = [], stream = true } = await request.json();

    if (!message) {
      return new Response(
        JSON.stringify({ error: 'Message is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Limit conversation history to last 6 messages for speed
    const recentHistory = conversationHistory.slice(-6);

    const messages = [
      { role: 'system' as const, content: BOB_SYSTEM_PROMPT_CONDENSED },
      ...recentHistory.map((msg: { text: string; sender: string }) => ({
        role: msg.sender === 'user' ? 'user' as const : 'assistant' as const,
        content: msg.text,
      })),
      { role: 'user' as const, content: message },
    ];

    const client = getOpenAI();
    if (!client) {
      return new Response(
        JSON.stringify({ error: 'OpenAI client not initialized' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // STREAMING RESPONSE - much faster perceived response time
    if (stream) {
      const streamResponse = await client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages,
        temperature: 0.7,
        max_tokens: 400,
        stream: true,
      });

      // Create a readable stream
      const encoder = new TextEncoder();
      const readableStream = new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of streamResponse) {
              const content = chunk.choices[0]?.delta?.content || '';
              if (content) {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`));
              }
            }
            controller.enqueue(encoder.encode('data: [DONE]\n\n'));
            controller.close();
          } catch (error) {
            controller.error(error);
          }
        },
      });

      return new Response(readableStream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    }

    // Non-streaming fallback
    const completion = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      temperature: 0.7,
      max_tokens: 400,
    });

    const response = completion.choices[0]?.message?.content || 
      "Let's cut to the chase - something went wrong. Try asking again.";

    return new Response(JSON.stringify({ response }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    console.error('OpenAI API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // Check if it's a rate limit error
    if (errorMessage.includes('429') || errorMessage.includes('Rate limit')) {
      return new Response(
        JSON.stringify({ response: "I'm getting a lot of questions right now. Give me 20 seconds and ask again." }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    return new Response(
      JSON.stringify({ error: `API Error: ${errorMessage}` }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

