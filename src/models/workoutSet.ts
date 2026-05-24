export interface WorkoutSet {
  id: string;
  exerciseId: string;
  weight?: number;
  reps: number;
  date: Date;
  rpe?: number;
  restTime?: number;
  notes?: string;
  isFailureSet: boolean;
}
