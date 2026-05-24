import type { Exercise, ExerciseType, MuscleGroup, WorkoutSet } from '@/models';

export type VolumeWindow = 'week' | 'month' | 'quarter';

export type MuscleVolumeMetric = {
  muscleGroup: MuscleGroup;
  volume: number;
};

export type ProgressTrendPoint = {
  date: string;
  label: string;
  weight: number;
  reps: number;
  sets: number;
};

const windowDays: Record<VolumeWindow, number> = {
  week: 7,
  month: 30,
  quarter: 90
};

const startOfDay = (date: Date) => {
  const nextDate = new Date(date);
  nextDate.setHours(0, 0, 0, 0);
  return nextDate;
};

const dayKey = (date: Date) => startOfDay(date).toISOString();

const dayLabel = (date: Date) =>
  new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(date);

export const calculateSetVolume = (workoutSet: WorkoutSet) =>
  (workoutSet.weight ?? 0) * workoutSet.reps;

export const calculateVolumeByMuscleGroup = (
  workoutSets: WorkoutSet[],
  exercisesById: Record<string, Exercise>,
  volumeWindow: VolumeWindow,
  now = new Date()
): MuscleVolumeMetric[] => {
  const since = startOfDay(now);
  since.setDate(since.getDate() - (windowDays[volumeWindow] - 1));

  const totals = workoutSets.reduce<Partial<Record<MuscleGroup, number>>>((groups, workoutSet) => {
    if (workoutSet.date < since || workoutSet.date > now) {
      return groups;
    }

    const exercise = exercisesById[workoutSet.exerciseId];
    if (!exercise) {
      return groups;
    }

    groups[exercise.muscleGroup] = (groups[exercise.muscleGroup] ?? 0) + calculateSetVolume(workoutSet);
    return groups;
  }, {});

  return Object.entries(totals)
    .map(([muscleGroup, volume]) => ({
      muscleGroup: muscleGroup as MuscleGroup,
      volume: volume ?? 0
    }))
    .filter((metric) => metric.volume > 0)
    .sort((left, right) => right.volume - left.volume);
};

export const getLoggedExercises = (
  exercises: Exercise[],
  workoutSets: WorkoutSet[]
) => {
  const loggedExerciseIds = new Set(workoutSets.map((workoutSet) => workoutSet.exerciseId));
  return exercises.filter((exercise) => loggedExerciseIds.has(exercise.id));
};

export const getExerciseTypes = (exercises: Exercise[]) =>
  Array.from(new Set(exercises.map((exercise) => exercise.type))).sort() as ExerciseType[];

export const getMuscleGroupsForType = (
  exercises: Exercise[],
  exerciseType: ExerciseType | ''
) =>
  Array.from(
    new Set(
      exercises
        .filter((exercise) => !exerciseType || exercise.type === exerciseType)
        .map((exercise) => exercise.muscleGroup)
    )
  ).sort() as MuscleGroup[];

export const getExercisesForSelection = (
  exercises: Exercise[],
  exerciseType: ExerciseType | '',
  muscleGroup: MuscleGroup | ''
) =>
  exercises
    .filter((exercise) => !exerciseType || exercise.type === exerciseType)
    .filter((exercise) => !muscleGroup || exercise.muscleGroup === muscleGroup)
    .sort((left, right) => left.name.localeCompare(right.name));

export const buildProgressTrend = (
  workoutSets: WorkoutSet[],
  exerciseId: string
): ProgressTrendPoint[] => {
  const grouped = workoutSets
    .filter((workoutSet) => workoutSet.exerciseId === exerciseId)
    .reduce<Record<string, WorkoutSet[]>>((days, workoutSet) => {
      const key = dayKey(workoutSet.date);
      days[key] = [...(days[key] ?? []), workoutSet];
      return days;
    }, {});

  return Object.entries(grouped)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([date, sets]) => {
      const weight = Math.max(...sets.map((workoutSet) => workoutSet.weight ?? 0));
      const reps = Math.max(...sets.map((workoutSet) => workoutSet.reps));

      return {
        date,
        label: dayLabel(new Date(date)),
        weight,
        reps,
        sets: sets.length
      };
    });
};

export const getFocusedWeightDomain = (trend: ProgressTrendPoint[]): [number, number] => {
  const weights = trend.map((point) => point.weight).filter((weight) => weight > 0);

  if (weights.length === 0) {
    return [0, 10];
  }

  const min = Math.min(...weights);
  const max = Math.max(...weights);
  const range = max - min;
  const padding = Math.max(5, Math.ceil(range));
  const lowerBound = Math.max(0, Math.floor(min - padding));
  const upperBound = Math.ceil(max + padding);

  return lowerBound === upperBound ? [Math.max(0, lowerBound - 5), upperBound + 5] : [lowerBound, upperBound];
};
