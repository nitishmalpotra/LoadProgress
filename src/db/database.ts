import Dexie, { type Table } from 'dexie';
import type {
  BodyWeight,
  CycleState,
  Exercise,
  Measurement,
  NutritionLog,
  PersonalRecord,
  Profile,
  TrainingRoutine,
  WorkoutSet
} from '@/models';

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
    icon: 'walkingLunge',
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
    icon: 'cableCrunch',
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
  },
  {
    id: '10000000-0000-4000-8000-00000000001d',
    name: 'Dumbbell Fly',
    type: 'Weight Training',
    muscleGroup: 'Chest',
    secondaryMuscleGroups: ['Shoulders'],
    icon: 'dumbbellFly',
    difficulty: 'Intermediate',
    equipment: ['Dumbbell', 'Bench'],
    description: 'Chest isolation movement',
    formCues: ['Keep a soft elbow bend', 'Stretch under control']
  },
  {
    id: '10000000-0000-4000-8000-00000000001e',
    name: 'Machine Chest Press',
    type: 'Weight Training',
    muscleGroup: 'Chest',
    secondaryMuscleGroups: ['Shoulders', 'Arms'],
    icon: 'chestPress',
    difficulty: 'Beginner',
    equipment: ['Machine'],
    description: 'Guided horizontal chest press',
    formCues: ['Set handles at mid-chest', 'Press without shrugging']
  },
  {
    id: '10000000-0000-4000-8000-00000000001f',
    name: 'Cable Crossover',
    type: 'Weight Training',
    muscleGroup: 'Chest',
    secondaryMuscleGroups: ['Shoulders'],
    icon: 'cableCrossover',
    difficulty: 'Intermediate',
    equipment: ['Cable Machine'],
    description: 'Cable chest isolation exercise',
    formCues: ['Keep ribs down', 'Bring hands together with control']
  },
  {
    id: '10000000-0000-4000-8000-000000000020',
    name: 'Chin-Ups',
    type: 'Bodyweight',
    muscleGroup: 'Back',
    secondaryMuscleGroups: ['Arms'],
    icon: 'chinUp',
    difficulty: 'Intermediate',
    equipment: ['Pull-up Bar'],
    description: 'Supinated vertical pulling movement',
    formCues: ['Start from a dead hang', 'Drive elbows down']
  },
  {
    id: '10000000-0000-4000-8000-000000000021',
    name: 'Seated Cable Row',
    type: 'Weight Training',
    muscleGroup: 'Back',
    secondaryMuscleGroups: ['Arms', 'Upper Back'],
    icon: 'seatedCableRow',
    difficulty: 'Beginner',
    equipment: ['Cable Machine'],
    description: 'Supported horizontal row',
    formCues: ['Keep chest tall', 'Pull elbows past ribs']
  },
  {
    id: '10000000-0000-4000-8000-000000000022',
    name: 'Face Pulls',
    type: 'Weight Training',
    muscleGroup: 'Upper Back',
    secondaryMuscleGroups: ['Shoulders'],
    icon: 'facePull',
    difficulty: 'Beginner',
    equipment: ['Cable Machine'],
    description: 'Rear delt and upper back pull',
    formCues: ['Pull toward eye level', 'Rotate thumbs behind you']
  },
  {
    id: '10000000-0000-4000-8000-000000000023',
    name: 'Back Extensions',
    type: 'Bodyweight',
    muscleGroup: 'Lower Back',
    secondaryMuscleGroups: ['Glutes'],
    icon: 'backExtension',
    difficulty: 'Beginner',
    equipment: ['Machine'],
    description: 'Posterior chain extension movement',
    formCues: ['Hinge at hips', 'Finish in a straight line']
  },
  {
    id: '10000000-0000-4000-8000-000000000024',
    name: 'Front Squat',
    type: 'Weight Training',
    muscleGroup: 'Legs',
    secondaryMuscleGroups: ['Core'],
    icon: 'frontSquat',
    difficulty: 'Advanced',
    equipment: ['Barbell'],
    description: 'Front-loaded squat variation',
    formCues: ['Keep elbows high', 'Sit between hips']
  },
  {
    id: '10000000-0000-4000-8000-000000000025',
    name: 'Leg Extensions',
    type: 'Weight Training',
    muscleGroup: 'Legs',
    secondaryMuscleGroups: [],
    icon: 'legExtension',
    difficulty: 'Beginner',
    equipment: ['Machine'],
    description: 'Quadriceps isolation exercise',
    formCues: ['Pause at the top', 'Lower under control']
  },
  {
    id: '10000000-0000-4000-8000-000000000026',
    name: 'Leg Curls',
    type: 'Weight Training',
    muscleGroup: 'Legs',
    secondaryMuscleGroups: [],
    icon: 'legCurl',
    difficulty: 'Beginner',
    equipment: ['Machine'],
    description: 'Hamstring isolation exercise',
    formCues: ['Keep hips down', 'Control the eccentric']
  },
  {
    id: '10000000-0000-4000-8000-000000000027',
    name: 'Standing Calf Raises',
    type: 'Weight Training',
    muscleGroup: 'Legs',
    secondaryMuscleGroups: [],
    icon: 'calfRaise',
    difficulty: 'Beginner',
    equipment: ['Machine'],
    description: 'Calf strength movement',
    formCues: ['Use full ankle range', 'Pause at the top']
  },
  {
    id: '10000000-0000-4000-8000-000000000028',
    name: 'Hip Thrusts',
    type: 'Weight Training',
    muscleGroup: 'Glutes',
    secondaryMuscleGroups: ['Legs'],
    icon: 'hipThrust',
    difficulty: 'Intermediate',
    equipment: ['Barbell', 'Bench'],
    description: 'Loaded glute extension movement',
    formCues: ['Tuck pelvis at lockout', 'Drive through heels']
  },
  {
    id: '10000000-0000-4000-8000-000000000029',
    name: 'Glute Bridges',
    type: 'Bodyweight',
    muscleGroup: 'Glutes',
    secondaryMuscleGroups: ['Legs'],
    icon: 'gluteBridge',
    difficulty: 'Beginner',
    equipment: ['Bodyweight'],
    description: 'Bodyweight glute activation movement',
    formCues: ['Ribs down', 'Squeeze glutes at the top']
  },
  {
    id: '10000000-0000-4000-8000-00000000002a',
    name: 'Arnold Press',
    type: 'Weight Training',
    muscleGroup: 'Shoulders',
    secondaryMuscleGroups: ['Arms'],
    icon: 'arnoldPress',
    difficulty: 'Intermediate',
    equipment: ['Dumbbell'],
    description: 'Rotational dumbbell shoulder press',
    formCues: ['Rotate smoothly', 'Keep wrists stacked']
  },
  {
    id: '10000000-0000-4000-8000-00000000002b',
    name: 'Rear Delt Fly',
    type: 'Weight Training',
    muscleGroup: 'Shoulders',
    secondaryMuscleGroups: ['Upper Back'],
    icon: 'rearDeltFly',
    difficulty: 'Beginner',
    equipment: ['Dumbbell'],
    description: 'Rear shoulder isolation movement',
    formCues: ['Lead with elbows', 'Avoid swinging']
  },
  {
    id: '10000000-0000-4000-8000-00000000002c',
    name: 'Cable Tricep Pushdowns',
    type: 'Weight Training',
    muscleGroup: 'Arms',
    secondaryMuscleGroups: [],
    icon: 'tricepPushdown',
    difficulty: 'Beginner',
    equipment: ['Cable Machine'],
    description: 'Cable tricep isolation exercise',
    formCues: ['Pin elbows to sides', 'Finish with straight arms']
  },
  {
    id: '10000000-0000-4000-8000-00000000002d',
    name: 'Skull Crushers',
    type: 'Weight Training',
    muscleGroup: 'Arms',
    secondaryMuscleGroups: [],
    icon: 'skullCrusher',
    difficulty: 'Intermediate',
    equipment: ['Barbell', 'Bench'],
    description: 'Lying tricep extension',
    formCues: ['Keep upper arms angled back', 'Lower with control']
  },
  {
    id: '10000000-0000-4000-8000-00000000002e',
    name: 'Wrist Curls',
    type: 'Weight Training',
    muscleGroup: 'Forearms',
    secondaryMuscleGroups: [],
    icon: 'forearmCurl',
    difficulty: 'Beginner',
    equipment: ['Dumbbell'],
    description: 'Forearm flexor isolation',
    formCues: ['Move at the wrist only', 'Use a controlled tempo']
  },
  {
    id: '10000000-0000-4000-8000-00000000002f',
    name: 'Side Plank',
    type: 'Bodyweight',
    muscleGroup: 'Core',
    secondaryMuscleGroups: [],
    icon: 'sidePlank',
    difficulty: 'Beginner',
    equipment: ['Bodyweight'],
    description: 'Lateral core stabilization exercise',
    formCues: ['Stack shoulders and hips', 'Keep hips lifted']
  },
  {
    id: '10000000-0000-4000-8000-000000000030',
    name: 'Crunches',
    type: 'Bodyweight',
    muscleGroup: 'Core',
    secondaryMuscleGroups: [],
    icon: 'crunch',
    difficulty: 'Beginner',
    equipment: ['Bodyweight'],
    description: 'Basic trunk flexion exercise',
    formCues: ['Curl ribs toward hips', 'Keep neck relaxed']
  },
  {
    id: '10000000-0000-4000-8000-000000000031',
    name: 'Ab Wheel Rollouts',
    type: 'Bodyweight',
    muscleGroup: 'Core',
    secondaryMuscleGroups: ['Shoulders'],
    icon: 'abWheel',
    difficulty: 'Advanced',
    equipment: ['Weight Plate'],
    description: 'Anti-extension core exercise',
    formCues: ['Brace before rolling', 'Do not let hips sag']
  },
  {
    id: '10000000-0000-4000-8000-000000000032',
    name: 'Kettlebell Swings',
    type: 'Weight Training',
    muscleGroup: 'Full Body',
    secondaryMuscleGroups: ['Glutes', 'Back'],
    icon: 'kettlebellSwing',
    difficulty: 'Intermediate',
    equipment: ['Kettlebell'],
    description: 'Explosive hip hinge conditioning movement',
    formCues: ['Snap hips forward', 'Let the bell float']
  },
  {
    id: '10000000-0000-4000-8000-000000000033',
    name: 'Thrusters',
    type: 'Weight Training',
    muscleGroup: 'Full Body',
    secondaryMuscleGroups: ['Legs', 'Shoulders'],
    icon: 'thruster',
    difficulty: 'Advanced',
    equipment: ['Barbell'],
    description: 'Front squat into overhead press',
    formCues: ['Drive out of the squat', 'Finish locked out overhead']
  }
];

