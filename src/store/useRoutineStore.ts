import { create } from 'zustand';
import { db, type LoadProgressDatabase } from '@/db/database';
import type { RoutineExercise, TrainingRoutine } from '@/models';

export const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;

export const DEFAULT_ROUTINE: TrainingRoutine[] = [
  {
    id: '0',
    type: 'Push',
    exercises: [
      { exerciseId: '10000000-0000-4000-8000-000000000001', targetSets: 4, targetReps: 5 }, // Bench Press
      { exerciseId: '10000000-0000-4000-8000-00000000000d', targetSets: 3, targetReps: 8 }, // Overhead Press
      { exerciseId: '10000000-0000-4000-8000-00000000000e', targetSets: 3, targetReps: 12 }, // Lateral Raises
      { exerciseId: '10000000-0000-4000-8000-000000000012', targetSets: 3, targetReps: 12 } // Tricep Extensions
    ]
  },
  {
    id: '1',
    type: 'Pull',
    exercises: [
      { exerciseId: '10000000-0000-4000-8000-000000000007', targetSets: 4, targetReps: 8 }, // Barbell Rows
      { exerciseId: '10000000-0000-4000-8000-000000000008', targetSets: 3, targetReps: 10 }, // Lat Pulldown
      { exerciseId: '10000000-0000-4000-8000-000000000022', targetSets: 3, targetReps: 15 }, // Face Pulls
      { exerciseId: '10000000-0000-4000-8000-000000000011', targetSets: 3, targetReps: 12 } // Bicep Curls
    ]
  },
  { id: '2', type: 'Run', exercises: [] }, // Easy Zone 2
  {
    id: '3',
    type: 'Lower',
    exercises: [
      { exerciseId: '10000000-0000-4000-8000-000000000009', targetSets: 4, targetReps: 5 }, // Squats
      { exerciseId: '10000000-0000-4000-8000-00000000000a', targetSets: 3, targetReps: 8 }, // Romanian Deadlift
      { exerciseId: '10000000-0000-4000-8000-00000000000c', targetSets: 3, targetReps: 10 }, // Leg Press
      { exerciseId: '10000000-0000-4000-8000-000000000026', targetSets: 3, targetReps: 12 } // Leg Curls
    ]
  },
  {
    id: '4',
    type: 'Push',
    exercises: [
      { exerciseId: '10000000-0000-4000-8000-000000000002', targetSets: 3, targetReps: 10 }, // Incline Dumbbell Press
      { exerciseId: '10000000-0000-4000-8000-000000000004', targetSets: 3, targetReps: 10 }, // Dips
      { exerciseId: '10000000-0000-4000-8000-00000000000e', targetSets: 3, targetReps: 15 } // Lateral Raises
    ]
  },
  { id: '5', type: 'Run', exercises: [] }, // Intervals
  { id: '6', type: 'Rest', exercises: [] }
];

export interface RoutineStoreState {
  routine: TrainingRoutine[];
  isLoading: boolean;
  loadRoutine: () => Promise<void>;
  updateDayType: (dayId: string, type: TrainingRoutine['type']) => Promise<void>;
  addExercise: (dayId: string, exercise: RoutineExercise) => Promise<void>;
  removeExercise: (dayId: string, index: number) => Promise<void>;
  moveExercise: (dayId: string, fromIndex: number, toIndex: number) => Promise<void>;
  updateExercise: (
    dayId: string,
    index: number,
    updates: Partial<RoutineExercise>
  ) => Promise<void>;
}

function patchDay(
  routine: TrainingRoutine[],
  dayId: string,
  updater: (day: TrainingRoutine) => TrainingRoutine
): TrainingRoutine[] {
  return routine.map((d) => (d.id === dayId ? updater(d) : d));
}

export const createRoutineStore = (database: LoadProgressDatabase = db) =>
  create<RoutineStoreState>((set, get) => ({
    routine: [],
    isLoading: true,

    loadRoutine: async () => {
      set({ isLoading: true });
      try {
        const rows = (await database.trainingRoutine.toArray()).sort((a, b) =>
          a.id.localeCompare(b.id)
        );
        if (rows.length === 0) {
          await database.trainingRoutine.bulkPut(DEFAULT_ROUTINE);
          set({ routine: DEFAULT_ROUTINE, isLoading: false });
        } else {
          set({ routine: rows, isLoading: false });
        }
      } catch {
        set({ isLoading: false });
      }
    },

    updateDayType: async (dayId, type) => {
      const updated = patchDay(get().routine, dayId, (d) => ({ ...d, type }));
      set({ routine: updated });
      const day = updated.find((d) => d.id === dayId)!;
      await database.trainingRoutine.put(day);
    },

    addExercise: async (dayId, exercise) => {
      const updated = patchDay(get().routine, dayId, (d) => ({
        ...d,
        exercises: [...d.exercises, exercise]
      }));
      set({ routine: updated });
      const day = updated.find((d) => d.id === dayId)!;
      await database.trainingRoutine.put(day);
    },

    removeExercise: async (dayId, index) => {
      const updated = patchDay(get().routine, dayId, (d) => ({
        ...d,
        exercises: d.exercises.filter((_, i) => i !== index)
      }));
      set({ routine: updated });
      const day = updated.find((d) => d.id === dayId)!;
      await database.trainingRoutine.put(day);
    },

    moveExercise: async (dayId, fromIndex, toIndex) => {
      const updated = patchDay(get().routine, dayId, (d) => {
        const exs = [...d.exercises];
        const [moved] = exs.splice(fromIndex, 1);
        exs.splice(toIndex, 0, moved);
        return { ...d, exercises: exs };
      });
      set({ routine: updated });
      const day = updated.find((d) => d.id === dayId)!;
      await database.trainingRoutine.put(day);
    },

    updateExercise: async (dayId, index, updates) => {
      const updated = patchDay(get().routine, dayId, (d) => ({
        ...d,
        exercises: d.exercises.map((ex, i) => (i === index ? { ...ex, ...updates } : ex))
      }));
      set({ routine: updated });
      const day = updated.find((d) => d.id === dayId)!;
      await database.trainingRoutine.put(day);
    }
  }));

export const useRoutineStore = createRoutineStore();
