import { create } from 'zustand';
import { db, type LoadProgressDatabase } from '@/db/database';
import type { Exercise, PersonalRecord, PersonalRecordType, WorkoutSet } from '@/models';

type WorkoutSetInput = Omit<WorkoutSet, 'id'> & { id?: string };
type WorkoutSetUpdate = Partial<Omit<WorkoutSet, 'id'>>;

type WorkoutSetsByExercise = Record<string, WorkoutSet[]>;
type WorkoutSetsByDate = Record<string, WorkoutSet[]>;
type ExercisesById = Record<string, Exercise>;
type PersonalRecordsByExercise = Record<string, PersonalRecord[]>;
type PersonalRecordsByExerciseAndType = Record<
  string,
  Partial<Record<PersonalRecordType, PersonalRecord[]>>
>;
type BestPersonalRecordsByExerciseAndType = Record<
  string,
  Partial<Record<PersonalRecordType, PersonalRecord>>
>;
type WeightAtRepsRecords = Record<string, PersonalRecord>;
export type UnitSystem = 'metric' | 'imperial';

export interface WorkoutStoreState {
  exercises: Exercise[];
  workoutSets: WorkoutSet[];
  personalRecords: PersonalRecord[];
  exercisesById: ExercisesById;
  workoutSetsByExerciseId: WorkoutSetsByExercise;
  workoutSetsByDate: WorkoutSetsByDate;
  personalRecordsByExerciseId: PersonalRecordsByExercise;
  personalRecordsByExerciseAndType: PersonalRecordsByExerciseAndType;
  bestPersonalRecordsByExerciseAndType: BestPersonalRecordsByExerciseAndType;
  weightAtRepsRecords: WeightAtRepsRecords;
  activeExercises: Exercise[];
  unitSystem: UnitSystem;
  isLoading: boolean;
  error: string | null;
  setUnitSystem: (unitSystem: UnitSystem) => void;
  loadWorkoutData: () => Promise<void>;
  addExercise: (exercise: Omit<Exercise, 'id'> & { id?: string }) => Promise<string>;
  addWorkoutSet: (set: WorkoutSetInput) => Promise<string>;
  updateWorkoutSet: (id: string, updates: WorkoutSetUpdate) => Promise<void>;
  deleteWorkoutSet: (id: string) => Promise<void>;
  deleteWorkoutSets: (ids: string[]) => Promise<void>;
  getExerciseById: (id: string) => Exercise | undefined;
  getWorkoutSetsForExercise: (exerciseId: string) => WorkoutSet[];
  getWorkoutSetsForDate: (date: Date) => WorkoutSet[];
  getPersonalRecordsForExercise: (exerciseId: string) => PersonalRecord[];
  getBestPersonalRecord: (
    exerciseId: string,
    type: PersonalRecordType,
    reps?: number
  ) => PersonalRecord | undefined;
  checkPersonalRecords: (workoutSet: WorkoutSet) => Promise<void>;
}

export const calculateOneRepMax = (weight: number, reps: number): number => {
  if (reps <= 0 || reps >= 37) {
    return weight;
  }

  return weight * (36 / (37 - reps));
};

const sameDay = (left: Date, right: Date): boolean => dayKey(left) === dayKey(right);

const dayKey = (date: Date): string => {
  const localDate = new Date(date);
  localDate.setHours(0, 0, 0, 0);
  return localDate.toISOString();
};

const weightAtRepsKey = (exerciseId: string, reps: number): string =>
  `${exerciseId}:Weight at Reps:${reps}`;

const createInitialState = (): Omit<
  WorkoutStoreState,
  | 'loadWorkoutData'
  | 'setUnitSystem'
  | 'addExercise'
  | 'addWorkoutSet'
  | 'updateWorkoutSet'
  | 'deleteWorkoutSet'
  | 'deleteWorkoutSets'
  | 'getExerciseById'
  | 'getWorkoutSetsForExercise'
  | 'getWorkoutSetsForDate'
  | 'getPersonalRecordsForExercise'
  | 'getBestPersonalRecord'
  | 'checkPersonalRecords'
