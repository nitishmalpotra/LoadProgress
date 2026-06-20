import { db, type LoadProgressDatabase } from '@/db/database';
import type {
  ActivityLevel,
  BodyWeight,
  CycleState,
  DietStyle,
  Difficulty,
  Equipment,
  Exercise,
  ExerciseType,
  Goal,
  Measurement,
  MuscleGroup,
  NutritionLog,
  PersonalRecord,
  PersonalRecordType,
  Profile,
  Sex,
  TrainingRoutine,
  WorkoutSet
} from '@/models';

type SerializedWorkoutSet = Omit<WorkoutSet, 'date'> & { date: string };
type SerializedPersonalRecord = Omit<PersonalRecord, 'date'> & { date: string };

export interface LoadProgressBackup {
  app: 'LoadProgress';
  version: 1;
  exportedAt: string;
  exercises: Exercise[];
  workoutSets: SerializedWorkoutSet[];
  personalRecords: SerializedPersonalRecord[];
  // added in schema v2; optional so pre-v2 backups still import cleanly
  profile?: Profile[];
  trainingRoutine?: TrainingRoutine[];
  bodyWeights?: BodyWeight[];
  measurements?: Measurement[];
  nutritionLog?: NutritionLog[];
  cycleState?: CycleState[];
}

export interface BackupImportResult {
  exercises: number;
  workoutSets: number;
  personalRecords: number;
}

const exerciseTypes: ExerciseType[] = ['Weight Training', 'Bodyweight'];
const muscleGroups: MuscleGroup[] = [
  'Chest',
  'Back',
  'Legs',
  'Shoulders',
  'Arms',
  'Core',
  'Full Body',
  'Forearms',
  'Glutes',
  'Upper Back',
  'Lower Back'
];
const difficulties: Difficulty[] = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];
const equipmentOptions: Equipment[] = [
  'Barbell',
  'Dumbbell',
  'Kettlebell',
  'Resistance Band',
  'Cable Machine',
  'Smith Machine',
  'Bodyweight',
  'Machine',
  'Weight Plate',
  'Bench',
  'Pull-up Bar',
  'Foam Roller'
];
const personalRecordTypes: PersonalRecordType[] = ['1RM', 'Volume', 'Weight at Reps', 'Total Reps'];

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === 'string');

const isValidDate = (value: unknown): value is string =>
  typeof value === 'string' && !Number.isNaN(new Date(value).getTime());

const isExercise = (value: unknown): value is Exercise => {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.id === 'string' &&
    typeof value.name === 'string' &&
    exerciseTypes.includes(value.type as ExerciseType) &&
    muscleGroups.includes(value.muscleGroup as MuscleGroup) &&
    Array.isArray(value.secondaryMuscleGroups) &&
    value.secondaryMuscleGroups.every((group) => muscleGroups.includes(group as MuscleGroup)) &&
    typeof value.icon === 'string' &&
    difficulties.includes(value.difficulty as Difficulty) &&
    Array.isArray(value.equipment) &&
    value.equipment.every((equipment) => equipmentOptions.includes(equipment as Equipment)) &&
    typeof value.description === 'string' &&
    isStringArray(value.formCues)
  );
};

const isSerializedWorkoutSet = (value: unknown): value is SerializedWorkoutSet => {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.id === 'string' &&
    typeof value.exerciseId === 'string' &&
    (value.weight === undefined ||
      (typeof value.weight === 'number' && Number.isFinite(value.weight))) &&
    typeof value.reps === 'number' &&
    Number.isInteger(value.reps) &&
    value.reps > 0 &&
    isValidDate(value.date) &&
    (value.rpe === undefined || (typeof value.rpe === 'number' && Number.isFinite(value.rpe))) &&
    (value.restTime === undefined ||
      (typeof value.restTime === 'number' && Number.isFinite(value.restTime))) &&
    (value.notes === undefined || typeof value.notes === 'string') &&
    typeof value.isFailureSet === 'boolean'
  );
};

