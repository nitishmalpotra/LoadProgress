import Dexie, { type Table } from 'dexie';
import type { Exercise, PersonalRecord, WorkoutSet } from '@/models';

export const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const createUuid = (): string => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  throw new Error('crypto.randomUUID is required to create database records.');
};

export const DEFAULT_EXERCISES: Exercise[] = [
  {
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
  },
  {
    id: '10000000-0000-4000-8000-000000000002',
    name: 'Incline Dumbbell Press',
    type: 'Weight Training',
    muscleGroup: 'Chest',
    secondaryMuscleGroups: [],
    icon: 'inclineBench',
    difficulty: 'Intermediate',
    equipment: ['Dumbbell', 'Bench'],
    description: 'Upper chest focused press',
    formCues: ['Control the weight', 'Keep elbows at 45 degrees']
  },
  {
    id: '10000000-0000-4000-8000-000000000003',
    name: 'Push-Ups',
    type: 'Bodyweight',
    muscleGroup: 'Chest',
    secondaryMuscleGroups: [],
    icon: 'pushUp',
    difficulty: 'Beginner',
    equipment: ['Bodyweight'],
    description: 'Fundamental pushing exercise',
    formCues: ['Keep core tight', 'Full range of motion']
  },
  {
    id: '10000000-0000-4000-8000-000000000004',
    name: 'Dips',
    type: 'Bodyweight',
    muscleGroup: 'Chest',
    secondaryMuscleGroups: [],
    icon: 'dips',
    difficulty: 'Intermediate',
    equipment: ['Bodyweight'],
    description: 'Advanced chest and tricep exercise',
    formCues: ['Lean forward for chest focus', 'Control the descent']
  },
  {
    id: '10000000-0000-4000-8000-000000000005',
    name: 'Pull-Ups',
    type: 'Bodyweight',
    muscleGroup: 'Back',
    secondaryMuscleGroups: [],
    icon: 'pullUp',
    difficulty: 'Intermediate',
    equipment: ['Pull-up Bar'],
    description: 'Upper body pulling movement',
    formCues: ['Full hang at bottom', 'Pull shoulder blades down']
  },
  {
    id: '10000000-0000-4000-8000-000000000006',
    name: 'Deadlift',
    type: 'Weight Training',
    muscleGroup: 'Back',
    secondaryMuscleGroups: [],
    icon: 'deadlift',
    difficulty: 'Advanced',
    equipment: ['Barbell'],
    description: 'Fundamental hip hinge movement',
    formCues: ['Neutral spine', 'Push through floor']
  },
  {
    id: '10000000-0000-4000-8000-000000000007',
    name: 'Barbell Rows',
    type: 'Weight Training',
    muscleGroup: 'Back',
    secondaryMuscleGroups: [],
    icon: 'bentOverRow',
    difficulty: 'Intermediate',
    equipment: ['Barbell'],
    description: 'Horizontal pulling movement',
    formCues: ['Hinge at hips', 'Pull to lower chest']
  },
  {
    id: '10000000-0000-4000-8000-000000000008',
    name: 'Lat Pulldown',
    type: 'Weight Training',
    muscleGroup: 'Back',
    secondaryMuscleGroups: [],
    icon: 'latPulldown',
    difficulty: 'Beginner',
    equipment: ['Cable Machine'],
    description: 'Vertical pulling movement',
    formCues: ['Pull to upper chest', 'Control the weight']
  },
  {
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
  },
  {
    id: '10000000-0000-4000-8000-00000000000a',
    name: 'Romanian Deadlift',
    type: 'Weight Training',
    muscleGroup: 'Legs',
    secondaryMuscleGroups: [],
    icon: 'romanianDeadlift',
    difficulty: 'Intermediate',
    equipment: ['Barbell'],
    description: 'Hamstring focused movement',
    formCues: ['Hinge at hips', 'Soft knee bend']
  },
  {
    id: '10000000-0000-4000-8000-00000000000b',
    name: 'Walking Lunges',
    type: 'Bodyweight',
    muscleGroup: 'Legs',
    secondaryMuscleGroups: [],
    icon: 'bodyweight',
    difficulty: 'Beginner',
    equipment: ['Bodyweight'],
    description: 'Unilateral leg exercise',
    formCues: ['Step with control', 'Keep torso upright']
  },
  {
    id: '10000000-0000-4000-8000-00000000000c',
    name: 'Leg Press',
    type: 'Weight Training',
    muscleGroup: 'Legs',
    secondaryMuscleGroups: [],
    icon: 'legPress',
    difficulty: 'Beginner',
    equipment: ['Machine'],
    description: 'Machine-based leg exercise',
    formCues: ['Control the weight', 'Full range of motion']
  },
  {
    id: '10000000-0000-4000-8000-00000000000d',
    name: 'Overhead Press',
    type: 'Weight Training',
    muscleGroup: 'Shoulders',
    secondaryMuscleGroups: [],
    icon: 'overheadPress',
    difficulty: 'Intermediate',
    equipment: ['Barbell'],
    description: 'Vertical pressing movement',
    formCues: ['Lock out arms', 'Engage core']
  },
  {
    id: '10000000-0000-4000-8000-00000000000e',
    name: 'Lateral Raises',
    type: 'Weight Training',
    muscleGroup: 'Shoulders',
    secondaryMuscleGroups: [],
    icon: 'lateralRaise',
    difficulty: 'Beginner',
    equipment: ['Dumbbell'],
    description: 'Lateral deltoid isolation',
    formCues: ['Lead with elbows', 'Control descent']
  },
  {
    id: '10000000-0000-4000-8000-00000000000f',
    name: 'Front Raises',
    type: 'Weight Training',
    muscleGroup: 'Shoulders',
    secondaryMuscleGroups: [],
    icon: 'frontRaise',
    difficulty: 'Beginner',
    equipment: ['Dumbbell'],
    description: 'Front deltoid isolation',
    formCues: ['Keep arms straight', 'Control movement']
  },
  {
    id: '10000000-0000-4000-8000-000000000010',
    name: 'Pike Push-Ups',
    type: 'Bodyweight',
    muscleGroup: 'Shoulders',
    secondaryMuscleGroups: [],
    icon: 'pushUp',
    difficulty: 'Intermediate',
    equipment: ['Bodyweight'],
    description: 'Bodyweight shoulder press',
    formCues: ['Form inverted V', 'Lower with control']
  },
  {
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
  },
  {
    id: '10000000-0000-4000-8000-000000000012',
    name: 'Tricep Extensions',
    type: 'Weight Training',
    muscleGroup: 'Arms',
    secondaryMuscleGroups: [],
    icon: 'tricepExtension',
    difficulty: 'Beginner',
    equipment: ['Dumbbell'],
    description: 'Tricep isolation',
    formCues: ['Keep elbows tucked', 'Extend fully']
  },
  {
    id: '10000000-0000-4000-8000-000000000013',
    name: 'Diamond Push-Ups',
    type: 'Bodyweight',
    muscleGroup: 'Arms',
    secondaryMuscleGroups: [],
    icon: 'pushUp',
    difficulty: 'Intermediate',
    equipment: ['Bodyweight'],
    description: 'Tricep focused push-up',
    formCues: ['Diamond hand position', 'Keep elbows tucked']
  },
  {
    id: '10000000-0000-4000-8000-000000000014',
    name: 'Hammer Curls',
    type: 'Weight Training',
    muscleGroup: 'Arms',
    secondaryMuscleGroups: [],
    icon: 'hammerCurl',
    difficulty: 'Beginner',
    equipment: ['Dumbbell'],
    description: 'Neutral grip bicep curl',
    formCues: ['Vertical hand position', 'Control the weight']
  },
  {
    id: '10000000-0000-4000-8000-000000000015',
    name: 'Plank',
    type: 'Bodyweight',
    muscleGroup: 'Core',
    secondaryMuscleGroups: [],
    icon: 'plank',
    difficulty: 'Beginner',
    equipment: ['Bodyweight'],
    description: 'Core stabilization exercise',
    formCues: ['Keep body straight', 'Engage core']
  },
  {
    id: '10000000-0000-4000-8000-000000000016',
    name: 'Russian Twists',
    type: 'Bodyweight',
    muscleGroup: 'Core',
    secondaryMuscleGroups: [],
    icon: 'russianTwist',
    difficulty: 'Intermediate',
    equipment: ['Bodyweight'],
    description: 'Rotational core exercise',
    formCues: ['Keep feet off ground', 'Rotate from core']
  },
  {
    id: '10000000-0000-4000-8000-000000000017',
    name: 'Leg Raises',
    type: 'Bodyweight',
    muscleGroup: 'Core',
    secondaryMuscleGroups: [],
    icon: 'legRaise',
    difficulty: 'Intermediate',
    equipment: ['Bodyweight'],
    description: 'Lower abs focused movement',
    formCues: ['Keep legs straight', 'Control descent']
  },
  {
    id: '10000000-0000-4000-8000-000000000018',
    name: 'Cable Crunches',
    type: 'Weight Training',
    muscleGroup: 'Core',
    secondaryMuscleGroups: [],
    icon: 'machine',
    difficulty: 'Intermediate',
    equipment: ['Cable Machine'],
    description: 'Weighted core exercise',
    formCues: ['Round spine', 'Pull with abs']
  },
  {
    id: '10000000-0000-4000-8000-000000000019',
    name: 'Burpees',
    type: 'Bodyweight',
    muscleGroup: 'Full Body',
    secondaryMuscleGroups: [],
    icon: 'burpee',
    difficulty: 'Intermediate',
    equipment: ['Bodyweight'],
    description: 'Full body conditioning',
    formCues: ['Explosive movement', 'Control landing']
  },
  {
    id: '10000000-0000-4000-8000-00000000001a',
    name: 'Mountain Climbers',
    type: 'Bodyweight',
    muscleGroup: 'Full Body',
    secondaryMuscleGroups: [],
    icon: 'mountainClimber',
    difficulty: 'Beginner',
    equipment: ['Bodyweight'],
    description: 'Dynamic core exercise',
    formCues: ['Keep hips low', 'Alternate legs quickly']
  },
  {
    id: '10000000-0000-4000-8000-00000000001b',
    name: 'Turkish Get-Ups',
    type: 'Weight Training',
    muscleGroup: 'Full Body',
    secondaryMuscleGroups: [],
    icon: 'turkishGetUp',
    difficulty: 'Advanced',
    equipment: ['Kettlebell'],
    description: 'Complex movement pattern',
    formCues: ['Keep arm vertical', 'Move with control']
  },
  {
    id: '10000000-0000-4000-8000-00000000001c',
    name: 'Clean and Press',
    type: 'Weight Training',
    muscleGroup: 'Full Body',
    secondaryMuscleGroups: [],
    icon: 'cleanAndJerk',
    difficulty: 'Advanced',
    equipment: ['Barbell'],
    description: 'Olympic lifting movement',
    formCues: ['Pull with legs', 'Catch in rack position']
  }
];

