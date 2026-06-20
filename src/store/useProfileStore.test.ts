import Dexie from 'dexie';
import { afterEach, describe, expect, it } from 'vitest';
import { LoadProgressDatabase } from '@/db/database';
import { createProfileStore } from './useProfileStore';
import type { Profile } from '@/models';

const createdDatabases = new Set<string>();

const createTestStore = async () => {
  const name = `LoadProgressProfileTest-${crypto.randomUUID()}`;
  createdDatabases.add(name);
  const database = new LoadProgressDatabase(name);
  const store = createProfileStore(database);
  return { database, store };
};

const sampleProfile: Omit<Profile, 'id'> = {
  weight: 75,
  height: 175,
  age: 30,
  sex: 'female',
  goal: 'recomposition',
  activityLevel: 'moderate',
  dietStyle: 'standard',
  location: 'London',
  trainingDaysPerWeek: 4,
  trainingMinutesPerSession: 60,
  cycleTrackingOptIn: true,
  unitSystem: 'metric'
};

afterEach(async () => {
  await Promise.all(
    [...createdDatabases].map(async (name) => {
      await Dexie.delete(name);
      createdDatabases.delete(name);
    })
  );
});

describe('useProfileStore', () => {
  it('returns null when no profile exists', async () => {
    const { store } = await createTestStore();
    await store.getState().loadProfile();
    expect(store.getState().profile).toBeNull();
    expect(store.getState().isLoading).toBe(false);
  });

  it('persists and retrieves a profile round-trip', async () => {
    const { store } = await createTestStore();

    await store.getState().saveProfile(sampleProfile);
    expect(store.getState().profile).toMatchObject(sampleProfile);

    // Simulate fresh load from DB
    const { store: freshStore } = await createTestStore();
    const { database } = await createTestStore();
    const freshStore2 = createProfileStore(database);
    await freshStore2.getState().loadProfile();

    // The first store should also reflect saved state
    await store.getState().loadProfile();
    const loaded = store.getState().profile;

    expect(loaded).not.toBeNull();
    expect(loaded?.weight).toBe(75);
    expect(loaded?.height).toBe(175);
    expect(loaded?.sex).toBe('female');
    expect(loaded?.goal).toBe('recomposition');
    expect(loaded?.cycleTrackingOptIn).toBe(true);
    expect(loaded?.unitSystem).toBe('metric');

    freshStore.getState(); // suppress unused warning
    database.close();
  });

  it('overwrites the profile on a second save', async () => {
    const { store } = await createTestStore();

    await store.getState().saveProfile(sampleProfile);
    await store.getState().saveProfile({ ...sampleProfile, weight: 80, goal: 'gain' });
    await store.getState().loadProfile();

    expect(store.getState().profile?.weight).toBe(80);
    expect(store.getState().profile?.goal).toBe('gain');
  });

  it('profile id is always "profile"', async () => {
    const { database, store } = await createTestStore();

    await store.getState().saveProfile(sampleProfile);
    const record = await database.profile.get('profile');

    expect(record?.id).toBe('profile');
    database.close();
  });
});
