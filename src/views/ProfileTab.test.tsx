import { describe, expect, it } from 'vitest';
import { validate } from '@/views/ProfileTab';

const validForm = {
  unitSystem: 'metric',
  weight: '70',
  height: '175',
  age: '30',
  sex: 'male',
  goal: 'recomposition',
  activityLevel: 'moderate',
  dietStyle: 'standard',
  location: '',
  trainingDaysPerWeek: '4',
  trainingMinutesPerSession: '60',
  cycleTrackingOptIn: false
} as const;

describe('ProfileTab validate', () => {
  it('passes a fully valid form', () => {
    expect(validate(validForm)).toEqual({});
  });

  it('flags empty required numbers with a readable message', () => {
    expect(validate({ ...validForm, weight: '' }).weight).toBe('Please enter your weight.');
  });

  it('flags non-numeric input', () => {
    expect(validate({ ...validForm, weight: 'abc' }).weight).toBe('Enter a valid weight.');
  });

  it('flags out-of-range values with min/max bounds', () => {
    expect(validate({ ...validForm, age: '5' }).age).toBe('Age must be between 10 and 100.');
    expect(
      validate({ ...validForm, trainingMinutesPerSession: '2' }).trainingMinutesPerSession
    ).toBe('Minutes per session must be at least 10.');
  });
});
