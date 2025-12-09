'use client';

import { useState, useEffect } from 'react';

interface Analytics {
  today: { visits: number; messages: number; uniqueSessions: number };
  last7Days: { visits: number; messages: number; uniqueSessions: number };
  last30Days: { visits: number; messages: number; uniqueSessions: number };
  allTime: {
    totalVisits: number;
    totalMessages: number;
    uniqueSessions: number;
  };
  recentEvents: Array<{
    id: string;
    timestamp: string;
    type: string;
    sessionId: string;
    userAgent?: string;
    referrer?: string;
    data?: {
      question?: string;
      topic?: string;
    };
  }>;
  topTopics: Array<{ topic: string; count: number }>;
  topQuestions: Array<{ question: string; count: number }>;
}

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authKey, setAuthKey] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const fetchAnalytics = async (key: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/analytics?key=${key}`);
      if (!response.ok) {
        if (response.status === 401) {
          setError('Invalid access key');
          setIsAuthenticated(false);
          return;
        }
        throw new Error('Failed to fetch analytics');
      }
      const data = await response.json();
      setAnalytics(data);
      setIsAuthenticated(true);
      setError(null);
      // Save key to localStorage
      localStorage.setItem('analytics_key', key);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check for saved key
    const savedKey = localStorage.getItem('analytics_key');
    if (savedKey) {
      setAuthKey(savedKey);
      fetchAnalytics(savedKey);
    } else {
      setLoading(false);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    fetchAnalytics(authKey);
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'page_view': return '👁️';
      case 'chat_message': return '💬';
      case 'voice_input': return '🎤';
      case 'tts_played': return '🔊';
      case 'video_avatar': return '🎬';
      default: return '📊';
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 w-full max-w-md border border-white/20">
          <h1 className="text-2xl font-bold text-white mb-6 text-center">🔐 Admin Access</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              value={authKey}
              onChange={(e) => setAuthKey(e.target.value)}
              placeholder="Enter access key"
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Access Dashboard'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex items-center justify-center">
        <div className="text-white text-xl">Loading analytics...</div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex items-center justify-center">
        <div className="text-white text-xl">No data available</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">📊 Digital Bob Analytics</h1>
            <p className="text-blue-300 mt-1">Track visitor engagement and questions</p>
          </div>
          <button
            onClick={() => fetchAnalytics(authKey)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            🔄 Refresh
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="Today"
            visits={analytics.today.visits}
            messages={analytics.today.messages}
            sessions={analytics.today.uniqueSessions}
            color="green"
          />
          <StatCard
            title="Last 7 Days"
            visits={analytics.last7Days.visits}
            messages={analytics.last7Days.messages}
            sessions={analytics.last7Days.uniqueSessions}
            color="blue"
          />
          <StatCard
            title="Last 30 Days"
            visits={analytics.last30Days.visits}
            messages={analytics.last30Days.messages}
            sessions={analytics.last30Days.uniqueSessions}
            color="purple"
          />
          <StatCard
            title="All Time"
            visits={analytics.allTime.totalVisits}
            messages={analytics.allTime.totalMessages}
            sessions={analytics.allTime.uniqueSessions}
            color="orange"
          />
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Top Topics */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <h2 className="text-xl font-bold text-white mb-4">🏷️ Top Topics</h2>
            <div className="space-y-3">
              {analytics.topTopics.length === 0 ? (
                <p className="text-white/60">No data yet</p>
              ) : (
                analytics.topTopics.map((topic, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-white">{topic.topic}</span>
                    <div className="flex items-center gap-2">
                      <div className="h-2 bg-blue-500 rounded-full" style={{ width: `${Math.min(topic.count * 10, 100)}px` }}></div>
                      <span className="text-blue-300 text-sm w-8">{topic.count}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Top Questions */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <h2 className="text-xl font-bold text-white mb-4">❓ Top Questions</h2>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {analytics.topQuestions.length === 0 ? (
                <p className="text-white/60">No questions yet</p>
              ) : (
                analytics.topQuestions.map((q, i) => (
                  <div key={i} className="p-3 bg-white/5 rounded-lg">
                    <p className="text-white text-sm">&ldquo;{q.question}&rdquo;</p>
                    <p className="text-blue-300 text-xs mt-1">Asked {q.count} time{q.count > 1 ? 's' : ''}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          <h2 className="text-xl font-bold text-white mb-4">📜 Recent Activity</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-white/60 text-sm border-b border-white/10">
                  <th className="pb-3 pr-4">Time</th>
                  <th className="pb-3 pr-4">Type</th>
                  <th className="pb-3 pr-4">Session</th>
                  <th className="pb-3 pr-4">Details</th>
                </tr>
              </thead>
              <tbody>
                {analytics.recentEvents.slice(0, 20).map((event) => (
                  <tr key={event.id} className="border-b border-white/5 text-sm">
                    <td className="py-3 pr-4 text-white/80">{formatDate(event.timestamp)}</td>
                    <td className="py-3 pr-4">
                      <span className="flex items-center gap-2 text-white">
                        {getEventIcon(event.type)}
                        <span className="capitalize">{event.type.replace('_', ' ')}</span>
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-white/60 font-mono text-xs">{event.sessionId.substring(0, 8)}...</td>
                    <td className="py-3 pr-4 text-white/80 max-w-xs truncate">
                      {event.data?.question || event.data?.topic || event.referrer || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, visits, messages, sessions, color }: {
  title: string;
  visits: number;
  messages: number;
  sessions: number;
  color: 'green' | 'blue' | 'purple' | 'orange';
}) {
  const colors = {
    green: 'from-green-500/20 to-green-600/20 border-green-500/30',
    blue: 'from-blue-500/20 to-blue-600/20 border-blue-500/30',
    purple: 'from-purple-500/20 to-purple-600/20 border-purple-500/30',
    orange: 'from-orange-500/20 to-orange-600/20 border-orange-500/30',
  };

  return (
    <div className={`bg-gradient-to-br ${colors[color]} backdrop-blur-lg rounded-2xl p-5 border`}>
      <h3 className="text-white/80 text-sm font-medium mb-3">{title}</h3>
      <div className="grid grid-cols-3 gap-2">
        <div>
          <p className="text-2xl font-bold text-white">{visits}</p>
          <p className="text-xs text-white/60">Visits</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-white">{messages}</p>
          <p className="text-xs text-white/60">Messages</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-white">{sessions}</p>
          <p className="text-xs text-white/60">Sessions</p>
        </div>
      </div>
    </div>
  );
}