> => ({
  exercises: [],
  workoutSets: [],
  personalRecords: [],
  exercisesById: {},
  workoutSetsByExerciseId: {},
  workoutSetsByDate: {},
  personalRecordsByExerciseId: {},
  personalRecordsByExerciseAndType: {},
  bestPersonalRecordsByExerciseAndType: {},
  weightAtRepsRecords: {},
  activeExercises: [],
  unitSystem: 'metric',
  isLoading: false,
  error: null
});

const validateWorkoutSet = (set: WorkoutSetInput | WorkoutSet): void => {
  if (!Number.isFinite(set.reps) || set.reps <= 0 || set.reps > 100) {
    throw new Error('Workout set reps must be between 1 and 100.');
  }

  if (
    set.weight !== undefined &&
    (!Number.isFinite(set.weight) || set.weight <= 0 || set.weight > 1000)
  ) {
    throw new Error('Workout set weight must be greater than 0 and at most 1000.');
  }

  if (set.date.getTime() > Date.now()) {
    throw new Error('Workout set date cannot be in the future.');
  }
};

const buildCaches = (
  exercises: Exercise[],
  workoutSets: WorkoutSet[],
  personalRecords: PersonalRecord[]
) => {
  const exercisesById: ExercisesById = {};
  const workoutSetsByExerciseId: WorkoutSetsByExercise = {};
  const workoutSetsByDate: WorkoutSetsByDate = {};
  const personalRecordsByExerciseId: PersonalRecordsByExercise = {};
  const personalRecordsByExerciseAndType: PersonalRecordsByExerciseAndType = {};
  const bestPersonalRecordsByExerciseAndType: BestPersonalRecordsByExerciseAndType = {};
  const weightAtRepsRecords: WeightAtRepsRecords = {};

  for (const exercise of exercises) {
    exercisesById[exercise.id] = exercise;
  }

  for (const set of workoutSets) {
    workoutSetsByExerciseId[set.exerciseId] = [
      ...(workoutSetsByExerciseId[set.exerciseId] ?? []),
      set
    ];

    const key = dayKey(set.date);
    workoutSetsByDate[key] = [...(workoutSetsByDate[key] ?? []), set];
  }

  for (const record of personalRecords) {
    addRecordToCaches(
      record,
      personalRecordsByExerciseId,
      personalRecordsByExerciseAndType,
      bestPersonalRecordsByExerciseAndType,
      weightAtRepsRecords
    );
  }

  return {
    exercisesById,
    workoutSetsByExerciseId,
    workoutSetsByDate,
    personalRecordsByExerciseId,
    personalRecordsByExerciseAndType,
    bestPersonalRecordsByExerciseAndType,
    weightAtRepsRecords
  };
};

const addRecordToCaches = (
  record: PersonalRecord,
  personalRecordsByExerciseId: PersonalRecordsByExercise,
  personalRecordsByExerciseAndType: PersonalRecordsByExerciseAndType,
  bestPersonalRecordsByExerciseAndType: BestPersonalRecordsByExerciseAndType,
  weightAtRepsRecords: WeightAtRepsRecords
) => {
  personalRecordsByExerciseId[record.exerciseId] = [
    ...(personalRecordsByExerciseId[record.exerciseId] ?? []),
    record
  ];

  personalRecordsByExerciseAndType[record.exerciseId] = {
    ...(personalRecordsByExerciseAndType[record.exerciseId] ?? {}),
    [record.type]: [
      ...(personalRecordsByExerciseAndType[record.exerciseId]?.[record.type] ?? []),
      record
    ]
  };

  const existingBest = bestPersonalRecordsByExerciseAndType[record.exerciseId]?.[record.type];
  if (!existingBest || record.value > existingBest.value) {
    bestPersonalRecordsByExerciseAndType[record.exerciseId] = {
      ...(bestPersonalRecordsByExerciseAndType[record.exerciseId] ?? {}),
      [record.type]: record
    };
  }

  if (record.type === 'Weight at Reps') {
    const key = weightAtRepsKey(record.exerciseId, record.reps);
    if (!weightAtRepsRecords[key] || record.value > weightAtRepsRecords[key].value) {
      weightAtRepsRecords[key] = record;
    }
  }
};

