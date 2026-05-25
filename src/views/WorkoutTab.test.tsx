import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Exercise } from '@/models';
import { useWorkoutStore } from '@/store/useWorkoutStore';
import { AddWorkoutModal } from '@/views/components/AddWorkoutModal';
import { WorkoutTab } from '@/views/WorkoutTab';

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

function resetWorkoutStore(addWorkoutSet = vi.fn().mockResolvedValue('set-id')) {
  useWorkoutStore.setState({
    exercises: [benchPress],
    workoutSets: [],
    personalRecords: [],
    exercisesById: { [benchPress.id]: benchPress },
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
    loadWorkoutData: vi.fn().mockResolvedValue(undefined),
    addWorkoutSet
  });
  return addWorkoutSet;
}

beforeEach(() => {
  vi.restoreAllMocks();
  resetWorkoutStore();
});

describe('WorkoutTab', () => {
  it('renders the empty state when the selected date has no sets', () => {
    render(<WorkoutTab />);

    expect(screen.getByText('No workouts for this date')).toBeInTheDocument();
  });

  it('logs a workout set from the add workout sheet', async () => {
    const addWorkoutSet = resetWorkoutStore();

    render(<AddWorkoutModal date={new Date('2026-05-20T09:00:00')} isOpen onClose={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: 'Weight Training' }));
    fireEvent.click(screen.getByRole('button', { name: 'Chest' }));
    fireEvent.click(screen.getByRole('button', { name: /Bench Press/ }));
    fireEvent.change(screen.getByLabelText('Weight'), { target: { value: '100' } });
    fireEvent.change(screen.getByLabelText('Reps'), { target: { value: '5' } });
    fireEvent.change(screen.getByLabelText(/RPE/), { target: { value: '8' } });
    fireEvent.change(screen.getByLabelText('Notes'), { target: { value: 'Smooth top set' } });
    fireEvent.click(screen.getByLabelText('Failure set'));
    fireEvent.click(screen.getByRole('button', { name: 'Add' }));

    await waitFor(() => {
      expect(addWorkoutSet).toHaveBeenCalledWith({
        exerciseId: benchPress.id,
        weight: 100,
        reps: 5,
        date: new Date('2026-05-20T09:00:00'),
        rpe: 8,
        notes: 'Smooth top set',
        isFailureSet: true
      });
    });
  });

  it('shows validation helpers for missing reps and negative weight', () => {
    render(<AddWorkoutModal date={new Date('2026-05-20T09:00:00')} isOpen onClose={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: 'Weight Training' }));
    fireEvent.click(screen.getByRole('button', { name: 'Chest' }));
    fireEvent.click(screen.getByRole('button', { name: /Bench Press/ }));
    fireEvent.change(screen.getByLabelText('Weight'), { target: { value: '-10' } });
    fireEvent.click(screen.getByRole('button', { name: 'Add' }));

    expect(screen.getByText('Reps must be a positive whole number.')).toBeInTheDocument();
    expect(screen.getByText('Weight must be a positive number.')).toBeInTheDocument();
  });
});
