import type { RoutineExercise, WorkoutSet } from '@/models';

// Maps JS Date.getDay() (0=Sun … 6=Sat) to routine day id (0=Mon … 6=Sun)
export function todayRoutineId(now: Date = new Date()): string {
  return String((now.getDay() + 6) % 7);
}

export interface PlanCompletion {
  done: boolean[]; // parallel to plannedExercises
  sessionDone: boolean;
}

export function derivePlanCompletion(
  plannedExercises: RoutineExercise[],
  todaySets: WorkoutSet[]
): PlanCompletion {
  if (plannedExercises.length === 0) return { done: [], sessionDone: false };
  const logged = new Set(todaySets.map((s) => s.exerciseId));
  const done = plannedExercises.map((ex) => logged.has(ex.exerciseId));
  return { done, sessionDone: done.every(Boolean) };
}
