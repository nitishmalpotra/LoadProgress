import { create } from 'zustand';
import { db, type LoadProgressDatabase } from '@/db/database';
import type { CycleState, Profile } from '@/models';

export type CyclePhase = 'follicular' | 'ovulatory' | 'luteal' | 'menstrual';

export const shouldShowCycleTab = (
  profile: Pick<Profile, 'sex' | 'cycleTrackingOptIn'> | null
): boolean => profile !== null && profile.sex === 'female' && profile.cycleTrackingOptIn;

export interface CycleStoreState {
  phase: CyclePhase | null;
  isLoading: boolean;
  loadCycle: () => Promise<void>;
  setPhase: (phase: CyclePhase) => Promise<void>;
}

export const createCycleStore = (database: LoadProgressDatabase = db) =>
  create<CycleStoreState>((set) => ({
    phase: null,
    isLoading: true,

    loadCycle: async () => {
      set({ isLoading: true });
      try {
        const record = (await database.cycleState.get('current')) ?? null;
        set({ phase: (record?.phase as CyclePhase | undefined) ?? null, isLoading: false });
      } catch {
        set({ isLoading: false });
      }
    },

    setPhase: async (phase) => {
      const record: CycleState = { id: 'current', phase, updatedAt: new Date().toISOString() };
      await database.cycleState.put(record);
      set({ phase });
    },
  }));

export const useCycleStore = createCycleStore();
