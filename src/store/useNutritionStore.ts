import { create } from 'zustand';
import { createUuid, db, type LoadProgressDatabase } from '@/db/database';
import type { NutritionLog } from '@/models';

export interface NutritionStoreState {
  entries: NutritionLog[];
  isLoading: boolean;
  loadNutrition: () => Promise<void>;
  logNutrition: (date: string, protein: number, carbs: number, fat: number) => Promise<void>;
}

export const createNutritionStore = (database: LoadProgressDatabase = db) =>
  create<NutritionStoreState>((set) => ({
    entries: [],
    isLoading: true,

    loadNutrition: async () => {
      set({ isLoading: true });
      try {
        const rows = await database.nutritionLog.orderBy('date').toArray();
        set({ entries: rows, isLoading: false });
      } catch {
        set({ isLoading: false });
      }
    },

    logNutrition: async (date, protein, carbs, fat) => {
      const existing = await database.nutritionLog.where('date').equals(date).first();
      const entry: NutritionLog = existing
        ? { ...existing, protein, carbs, fat }
        : { id: createUuid(), date, protein, carbs, fat };
      await database.nutritionLog.put(entry);
      const rows = await database.nutritionLog.orderBy('date').toArray();
      set({ entries: rows });
    },
  }));

export const useNutritionStore = createNutritionStore();
