import Dexie from 'dexie';
import { afterEach, describe, expect, it } from 'vitest';
import { LoadProgressDatabase } from '@/db/database';
import { exportBackupData, importBackupFile } from '@/db/backup';
import { createMeasurementStore } from './useMeasurementStore';

const created = new Set<string>();

const makeStore = async () => {
  const name = `MeasurementTest-${crypto.randomUUID()}`;
  created.add(name);
  const database = new LoadProgressDatabase(name);
  await database.open();
  return { database, store: createMeasurementStore(database) };
};

afterEach(async () => {
  await Promise.all([...created].map((n) => Dexie.delete(n).then(() => created.delete(n))));
});

describe('useMeasurementStore', () => {
  it('starts empty', async () => {
    const { store } = await makeStore();
    await store.getState().loadMeasurements();
    expect(store.getState().measurements).toHaveLength(0);
  });

  it('logMeasurement creates a new entry', async () => {
    const { store } = await makeStore();
    await store.getState().logMeasurement('2025-06-01', 80, 95);
    expect(store.getState().measurements).toHaveLength(1);
    expect(store.getState().measurements[0].waist).toBe(80);
    expect(store.getState().measurements[0].hips).toBe(95);
  });

  it('logMeasurement upserts — same date updates values', async () => {
    const { store } = await makeStore();
    await store.getState().logMeasurement('2025-06-01', 80, 95);
    const firstId = store.getState().measurements[0].id;
    await store.getState().logMeasurement('2025-06-01', 79, 94);
    expect(store.getState().measurements).toHaveLength(1);
    expect(store.getState().measurements[0].waist).toBe(79);
    expect(store.getState().measurements[0].hips).toBe(94);
    expect(store.getState().measurements[0].id).toBe(firstId);
  });

  it('measurements are ordered by date ascending after load', async () => {
    const { store } = await makeStore();
    await store.getState().logMeasurement('2025-07-01', 81, 96);
    await store.getState().logMeasurement('2025-06-01', 80, 95);
    await store.getState().loadMeasurements();
    expect(store.getState().measurements[0].date).toBe('2025-06-01');
    expect(store.getState().measurements[1].date).toBe('2025-07-01');
  });

  it('round-trips through backup', async () => {
    const { database: src, store } = await makeStore();
    const { database: dst } = await makeStore();

    await store.getState().logMeasurement('2025-06-01', 80, 95);
    await store.getState().logMeasurement('2025-07-01', 79, 94);

    const backup = await exportBackupData(src);
    expect(backup.measurements).toHaveLength(2);

    const file = new File([JSON.stringify(backup)], 'backup.json', { type: 'application/json' });
    await importBackupFile(file, dst);

    const restored = await dst.measurements.orderBy('date').toArray();
    expect(restored).toHaveLength(2);
    expect(restored[0].waist).toBe(80);
    expect(restored[1].waist).toBe(79);
  });
});
