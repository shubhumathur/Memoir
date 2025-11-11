export type OnboardingInput = {
  sleepHours?: number;
  activityLevel?: string;
  hobbies?: string[];
  stressLevel?: number;
  preferredTime?: string;
};

export type HabitSuggestion = {
  name: string;
  description: string;
  frequency: 'daily';
  reminderTime: string;
  autoAdded: boolean;
};

export function generateHabitsFromOnboarding(onboarding: OnboardingInput): HabitSuggestion[] {
  const habits: HabitSuggestion[] = [];
  const push = (name: string, description: string, reminderTime = '20:00') =>
    habits.push({ name, description, frequency: 'daily', reminderTime, autoAdded: true });

  const sleepHours = Number(onboarding.sleepHours || 0);
  const activityLevel = String(onboarding.activityLevel || '').toLowerCase();
  const hobbies = Array.isArray(onboarding.hobbies) ? onboarding.hobbies.map(h => h.toLowerCase()) : [];
  const stressLevel = Number(onboarding.stressLevel || 0);
  const preferredTime = onboarding.preferredTime || '21:00';

  if (sleepHours && sleepHours < 6) push('Wind-down routine', 'No screens 30 min before bed', '22:00');
  if (activityLevel === 'sedentary') push('Short walk', '10-minute walk post-lunch', '16:00');
  if (hobbies.includes('reading')) push('Reading', 'Read 20 minutes', '21:00');
  if (stressLevel >= 4) push('Breathing exercise', '5-minute guided breathing', preferredTime);
  if (habits.length < 3) push('Daily journaling', 'Write for 5 minutes', '20:00');

  return habits;
}
