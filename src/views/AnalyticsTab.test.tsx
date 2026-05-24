import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Exercise, WorkoutSet } from '@/models';
import { useWorkoutStore } from '@/store/useWorkoutStore';
import { AnalyticsTab } from '@/views/AnalyticsTab';
import {
  buildProgressTrend,
  calculateVolumeByMuscleGroup,
  getFocusedWeightDomain
} from '@/views/analyticsMetrics';
import { ProgressTab } from '@/views/ProgressTab';

const benchPress: Exercise = {
  id: '10000000-0000-4000-8000-000000000001',
  name: 'Bench Press',
  type: 'Weight Training',
  muscleGroup: 'Chest',
  secondaryMuscleGroups: [],
  icon: 'benchPress',
  difficulty: 'Intermediate',
  equipment: ['Barbell', 'Bench'],
  description: 'Classic compound chest exercise',
  formCues: ['Retract shoulder blades']
};

const deadlift: Exercise = {
  id: '10000000-0000-4000-8000-000000000006',
  name: 'Deadlift',
  type: 'Weight Training',
  muscleGroup: 'Back',
  secondaryMuscleGroups: [],
  icon: 'deadlift',
  difficulty: 'Advanced',
  equipment: ['Barbell'],
  description: 'Fundamental hip hinge movement',
  formCues: ['Neutral spine']
};

const squat: Exercise = {
  id: '10000000-0000-4000-8000-000000000009',
  name: 'Squats',
  type: 'Weight Training',
  muscleGroup: 'Legs',
  secondaryMuscleGroups: [],
  icon: 'squat',
  difficulty: 'Intermediate',
  equipment: ['Barbell'],
  description: 'Fundamental lower body movement',
  formCues: ['Keep chest up']
};

const exercisesById = {
  [benchPress.id]: benchPress,
  [deadlift.id]: deadlift,
  [squat.id]: squat
};

const makeSet = (
  id: string,
  exerciseId: string,
  weight: number,
  reps: number,
  date: string
): WorkoutSet => ({
  id,
  exerciseId,
  weight,
  reps,
  date: new Date(date),
  isFailureSet: false
});

function resetWorkoutStore(workoutSets: WorkoutSet[] = []) {
  useWorkoutStore.setState({
    exercises: [benchPress, deadlift, squat],
    workoutSets,
    personalRecords: [],
    exercisesById,
    workoutSetsByExerciseId: {},
    workoutSetsByDate: {},
    personalRecordsByExerciseId: {},
    personalRecordsByExerciseAndType: {},
    bestPersonalRecordsByExerciseAndType: {},
    weightAtRepsRecords: {},
    activeExercises: [],
    unitSystem: 'metric',
    isLoading: false,
    error: null,
    loadWorkoutData: vi.fn().mockResolvedValue(undefined)
  });
}

beforeEach(() => {
  vi.restoreAllMocks();
  resetWorkoutStore();
});

describe('analytics metrics', () => {
  it('calculates volume totals by muscle group for the selected window', () => {
    const workoutSets = [
      makeSet('set-1', benchPress.id, 100, 5, '2026-05-24T09:00:00'),
      makeSet('set-2', benchPress.id, 90, 8, '2026-05-23T09:00:00'),
      makeSet('set-3', deadlift.id, 140, 3, '2026-05-22T09:00:00'),
      makeSet('set-4', squat.id, 120, 5, '2026-04-20T09:00:00')
    ];

    const metrics = calculateVolumeByMuscleGroup(
      workoutSets,
      exercisesById,
      'week',
      new Date('2026-05-24T12:00:00')
    );

    expect(metrics).toEqual([
      { muscleGroup: 'Chest', volume: 1220 },
      { muscleGroup: 'Back', volume: 420 }
    ]);
  });

  it('uses focused weight bounds for narrow progress ranges', () => {
    const trend = buildProgressTrend(
      [
        makeSet('set-1', benchPress.id, 100, 5, '2026-05-20T09:00:00'),
        makeSet('set-2', benchPress.id, 105, 4, '2026-05-21T09:00:00')
      ],
      benchPress.id
    );

    expect(getFocusedWeightDomain(trend)).toEqual([95, 110]);
  });
});

describe('analytics views', () => {
  it('renders a clean empty state when volume data is missing', () => {
    render(<AnalyticsTab />);

    expect(screen.getByText('Add logs to view progress metrics')).toBeInTheDocument();
  });

  it('renders a clean empty state when progress data is missing', () => {
    render(<ProgressTab />);

    expect(screen.getByText('Add logs to view progress metrics')).toBeInTheDocument();
  });
});
