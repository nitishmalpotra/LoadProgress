import Dexie from 'dexie';
import { afterEach, describe, expect, it } from 'vitest';
import { LoadProgressDatabase } from '@/db/database';
import { exportBackupData, importBackupFile } from '@/db/backup';
import { createNutritionStore } from './useNutritionStore';

const created = new Set<string>();

const makeStore = async () => {
  const name = `NutritionTest-${crypto.randomUUID()}`;
  created.add(name);
  const database = new LoadProgressDatabase(name);
  await database.open();
  return { database, store: createNutritionStore(database) };
};

afterEach(async () => {
  await Promise.all([...created].map((n) => Dexie.delete(n).then(() => created.delete(n))));
});

describe('useNutritionStore', () => {
  it('starts empty', async () => {
    const { store } = await makeStore();
    await store.getState().loadNutrition();
    expect(store.getState().entries).toHaveLength(0);
  });

  it('logNutrition creates a new entry', async () => {
    const { store } = await makeStore();
    await store.getState().logNutrition('2025-06-01', 150, 200, 70);
    expect(store.getState().entries).toHaveLength(1);
    expect(store.getState().entries[0].protein).toBe(150);
    expect(store.getState().entries[0].carbs).toBe(200);
    expect(store.getState().entries[0].fat).toBe(70);
  });

  it('logNutrition upserts — same date updates values', async () => {
    const { store } = await makeStore();
    await store.getState().logNutrition('2025-06-01', 150, 200, 70);
    const firstId = store.getState().entries[0].id;
    await store.getState().logNutrition('2025-06-01', 160, 180, 65);
    expect(store.getState().entries).toHaveLength(1);
    expect(store.getState().entries[0].protein).toBe(160);
    expect(store.getState().entries[0].id).toBe(firstId);
  });

  it('entries are ordered by date ascending after load', async () => {
    const { store } = await makeStore();
    await store.getState().logNutrition('2025-07-01', 150, 200, 70);
    await store.getState().logNutrition('2025-06-01', 140, 190, 65);
    await store.getState().loadNutrition();
    expect(store.getState().entries[0].date).toBe('2025-06-01');
    expect(store.getState().entries[1].date).toBe('2025-07-01');
  });

  it('round-trips through backup', async () => {
    const { database: src, store } = await makeStore();
    const { database: dst } = await makeStore();

    await store.getState().logNutrition('2025-06-01', 150, 200, 70);
    await store.getState().logNutrition('2025-06-02', 160, 180, 65);

    const backup = await exportBackupData(src);
    expect(backup.nutritionLog).toHaveLength(2);

    const file = new File([JSON.stringify(backup)], 'backup.json', { type: 'application/json' });
    await importBackupFile(file, dst);

    const restored = await dst.nutritionLog.orderBy('date').toArray();
    expect(restored).toHaveLength(2);
    expect(restored[0].protein).toBe(150);
    expect(restored[1].protein).toBe(160);
  });
});
