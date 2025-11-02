import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const { token, user } = useAuth();
  const [moodData, setMoodData] = useState([]);
  const [userStats, setUserStats] = useState(null);
  const [recentActivities, setRecentActivities] = useState([]);
  const [dailyPrompt, setDailyPrompt] = useState('');
  const [affirmation, setAffirmation] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [moodboardRes, journalsRes, chatsRes] = await Promise.all([
        axios.get('/insights/moodboard?days=7', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('/journal/list', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('/chat/history?persona=mentor', { headers: { Authorization: `Bearer ${token}` } })
      ]);

      // Process mood data for chart
      const processedMoodData = moodboardRes.data.moodTimeline.map((entry: any) => ({
        day: new Date(entry.date).toLocaleDateString('en-US', { weekday: 'short' }),
        mood: entry.sentiment === 'positive' ? 4 : entry.sentiment === 'negative' ? 2 : 3
      }));
      setMoodData(processedMoodData);

      // Set user stats
      setUserStats({
        totalJournals: journalsRes.data.length,
        totalChats: chatsRes.data.messages ? Math.ceil(chatsRes.data.messages.length / 2) : 0,
        currentStreak: moodboardRes.data.consistencyScore || 0
      });

      // Set recent activities (last 3 journal entries)
      const recentJournals = journalsRes.data.slice(0, 3).map((entry: any) => ({
        type: 'journal',
        content: entry.content.substring(0, 100) + '...',
        date: new Date(entry.date).toLocaleDateString()
      }));
      setRecentActivities(recentJournals);

      // Generate daily prompt
      try {
        const promptRes = await axios.post('/chat/send', {
          message: 'Generate a thoughtful reflection prompt for today, focused on mental wellness and self-discovery. Keep it to one sentence.',
          persona: 'psychologist'
        }, { headers: { Authorization: `Bearer ${token}` } });
        setDailyPrompt(promptRes.data.reply);
      } catch (e) {
        setDailyPrompt('What emotions are you feeling right now, and what might they be telling you?');
      }

      // Set affirmation
      setAffirmation('You are worthy of peace, joy, and self-compassion. Your journey matters.');

    } catch (e) {
      console.error('Failed to fetch dashboard data', e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex flex-col gap-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 flex flex-col gap-6">
      {/* Personalized Welcome */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Welcome back{user?.username ? `, ${user.username}` : ''}!
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          {userStats?.currentStreak > 0 ? `You're on a ${userStats.currentStreak}% consistency streak. Keep it up!` : 'Ready to start your day with some reflection?'}
        </p>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm text-center">
          <div className="text-2xl font-bold text-blue-600">{userStats?.totalJournals || 0}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Journal Entries</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm text-center">
          <div className="text-2xl font-bold text-green-600">{userStats?.totalChats || 0}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">AI Conversations</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm text-center">
          <div className="text-2xl font-bold text-purple-600">{userStats?.currentStreak || 0}%</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Consistency</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm text-center">
          <div className="text-2xl font-bold text-orange-600">{moodData.length}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Days Tracked</div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Mood Overview */}
        <div className="col-span-2 bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <span className="text-blue-500">📈</span>
            Mood Overview
          </h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={moodData}>
                <XAxis dataKey="day" />
                <YAxis domain={[0,5]} />
                <Tooltip />
                <Line type="monotone" dataKey="mood" stroke="#2563eb" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm flex flex-col gap-4">
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            <span className="text-green-500">⚡</span>
            Quick Actions
          </h3>
          <Link to="/journal" className="px-4 py-3 rounded-lg bg-blue-600 text-white text-center font-medium hover:bg-blue-700 transition-colors">📝 Quick Journal</Link>
          <Link to="/chat" className="px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 text-center font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">💬 Open Chat</Link>
          <Link to="/insights" className="px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 text-center font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">📊 View Insights</Link>
        </div>
      </div>

      {/* Recent Activity & Daily Features */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Recent Activity Feed */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm md:col-span-2">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <span className="text-purple-500">📝</span>
            Recent Activity
          </h3>
          {recentActivities.length > 0 ? (
            <div className="space-y-3">
              {recentActivities.map((activity, index) => (
                <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                  <p className="text-sm text-gray-600 dark:text-gray-300">{activity.content}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{activity.date}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No recent activity. Start journaling to see your entries here!</p>
          )}
        </div>

        {/* Daily Prompt */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <span className="text-orange-500">💭</span>
            Daily Prompt
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 italic">"{dailyPrompt}"</p>
          <Link to="/journal" className="inline-block mt-3 px-3 py-2 bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-200 rounded text-sm hover:bg-orange-200 dark:hover:bg-orange-900/30 transition-colors">
            Reflect Now
          </Link>
        </div>

        {/* Daily Affirmation */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <span className="text-pink-500">✨</span>
            Daily Affirmation
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 italic">"{affirmation}"</p>
          <button className="mt-3 px-3 py-2 bg-pink-100 dark:bg-pink-900/20 text-pink-800 dark:text-pink-200 rounded text-sm hover:bg-pink-200 dark:hover:bg-pink-900/30 transition-colors">
            💖 Take a Moment
          </button>
        </div>
      </div>

      {/* Crisis Resources */}
      <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-6 border border-red-200 dark:border-red-800">
        <h3 className="font-semibold mb-2 text-red-800 dark:text-red-200">🆘 Crisis Resources</h3>
        <p className="text-sm text-red-700 dark:text-red-300">
          If you're in crisis, contact your local emergency number or visit a trusted resource. You're not alone, and help is available 24/7.
        </p>
      </div>
    </div>
  );
}


