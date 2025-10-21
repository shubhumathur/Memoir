import { useState } from 'react';
import axios from 'axios';

type Message = { role: 'user' | 'assistant'; text: string };

export default function Chat() {
  const [persona, setPersona] = useState('mentor');
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', text: 'Hi! I am here to support you. How are you feeling today?' },
  ]);

  const send = async () => {
    if (!input.trim()) return;
    const userMessage: Message = { role: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    try {
      const res = await axios.post('/chat/send', { message: input, persona });
      const assistantMessage: Message = { role: 'assistant', text: res.data.reply };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (e) {
      console.error('Failed to send message', e);
    }
  };

  const summarize = async () => {
    try {
      const res = await axios.post('/insights/summary', { journals: messages.filter(m => m.role === 'user').map(m => m.text) });
      alert(`Summary: ${res.data.summary}`);
    } catch (e) {
      console.error('Failed to summarize', e);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">Chat</h1>
      <div className="flex gap-2 items-center">
        <label className="text-sm">Persona</label>
        <select className="px-3 py-2 rounded border bg-transparent" value={persona} onChange={e => setPersona(e.target.value)}>
          <option value="mentor">Mentor</option>
          <option value="coach">Coach</option>
          <option value="psychologist">Psychologist</option>
        </select>
        <button className="ml-auto px-3 py-2 rounded border" onClick={summarize}>Summarize Chat</button>
      </div>
      <div className="rounded border bg-white dark:bg-gray-800 p-4 h-96 overflow-y-auto flex flex-col gap-3">
        {messages.map((m, i) => (
          <div key={i} className={m.role === 'user' ? 'self-end max-w-[80%] px-3 py-2 rounded bg-blue-600 text-white' : 'self-start max-w-[80%] px-3 py-2 rounded bg-gray-100 dark:bg-gray-700'}>
            {m.text}
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input className="flex-1 px-3 py-2 rounded border bg-transparent" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') send(); }} placeholder="Type a message" />
        <button className="px-4 py-2 rounded bg-blue-600 text-white" onClick={send}>Send</button>
      </div>
    </div>
  );
}


