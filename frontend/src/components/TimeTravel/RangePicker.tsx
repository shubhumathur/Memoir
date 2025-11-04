import React from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';

const PRESETS = [
  { label: 'Last Week', days: 7 },
  { label: 'Last Month', days: 30 },
  { label: 'Last 3 Months', days: 90 },
  { label: 'Last 6 Months', days: 180 },
  { label: 'Last Year', days: 365 },
];

interface RangePickerProps {
  start: string;
  end: string;
  onStartChange: (date: string) => void;
  onEndChange: (date: string) => void;
  selectedPreset: number | null;
  onPresetSelect: (preset: typeof PRESETS[0], index: number) => void;
  onGenerate: () => void;
  loading: boolean;
}

export default function RangePicker({
  start,
  end,
  onStartChange,
  onEndChange,
  selectedPreset,
  onPresetSelect,
  onGenerate,
  loading,
}: RangePickerProps) {
  return (
    <Card>
      <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Select Time Period</h2>
      
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
            Quick Presets
          </label>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((preset, index) => (
              <button
                key={preset.label}
                onClick={() => onPresetSelect(preset, index)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  selectedPreset === index
                    ? 'bg-blue-600 text-white shadow-md scale-105'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
                aria-pressed={selectedPreset === index}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
              From Date
            </label>
            <input
              type="date"
              value={start}
              onChange={(e) => onStartChange(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
              To Date
            </label>
            <input
              type="date"
              value={end}
              onChange={(e) => onEndChange(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <Button
          onClick={onGenerate}
          disabled={loading || !start || !end}
          isLoading={loading}
          className="w-full"
        >
          {loading ? 'Generating...' : 'Generate Reflection'}
        </Button>
      </div>
    </Card>
  );
}

