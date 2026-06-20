export type Sex = 'male' | 'female';
export type Goal = 'lose' | 'recomposition' | 'gain';
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'very_active';
export type DietStyle = 'standard' | 'vegan' | 'vegetarian' | 'keto' | 'paleo';

export interface Profile {
  id: string; // ponytail: always 'profile' — single-record table
  weight: number; // always kg; form converts for display
  height: number; // always cm; form converts for display
  age: number;
  sex: Sex;
  goal: Goal;
  activityLevel: ActivityLevel;
  dietStyle: DietStyle;
  location?: string;
  trainingDaysPerWeek: number;
  trainingMinutesPerSession: number;
  cycleTrackingOptIn: boolean;
  unitSystem: 'metric' | 'imperial';
}

export interface RoutineExercise {
  exerciseId: string;
  targetSets: number;
  targetReps: number;
  note?: string;
}

export interface TrainingRoutine {
  id: string; // '0'–'6' representing Mon–Sun
  type: 'Push' | 'Pull' | 'Lower' | 'Run' | 'Rest';
  exercises: RoutineExercise[];
}

export interface BodyWeight {
  id: string;
  date: string; // ISO date YYYY-MM-DD
  weight: number;
}

export interface Measurement {
  id: string;
  date: string; // ISO date YYYY-MM-DD
  waist: number;
  hips: number;
}

export interface NutritionLog {
  id: string;
  date: string; // ISO date YYYY-MM-DD
  protein: number;
  carbs: number;
  fat: number;
}

export interface CycleState {
  id: string; // ponytail: always 'current' — single-record table
  phase: string;
  updatedAt: string;
}
