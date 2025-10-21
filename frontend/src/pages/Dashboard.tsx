import { Link } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const moodData = [
  { day: 'Mon', mood: 3 },
  { day: 'Tue', mood: 2 },
  { day: 'Wed', mood: 4 },
  { day: 'Thu', mood: 3 },
  { day: 'Fri', mood: 5 },
  { day: 'Sat', mood: 4 },
  { day: 'Sun', mood: 3 },
];

export default function Dashboard() {
  return (
    <div className="p-6 flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Welcome back</h1>
      <div className="grid md:grid-cols-3 gap-6">
        <div className="col-span-2 bg-white dark:bg-gray-800 rounded p-4 shadow">
          <h3 className="font-medium mb-2">Mood Overview</h3>
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
        <div className="bg-white dark:bg-gray-800 rounded p-4 shadow flex flex-col gap-3">
          <h3 className="font-medium">Quick Actions</h3>
          <Link to="/journal" className="px-3 py-2 rounded bg-blue-600 text-white text-center">Quick Journal</Link>
          <Link to="/chat" className="px-3 py-2 rounded border text-center">Open Chat</Link>
        </div>
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded p-4 shadow">
          <h3 className="font-medium mb-2">Chat preview</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">AI: Remember to celebrate small wins today.</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded p-4 shadow">
          <h3 className="font-medium mb-2">Reflection prompt</h3>
          <p className="text-sm">What gave you energy this week?</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded p-4 shadow">
          <h3 className="font-medium mb-2">Crisis resources</h3>
          <p className="text-xs text-gray-600 dark:text-gray-300">If you're in crisis, contact your local emergency number or visit a trusted resource.</p>
        </div>
      </div>
    </div>
  );
}


