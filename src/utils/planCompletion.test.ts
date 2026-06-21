import { describe, expect, it } from 'vitest';
import { derivePlanCompletion, todayRoutineId } from './planCompletion';
import type { WorkoutSet } from '@/models';

// ---- todayRoutineId ----

describe('todayRoutineId', () => {
  it('maps Sunday (getDay=0) to "6"', () => {
    expect(todayRoutineId(new Date('2024-01-07'))).toBe('6'); // Sunday
  });
  it('maps Monday (getDay=1) to "0"', () => {
    expect(todayRoutineId(new Date('2024-01-08'))).toBe('0'); // Monday
  });
  it('maps Saturday (getDay=6) to "5"', () => {
    expect(todayRoutineId(new Date('2024-01-13'))).toBe('5'); // Saturday
  });
  it('covers all days without collision', () => {
    const dates = [
      '2024-01-08', // Mon
      '2024-01-09', // Tue
      '2024-01-10', // Wed
      '2024-01-11', // Thu
      '2024-01-12', // Fri
      '2024-01-13', // Sat
      '2024-01-14' // Sun
    ];
    const ids = dates.map((d) => todayRoutineId(new Date(d)));
    expect(ids).toEqual(['0', '1', '2', '3', '4', '5', '6']);
  });
});

// ---- derivePlanCompletion ----

const makeSet = (exerciseId: string): WorkoutSet => ({
  id: exerciseId + '-set',
  exerciseId,
  reps: 10,
  date: new Date(),
  isFailureSet: false
});

describe('derivePlanCompletion', () => {
  const plan = [
    { exerciseId: 'a', targetSets: 3, targetReps: 10 },
    { exerciseId: 'b', targetSets: 3, targetReps: 8 }
  ];

  it('returns all false when no sets logged', () => {
    const { done, sessionDone } = derivePlanCompletion(plan, []);
    expect(done).toEqual([false, false]);
    expect(sessionDone).toBe(false);
  });

  it('marks only the logged exercise as done', () => {
    const { done, sessionDone } = derivePlanCompletion(plan, [makeSet('a')]);
    expect(done).toEqual([true, false]);
    expect(sessionDone).toBe(false);
  });

  it('sessionDone is true when all exercises have a set', () => {
    const { done, sessionDone } = derivePlanCompletion(plan, [makeSet('a'), makeSet('b')]);
    expect(done).toEqual([true, true]);
    expect(sessionDone).toBe(true);
  });

  it('unplanned sets do not affect completion', () => {
    const { done } = derivePlanCompletion(plan, [makeSet('c'), makeSet('d')]);
    expect(done).toEqual([false, false]);
  });

  it('returns empty and sessionDone=false for a rest/run day with no exercises', () => {
    const { done, sessionDone } = derivePlanCompletion([], [makeSet('a')]);
    expect(done).toEqual([]);
    expect(sessionDone).toBe(false);
  });

  it('multiple sets for the same exercise count as one done', () => {
    const { done, sessionDone } = derivePlanCompletion(
      [{ exerciseId: 'a', targetSets: 3, targetReps: 10 }],
      [makeSet('a'), makeSet('a')]
    );
    expect(done).toEqual([true]);
    expect(sessionDone).toBe(true);
  });
});