const isSerializedPersonalRecord = (value: unknown): value is SerializedPersonalRecord => {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.id === 'string' &&
    typeof value.exerciseId === 'string' &&
    personalRecordTypes.includes(value.type as PersonalRecordType) &&
    typeof value.value === 'number' &&
    Number.isFinite(value.value) &&
    isValidDate(value.date) &&
    typeof value.reps === 'number' &&
    Number.isInteger(value.reps)
  );
};

const sexes: Sex[] = ['male', 'female'];
const goals: Goal[] = ['lose', 'recomposition', 'gain'];
const activityLevels: ActivityLevel[] = ['sedentary', 'light', 'moderate', 'very_active'];
const dietStyles: DietStyle[] = ['standard', 'vegan', 'vegetarian', 'keto', 'paleo'];

const isProfile = (v: unknown): v is Profile =>
  isRecord(v) &&
  typeof v.id === 'string' &&
  typeof v.weight === 'number' &&
  typeof v.height === 'number' &&
  typeof v.age === 'number' &&
  sexes.includes(v.sex as Sex) &&
  goals.includes(v.goal as Goal) &&
  activityLevels.includes(v.activityLevel as ActivityLevel) &&
  dietStyles.includes(v.dietStyle as DietStyle) &&
  (v.location === undefined || typeof v.location === 'string') &&
  typeof v.trainingDaysPerWeek === 'number' &&
  typeof v.trainingMinutesPerSession === 'number' &&
  typeof v.cycleTrackingOptIn === 'boolean' &&
  (v.unitSystem === 'metric' || v.unitSystem === 'imperial');

const isTrainingRoutine = (v: unknown): v is TrainingRoutine =>
  isRecord(v) && typeof v.id === 'string' && typeof v.type === 'string' && Array.isArray(v.exercises);

const isBodyWeight = (v: unknown): v is BodyWeight =>
  isRecord(v) &&
  typeof v.id === 'string' &&
  typeof v.date === 'string' &&
  typeof v.weight === 'number';

const isMeasurement = (v: unknown): v is Measurement =>
  isRecord(v) &&
  typeof v.id === 'string' &&
  typeof v.date === 'string' &&
  typeof v.waist === 'number' &&
  typeof v.hips === 'number';

const isNutritionLog = (v: unknown): v is NutritionLog =>
  isRecord(v) &&
  typeof v.id === 'string' &&
  typeof v.date === 'string' &&
  typeof v.protein === 'number' &&
  typeof v.carbs === 'number' &&
  typeof v.fat === 'number';

const isCycleState = (v: unknown): v is CycleState =>
  isRecord(v) && typeof v.id === 'string' && typeof v.phase === 'string';

const reviveWorkoutSet = (set: SerializedWorkoutSet): WorkoutSet => ({
  ...set,
  date: new Date(set.date)
});

const revivePersonalRecord = (record: SerializedPersonalRecord): PersonalRecord => ({
  ...record,
  date: new Date(record.date)
});

export const exportBackupData = async (
  database: LoadProgressDatabase = db
): Promise<LoadProgressBackup> => {
  const [
    exercises,
    workoutSets,
    personalRecords,
    profile,
    trainingRoutine,
    bodyWeights,
    measurements,
    nutritionLog,
    cycleState
  ] = await Promise.all([
    database.exercises.toArray(),
    database.workoutSets.toArray(),
    database.personalRecords.toArray(),
    database.profile.toArray(),
    database.trainingRoutine.toArray(),
    database.bodyWeights.toArray(),
    database.measurements.toArray(),
    database.nutritionLog.toArray(),
    database.cycleState.toArray()
  ]);

  return {
    app: 'LoadProgress',
    version: 1,
    exportedAt: new Date().toISOString(),
    exercises,
    workoutSets: workoutSets.map((set) => ({ ...set, date: set.date.toISOString() })),
    personalRecords: personalRecords.map((record) => ({
      ...record,
      date: record.date.toISOString()
    })),
    profile,
    trainingRoutine,
    bodyWeights,
    measurements,
    nutritionLog,
    cycleState
  };
};

export const downloadBackupFile = async (database: LoadProgressDatabase = db): Promise<void> => {
  const backup = await exportBackupData(database);
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = `loadprogress-backup-${backup.exportedAt.slice(0, 10)}.json`;
  link.click();
  URL.revokeObjectURL(url);
};

