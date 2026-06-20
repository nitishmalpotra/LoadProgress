import { create } from 'zustand';
import { db, type LoadProgressDatabase } from '@/db/database';
import type { Profile } from '@/models';
import { useWorkoutStore } from '@/store/useWorkoutStore';

export interface ProfileStoreState {
  profile: Profile | null;
  isLoading: boolean;
  loadProfile: () => Promise<void>;
  saveProfile: (data: Omit<Profile, 'id'>) => Promise<void>;
}

export const createProfileStore = (database: LoadProgressDatabase = db) =>
  create<ProfileStoreState>((set) => ({
    profile: null,
    isLoading: true, // starts true so Layout's first-launch redirect waits for the real read

    loadProfile: async () => {
      set({ isLoading: true });
      try {
        const profile = (await database.profile.get('profile')) ?? null;
        set({ profile, isLoading: false });
        if (profile) {
          useWorkoutStore.getState().setUnitSystem(profile.unitSystem);
        }
      } catch {
        set({ isLoading: false });
      }
    },

    saveProfile: async (data) => {
      const profile: Profile = { ...data, id: 'profile' };
      await database.profile.put(profile);
      set({ profile });
      useWorkoutStore.getState().setUnitSystem(profile.unitSystem);
    }
  }));

export const useProfileStore = createProfileStore();
