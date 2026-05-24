export type ExerciseType = 'Weight Training' | 'Bodyweight';

export type MuscleGroup =
  | 'Chest'
  | 'Back'
  | 'Legs'
  | 'Shoulders'
  | 'Arms'
  | 'Core'
  | 'Full Body'
  | 'Forearms'
  | 'Glutes'
  | 'Upper Back'
  | 'Lower Back';

export type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';

export type Equipment =
  | 'Barbell'
  | 'Dumbbell'
  | 'Kettlebell'
  | 'Resistance Band'
  | 'Cable Machine'
  | 'Smith Machine'
  | 'Bodyweight'
  | 'Machine'
  | 'Weight Plate'
  | 'Bench'
  | 'Pull-up Bar'
  | 'Foam Roller';

export interface Exercise {
  id: string;
  name: string;
  type: ExerciseType;
  muscleGroup: MuscleGroup;
  secondaryMuscleGroups: MuscleGroup[];
  icon: string;
  difficulty: Difficulty;
  equipment: Equipment[];
  description: string;
  formCues: string[];
}
