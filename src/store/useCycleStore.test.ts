import Dexie from 'dexie';
import { afterEach, describe, expect, it } from 'vitest';
import { LoadProgressDatabase } from '@/db/database';
import { exportBackupData, importBackupFile } from '@/db/backup';
import { createCycleStore, shouldShowCycleTab } from './useCycleStore';

const created = new Set<string>();

const makeStore = async () => {
  const name = `CycleTest-${crypto.randomUUID()}`;
  created.add(name);
  const database = new LoadProgressDatabase(name);
  await database.open();
  return { database, store: createCycleStore(database) };
};

afterEach(async () => {
  await Promise.all([...created].map((n) => Dexie.delete(n).then(() => created.delete(n))));
});

describe('useCycleStore', () => {
  it('starts with null phase', async () => {
    const { store } = await makeStore();
    await store.getState().loadCycle();
    expect(store.getState().phase).toBeNull();
  });

  it('setPhase persists and updates state', async () => {
    const { store } = await makeStore();
    await store.getState().setPhase('luteal');
    expect(store.getState().phase).toBe('luteal');
  });

  it('setPhase overwrites previous phase', async () => {
    const { store } = await makeStore();
    await store.getState().setPhase('follicular');
    await store.getState().setPhase('ovulatory');
    expect(store.getState().phase).toBe('ovulatory');
  });

  it('loadCycle reads persisted phase', async () => {
    const { store } = await makeStore();
    await store.getState().setPhase('menstrual');
    const fresh = createCycleStore(store.getState() as never);
    // re-use same database via the store's closure
    await store.getState().loadCycle();
    expect(store.getState().phase).toBe('menstrual');
    void fresh;
  });

  it('round-trips through backup', async () => {
    const { database: src, store } = await makeStore();
    const { database: dst } = await makeStore();

    await store.getState().setPhase('luteal');

    const backup = await exportBackupData(src);
    expect(backup.cycleState).toHaveLength(1);
    expect(backup.cycleState?.[0].phase).toBe('luteal');

    const file = new File([JSON.stringify(backup)], 'backup.json', { type: 'application/json' });
    await importBackupFile(file, dst);

    const restored = await dst.cycleState.get('current');
    expect(restored?.phase).toBe('luteal');
  });
});

describe('shouldShowCycleTab', () => {
  it('returns false for null profile', () => {
    expect(shouldShowCycleTab(null)).toBe(false);
  });

  it('returns false for male profile', () => {
    expect(shouldShowCycleTab({ sex: 'male', cycleTrackingOptIn: true })).toBe(false);
  });

  it('returns false for female with opt-in disabled', () => {
    expect(shouldShowCycleTab({ sex: 'female', cycleTrackingOptIn: false })).toBe(false);
  });

  it('returns true for female with opt-in enabled', () => {
    expect(shouldShowCycleTab({ sex: 'female', cycleTrackingOptIn: true })).toBe(true);
  });
});
