import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

// Analytics data structure
interface AnalyticsEvent {
  id: string;
  timestamp: string;
  type: 'page_view' | 'chat_message' | 'voice_input' | 'tts_played' | 'video_avatar';
  sessionId: string;
  userAgent?: string;
  referrer?: string;
  ip?: string;
  data?: {
    question?: string;
    responsePreview?: string;
    topic?: string;
    duration?: number;
  };
}

interface AnalyticsData {
  events: AnalyticsEvent[];
  sessions: {
    [sessionId: string]: {
      firstSeen: string;
      lastSeen: string;
      messageCount: number;
      userAgent?: string;
      referrer?: string;
    };
  };
  summary: {
    totalVisits: number;
    totalMessages: number;
    uniqueSessions: number;
    topQuestions: { question: string; count: number }[];
    topTopics: { topic: string; count: number }[];
  };
}

const ANALYTICS_FILE = path.join(process.cwd(), 'analytics-data.json');

// Initialize or load analytics data
async function loadAnalytics(): Promise<AnalyticsData> {
  try {
    const data = await fs.readFile(ANALYTICS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    // File doesn't exist, return default structure
    return {
      events: [],
      sessions: {},
      summary: {
        totalVisits: 0,
        totalMessages: 0,
        uniqueSessions: 0,
        topQuestions: [],
        topTopics: [],
      },
    };
  }
}

// Save analytics data
async function saveAnalytics(data: AnalyticsData): Promise<void> {
  await fs.writeFile(ANALYTICS_FILE, JSON.stringify(data, null, 2));
}

// Detect topic from question
function detectTopic(question: string): string {
  const q = question.toLowerCase();
  
  if (q.includes('marine') || q.includes('military') || q.includes('usmc') || q.includes('navy')) {
    return 'Military/Marine Corps';
  }
  if (q.includes('family') || q.includes('wife') || q.includes('dawn') || q.includes('children') || q.includes('kids')) {
    return 'Family';
  }
  if (q.includes('perfectserve') || q.includes('perfect serve') || q.includes('current role')) {
    return 'PerfectServe';
  }
  if (q.includes('davita') || q.includes('healthcare')) {
    return 'DaVita/Healthcare';
  }
  if (q.includes('situsamc') || q.includes('situs') || q.includes('real estate')) {
    return 'SitusAMC';
  }
  if (q.includes('playbook') || q.includes('transform') || q.includes('strategy')) {
    return 'Leadership Playbook';
  }
  if (q.includes('orbie') || q.includes('award')) {
    return 'Awards/Recognition';
  }
  if (q.includes('ai') || q.includes('llm') || q.includes('technology') || q.includes('cloud') || q.includes('devops')) {
    return 'Technology/AI';
  }
  if (q.includes('leadership') || q.includes('manage') || q.includes('team')) {
    return 'Leadership Style';
  }
  if (q.includes('book') || q.includes('read')) {
    return 'Books/Learning';
  }
  if (q.includes('career') || q.includes('experience') || q.includes('background')) {
    return 'Career Journey';
  }
  if (q.includes('contact') || q.includes('email') || q.includes('phone') || q.includes('hire')) {
    return 'Contact/Hiring';
  }
  
  return 'General';
}

// POST - Record an analytics event
export async function POST(request: NextRequest) {
  try {
    const event = await request.json();
    const analytics = await loadAnalytics();
    
    // Generate event ID
    const eventId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Get IP and user info from headers
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 
               request.headers.get('x-real-ip') || 
               'unknown';
    const userAgent = request.headers.get('user-agent') || undefined;
    const referrer = request.headers.get('referer') || undefined;
    
    // Create the event
    const analyticsEvent: AnalyticsEvent = {
      id: eventId,
      timestamp: new Date().toISOString(),
      type: event.type || 'page_view',
      sessionId: event.sessionId || 'unknown',
      userAgent,
      referrer,
      ip: ip.substring(0, 20), // Truncate for privacy
      data: event.data,
    };
    
    // Detect topic if it's a chat message
    if (event.type === 'chat_message' && event.data?.question) {
      analyticsEvent.data = {
        ...analyticsEvent.data,
        topic: detectTopic(event.data.question),
      };
    }
    
    // Add event to list (keep last 1000 events)
    analytics.events.unshift(analyticsEvent);
    if (analytics.events.length > 1000) {
      analytics.events = analytics.events.slice(0, 1000);
    }
    
    // Update session info
    const sessionId = event.sessionId || 'unknown';
    if (!analytics.sessions[sessionId]) {
      analytics.sessions[sessionId] = {
        firstSeen: analyticsEvent.timestamp,
        lastSeen: analyticsEvent.timestamp,
        messageCount: 0,
        userAgent,
        referrer,
      };
      analytics.summary.uniqueSessions++;
    }
    analytics.sessions[sessionId].lastSeen = analyticsEvent.timestamp;
    
    // Update summary stats
    if (event.type === 'page_view') {
      analytics.summary.totalVisits++;
    }
    if (event.type === 'chat_message') {
      analytics.summary.totalMessages++;
      analytics.sessions[sessionId].messageCount++;
      
      // Track top questions (truncated)
      const questionPreview = event.data?.question?.substring(0, 100) || 'Unknown';
      const existingQ = analytics.summary.topQuestions.find(q => q.question === questionPreview);
      if (existingQ) {
        existingQ.count++;
      } else {
        analytics.summary.topQuestions.push({ question: questionPreview, count: 1 });
      }
      analytics.summary.topQuestions.sort((a, b) => b.count - a.count);
      analytics.summary.topQuestions = analytics.summary.topQuestions.slice(0, 20);
      
      // Track top topics
      const topic = analyticsEvent.data?.topic || 'General';
      const existingT = analytics.summary.topTopics.find(t => t.topic === topic);
      if (existingT) {
        existingT.count++;
      } else {
        analytics.summary.topTopics.push({ topic, count: 1 });
      }
      analytics.summary.topTopics.sort((a, b) => b.count - a.count);
    }
    
    await saveAnalytics(analytics);
    
    return NextResponse.json({ success: true, eventId });
  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json({ error: 'Failed to record analytics' }, { status: 500 });
  }
}

// GET - Retrieve analytics data (for admin dashboard)
export async function GET(request: NextRequest) {
  try {
    // Simple auth check via query param (replace with proper auth in production)
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');
    
    // Basic protection - in production, use proper authentication
    if (key !== 'bob2025') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const analytics = await loadAnalytics();
    
    // Calculate additional metrics
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
    
    const todayEvents = analytics.events.filter(e => e.timestamp.startsWith(today));
    const last7DaysEvents = analytics.events.filter(e => e.timestamp >= last7Days);
    const last30DaysEvents = analytics.events.filter(e => e.timestamp >= last30Days);
    
    const metrics = {
      today: {
        visits: todayEvents.filter(e => e.type === 'page_view').length,
        messages: todayEvents.filter(e => e.type === 'chat_message').length,
        uniqueSessions: new Set(todayEvents.map(e => e.sessionId)).size,
      },
      last7Days: {
        visits: last7DaysEvents.filter(e => e.type === 'page_view').length,
        messages: last7DaysEvents.filter(e => e.type === 'chat_message').length,
        uniqueSessions: new Set(last7DaysEvents.map(e => e.sessionId)).size,
      },
      last30Days: {
        visits: last30DaysEvents.filter(e => e.type === 'page_view').length,
        messages: last30DaysEvents.filter(e => e.type === 'chat_message').length,
        uniqueSessions: new Set(last30DaysEvents.map(e => e.sessionId)).size,
      },
      allTime: analytics.summary,
      recentEvents: analytics.events.slice(0, 50),
      topTopics: analytics.summary.topTopics,
      topQuestions: analytics.summary.topQuestions.slice(0, 10),
    };
    
    return NextResponse.json(metrics);
  } catch (error) {
    console.error('Analytics fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}