export class LoadProgressDatabase extends Dexie {
  exercises!: Table<Exercise, string>;
  workoutSets!: Table<WorkoutSet, string>;
  personalRecords!: Table<PersonalRecord, string>;
  profile!: Table<Profile, string>;
  trainingRoutine!: Table<TrainingRoutine, string>;
  bodyWeights!: Table<BodyWeight, string>;
  measurements!: Table<Measurement, string>;
  nutritionLog!: Table<NutritionLog, string>;
  cycleState!: Table<CycleState, string>;

  constructor(name = 'LoadProgressDatabase') {
    super(name);

    this.version(1).stores({
      exercises: '&id',
      workoutSets: '&id, exerciseId, date',
      personalRecords: '&id, exerciseId, type'
    });

    this.version(2).stores({
      exercises: '&id',
      workoutSets: '&id, exerciseId, date',
      personalRecords: '&id, exerciseId, type',
      profile: '&id',
      trainingRoutine: '&id',
      bodyWeights: '&id, date',
      measurements: '&id, date',
      nutritionLog: '&id, date',
      cycleState: '&id'
    });

    this.on('populate', () => this.exercises.bulkAdd(DEFAULT_EXERCISES));
    this.on('ready', () => this.seedMissingDefaultExercises());
  }

  private async seedMissingDefaultExercises(): Promise<void> {
    const existingIds = new Set(await this.exercises.toCollection().primaryKeys());
    const missingExercises = DEFAULT_EXERCISES.filter((exercise) => !existingIds.has(exercise.id));

    if (missingExercises.length > 0) {
      await this.exercises.bulkAdd(missingExercises);
    }
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
