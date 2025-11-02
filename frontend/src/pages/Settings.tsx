import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#6366f1'];

export default function Settings() {
  const { token, logout } = useAuth();
  const [settings, setSettings] = useState<any>(null);
  const [insights, setInsights] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [activeTab, setActiveTab] = useState('profile');

  // Form states
  const [persona, setPersona] = useState('mentor');
  const [privacyLocal, setPrivacyLocal] = useState(false);
  const [theme, setTheme] = useState<'light'|'dark'>('light');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const [settingsRes, insightsRes] = await Promise.all([
        axios.get('/settings', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('/settings/insights', { headers: { Authorization: `Bearer ${token}` } })
      ]);

      setSettings(settingsRes.data);
      setInsights(insightsRes.data);

      // Set form values
      setPersona(settingsRes.data.user.persona);
      setPrivacyLocal(settingsRes.data.user.privacySettings?.localOnly || false);
      setTheme(settingsRes.data.user.theme);
    } catch (e) {
      console.error('Failed to load settings', e);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      await axios.post('/settings/update',
        {
          persona,
          privacySettings: { localOnly: privacyLocal },
          theme
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await loadSettings(); // Reload to get updated data
    } catch (e) {
      console.error('Failed to save settings', e);
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async () => {
    if (!currentPassword || !newPassword) return;

    try {
      await axios.post('/settings/change-password',
        { currentPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCurrentPassword('');
      setNewPassword('');
      alert('Password changed successfully!');
    } catch (e) {
      console.error('Failed to change password', e);
      alert('Failed to change password. Please try again.');
    }
  };

  const exportData = async () => {
    try {
      const response = await axios.get('/settings/export', {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `memoir-data-${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (e) {
      console.error('Failed to export data', e);
      alert('Failed to export data. Please try again.');
    }
  };

  const deleteAllData = async () => {
    if (deleteConfirmation !== 'DELETE_ALL_DATA') return;

    try {
      await axios.delete('/settings/data',
        {
          data: { confirmDelete: deleteConfirmation },
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      alert('All data deleted successfully. You will be logged out.');
      logout();
    } catch (e) {
      console.error('Failed to delete data', e);
      alert('Failed to delete data. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-4xl mx-auto flex items-center justify-center">
        <div className="text-lg">Loading settings...</div>
      </div>
    );
  }

  const tabs = [
    { id: 'profile', label: 'Profile & Preferences', icon: '👤' },
    { id: 'privacy', label: 'Privacy & Data', icon: '🔒' },
    { id: 'insights', label: 'Your Journey', icon: '📊' }
  ];

  const personaDescriptions = {
    mentor: 'A wise guide offering advice and perspective on life experiences',
    coach: 'A motivational coach focused on goals, habits, and personal growth',
    psychologist: 'A mental health professional providing therapeutic support and insights'
  };

  const sentimentData = insights ? [
    { name: 'Positive', value: Math.round((insights.avgSentiment + 1) * 50), color: '#10b981' },
    { name: 'Neutral', value: 100 - Math.abs(insights.avgSentiment * 50), color: '#f59e0b' },
    { name: 'Negative', value: Math.round((1 - insights.avgSentiment) * 50), color: '#ef4444' }
  ].filter(item => item.value > 0) : [];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Manage your account and preferences
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Profile & Preferences Tab */}
      {activeTab === 'profile' && (
        <div className="space-y-6">
          {/* User Info */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Account Information</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Username</label>
                <div className="px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded border text-gray-900 dark:text-white">
                  {settings?.user.username}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                <div className="px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded border text-gray-900 dark:text-white">
                  {settings?.user.email}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Member Since</label>
                <div className="px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded border text-gray-900 dark:text-white">
                  {settings?.user.joinedAt ? new Date(settings.user.joinedAt).toLocaleDateString() : 'N/A'}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Days Active</label>
                <div className="px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded border text-gray-900 dark:text-white">
                  {settings?.stats.daysActive || 0}
                </div>
              </div>
            </div>
          </div>

          {/* AI Companion Settings */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">AI Companion</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Preferred Persona</label>
                <select
                  className="w-full px-3 py-2 rounded border bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  value={persona}
                  onChange={e => setPersona(e.target.value)}
                >
                  <option value="mentor">Mentor - Wise guidance and life advice</option>
                  <option value="coach">Coach - Motivation and goal-focused support</option>
                  <option value="psychologist">Psychologist - Therapeutic and mental health support</option>
                </select>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {personaDescriptions[persona as keyof typeof personaDescriptions]}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Theme</label>
                <select
                  className="w-full px-3 py-2 rounded border bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  value={theme}
                  onChange={e => setTheme(e.target.value as 'light'|'dark')}
                >
                  <option value="light">Light Theme</option>
                  <option value="dark">Dark Theme</option>
                </select>
              </div>

              <button
                onClick={saveSettings}
                disabled={saving}
                className="px-6 py-2 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving...' : 'Save Preferences'}
              </button>
            </div>
          </div>

          {/* Change Password */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Change Password</h2>
            <div className="space-y-4 max-w-md">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Current Password</label>
                <input
                  type="password"
                  className="w-full px-3 py-2 rounded border bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">New Password</label>
                <input
                  type="password"
                  className="w-full px-3 py-2 rounded border bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                />
              </div>
              <button
                onClick={changePassword}
                className="px-6 py-2 bg-green-600 text-white rounded font-medium hover:bg-green-700"
              >
                Change Password
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Privacy & Data Tab */}
      {activeTab === 'privacy' && (
        <div className="space-y-6">
          {/* Privacy Settings */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Privacy Settings</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Local-only Mode</label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Keep all data stored locally and disable cloud features
                  </p>
                </div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={privacyLocal}
                    onChange={e => setPrivacyLocal(e.target.checked)}
                    className="rounded"
                  />
                </label>
              </div>

              <button
                onClick={saveSettings}
                disabled={saving}
                className="px-6 py-2 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving...' : 'Save Privacy Settings'}
              </button>
            </div>
          </div>

          {/* Data Management */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Data Management</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Export Your Data</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Download all your journal entries and chat conversations as a JSON file.
                </p>
                <button
                  onClick={exportData}
                  className="px-4 py-2 bg-green-600 text-white rounded font-medium hover:bg-green-700"
                >
                  Export Data
                </button>
              </div>

              <hr className="border-gray-200 dark:border-gray-700" />

              <div>
                <h3 className="font-medium mb-2 text-red-600 dark:text-red-400">Delete All Data</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Permanently delete all your journal entries, chat conversations, and reset your account to defaults.
                  This action cannot be undone.
                </p>

                {!showDeleteConfirm ? (
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="px-4 py-2 bg-red-600 text-white rounded font-medium hover:bg-red-700"
                  >
                    Delete All Data
                  </button>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-red-600 dark:text-red-400">
                      Type "DELETE_ALL_DATA" to confirm:
                    </p>
                    <input
                      type="text"
                      className="w-full px-3 py-2 rounded border bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      value={deleteConfirmation}
                      onChange={e => setDeleteConfirmation(e.target.value)}
                      placeholder="DELETE_ALL_DATA"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={deleteAllData}
                        disabled={deleteConfirmation !== 'DELETE_ALL_DATA'}
                        className="px-4 py-2 bg-red-600 text-white rounded font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Confirm Delete
                      </button>
                      <button
                        onClick={() => {
                          setShowDeleteConfirm(false);
                          setDeleteConfirmation('');
                        }}
                        className="px-4 py-2 bg-gray-600 text-white rounded font-medium hover:bg-gray-700"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Your Journey Tab */}
      {activeTab === 'insights' && (
        <div className="space-y-6">
          {/* Usage Statistics */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Your Journey Statistics</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{insights?.totalJournals || 0}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Journal Entries</div>
              </div>
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">{insights?.totalChats || 0}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Chat Conversations</div>
              </div>
              <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{insights?.streakData?.current || 0}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Current Streak</div>
              </div>
              <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{insights?.streakData?.longest || 0}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Longest Streak</div>
              </div>
            </div>
          </div>

          {/* Sentiment Analysis */}
          {sentimentData.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Overall Sentiment</h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={sentimentData}
                      dataKey="value"
                      nameKey="name"
                      outerRadius={80}
                      label={({ name, value }) => `${name}: ${value}%`}
                    >
                      {sentimentData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Most Used Persona */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Your AI Companion</h2>
            <div className="text-center">
              <div className="text-4xl mb-2">
                {insights?.mostUsedPersona === 'mentor' ? 'Mentor' :
                 insights?.mostUsedPersona === 'coach' ? 'Coach' : 'Psychologist'}
              </div>
              <div className="text-lg font-semibold capitalize">{insights?.mostUsedPersona || 'Mentor'}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Your most frequently used AI companion
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


