import { create } from 'zustand';
import { createUuid, db, type LoadProgressDatabase } from '@/db/database';
import type { BodyWeight } from '@/models';

// ponytail: date strings are YYYY-MM-DD; lexicographic comparison is correct for ISO dates
export function trailingAverage(entries: BodyWeight[], days = 7): Array<number | null> {
  return entries.map((entry) => {
    const cutoff = new Date(entry.date);
    cutoff.setDate(cutoff.getDate() - (days - 1));
    const cutoffStr = cutoff.toISOString().slice(0, 10);
    const inWindow = entries.filter((e) => e.date >= cutoffStr && e.date <= entry.date);
    return inWindow.reduce((sum, e) => sum + e.weight, 0) / inWindow.length;
  });
}

export interface BodyWeightStoreState {
  weights: BodyWeight[];
  isLoading: boolean;
  loadWeights: () => Promise<void>;
  logWeight: (date: string, weight: number) => Promise<void>;
}

export const createBodyWeightStore = (database: LoadProgressDatabase = db) =>
  create<BodyWeightStoreState>((set) => ({
    weights: [],
    isLoading: true,

    loadWeights: async () => {
      set({ isLoading: true });
      try {
        const rows = await database.bodyWeights.orderBy('date').toArray();
        set({ weights: rows, isLoading: false });
      } catch {
        set({ isLoading: false });
      }
    },

    logWeight: async (date, weight) => {
      const existing = await database.bodyWeights.where('date').equals(date).first();
      const entry: BodyWeight = existing ? { ...existing, weight } : { id: createUuid(), date, weight };
      await database.bodyWeights.put(entry);
      const rows = await database.bodyWeights.orderBy('date').toArray();
      set({ weights: rows });
    },
  }));

export const useBodyWeightStore = createBodyWeightStore();
