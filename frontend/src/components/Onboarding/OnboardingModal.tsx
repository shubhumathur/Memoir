import React, { useMemo, useState } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCompleted?: () => void;
}

export default function OnboardingModal({ isOpen, onClose, onCompleted }: OnboardingModalProps) {
  const { token } = useAuth();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    age: '',
    sleepHours: 7,
    activityLevel: 'light',
    hobbies: [] as string[],
    preferredTime: '21:00',
    moodAvg: 3,
    stressLevel: 3,
  });

  const steps = useMemo(() => [
    'Basic info', 'Sleep', 'Activity', 'Mood & stress', 'Hobbies & preferences', 'Privacy'
  ], []);

  const addHobby = (value: string) => {
    if (!value.trim()) return;
    if (form.hobbies.includes(value)) return;
    setForm(prev => ({ ...prev, hobbies: [...prev.hobbies, value] }));
  };

  const removeHobby = (value: string) => setForm(prev => ({ ...prev, hobbies: prev.hobbies.filter(h => h !== value) }));

  const next = () => setStep(s => Math.min(s + 1, steps.length - 1));
  const back = () => setStep(s => Math.max(s - 1, 0));

  const finish = async () => {
    // If user not authenticated yet, store draft and go to signup
    if (!token) {
      localStorage.setItem('onboarding_draft', JSON.stringify(form));
      window.location.href = '/signup';
      return;
    }

    setSaving(true);
    try {
      await axios.post('/settings/onboarding', { onboarding: form }, { headers: { Authorization: `Bearer ${token}` } });
      await axios.post('/habits/autogenerate', { onboarding: form }, { headers: { Authorization: `Bearer ${token}` } });
      localStorage.removeItem('onboarding_draft');
      onCompleted?.();
      onClose();
    } catch (e) {
      console.error('Onboarding save error', e);
      alert('Failed to save onboarding. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Welcome • ${steps[step]}`} size="md">
      <div className="space-y-5">
        <div className="flex gap-2" aria-label="Progress">
          {steps.map((_, i) => (
            <div key={i} className={`h-2 rounded-full ${i <= step ? 'bg-primary w-8' : 'bg-neutral-200 w-2'}`} />
          ))}
        </div>

        {step === 0 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Display name</label>
              <input className="w-full px-3 py-2 rounded-xl border" placeholder="Your name" aria-label="Display name" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Age</label>
                <input type="number" className="w-full px-3 py-2 rounded-xl border" value={form.age} onChange={e => setForm(prev => ({ ...prev, age: e.target.value }))} aria-label="Age" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Timezone</label>
                <input className="w-full px-3 py-2 rounded-xl border" value={Intl.DateTimeFormat().resolvedOptions().timeZone} disabled aria-label="Timezone" />
              </div>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <label className="block text-sm font-medium">Average sleep hours: {form.sleepHours}h</label>
            <input type="range" min={3} max={10} value={form.sleepHours} onChange={e => setForm(prev => ({ ...prev, sleepHours: Number(e.target.value) }))} aria-label="Average sleep hours" />
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <label className="block text-sm font-medium mb-1">Activity level</label>
            <select className="w-full px-3 py-2 rounded-xl border" value={form.activityLevel} onChange={e => setForm(prev => ({ ...prev, activityLevel: e.target.value }))} aria-label="Activity level">
              <option value="sedentary">Sedentary</option>
              <option value="light">Light</option>
              <option value="moderate">Moderate</option>
              <option value="very active">Very active</option>
            </select>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <label className="block text-sm font-medium">Average mood: {form.moodAvg}</label>
            <input type="range" min={1} max={5} value={form.moodAvg} onChange={e => setForm(prev => ({ ...prev, moodAvg: Number(e.target.value) }))} aria-label="Average mood" />
            <label className="block text-sm font-medium">Stress level: {form.stressLevel}</label>
            <input type="range" min={1} max={5} value={form.stressLevel} onChange={e => setForm(prev => ({ ...prev, stressLevel: Number(e.target.value) }))} aria-label="Stress level" />
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Hobbies (press Enter)</label>
              <input className="w-full px-3 py-2 rounded-xl border" onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addHobby((e.target as HTMLInputElement).value); (e.target as HTMLInputElement).value=''; } }} aria-label="Add hobby" />
              <div className="flex flex-wrap gap-2 mt-2">
                {form.hobbies.map(h => (
                  <span key={h} className="px-3 py-1 rounded-full bg-secondary text-neutral-900 text-sm">
                    {h}
                    <button className="ml-2 text-accent" aria-label={`Remove ${h}`} onClick={() => removeHobby(h)}>×</button>
                  </span>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Preferred reminder time</label>
              <input type="time" className="w-full px-3 py-2 rounded-xl border" value={form.preferredTime} onChange={e => setForm(prev => ({ ...prev, preferredTime: e.target.value }))} aria-label="Preferred reminder time" />
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-4">
            <label className="inline-flex items-center gap-2">
              <input type="checkbox" defaultChecked aria-label="I agree to data processing" />
              <span className="text-sm">I agree to store my onboarding answers to personalize my experience.</span>
            </label>
          </div>
        )}

        <div className="flex justify-between pt-2">
          <Button variant="ghost" onClick={onClose} aria-label="Skip onboarding">Skip</Button>
          <div className="flex gap-2">
            {step > 0 && <Button variant="outline" onClick={back} aria-label="Back">Back</Button>}
            {step < steps.length - 1 ? (
              <Button onClick={next} aria-label="Next">Next</Button>
            ) : (
              <Button onClick={finish} isLoading={saving} aria-label="Finish onboarding">Finish</Button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
