import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import Card from '../ui/Card';

interface EmotionTimelineProps {
  data: Array<{
    date: string;
    sentiment: number;
    fullDate: string;
  }>;
}

export default function EmotionTimeline({ data }: EmotionTimelineProps) {
  return (
    <Card>
      <h3 className="font-semibold mb-4 text-gray-900 dark:text-white">Emotion Timeline</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorSentiment" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="date" stroke="#6b7280" />
            <YAxis domain={[-1, 1]} ticks={[-1, 0, 1]} tickFormatter={(value) => value === 1 ? 'Positive' : value === -1 ? 'Negative' : 'Neutral'} stroke="#6b7280" />
            <Tooltip
              formatter={(value: any) => [value === 1 ? 'Positive' : value === -1 ? 'Negative' : 'Neutral', 'Sentiment']}
              labelFormatter={(label) => `Date: ${label}`}
              contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: '8px' }}
            />
            <Area
              type="monotone"
              dataKey="sentiment"
              stroke="#3b82f6"
              strokeWidth={2}
              fill="url(#colorSentiment)"
              dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
        Shows your emotional journey over time. Positive values indicate positive sentiment, negative values indicate negative sentiment.
      </p>
    </Card>
  );
}

