import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import PageContainer from '../components/layout/PageContainer';
import RangePicker from '../components/TimeTravel/RangePicker';
import SummaryView from '../components/TimeTravel/SummaryView';
import Card from '../components/ui/Card';
import { motion } from 'framer-motion';

const PRESETS = [
  { label: 'Last Week', days: 7 },
  { label: 'Last Month', days: 30 },
  { label: 'Last 3 Months', days: 90 },
  { label: 'Last 6 Months', days: 180 },
  { label: 'Last Year', days: 365 },
];

export default function TimeTravel() {
  const { token } = useAuth();
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [summary, setSummary] = useState('');
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<number | null>(1);

  useEffect(() => {
    // Set default to last month
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 30);
    setStart(startDate.toISOString().split('T')[0]);
    setEnd(endDate.toISOString().split('T')[0]);
  }, []);

  const applyPreset = (preset: typeof PRESETS[0], index: number) => {
    setSelectedPreset(index);
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - preset.days);
    setStart(startDate.toISOString().split('T')[0]);
    setEnd(endDate.toISOString().split('T')[0]);
  };

  const generateSummary = async () => {
    if (!start || !end) return;
    setLoading(true);
    try {
      const res = await axios.post(
        '/insights/summary',
        { start, end },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSummary(res.data.aiSummary || res.data.summary || 'No summary available');
      setAnalysisData(res.data.analysisData);
    } catch (e) {
      console.error('Failed to generate summary', e);
      setSummary('Error generating summary. Please try again.');
      setAnalysisData(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer maxWidth="7xl">
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Time Travel Reflections
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Reflect on your mental wellness journey over time
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left Pane: Date Range Picker */}
          <div>
            <RangePicker
              start={start}
              end={end}
              onStartChange={setStart}
              onEndChange={setEnd}
              selectedPreset={selectedPreset}
              onPresetSelect={applyPreset}
              onGenerate={generateSummary}
              loading={loading}
            />
          </div>

          {/* Right Pane: Summary View */}
          <div>
            {summary ? (
              <SummaryView
                summary={summary}
                analysisData={analysisData}
                startDate={start}
                endDate={end}
              />
            ) : (
              <Card>
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🕰️</div>
                  <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                    Ready to Reflect?
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Select a time period and generate an AI-powered reflection of your mental wellness
                    journey.
                  </p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
