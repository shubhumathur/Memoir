import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import WordCloud from 'react-d3-cloud';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#6366f1', '#ef4444', '#8b5cf6', '#06b6d4'];

const SENTIMENT_COLORS = {
  positive: '#10b981',
  negative: '#ef4444',
  neutral: '#f59e0b'
};

export default function Insights() {
  const { token } = useAuth();
  const [moodboardData, setMoodboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDays, setSelectedDays] = useState(7);

  useEffect(() => {
    fetchMoodboardData();
  }, [selectedDays]);

  const fetchMoodboardData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/insights/moodboard?days=${selectedDays}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMoodboardData(res.data);
    } catch (e) {
      console.error('Failed to fetch moodboard data', e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-6xl mx-auto flex flex-col gap-6">
        <h1 className="text-2xl font-semibold">Daily Insights Moodboard</h1>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!moodboardData) {
    return (
      <div className="p-6 max-w-6xl mx-auto flex flex-col gap-6">
        <h1 className="text-2xl font-semibold">Daily Insights Moodboard</h1>
        <div className="text-center py-12">
          <p className="text-gray-500">No data available yet. Start journaling and chatting to see your insights!</p>
        </div>
      </div>
    );
  }

  const { moodTimeline, emotionData, wordCloudData, chatStats, consistencyScore, aiInsights, dateRange } = moodboardData;

  // Process mood timeline for chart
  const processedMoodData = moodTimeline.map((entry: any) => ({
    date: new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    sentiment: entry.sentiment === 'positive' ? 1 : entry.sentiment === 'negative' ? -1 : 0,
    fullDate: entry.date
  }));

  return (
    <div className="p-6 max-w-6xl mx-auto flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Daily Insights Moodboard</h1>
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium">Time Range:</label>
          <select
            className="px-3 py-2 rounded border bg-white dark:bg-gray-800"
            value={selectedDays}
            onChange={e => setSelectedDays(Number(e.target.value))}
          >
            <option value={7}>Last 7 days</option>
            <option value={14}>Last 14 days</option>
            <option value={30}>Last 30 days</option>
          </select>
        </div>
      </div>

      {/* AI Insights Section */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">
          AI-Powered Insights
        </h2>
        <div className="grid md:grid-cols-1 gap-4">
          {aiInsights.map((insight: string, index: number) => (
            <div key={index} className="bg-white dark:bg-gray-800 rounded p-4 shadow-sm">
              <p className="text-sm leading-relaxed">{insight}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Main Dashboard Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Mood Timeline */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm col-span-2">
          <h3 className="font-semibold mb-4">
            Mood Timeline
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={processedMoodData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[-1, 1]} ticks={[-1, 0, 1]} tickFormatter={(value) => value === 1 ? 'Positive' : value === -1 ? 'Negative' : 'Neutral'} />
                <Tooltip
                  formatter={(value: any) => [value === 1 ? 'Positive' : value === -1 ? 'Negative' : 'Neutral', 'Sentiment']}
                  labelFormatter={(label) => `Date: ${label}`}
                />
                <Line type="monotone" dataKey="sentiment" stroke="#3b82f6" strokeWidth={3} dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Consistency Score */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <h3 className="font-semibold mb-4">
            Journaling Consistency
          </h3>
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-600 mb-2">{consistencyScore}%</div>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {consistencyScore >= 80 ? 'Excellent consistency!' :
               consistencyScore >= 60 ? 'Good progress!' :
               consistencyScore >= 40 ? 'Keep it up!' : 'Let\'s build the habit!'}
            </p>
            <div className="mt-4 bg-gray-200 dark:bg-gray-700 rounded-full h-3">
              <div
                className="bg-blue-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${consistencyScore}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Emotion Distribution */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <h3 className="font-semibold mb-4">
            Emotional Landscape
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={emotionData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={80}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {emotionData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Word Cloud */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <h3 className="font-semibold mb-4">
            Key Themes
          </h3>
          <div className="h-64 flex items-center justify-center">
            {wordCloudData.length > 0 ? (
              <WordCloud
                data={wordCloudData.slice(0, 20)}
                width={250}
                height={200}
                fontSize={(word) => Math.log2(word.value) * 5 + 12}
                rotate={0}
                padding={2}
              />
            ) : (
              <p className="text-gray-500 text-sm">No keywords yet</p>
            )}
          </div>
        </div>

        {/* Chat Statistics */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <h3 className="font-semibold mb-4">
            AI Conversations
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm">Total Chats</span>
              <span className="font-semibold">{chatStats.totalConversations}</span>
            </div>
            {Object.entries(chatStats.personaUsage).map(([persona, count]: [string, any]) => (
              <div key={persona} className="flex justify-between">
                <span className="text-sm capitalize">{persona}</span>
                <span className="font-semibold">{count}</span>
              </div>
            ))}
            {chatStats.totalConversations === 0 && (
              <p className="text-gray-500 text-sm">No conversations yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
        <h3 className="font-semibold mb-4">Summary ({dateRange.start} to {dateRange.end})</h3>
        <div className="grid md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-blue-600">{moodTimeline.length}</div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Journal Entries</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">{emotionData.length}</div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Unique Emotions</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-600">{wordCloudData.length}</div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Key Topics</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-pink-600">{chatStats.totalConversations}</div>
            <div className="text-sm text-gray-600 dark:text-gray-300">AI Chats</div>
          </div>
        </div>
      </div>
    </div>
  );
}


