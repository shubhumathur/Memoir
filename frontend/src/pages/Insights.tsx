import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import PageContainer from '../components/layout/PageContainer';
import Card from '../components/ui/Card';
import Skeleton from '../components/ui/Skeleton';
import EmotionTimeline from '../components/Insights/EmotionTimeline';
import TopEmotionsTable from '../components/Insights/TopEmotionsTable';
import WordCloud from 'react-d3-cloud';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#6366f1', '#ef4444', '#8b5cf6', '#06b6d4'];

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
        headers: { Authorization: `Bearer ${token}` },
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
      <PageContainer maxWidth="7xl">
        <div className="space-y-6">
          <Skeleton variant="text" width="40%" height={40} />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <Skeleton variant="rectangular" height={200} />
              </Card>
            ))}
          </div>
        </div>
      </PageContainer>
    );
  }

  if (!moodboardData) {
    return (
      <PageContainer maxWidth="7xl">
        <Card>
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📊</div>
            <p className="text-gray-500 dark:text-gray-400">
              No data available yet. Start journaling and chatting to see your insights!
            </p>
          </div>
        </Card>
      </PageContainer>
    );
  }

  const { moodTimeline, emotionData, wordCloudData, chatStats, consistencyScore, aiInsights, dateRange } = moodboardData;

  const processedMoodData = moodTimeline.map((entry: any) => ({
    date: new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    sentiment: entry.sentiment === 'positive' ? 1 : entry.sentiment === 'negative' ? -1 : 0,
    fullDate: entry.date,
  }));

  // Separate positive and negative emotions
  const positiveEmotions = emotionData.filter((e: any) => ['joy', 'happy', 'calm', 'grateful', 'excited', 'confident'].includes(e.name.toLowerCase()));
  const negativeEmotions = emotionData.filter((e: any) => ['sad', 'anxious', 'angry', 'stressed', 'worried', 'frustrated'].includes(e.name.toLowerCase()));

  return (
    <PageContainer maxWidth="7xl">
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Insights Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Discover patterns in your mental wellness journey
            </p>
          </div>
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Time Range:</label>
            <select
              className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={selectedDays}
              onChange={(e) => setSelectedDays(Number(e.target.value))}
              aria-label="Select time range"
            >
              <option value={7}>Last 7 days</option>
              <option value={14}>Last 14 days</option>
              <option value={30}>Last 30 days</option>
            </select>
          </div>
        </motion.div>

        {/* AI Insights Section */}
        {aiInsights && aiInsights.length > 0 && (
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              💡 AI-Powered Insights
            </h2>
            <div className="grid md:grid-cols-1 gap-4">
              {aiInsights.map((insight: string, index: number) => (
                <div
                  key={index}
                  className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700"
                >
                  <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">{insight}</p>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Main Dashboard Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Emotion Timeline */}
          <div className="md:col-span-2">
            <EmotionTimeline data={processedMoodData} />
          </div>

          {/* Consistency Score */}
          <Card>
            <h3 className="font-semibold mb-4 text-gray-900 dark:text-white">
              Journaling Consistency
            </h3>
            <div className="text-center">
              <div className="text-5xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                {consistencyScore}%
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                {consistencyScore >= 80
                  ? 'Excellent consistency!'
                  : consistencyScore >= 60
                  ? 'Good progress!'
                  : consistencyScore >= 40
                  ? 'Keep it up!'
                  : "Let's build the habit!"}
              </p>
              <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${consistencyScore}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className="bg-blue-600 h-3 rounded-full"
                />
              </div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
              Percentage of days with journal entries in the selected period.
            </p>
          </Card>

          {/* Emotion Distribution */}
          <Card>
            <h3 className="font-semibold mb-4 text-gray-900 dark:text-white">Emotional Landscape</h3>
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
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Distribution of emotions detected across your journal entries.
            </p>
          </Card>

          {/* Word Cloud */}
          <Card>
            <h3 className="font-semibold mb-4 text-gray-900 dark:text-white">Key Themes</h3>
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
                <p className="text-gray-500 dark:text-gray-400 text-sm">No keywords yet</p>
              )}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Most frequently mentioned topics in your journal entries.
            </p>
          </Card>

          {/* Top Positive Emotions */}
          <TopEmotionsTable emotions={positiveEmotions} type="positive" />

          {/* Top Negative Emotions */}
          <TopEmotionsTable emotions={negativeEmotions} type="negative" />

          {/* Chat Statistics */}
          <Card>
            <h3 className="font-semibold mb-4 text-gray-900 dark:text-white">AI Conversations</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                <span className="text-sm text-gray-700 dark:text-gray-300">Total Chats</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {chatStats.totalConversations}
                </span>
              </div>
              {Object.entries(chatStats.personaUsage || {}).map(([persona, count]: [string, any]) => (
                <div key={persona} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                  <span className="text-sm capitalize text-gray-700 dark:text-gray-300">{persona}</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{count}</span>
                </div>
              ))}
              {chatStats.totalConversations === 0 && (
                <p className="text-gray-500 dark:text-gray-400 text-sm text-center py-4">
                  No conversations yet
                </p>
              )}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
              Your AI chat interactions and persona preferences.
            </p>
          </Card>
        </div>

        {/* Summary Stats */}
        <Card>
          <h3 className="font-semibold mb-4 text-gray-900 dark:text-white">
            Summary ({dateRange.start} to {dateRange.end})
          </h3>
          <div className="grid md:grid-cols-4 gap-4 text-center">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {moodTimeline.length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">Journal Entries</div>
            </div>
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                {emotionData.length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">Unique Emotions</div>
            </div>
            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                {wordCloudData.length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">Key Topics</div>
            </div>
            <div className="p-4 bg-pink-50 dark:bg-pink-900/20 rounded-xl">
              <div className="text-3xl font-bold text-pink-600 dark:text-pink-400">
                {chatStats.totalConversations}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">AI Chats</div>
            </div>
          </div>
        </Card>
      </div>
    </PageContainer>
  );
}
