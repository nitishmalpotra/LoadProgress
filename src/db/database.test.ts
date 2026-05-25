import Dexie from 'dexie';
import { afterEach, describe, expect, it } from 'vitest';
import { DEFAULT_EXERCISES, LoadProgressDatabase, UUID_REGEX, createUuid } from './database';
import type { Exercise, WorkoutSet } from '@/models';

const createdDatabases = new Set<string>();

const createTestDatabase = () => {
  const name = `LoadProgressTest-${crypto.randomUUID()}`;
  createdDatabases.add(name);
  return new LoadProgressDatabase(name);
};

afterEach(async () => {
  await Promise.all(
    [...createdDatabases].map(async (name) => {
      await Dexie.delete(name);
      createdDatabases.delete(name);
    })
  );
});

describe('LoadProgressDatabase', () => {
  it('pre-populates the default exercise library', async () => {
    const database = createTestDatabase();

    await database.open();

    expect(await database.exercises.count()).toBe(DEFAULT_EXERCISES.length);
    expect(await database.exercises.toArray()).toEqual(DEFAULT_EXERCISES);
    expect(DEFAULT_EXERCISES.every((exercise) => UUID_REGEX.test(exercise.id))).toBe(true);

    database.close();
  });

  it('adds a custom exercise asynchronously with an RFC 4122 UUID', async () => {
    const database = createTestDatabase();
    const customExercise: Omit<Exercise, 'id'> = {
      name: 'Goblet Squat',
      type: 'Weight Training',
      muscleGroup: 'Legs',
      secondaryMuscleGroups: ['Glutes', 'Core'],
      icon: 'squat',
      difficulty: 'Beginner',
      equipment: ['Kettlebell'],
      description: 'Front-loaded squat variation',
      formCues: ['Keep chest tall', 'Sit between hips']
    };

    await database.open();
    const id = await database.addExercise(customExercise);
    const savedExercise = await database.exercises.get(id);

    expect(UUID_REGEX.test(id)).toBe(true);
    expect(savedExercise).toMatchObject(customExercise);
    expect(await database.exercises.count()).toBe(DEFAULT_EXERCISES.length + 1);

    database.close();
  });

  it('queries workout sets by date', async () => {
    const database = createTestDatabase();
    const exerciseId = DEFAULT_EXERCISES[0].id;
    const targetMorning = new Date('2026-05-24T08:30:00.000Z');
    const targetEvening = new Date('2026-05-24T19:15:00.000Z');
    const otherDate = new Date('2026-05-25T08:30:00.000Z');

    await database.open();

    const targetSetIds = await Promise.all([
      database.addWorkoutSet({
        exerciseId,
        weight: 100,
        reps: 5,
        date: targetMorning,
        isFailureSet: false
      }),
      database.addWorkoutSet({
        exerciseId,
        weight: 102.5,
        reps: 3,
        date: targetEvening,
        rpe: 9,
        restTime: 180,
        notes: 'Moved well',
        isFailureSet: true
      })
    ]);

    await database.addWorkoutSet({
      exerciseId,
      weight: 90,
      reps: 8,
      date: otherDate,
      isFailureSet: false
    });

    const setsForDate = await database.getWorkoutSetsByDate(targetMorning);

    expect(setsForDate.map((set) => set.id).sort()).toEqual(targetSetIds.sort());
    expect(setsForDate.every((set) => UUID_REGEX.test(set.id))).toBe(true);

    database.close();
  });

  it('does not duplicate seeded exercises when the database is reopened', async () => {
    const name = `LoadProgressRefreshTest-${crypto.randomUUID()}`;
    createdDatabases.add(name);
    const firstLoad = new LoadProgressDatabase(name);

    await firstLoad.open();
    expect(await firstLoad.exercises.count()).toBe(DEFAULT_EXERCISES.length);
    firstLoad.close();

    const refreshedLoad = new LoadProgressDatabase(name);
    await refreshedLoad.open();

    expect(await refreshedLoad.exercises.count()).toBe(DEFAULT_EXERCISES.length);

    refreshedLoad.close();
  });

  it('creates RFC 4122 UUIDs for new set IDs', async () => {
    const setId = createUuid();
    const set: WorkoutSet = {
      id: setId,
      exerciseId: DEFAULT_EXERCISES[0].id,
      weight: 80,
      reps: 8,
      date: new Date(),
      isFailureSet: false
    };

    expect(UUID_REGEX.test(set.id)).toBe(true);
    expect(UUID_REGEX.test(set.exerciseId)).toBe(true);
  });
});
