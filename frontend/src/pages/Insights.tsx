import { useState, useEffect } from 'react';
import axios from 'axios';
import WordCloud from 'react-d3-cloud';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis } from 'recharts';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#6366f1', '#ef4444'];

export default function Insights() {
  const [graphData, setGraphData] = useState<any>(null);
  const [summaryData, setSummaryData] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const graphRes = await axios.get('/insights/graph');
        setGraphData(graphRes.data);
        const summaryRes = await axios.post('/insights/summary', { journals: [], start: '2025-01-01', end: '2025-12-31' });
        setSummaryData(summaryRes.data);
      } catch (e) {
        console.error('Failed to fetch insights', e);
      }
    };
    fetchData();
  }, []);

  const emotions = graphData ? [
    { name: 'Joy', value: graphData.activitiesLinkedToHappiness?.length || 0 },
    { name: 'Anxiety', value: graphData.topTriggersForAnxiety?.length || 0 },
    { name: 'Calm', value: graphData.habitsImprovingStability?.length || 0 },
  ] : [];

  const consistency = [
    { day: 'Mon', count: 1 },
    { day: 'Tue', count: 0 },
    { day: 'Wed', count: 1 },
    { day: 'Thu', count: 1 },
    { day: 'Fri', count: 1 },
    { day: 'Sat', count: 0 },
    { day: 'Sun', count: 1 },
  ];

  const words = graphData ? graphData.activitiesLinkedToHappiness?.map((a: any) => ({ text: a.activity, value: a.count })) || [] : [];

  return (
    <div className="p-6 flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Insights</h1>
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded p-4 shadow">
          <h3 className="font-medium mb-2">Emotions</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={emotions} dataKey="value" nameKey="name" outerRadius={80} label>
                  {emotions.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded p-4 shadow">
          <h3 className="font-medium mb-2">Consistency</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={consistency}>
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#2563eb" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded p-4 shadow">
          <h3 className="font-medium mb-2">Word Cloud</h3>
          <div className="h-64">
            <WordCloud data={words} width={200} height={200} />
          </div>
        </div>
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        <InsightCard title="Top Anxiety Triggers" text={graphData?.topTriggersForAnxiety?.map((a: any) => a.activity).join(', ') || 'None'} />
        <InsightCard title="Joy Activities" text={graphData?.activitiesLinkedToHappiness?.map((a: any) => a.activity).join(', ') || 'None'} />
        <InsightCard title="Stabilizing Habits" text={graphData?.habitsImprovingStability?.map((h: any) => h.habit).join(', ') || 'None'} />
      </div>
    </div>
  );
}

function InsightCard({ title, text }: { title: string; text: string }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded p-4 shadow">
      <h3 className="font-medium mb-2">{title}</h3>
      <p className="text-sm text-gray-600 dark:text-gray-300">{text}</p>
    </div>
  );
}


