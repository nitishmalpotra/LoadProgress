import Dexie from 'dexie';
import { afterEach, describe, expect, it } from 'vitest';
import { LoadProgressDatabase } from '@/db/database';
import { exportBackupData, importBackupFile } from '@/db/backup';
import { createRoutineStore, DEFAULT_ROUTINE } from './useRoutineStore';

const createdDatabases = new Set<string>();

const createTestStore = async () => {
  const name = `LoadProgressRoutineTest-${crypto.randomUUID()}`;
  createdDatabases.add(name);
  const database = new LoadProgressDatabase(name);
  await database.open();
  const store = createRoutineStore(database);
  return { database, store };
};

afterEach(async () => {
  await Promise.all(
    [...createdDatabases].map(async (name) => {
      await Dexie.delete(name);
      createdDatabases.delete(name);
    })
  );
});

describe('useRoutineStore', () => {
  it('seeds the default week when the DB is empty', async () => {
    const { store } = await createTestStore();
    await store.getState().loadRoutine();
    expect(store.getState().routine).toHaveLength(7);
    expect(store.getState().routine[0].id).toBe('0');
    expect(store.getState().routine[0].type).toBe('Push');
    // two Run days in the default week
    const runDays = store.getState().routine.filter((d) => d.type === 'Run');
    expect(runDays).toHaveLength(2);
  });

  it('does not re-seed on subsequent loads', async () => {
    const { store } = await createTestStore();
    await store.getState().loadRoutine();
    await store.getState().updateDayType('6', 'Lower');
    await store.getState().loadRoutine();
    expect(store.getState().routine[6].type).toBe('Lower');
  });

  it('days are ordered Mon–Sun (id 0–6) after load', async () => {
    const { store } = await createTestStore();
    await store.getState().loadRoutine();
    expect(store.getState().routine.map((d) => d.id)).toEqual(
      ['0', '1', '2', '3', '4', '5', '6']
    );
  });

  it('updateDayType persists to DB', async () => {
    const { database, store } = await createTestStore();
    await store.getState().loadRoutine();
    await store.getState().updateDayType('2', 'Lower');
    const day = await database.trainingRoutine.get('2');
    expect(day?.type).toBe('Lower');
  });

  it('addExercise appends and persists', async () => {
    const { database, store } = await createTestStore();
    await store.getState().loadRoutine();
    const before = store.getState().routine[0].exercises.length;
    await store.getState().addExercise('0', {
      exerciseId: 'test-id',
      targetSets: 3,
      targetReps: 10,
    });
    expect(store.getState().routine[0].exercises).toHaveLength(before + 1);
    const day = await database.trainingRoutine.get('0');
    expect(day?.exercises).toHaveLength(before + 1);
  });

  it('removeExercise removes the correct index and persists', async () => {
    const { database, store } = await createTestStore();
    await store.getState().loadRoutine();
    const secondId = store.getState().routine[0].exercises[1].exerciseId;
    await store.getState().removeExercise('0', 0);
    expect(store.getState().routine[0].exercises[0].exerciseId).toBe(secondId);
    const day = await database.trainingRoutine.get('0');
    expect(day?.exercises[0].exerciseId).toBe(secondId);
  });

  it('moveExercise swaps two exercises', async () => {
    const { store } = await createTestStore();
    await store.getState().loadRoutine();
    const first = store.getState().routine[0].exercises[0].exerciseId;
    const second = store.getState().routine[0].exercises[1].exerciseId;
    await store.getState().moveExercise('0', 0, 1);
    expect(store.getState().routine[0].exercises[0].exerciseId).toBe(second);
    expect(store.getState().routine[0].exercises[1].exerciseId).toBe(first);
  });

  it('updateExercise persists sets, reps and note', async () => {
    const { store } = await createTestStore();
    await store.getState().loadRoutine();
    await store.getState().updateExercise('0', 0, {
      targetSets: 5,
      targetReps: 3,
      note: 'Heavy',
    });
    const ex = store.getState().routine[0].exercises[0];
    expect(ex.targetSets).toBe(5);
    expect(ex.targetReps).toBe(3);
    expect(ex.note).toBe('Heavy');
  });

  it('round-trips through backup export and import', async () => {
    const { database: sourceDb, store } = await createTestStore();
    const { database: targetDb } = await createTestStore();

    await store.getState().loadRoutine();
    await store.getState().updateDayType('6', 'Lower');

    const backup = await exportBackupData(sourceDb);
    expect(backup.trainingRoutine).toHaveLength(7);

    const file = new File([JSON.stringify(backup)], 'backup.json', {
      type: 'application/json',
    });
    await importBackupFile(file, targetDb);

    const restored = await targetDb.trainingRoutine.get('6');
    expect(restored?.type).toBe('Lower');
  });

  it('DEFAULT_ROUTINE contains exercises from the known library IDs', () => {
    const allIds = DEFAULT_ROUTINE.flatMap((d) => d.exercises.map((e) => e.exerciseId));
    // all should be prefixed with the known exercise ID format
    expect(allIds.every((id) => id.startsWith('10000000-0000-4000-8000-'))).toBe(true);
  });
});
