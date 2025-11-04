import React from 'react';
import { motion } from 'framer-motion';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import jsPDF from 'jspdf';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#6366f1', '#ef4444', '#8b5cf6', '#06b6d4'];

interface SummaryViewProps {
  summary: string;
  analysisData: any;
  startDate: string;
  endDate: string;
}

export default function SummaryView({ summary, analysisData, startDate, endDate }: SummaryViewProps) {
  const exportAsPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const maxWidth = pageWidth - 2 * margin;

    doc.setFontSize(18);
    doc.text('Time Travel Reflection', margin, 20);

    doc.setFontSize(12);
    doc.text(`Period: ${startDate} to ${endDate}`, margin, 35);

    // Add summary text
    const textLines = doc.splitTextToSize(summary, maxWidth);
    let yPos = 50;
    doc.setFontSize(11);
    textLines.forEach((line: string) => {
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }
      doc.text(line, margin, yPos);
      yPos += 7;
    });

    // Add analysis data
    if (analysisData) {
      yPos += 10;
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }
      doc.setFontSize(14);
      doc.text('Analysis Summary', margin, yPos);
      yPos += 10;

      doc.setFontSize(11);
      doc.text(`Total Entries: ${analysisData.totalEntries}`, margin, yPos);
      yPos += 7;
      doc.text(`Average Words per Entry: ${analysisData.avgWordsPerEntry}`, margin, yPos);
    }

    doc.save(`memoir-reflection-${startDate}-to-${endDate}.pdf`);
  };

  const emotionData = analysisData?.emotions
    ? Object.entries(analysisData.emotions)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => (b.value as number) - (a.value as number))
        .slice(0, 6)
    : [];

  const sentimentData = analysisData?.sentiments
    ? [
        { name: 'Positive', value: analysisData.sentiments.positive || 0 },
        { name: 'Neutral', value: analysisData.sentiments.neutral || 0 },
        { name: 'Negative', value: analysisData.sentiments.negative || 0 },
      ].filter((item) => item.value > 0)
    : [];

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              AI Reflection Summary
            </h2>
            <Button onClick={exportAsPDF} variant="secondary" size="sm">
              Export as PDF
            </Button>
          </div>
          <div className="prose dark:prose-invert max-w-none">
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
              {summary}
            </p>
          </div>
        </Card>
      </motion.div>

      {analysisData && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <h3 className="font-semibold mb-4 text-gray-900 dark:text-white">Period Overview</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Total Entries</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {analysisData.totalEntries}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Avg Words/Entry</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {analysisData.avgWordsPerEntry}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Date Range</span>
                <span className="font-semibold text-sm text-gray-900 dark:text-white">
                  {startDate} to {endDate}
                </span>
              </div>
            </div>
          </Card>

          {emotionData.length > 0 && (
            <Card>
              <h3 className="font-semibold mb-4 text-gray-900 dark:text-white">
                Emotional Landscape
              </h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={emotionData}
                      dataKey="value"
                      nameKey="name"
                      outerRadius={70}
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
            </Card>
          )}

          {sentimentData.length > 0 && (
            <Card>
              <h3 className="font-semibold mb-4 text-gray-900 dark:text-white">Sentiment Overview</h3>
              <div className="space-y-2">
                {sentimentData.map((item: any) => (
                  <div key={item.name} className="flex justify-between items-center">
                    <span className="text-sm capitalize text-gray-700 dark:text-gray-300">
                      {item.name}
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-500 ${
                            item.name === 'Positive'
                              ? 'bg-green-500'
                              : item.name === 'Negative'
                              ? 'bg-red-500'
                              : 'bg-yellow-500'
                          }`}
                          style={{
                            width: `${(item.value / analysisData.totalEntries) * 100}%`,
                          }}
                        ></div>
                      </div>
                      <span className="text-sm font-semibold w-8 text-right text-gray-900 dark:text-white">
                        {item.value}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {analysisData.keywords && Object.keys(analysisData.keywords).length > 0 && (
            <Card className="md:col-span-2 lg:col-span-3">
              <h3 className="font-semibold mb-4 text-gray-900 dark:text-white">
                Key Topics & Keywords
              </h3>
              <div className="flex flex-wrap gap-2">
                {Object.entries(analysisData.keywords)
                  .sort(([, a]: any, [, b]: any) => b - a)
                  .slice(0, 20)
                  .map(([keyword, count]: [string, any]) => (
                    <span
                      key={keyword}
                      className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-full text-sm"
                      title={`${keyword}: ${count} occurrences`}
                    >
                      {keyword} ({count})
                    </span>
                  ))}
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

