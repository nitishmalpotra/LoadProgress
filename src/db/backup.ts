import { db, type LoadProgressDatabase } from '@/db/database';
import type {
  Difficulty,
  Equipment,
  Exercise,
  ExerciseType,
  MuscleGroup,
  PersonalRecord,
  PersonalRecordType,
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
    (value.weight === undefined || (typeof value.weight === 'number' && Number.isFinite(value.weight))) &&
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
  const [exercises, workoutSets, personalRecords] = await Promise.all([
    database.exercises.toArray(),
    database.workoutSets.toArray(),
    database.personalRecords.toArray()
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
    }))
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

  await database.transaction('rw', database.exercises, database.workoutSets, database.personalRecords, async () => {
    await database.exercises.bulkPut(backup.exercises);
    await database.workoutSets.bulkPut(workoutSets);
    await database.personalRecords.bulkPut(personalRecords);
  });

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
