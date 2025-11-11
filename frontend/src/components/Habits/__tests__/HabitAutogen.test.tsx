import { describe, it, expect } from 'vitest';
import { generateHabitsFromOnboarding } from '../../../src/utils/habits';

describe('generateHabitsFromOnboarding', () => {
  it('adds wind-down when sleepHours < 6', () => {
    const habits = generateHabitsFromOnboarding({ sleepHours: 5 });
    expect(habits.some(h => h.name.includes('Wind-down'))).toBe(true);
  });

  it('adds short walk when sedentary', () => {
    const habits = generateHabitsFromOnboarding({ activityLevel: 'sedentary' });
    expect(habits.some(h => h.name.includes('Short walk'))).toBe(true);
  });

  it('adds reading when hobbies include reading', () => {
    const habits = generateHabitsFromOnboarding({ hobbies: ['Reading'] });
    expect(habits.some(h => h.name.includes('Reading'))).toBe(true);
  });

  it('adds breathing when stressLevel >= 4', () => {
    const habits = generateHabitsFromOnboarding({ stressLevel: 4, preferredTime: '09:00' });
    const b = habits.find(h => h.name.includes('Breathing'));
    expect(b).toBeTruthy();
    expect(b?.reminderTime).toBe('09:00');
  });

  it('ensures at least one habit', () => {
    const habits = generateHabitsFromOnboarding({});
    expect(habits.length).toBeGreaterThanOrEqual(1);
  });
});
