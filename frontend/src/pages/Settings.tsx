import { useState } from 'react';

export default function Settings() {
  const [persona, setPersona] = useState('mentor');
  const [privacyLocal, setPrivacyLocal] = useState(false);
  const [theme, setTheme] = useState<'light'|'dark'>('light');

  return (
    <div className="p-6 max-w-3xl mx-auto flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">Settings</h1>
      <div className="bg-white dark:bg-gray-800 rounded p-4 shadow flex flex-col gap-4">
        <div>
          <label className="block text-sm mb-1">Persona</label>
          <select className="px-3 py-2 rounded border bg-transparent" value={persona} onChange={e=>setPersona(e.target.value)}>
            <option value="mentor">Mentor</option>
            <option value="coach">Coach</option>
            <option value="psychologist">Psychologist</option>
          </select>
        </div>
        <div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={privacyLocal} onChange={()=>setPrivacyLocal(!privacyLocal)} />
            Local-only mode
          </label>
          <div className="mt-2 flex gap-2">
            <button className="px-3 py-2 rounded border">Export Data</button>
            <button className="px-3 py-2 rounded border">Delete Data</button>
          </div>
        </div>
        <div>
          <label className="block text-sm mb-1">Theme</label>
          <select className="px-3 py-2 rounded border bg-transparent" value={theme} onChange={e=>setTheme(e.target.value as 'light'|'dark')}>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </div>
      </div>
    </div>
  );
}


