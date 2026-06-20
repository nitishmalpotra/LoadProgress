import { create } from 'zustand';
import { createUuid, db, type LoadProgressDatabase } from '@/db/database';
import type { Measurement } from '@/models';

export interface MeasurementStoreState {
  measurements: Measurement[];
  isLoading: boolean;
  loadMeasurements: () => Promise<void>;
  logMeasurement: (date: string, waist: number, hips: number) => Promise<void>;
}

export const createMeasurementStore = (database: LoadProgressDatabase = db) =>
  create<MeasurementStoreState>((set) => ({
    measurements: [],
    isLoading: true,

    loadMeasurements: async () => {
      set({ isLoading: true });
      try {
        const rows = await database.measurements.orderBy('date').toArray();
        set({ measurements: rows, isLoading: false });
      } catch {
        set({ isLoading: false });
      }
    },

    logMeasurement: async (date, waist, hips) => {
      const existing = await database.measurements.where('date').equals(date).first();
      const entry: Measurement = existing
        ? { ...existing, waist, hips }
        : { id: createUuid(), date, waist, hips };
      await database.measurements.put(entry);
      const rows = await database.measurements.orderBy('date').toArray();
      set({ measurements: rows });
    },
  }));

export const useMeasurementStore = createMeasurementStore();