export class LoadProgressDatabase extends Dexie {
  exercises!: Table<Exercise, string>;
  workoutSets!: Table<WorkoutSet, string>;
  personalRecords!: Table<PersonalRecord, string>;

  constructor(name = 'LoadProgressDatabase') {
    super(name);

    this.version(1).stores({
      exercises: '&id',
      workoutSets: '&id, exerciseId, date',
      personalRecords: '&id, exerciseId, type'
    });

    this.on('populate', () => this.exercises.bulkAdd(DEFAULT_EXERCISES));
  }

  async addExercise(exercise: Omit<Exercise, 'id'> & { id?: string }): Promise<string> {
    const id = exercise.id ?? createUuid();
    await this.exercises.add({ ...exercise, id });
    return id;
  }

  async addWorkoutSet(set: Omit<WorkoutSet, 'id'> & { id?: string }): Promise<string> {
    const id = set.id ?? createUuid();
    await this.workoutSets.add({ ...set, id });
    return id;
  }

  async addPersonalRecord(record: Omit<PersonalRecord, 'id'> & { id?: string }): Promise<string> {
    const id = record.id ?? createUuid();
    await this.personalRecords.add({ ...record, id });
    return id;
  }

  async getWorkoutSetsByDate(date: Date): Promise<WorkoutSet[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(endOfDay.getDate() + 1);

    return this.workoutSets.where('date').between(startOfDay, endOfDay, true, false).toArray();
  }
}

export const db = new LoadProgressDatabase();
