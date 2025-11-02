import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

type Message = { role: 'user' | 'assistant'; text: string; timestamp?: string };

export default function Chat() {
  const { token } = useAuth();
  const [persona, setPersona] = useState('mentor');
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadHistory();
  }, [persona]);

  const loadHistory = async () => {
    try {
      const res = await axios.get(`/chat/history?persona=${persona}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(res.data.messages.length > 0 ? res.data.messages : [
        { role: 'assistant', text: `Hi! I'm your ${persona}. How are you feeling today?` }
      ]);
    } catch (e) {
      console.error('Failed to load history', e);
      setMessages([{ role: 'assistant', text: `Hi! I'm your ${persona}. How are you feeling today?` }]);
    }
  };

  const send = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await axios.post('/chat/send', {
        message: input,
        persona,
        history: messages.slice(-10) // Send last 10 messages for context
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const assistantMessage: Message = {
        role: 'assistant',
        text: res.data.reply,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (e) {
      console.error('Failed to send message', e);
      const errorMessage: Message = {
        role: 'assistant',
        text: 'I\'m sorry, I\'m having trouble responding right now. Please try again.',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const summarize = async () => {
    try {
      const userMessages = messages.filter(m => m.role === 'user').map(m => m.text);
      if (userMessages.length === 0) {
        alert('No messages to summarize yet.');
        return;
      }
      const res = await axios.post('/insights/summary', { journals: userMessages }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert(`Chat Summary: ${res.data.summary}`);
    } catch (e) {
      console.error('Failed to summarize', e);
      alert('Failed to generate summary. Please try again.');
    }
  };

  const clearChat = async () => {
    if (confirm('Are you sure you want to clear this chat? This action cannot be undone.')) {
      try {
        // Note: This is a simplified clear - in production you'd want a proper clear endpoint
        setMessages([
          { role: 'assistant', text: `Hi! I'm your ${persona}. How are you feeling today?` },
        ]);
      } catch (e) {
        console.error('Failed to clear chat', e);
      }
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Empathetic AI Chat</h1>
        <div className="flex gap-2">
          <button className="px-3 py-2 rounded border text-sm hover:bg-gray-100 dark:hover:bg-gray-700" onClick={summarize}>
            Summarize
          </button>
          <button className="px-3 py-2 rounded border text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900" onClick={clearChat}>
            Clear Chat
          </button>
        </div>
      </div>

      <div className="flex gap-2 items-center">
        <label className="text-sm font-medium">AI Persona:</label>
        <select
          className="px-3 py-2 rounded border bg-white dark:bg-gray-800"
          value={persona}
          onChange={e => setPersona(e.target.value)}
        >
          <option value="mentor">Mentor - Supportive & Understanding</option>
          <option value="coach">Coach - Motivational & Action-Oriented</option>
          <option value="psychologist">Psychologist - Therapeutic & Insightful</option>
        </select>
      </div>

      <div className="rounded-lg border bg-white dark:bg-gray-800 p-4 h-96 overflow-y-auto flex flex-col gap-3 shadow-sm">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] px-4 py-3 rounded-lg ${
              m.role === 'user'
                ? 'bg-blue-600 text-white rounded-br-sm'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-bl-sm'
            }`}>
              <p className="text-sm leading-relaxed">{m.text}</p>
              {m.timestamp && (
                <p className="text-xs opacity-70 mt-1">
                  {new Date(m.timestamp).toLocaleTimeString()}
                </p>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 dark:bg-gray-700 px-4 py-3 rounded-lg rounded-bl-sm max-w-[80%]">
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
                <span className="text-sm text-gray-500">Thinking...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <input
          className="flex-1 px-4 py-3 rounded-lg border bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
          placeholder="Share what's on your mind..."
          disabled={isLoading}
        />
        <button
          className="px-6 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          onClick={send}
          disabled={isLoading || !input.trim()}
        >
          {isLoading ? 'Sending...' : 'Send'}
        </button>
      </div>

      <div className="text-xs text-gray-500 text-center">
        Your conversations are private and stored securely. The AI is here to listen and support you.
      </div>
    </div>
  );
}


