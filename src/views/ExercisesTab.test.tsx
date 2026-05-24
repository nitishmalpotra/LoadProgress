import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Exercise, WorkoutSet } from '@/models';
import { useWorkoutStore } from '@/store/useWorkoutStore';
import { ExerciseDetail } from '@/views/ExerciseDetail';
import { ExercisesTab } from '@/views/ExercisesTab';
import { AddWorkoutModal } from '@/views/components/AddWorkoutModal';

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
  formCues: ['Retract shoulder blades', 'Keep feet planted']
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
  formCues: ['Break at hips and knees', 'Keep chest up']
};

const curl: Exercise = {
  id: '10000000-0000-4000-8000-000000000011',
  name: 'Bicep Curls',
  type: 'Weight Training',
  muscleGroup: 'Arms',
  secondaryMuscleGroups: [],
  icon: 'bicepCurl',
  difficulty: 'Beginner',
  equipment: ['Dumbbell'],
  description: 'Basic bicep exercise',
  formCues: ['Keep elbows still', 'Full range of motion']
};

function resetWorkoutStore(
  exercises: Exercise[] = [benchPress, squat, curl],
  sets: WorkoutSet[] = []
) {
  const addExercise = vi.fn(async (exercise: Omit<Exercise, 'id'> & { id?: string }) => {
    const savedExercise = {
      ...exercise,
      id: exercise.id ?? '20000000-0000-4000-8000-000000000001'
    };

    useWorkoutStore.setState((state) => ({
      exercises: [...state.exercises, savedExercise],
      exercisesById: {
        ...state.exercisesById,
        [savedExercise.id]: savedExercise
      }
    }));

    return savedExercise.id;
  });

  useWorkoutStore.setState({
    exercises,
    workoutSets: sets,
    personalRecords: [],
    exercisesById: Object.fromEntries(exercises.map((exercise) => [exercise.id, exercise])),
    workoutSetsByExerciseId: sets.reduce<Record<string, WorkoutSet[]>>((groups, set) => {
      groups[set.exerciseId] = [...(groups[set.exerciseId] ?? []), set];
      return groups;
    }, {}),
    workoutSetsByDate: {},
    personalRecordsByExerciseId: {},
    personalRecordsByExerciseAndType: {},
    bestPersonalRecordsByExerciseAndType: {},
    weightAtRepsRecords: {},
    activeExercises: [],
    unitSystem: 'metric',
    isLoading: false,
    error: null,
    loadWorkoutData: vi.fn().mockResolvedValue(undefined),
    addExercise,
    addWorkoutSet: vi.fn().mockResolvedValue('set-id')
  });

  return addExercise;
}

beforeEach(() => {
  vi.restoreAllMocks();
  resetWorkoutStore();
});

describe('ExercisesTab', () => {
  it('filters search results by exercise name and equipment', () => {
    render(<ExercisesTab />);

    fireEvent.change(screen.getByLabelText('Search exercises'), { target: { value: 'Bench' } });

    expect(screen.getByText('Bench Press')).toBeInTheDocument();
    expect(screen.queryByText('Squats')).not.toBeInTheDocument();
    expect(screen.queryByText('Bicep Curls')).not.toBeInTheDocument();
  });

  it('aggregates average weight and total repetitions in the detail sheet', () => {
    const sets: WorkoutSet[] = [
      {
        id: 'set-1',
        exerciseId: benchPress.id,
        weight: 100,
        reps: 5,
        date: new Date('2026-05-20T09:00:00'),
        rpe: 8,
        isFailureSet: false
      },
      {
        id: 'set-2',
        exerciseId: benchPress.id,
        weight: 120,
        reps: 3,
        date: new Date('2026-05-21T09:00:00'),
        rpe: 9,
        isFailureSet: false
      }
    ];
    resetWorkoutStore([benchPress], sets);

    render(<ExerciseDetail exercise={benchPress} onClose={vi.fn()} />);

    const stats = screen.getByLabelText('Key stats');
    expect(within(stats).getByText('Average Weight')).toBeInTheDocument();
    expect(within(stats).getByText('110 kg')).toBeInTheDocument();
    expect(within(stats).getByText('Total Reps')).toBeInTheDocument();
    expect(within(stats).getByText('8')).toBeInTheDocument();
  });

  it('shows a custom-created exercise in the add workout selection flow', async () => {
    resetWorkoutStore([benchPress]);
    const { rerender } = render(<ExercisesTab />);

    fireEvent.click(screen.getByRole('button', { name: /Custom Exercise/ }));
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Safety Bar Squat' } });
    fireEvent.change(screen.getByLabelText('Muscle Group'), { target: { value: 'Legs' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save Exercise' }));

    await waitFor(() => {
      expect(screen.getByText('Safety Bar Squat')).toBeInTheDocument();
    });

    rerender(<AddWorkoutModal date={new Date('2026-05-20T09:00:00')} isOpen onClose={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: 'Weight Training' }));
    fireEvent.click(screen.getByRole('button', { name: 'Legs' }));

    expect(screen.getByRole('button', { name: /Safety Bar Squat/ })).toBeInTheDocument();
  });
});
