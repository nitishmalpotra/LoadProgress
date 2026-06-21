import Dexie from 'dexie';
import { afterEach, describe, expect, it } from 'vitest';
import { LoadProgressDatabase } from '@/db/database';
import { exportBackupData, importBackupFile } from '@/db/backup';
import { createBodyWeightStore, trailingAverage } from './useBodyWeightStore';

// ─── pure-function tests ────────────────────────────────────────────────────

describe('trailingAverage', () => {
  it('single entry returns its own weight', () => {
    const entries = [{ id: '1', date: '2025-01-10', weight: 80 }];
    expect(trailingAverage(entries)).toEqual([80]);
  });

  it('averages within 7-day window', () => {
    const entries = [
      { id: '1', date: '2025-01-01', weight: 80 },
      { id: '2', date: '2025-01-07', weight: 82 }, // day 7 — both in window
      { id: '3', date: '2025-01-08', weight: 84 } // day 8 — only 2 & 3 in window (day 1 is outside)
    ];
    const avgs = trailingAverage(entries);
    expect(avgs[0]).toBeCloseTo(80);
    expect(avgs[1]).toBeCloseTo(81); // (80+82)/2
    expect(avgs[2]).toBeCloseTo(83); // (82+84)/2 — Jan 1 is day 8 before Jan 8, outside 7-day window
  });

  it('tolerates gaps (skipped days do not count as zeros)', () => {
    const entries = [
      { id: '1', date: '2025-03-01', weight: 75 },
      { id: '2', date: '2025-03-15', weight: 77 } // 14 days later — only entry 2 in its window
    ];
    const avgs = trailingAverage(entries);
    expect(avgs[1]).toBeCloseTo(77);
  });

  it('all entries in window are included', () => {
    const entries = [
      { id: '1', date: '2025-05-01', weight: 70 },
      { id: '2', date: '2025-05-03', weight: 72 },
      { id: '3', date: '2025-05-05', weight: 74 },
      { id: '4', date: '2025-05-07', weight: 76 } // window [May 1–7]: all 4 entries
    ];
    const avgs = trailingAverage(entries);
    expect(avgs[3]).toBeCloseTo(73); // (70+72+74+76)/4
  });
});

// ─── store + IndexedDB tests ────────────────────────────────────────────────

const created = new Set<string>();

const makeStore = async () => {
  const name = `BodyWeightTest-${crypto.randomUUID()}`;
  created.add(name);
  const database = new LoadProgressDatabase(name);
  await database.open();
  return { database, store: createBodyWeightStore(database) };
};

afterEach(async () => {
  await Promise.all([...created].map((n) => Dexie.delete(n).then(() => created.delete(n))));
});

describe('useBodyWeightStore', () => {
  it('starts empty', async () => {
    const { store } = await makeStore();
    await store.getState().loadWeights();
    expect(store.getState().weights).toHaveLength(0);
  });

  it('logWeight creates a new entry', async () => {
    const { store } = await makeStore();
    await store.getState().logWeight('2025-06-01', 80);
    expect(store.getState().weights).toHaveLength(1);
    expect(store.getState().weights[0].weight).toBe(80);
  });

  it('logWeight upserts — same date updates weight', async () => {
    const { store } = await makeStore();
    await store.getState().logWeight('2025-06-01', 80);
    const firstId = store.getState().weights[0].id;
    await store.getState().logWeight('2025-06-01', 81.5);
    expect(store.getState().weights).toHaveLength(1);
    expect(store.getState().weights[0].weight).toBe(81.5);
    expect(store.getState().weights[0].id).toBe(firstId);
  });

  it('weights are ordered by date ascending after load', async () => {
    const { store } = await makeStore();
    await store.getState().logWeight('2025-06-10', 82);
    await store.getState().logWeight('2025-06-01', 80);
    await store.getState().loadWeights();
    expect(store.getState().weights[0].date).toBe('2025-06-01');
    expect(store.getState().weights[1].date).toBe('2025-06-10');
  });

  it('round-trips through backup', async () => {
    const { database: src, store } = await makeStore();
    const { database: dst } = await makeStore();

    await store.getState().logWeight('2025-06-01', 80);
    await store.getState().logWeight('2025-06-05', 79.5);

    const backup = await exportBackupData(src);
    expect(backup.bodyWeights).toHaveLength(2);

    const file = new File([JSON.stringify(backup)], 'backup.json', { type: 'application/json' });
    await importBackupFile(file, dst);

    const restored = await dst.bodyWeights.orderBy('date').toArray();
    expect(restored).toHaveLength(2);
    expect(restored[0].weight).toBe(80);
    expect(restored[1].weight).toBe(79.5);
  });
});
