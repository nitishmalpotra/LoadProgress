import Dexie from 'dexie';
import { afterEach, describe, expect, it } from 'vitest';
import { DEFAULT_EXERCISES, LoadProgressDatabase } from '@/db/database';
import { exportBackupData, importBackupFile, parseBackupJson, readBackupFile } from '@/db/backup';
import { createWorkoutStore } from '@/store/useWorkoutStore';

const createdDatabases = new Set<string>();

const createTestDatabase = async () => {
  const name = `LoadProgressBackupTest-${crypto.randomUUID()}`;
  createdDatabases.add(name);
  const database = new LoadProgressDatabase(name);

  await database.open();

  return database;
};

afterEach(async () => {
  await Promise.all(
    [...createdDatabases].map(async (name) => {
      await Dexie.delete(name);
      createdDatabases.delete(name);
    })
  );
});

describe('backup tooling', () => {
  it('exports valid JSON structures from Dexie tables', async () => {
    const database = await createTestDatabase();
    const exerciseId = DEFAULT_EXERCISES[0].id;
    const setId = await database.addWorkoutSet({
      exerciseId,
      weight: 100,
      reps: 5,
      date: new Date('2026-05-20T10:00:00.000Z'),
      isFailureSet: false
    });
    const recordId = await database.addPersonalRecord({
      exerciseId,
      type: '1RM',
      value: 112.5,
      date: new Date('2026-05-20T10:00:00.000Z'),
      reps: 5
    });

    const backup = await exportBackupData(database);
    const parsedBackup = parseBackupJson(JSON.stringify(backup));

    expect(parsedBackup.app).toBe('LoadProgress');
    expect(parsedBackup.version).toBe(1);
    expect(parsedBackup.exercises).toHaveLength(28);
    expect(parsedBackup.workoutSets).toContainEqual(
      expect.objectContaining({ id: setId, date: '2026-05-20T10:00:00.000Z' })
    );
    expect(parsedBackup.personalRecords).toContainEqual(
      expect.objectContaining({ id: recordId, date: '2026-05-20T10:00:00.000Z' })
    );

    database.close();
  });

  it('decodes a valid uploaded JSON backup and populates a clean database', async () => {
    const sourceDatabase = await createTestDatabase();
    const targetDatabase = await createTestDatabase();
    const exerciseId = DEFAULT_EXERCISES[1].id;

    await sourceDatabase.addWorkoutSet({
      id: '20000000-0000-4000-8000-000000000001',
      exerciseId,
      weight: 32,
      reps: 10,
      date: new Date('2026-05-18T09:00:00.000Z'),
      rpe: 8,
      notes: 'Clean reps',
      isFailureSet: false
    });
    await sourceDatabase.addPersonalRecord({
      id: '30000000-0000-4000-8000-000000000001',
      exerciseId,
      type: 'Weight at Reps',
      value: 32,
      date: new Date('2026-05-18T09:00:00.000Z'),
      reps: 10
    });
    await targetDatabase.workoutSets.clear();
    await targetDatabase.personalRecords.clear();

    const backup = await exportBackupData(sourceDatabase);
    const file = new File([JSON.stringify(backup)], 'loadprogress-backup.json', {
      type: 'application/json'
    });
    const decodedBackup = await readBackupFile(file);
    const result = await importBackupFile(file, targetDatabase);
    const store = createWorkoutStore(targetDatabase);

    await store.getState().loadWorkoutData();

    expect(decodedBackup.workoutSets).toHaveLength(1);
    expect(result).toEqual({ exercises: 28, workoutSets: 1, personalRecords: 1 });
    expect(await targetDatabase.workoutSets.count()).toBe(1);
    expect(await targetDatabase.personalRecords.count()).toBe(1);
    expect(store.getState().workoutSets).toHaveLength(1);
    expect(store.getState().personalRecords).toHaveLength(1);
    expect((await targetDatabase.workoutSets.toArray())[0].date).toBeInstanceOf(Date);

    sourceDatabase.close();
    targetDatabase.close();
  });

  it('rejects malformed imports without writing to IndexedDB', async () => {
    const database = await createTestDatabase();
    const malformedBackup = {
      app: 'LoadProgress',
      version: 1,
      exportedAt: new Date().toISOString(),
      exercises: DEFAULT_EXERCISES,
      workoutSets: [{ id: 'bad-set', exerciseId: DEFAULT_EXERCISES[0].id, reps: 5 }],
      personalRecords: []
    };

    const file = new File([JSON.stringify(malformedBackup)], 'malformed.json', {
      type: 'application/json'
    });

    expect(() => parseBackupJson('not json')).toThrow('valid JSON');
    expect(() => parseBackupJson(JSON.stringify(malformedBackup))).toThrow('unsupported records');
    await expect(importBackupFile(file, database)).rejects.toThrow('unsupported records');
    expect(await database.workoutSets.count()).toBe(0);

    database.close();
  });
});