const calculateDailyVolume = (sets: WorkoutSet[]): number =>
  sets.reduce((total, set) => total + (set.weight ?? 0) * set.reps, 0);

export const createWorkoutStore = (database: LoadProgressDatabase = db) =>
  create<WorkoutStoreState>((set, get) => ({
    ...createInitialState(),

    setUnitSystem: (unitSystem) => set({ unitSystem }),

    loadWorkoutData: async () => {
      set({ isLoading: true, error: null });

      try {
        const [exercises, workoutSets, personalRecords] = await Promise.all([
          database.exercises.toArray(),
          database.workoutSets.toArray(),
          database.personalRecords.toArray()
        ]);

        const caches = buildCaches(exercises, workoutSets, personalRecords);
        const activeExerciseIds = new Set(workoutSets.map((workoutSet) => workoutSet.exerciseId));

        set({
          exercises,
          workoutSets,
          personalRecords,
          ...caches,
          activeExercises: exercises.filter((exercise) => activeExerciseIds.has(exercise.id)),
          isLoading: false
        });
      } catch (error) {
        set({ isLoading: false, error: error instanceof Error ? error.message : String(error) });
        throw error;
      }
    },

    addExercise: async (exercise) => {
      const id = await database.addExercise(exercise);
      const savedExercise = { ...exercise, id };

      set((state) => ({
        exercises: [...state.exercises, savedExercise],
        exercisesById: {
          ...state.exercisesById,
          [id]: savedExercise
        }
      }));

      return id;
    },

    addWorkoutSet: async (workoutSet) => {
      validateWorkoutSet(workoutSet);

      if (!get().exercisesById[workoutSet.exerciseId]) {
        throw new Error('Workout set exercise does not exist.');
      }

      const id = await database.addWorkoutSet(workoutSet);
      const savedSet: WorkoutSet = { ...workoutSet, id };
      const dateKey = dayKey(savedSet.date);

      set((state) => {
        const nextExerciseSets = [
          ...(state.workoutSetsByExerciseId[savedSet.exerciseId] ?? []),
          savedSet
        ];
        const nextDateSets = [...(state.workoutSetsByDate[dateKey] ?? []), savedSet];
        const activeExerciseIds = new Set(state.activeExercises.map((exercise) => exercise.id));
        const exercise = state.exercisesById[savedSet.exerciseId];
        const activeExercises =
          exercise && !activeExerciseIds.has(savedSet.exerciseId)
            ? [...state.activeExercises, exercise]
            : state.activeExercises;

        return {
          workoutSets: [...state.workoutSets, savedSet],
          workoutSetsByExerciseId: {
            ...state.workoutSetsByExerciseId,
            [savedSet.exerciseId]: nextExerciseSets
          },
          workoutSetsByDate: {
            ...state.workoutSetsByDate,
            [dateKey]: nextDateSets
          },
          activeExercises
        };
      });

      await get().checkPersonalRecords(savedSet);

      return id;
    },

    updateWorkoutSet: async (id, updates) => {
      const existingSet = get().workoutSets.find((workoutSet) => workoutSet.id === id);
      if (!existingSet) {
        throw new Error('Workout set does not exist.');
      }

      const updatedSet = { ...existingSet, ...updates };
      validateWorkoutSet(updatedSet);

      if (!get().exercisesById[updatedSet.exerciseId]) {
        throw new Error('Workout set exercise does not exist.');
      }

      await database.workoutSets.update(id, updates);

      const workoutSets = get().workoutSets.map((workoutSet) =>
        workoutSet.id === id ? updatedSet : workoutSet
      );
      const caches = buildCaches(get().exercises, workoutSets, get().personalRecords);
      const activeExerciseIds = new Set(workoutSets.map((workoutSet) => workoutSet.exerciseId));

      set({
        workoutSets,
        ...caches,
        activeExercises: get().exercises.filter((exercise) => activeExerciseIds.has(exercise.id))
      });
    },

    deleteWorkoutSet: async (id) => {
      await get().deleteWorkoutSets([id]);
    },

    deleteWorkoutSets: async (ids) => {
      await database.workoutSets.bulkDelete(ids);

      const deletedIds = new Set(ids);
      const workoutSets = get().workoutSets.filter((workoutSet) => !deletedIds.has(workoutSet.id));
      const caches = buildCaches(get().exercises, workoutSets, get().personalRecords);
      const activeExerciseIds = new Set(workoutSets.map((workoutSet) => workoutSet.exerciseId));

      set({
        workoutSets,
        ...caches,
        activeExercises: get().exercises.filter((exercise) => activeExerciseIds.has(exercise.id))
      });
    },

    getExerciseById: (id) => get().exercisesById[id],

    getWorkoutSetsForExercise: (exerciseId) => get().workoutSetsByExerciseId[exerciseId] ?? [],

    getWorkoutSetsForDate: (date) => get().workoutSetsByDate[dayKey(date)] ?? [],

    getPersonalRecordsForExercise: (exerciseId) =>
      get().personalRecordsByExerciseId[exerciseId] ?? [],

    getBestPersonalRecord: (exerciseId, type, reps) => {
      if (type === 'Weight at Reps' && reps !== undefined) {
        return get().weightAtRepsRecords[weightAtRepsKey(exerciseId, reps)];
      }

      return get().bestPersonalRecordsByExerciseAndType[exerciseId]?.[type];
    },

    checkPersonalRecords: async (workoutSet: WorkoutSet) => {
      if (workoutSet.weight === undefined) {
        return;
      }

      const records: Array<Omit<PersonalRecord, 'id'>> = [];
      const oneRepMax = calculateOneRepMax(workoutSet.weight, workoutSet.reps);
      const existingOneRepMax =
        get().bestPersonalRecordsByExerciseAndType[workoutSet.exerciseId]?.['1RM'];

      if (!existingOneRepMax || oneRepMax > existingOneRepMax.value) {
        records.push({
          exerciseId: workoutSet.exerciseId,
          type: '1RM',
          value: oneRepMax,
          date: workoutSet.date,
          reps: workoutSet.reps
        });
      }

      const existingWeightAtReps =
        get().weightAtRepsRecords[weightAtRepsKey(workoutSet.exerciseId, workoutSet.reps)];
      if (!existingWeightAtReps || workoutSet.weight > existingWeightAtReps.value) {
        records.push({
          exerciseId: workoutSet.exerciseId,
          type: 'Weight at Reps',
          value: workoutSet.weight,
          date: workoutSet.date,
          reps: workoutSet.reps
        });
      }

      const dailyExerciseSets = (get().workoutSetsByExerciseId[workoutSet.exerciseId] ?? []).filter(
        (setForExercise) => sameDay(setForExercise.date, workoutSet.date)
      );
      const dailyVolume = calculateDailyVolume(dailyExerciseSets);
      const existingVolume =
        get().bestPersonalRecordsByExerciseAndType[workoutSet.exerciseId]?.Volume;

      if (!existingVolume || dailyVolume > existingVolume.value) {
        records.push({
          exerciseId: workoutSet.exerciseId,
          type: 'Volume',
          value: dailyVolume,
          date: workoutSet.date,
          reps: dailyExerciseSets.reduce(
            (totalReps, setForExercise) => totalReps + setForExercise.reps,
            0
          )
        });
      }

      for (const record of records) {
        const id = await database.addPersonalRecord(record);
        const savedRecord: PersonalRecord = { ...record, id };

        set((state) => {
          const personalRecordsByExerciseId = { ...state.personalRecordsByExerciseId };
          const personalRecordsByExerciseAndType = {
            ...state.personalRecordsByExerciseAndType
          };
          const bestPersonalRecordsByExerciseAndType = {
            ...state.bestPersonalRecordsByExerciseAndType
          };
          const weightAtRepsRecords = { ...state.weightAtRepsRecords };

          addRecordToCaches(
            savedRecord,
            personalRecordsByExerciseId,
            personalRecordsByExerciseAndType,
            bestPersonalRecordsByExerciseAndType,
            weightAtRepsRecords
          );

          return {
            personalRecords: [...state.personalRecords, savedRecord],
            personalRecordsByExerciseId,
            personalRecordsByExerciseAndType,
            bestPersonalRecordsByExerciseAndType,
            weightAtRepsRecords
          };
        });
      }
    }
  }));

export const useWorkoutStore = createWorkoutStore();