export const parseBackupJson = (json: string): LoadProgressBackup => {
  let parsed: unknown;

  try {
    parsed = JSON.parse(json);
  } catch {
    throw new Error('Backup file is not valid JSON.');
  }

  if (!isRecord(parsed)) {
    throw new Error('Backup file has an invalid structure.');
  }

  if (
    parsed.app !== 'LoadProgress' ||
    parsed.version !== 1 ||
    !isValidDate(parsed.exportedAt) ||
    !Array.isArray(parsed.exercises) ||
    !Array.isArray(parsed.workoutSets) ||
    !Array.isArray(parsed.personalRecords)
  ) {
    throw new Error('Backup file has an invalid structure.');
  }

  if (
    !parsed.exercises.every(isExercise) ||
    !parsed.workoutSets.every(isSerializedWorkoutSet) ||
    !parsed.personalRecords.every(isSerializedPersonalRecord)
  ) {
    throw new Error('Backup file contains unsupported records.');
  }

  if (
    (parsed.profile !== undefined && (!Array.isArray(parsed.profile) || !parsed.profile.every(isProfile))) ||
    (parsed.trainingRoutine !== undefined && (!Array.isArray(parsed.trainingRoutine) || !parsed.trainingRoutine.every(isTrainingRoutine))) ||
    (parsed.bodyWeights !== undefined && (!Array.isArray(parsed.bodyWeights) || !parsed.bodyWeights.every(isBodyWeight))) ||
    (parsed.measurements !== undefined && (!Array.isArray(parsed.measurements) || !parsed.measurements.every(isMeasurement))) ||
    (parsed.nutritionLog !== undefined && (!Array.isArray(parsed.nutritionLog) || !parsed.nutritionLog.every(isNutritionLog))) ||
    (parsed.cycleState !== undefined && (!Array.isArray(parsed.cycleState) || !parsed.cycleState.every(isCycleState)))
  ) {
    throw new Error('Backup file contains unsupported records.');
  }

  return parsed as unknown as LoadProgressBackup;
};

export const readBackupFile = (file: File): Promise<LoadProgressBackup> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.addEventListener('load', () => {
      try {
        resolve(parseBackupJson(String(reader.result ?? '')));
      } catch (error) {
        reject(error);
      }
    });
    reader.addEventListener('error', () => reject(new Error('Backup file could not be read.')));
    reader.readAsText(file);
  });

export const importBackupData = async (
  backup: LoadProgressBackup,
  database: LoadProgressDatabase = db
): Promise<BackupImportResult> => {
  const workoutSets = backup.workoutSets.map(reviveWorkoutSet);
  const personalRecords = backup.personalRecords.map(revivePersonalRecord);

  await database.transaction(
    'rw',
    database.exercises,
    database.workoutSets,
    database.personalRecords,
    database.profile,
    database.trainingRoutine,
    database.bodyWeights,
    database.measurements,
    database.nutritionLog,
    database.cycleState,
    async () => {
      await database.exercises.bulkPut(backup.exercises);
      await database.workoutSets.bulkPut(workoutSets);
      await database.personalRecords.bulkPut(personalRecords);
      if (backup.profile?.length) await database.profile.bulkPut(backup.profile);
      if (backup.trainingRoutine?.length) await database.trainingRoutine.bulkPut(backup.trainingRoutine);
      if (backup.bodyWeights?.length) await database.bodyWeights.bulkPut(backup.bodyWeights);
      if (backup.measurements?.length) await database.measurements.bulkPut(backup.measurements);
      if (backup.nutritionLog?.length) await database.nutritionLog.bulkPut(backup.nutritionLog);
      if (backup.cycleState?.length) await database.cycleState.bulkPut(backup.cycleState);
    }
  );

  return {
    exercises: backup.exercises.length,
    workoutSets: workoutSets.length,
    personalRecords: personalRecords.length
  };
};

export const importBackupFile = async (
  file: File,
  database: LoadProgressDatabase = db
): Promise<BackupImportResult> => {
  const backup = await readBackupFile(file);

  return importBackupData(backup, database);
};
