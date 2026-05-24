import Dexie from 'dexie';
import { afterEach, describe, expect, it } from 'vitest';
import { DEFAULT_EXERCISES, LoadProgressDatabase } from '@/db/database';
import { calculateOneRepMax, createWorkoutStore } from './useWorkoutStore';

const createdDatabases = new Set<string>();

const createTestStore = async () => {
  const name = `LoadProgressStoreTest-${crypto.randomUUID()}`;
  createdDatabases.add(name);
  const database = new LoadProgressDatabase(name);
  const store = createWorkoutStore(database);

  await store.getState().loadWorkoutData();

  return { database, store };
};

const daysAgo = (days: number): Date => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(12, 0, 0, 0);
  return date;
};

afterEach(async () => {
  await Promise.all(
    [...createdDatabases].map(async (name) => {
      await Dexie.delete(name);
      createdDatabases.delete(name);
    })
  );
});

describe('calculateOneRepMax', () => {
  it('uses the Brzycki formula', () => {
    expect(calculateOneRepMax(100, 5)).toBe(112.5);
    expect(calculateOneRepMax(120, 1)).toBe(120);
  });
});

describe('useWorkoutStore', () => {
  it('creates a new 1RM PR when a heavier set beats the current record', async () => {
    const { database, store } = await createTestStore();
    const exerciseId = DEFAULT_EXERCISES[0].id;

    await store.getState().addWorkoutSet({
      exerciseId,
      weight: 100,
      reps: 5,
      date: daysAgo(2),
      isFailureSet: false
    });
    await store.getState().addWorkoutSet({
      exerciseId,
      weight: 110,
      reps: 5,
      date: daysAgo(1),
      isFailureSet: false
    });

    const oneRepMaxRecords = store
      .getState()
      .getPersonalRecordsForExercise(exerciseId)
      .filter((record) => record.type === '1RM');

    expect(oneRepMaxRecords).toHaveLength(2);
    expect(store.getState().getBestPersonalRecord(exerciseId, '1RM')?.value).toBe(123.75);
    expect((await database.personalRecords.where('type').equals('1RM').toArray()).length).toBe(2);

    database.close();
  });

  it('does not create a PR when the new set is weaker than existing records', async () => {
    const { database, store } = await createTestStore();
    const exerciseId = DEFAULT_EXERCISES[0].id;

    await store.getState().addWorkoutSet({
      exerciseId,
      weight: 100,
      reps: 5,
      date: daysAgo(3),
      isFailureSet: false
    });

    const recordCountAfterFirstSet = store.getState().personalRecords.length;

    await store.getState().addWorkoutSet({
      exerciseId,
      weight: 90,
      reps: 5,
      date: daysAgo(1),
      isFailureSet: false
    });

    expect(store.getState().personalRecords).toHaveLength(recordCountAfterFirstSet);
    expect(await database.personalRecords.count()).toBe(recordCountAfterFirstSet);

    database.close();
  });

  it('rebuilds workout set caches after deleting sets', async () => {
    const { database, store } = await createTestStore();
    const exerciseId = DEFAULT_EXERCISES[0].id;

    const firstSetId = await store.getState().addWorkoutSet({
      exerciseId,
      weight: 100,
      reps: 5,
      date: daysAgo(2),
      isFailureSet: false
    });
    const secondSetId = await store.getState().addWorkoutSet({
      exerciseId,
      weight: 105,
      reps: 3,
      date: daysAgo(1),
      isFailureSet: false
    });

    await store.getState().deleteWorkoutSet(firstSetId);

    expect(store.getState().workoutSets.map((set) => set.id)).toEqual([secondSetId]);
    expect(store.getState().getWorkoutSetsForExercise(exerciseId).map((set) => set.id)).toEqual([
      secondSetId
    ]);
    expect(store.getState().getWorkoutSetsForDate(daysAgo(2))).toEqual([]);
    expect(store.getState().getWorkoutSetsForDate(daysAgo(1)).map((set) => set.id)).toEqual([
      secondSetId
    ]);
    expect(await database.workoutSets.count()).toBe(1);

    database.close();
  });

  it('rejects invalid workout set inputs before saving', async () => {
    const { database, store } = await createTestStore();
    const exerciseId = DEFAULT_EXERCISES[0].id;

    await expect(
      store.getState().addWorkoutSet({
        exerciseId,
        weight: 1000.5,
        reps: 5,
        date: daysAgo(1),
        isFailureSet: false
      })
    ).rejects.toThrow('weight');

    await expect(
      store.getState().addWorkoutSet({
        exerciseId,
        weight: 100,
        reps: 101,
        date: daysAgo(1),
        isFailureSet: false
      })
    ).rejects.toThrow('reps');

    await expect(
      store.getState().addWorkoutSet({
        exerciseId,
        weight: 100,
        reps: 5,
        date: new Date(Date.now() + 60_000),
        isFailureSet: false
      })
    ).rejects.toThrow('future');

    expect(await database.workoutSets.count()).toBe(0);

    database.close();
  });
});
