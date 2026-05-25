import { useEffect, useMemo, useState } from 'react';
import { Dumbbell, Plus, Search, Weight } from 'lucide-react';
import type { Difficulty, Equipment, Exercise, ExerciseType, MuscleGroup } from '@/models';
import { useWorkoutStore } from '@/store/useWorkoutStore';
import { ExerciseDetail } from '@/views/ExerciseDetail';
import { ExerciseIcon } from '@/views/components/ExerciseIcon';
import styles from '@/views/styles/Exercises.module.css';

const exerciseTypes: ExerciseType[] = ['Weight Training', 'Bodyweight'];
const muscleGroups: MuscleGroup[] = [
  'Chest',
  'Back',
  'Legs',
  'Shoulders',
  'Arms',
  'Core',
  'Full Body',
  'Forearms',
  'Glutes',
  'Upper Back',
  'Lower Back'
];
const equipmentOptions: Equipment[] = [
  'Barbell',
  'Dumbbell',
  'Kettlebell',
  'Resistance Band',
  'Cable Machine',
  'Smith Machine',
  'Bodyweight',
  'Machine',
  'Weight Plate',
  'Bench',
  'Pull-up Bar',
  'Foam Roller'
];
const difficulties: Difficulty[] = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];

const emptyExercise = {
  name: '',
  type: 'Weight Training' as ExerciseType,
  muscleGroup: 'Chest' as MuscleGroup,
  equipment: 'Barbell' as Equipment,
  difficulty: 'Beginner' as Difficulty,
  description: '',
  formCues: ''
};

function matchesSearch(exercise: Exercise, query: string) {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return true;
  }

  return [
    exercise.name,
    exercise.muscleGroup,
    ...exercise.secondaryMuscleGroups,
    ...exercise.equipment
  ]
    .join(' ')
    .toLowerCase()
    .includes(normalizedQuery);
}

function groupExercises(exercises: Exercise[]) {
  return exercises.reduce<Array<{ muscleGroup: MuscleGroup; exercises: Exercise[] }>>(
    (groups, exercise) => {
      const existingGroup = groups.find((group) => group.muscleGroup === exercise.muscleGroup);

      if (existingGroup) {
        existingGroup.exercises.push(exercise);
      } else {
        groups.push({ muscleGroup: exercise.muscleGroup, exercises: [exercise] });
      }

      return groups;
    },
    []
  );
}

export function ExercisesTab() {
  const exercises = useWorkoutStore((state) => state.exercises);
  const addExercise = useWorkoutStore((state) => state.addExercise);
  const loadWorkoutData = useWorkoutStore((state) => state.loadWorkoutData);
  const [exerciseType, setExerciseType] = useState<ExerciseType>('Weight Training');
  const [query, setQuery] = useState('');
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [isAddingExercise, setIsAddingExercise] = useState(false);
  const [customExercise, setCustomExercise] = useState(emptyExercise);
  const [customError, setCustomError] = useState('');

  useEffect(() => {
    void loadWorkoutData();
  }, [loadWorkoutData]);

  const visibleExercises = useMemo(
    () =>
      exercises
        .filter((exercise) => exercise.type === exerciseType)
        .filter((exercise) => matchesSearch(exercise, query))
        .sort((left, right) =>
          left.muscleGroup === right.muscleGroup
            ? left.name.localeCompare(right.name)
            : left.muscleGroup.localeCompare(right.muscleGroup)
        ),
    [exerciseType, exercises, query]
  );
  const groupedExercises = useMemo(() => groupExercises(visibleExercises), [visibleExercises]);

  const handleCreateExercise = async () => {
    if (!customExercise.name.trim()) {
      setCustomError('Exercise name is required.');
      return;
    }

    const savedId = await addExercise({
      name: customExercise.name.trim(),
      type: customExercise.type,
      muscleGroup: customExercise.muscleGroup,
      secondaryMuscleGroups: [],
      icon: 'custom',
      difficulty: customExercise.difficulty,
      equipment: [customExercise.equipment],
      description: customExercise.description.trim() || 'Custom exercise',
      formCues: customExercise.formCues
        .split('\n')
        .map((cue) => cue.trim())
        .filter(Boolean)
    });

    const savedExercise: Exercise = {
      id: savedId,
      name: customExercise.name.trim(),
      type: customExercise.type,
      muscleGroup: customExercise.muscleGroup,
      secondaryMuscleGroups: [],
      icon: 'custom',
      difficulty: customExercise.difficulty,
      equipment: [customExercise.equipment],
      description: customExercise.description.trim() || 'Custom exercise',
      formCues: customExercise.formCues
        .split('\n')
        .map((cue) => cue.trim())
        .filter(Boolean)
    };

    setExerciseType(customExercise.type);
    setSelectedExercise(savedExercise);
    setCustomExercise(emptyExercise);
    setCustomError('');
    setIsAddingExercise(false);
  };

  return (
    <section className={styles.exercisesPage} aria-labelledby="exercises-title">
      <header className={styles.pageHeader}>
        <div>
          <p className={styles.eyebrow}>Exercise Library</p>
          <h1 id="exercises-title">Library</h1>
          <p>Browse movements, cues, requirements, and training history.</p>
        </div>
        <button
          className={styles.addButton}
          type="button"
          onClick={() => setIsAddingExercise((isOpen) => !isOpen)}
        >
          <Plus size={18} />
          Custom Exercise
        </button>
      </header>

      <div className={styles.filterPanel}>
        <div className={styles.segmentedRow} aria-label="Exercise type filter">
          {exerciseTypes.map((type) => (
            <button
              aria-pressed={exerciseType === type}
              className={exerciseType === type ? styles.segmentSelected : styles.segment}
              key={type}
              type="button"
              onClick={() => setExerciseType(type)}
            >
              {type === 'Weight Training' ? <Weight size={17} /> : <Dumbbell size={17} />}
              {type}
            </button>
          ))}
        </div>

        <label className={styles.searchGroup}>
          <span>Search exercises</span>
          <div className={styles.searchField}>
            <Search size={18} />
            <input
              placeholder="Bench, chest, cable..."
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
        </label>
      </div>

      {isAddingExercise ? (
        <form
          className={styles.customPanel}
          onSubmit={(event) => {
            event.preventDefault();
            void handleCreateExercise();
          }}
        >
          <label>
            <span>Name</span>
            <input
              value={customExercise.name}
              onChange={(event) =>
                setCustomExercise((exercise) => ({ ...exercise, name: event.target.value }))
              }
            />
          </label>
          <label>
            <span>Type</span>
            <select
              value={customExercise.type}
              onChange={(event) =>
                setCustomExercise((exercise) => ({
                  ...exercise,
                  type: event.target.value as ExerciseType,
                  equipment: event.target.value === 'Bodyweight' ? 'Bodyweight' : exercise.equipment
                }))
              }
            >
              {exerciseTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Muscle Group</span>
            <select
              value={customExercise.muscleGroup}
              onChange={(event) =>
                setCustomExercise((exercise) => ({
                  ...exercise,
                  muscleGroup: event.target.value as MuscleGroup
                }))
              }
            >
              {muscleGroups.map((group) => (
                <option key={group} value={group}>
                  {group}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Equipment</span>
            <select
              value={customExercise.equipment}
              onChange={(event) =>
                setCustomExercise((exercise) => ({
                  ...exercise,
                  equipment: event.target.value as Equipment
                }))
              }
            >
              {equipmentOptions.map((equipment) => (
                <option key={equipment} value={equipment}>
                  {equipment}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Difficulty</span>
            <select
              value={customExercise.difficulty}
              onChange={(event) =>
                setCustomExercise((exercise) => ({
                  ...exercise,
                  difficulty: event.target.value as Difficulty
                }))
              }
            >
              {difficulties.map((difficulty) => (
                <option key={difficulty} value={difficulty}>
                  {difficulty}
                </option>
              ))}
            </select>
          </label>
          <label className={styles.wideField}>
            <span>Description</span>
            <textarea
              value={customExercise.description}
              onChange={(event) =>
                setCustomExercise((exercise) => ({
                  ...exercise,
                  description: event.target.value
                }))
              }
            />
          </label>
          <label className={styles.wideField}>
            <span>Form Cues</span>
            <textarea
              placeholder="One cue per line"
              value={customExercise.formCues}
              onChange={(event) =>
                setCustomExercise((exercise) => ({
                  ...exercise,
                  formCues: event.target.value
                }))
              }
            />
          </label>
          {customError ? <span className={styles.errorText}>{customError}</span> : null}
          <button className={styles.saveButton} type="submit">
            Save Exercise
          </button>
        </form>
      ) : null}

      <div className={styles.exerciseList}>
        {groupedExercises.length === 0 ? (
          <div className={styles.emptyState}>No exercises match this search</div>
        ) : (
          groupedExercises.map((group) => (
            <section className={styles.exerciseGroup} key={group.muscleGroup}>
              <h2>{group.muscleGroup}</h2>
              <div className={styles.exerciseCards}>
                {group.exercises.map((exercise) => (
                  <button
                    className={styles.exerciseCard}
                    key={exercise.id}
                    type="button"
                    onClick={() => setSelectedExercise(exercise)}
                  >
                    <span className={styles.exerciseTitle}>
                      <ExerciseIcon className={styles.exerciseCardIcon} iconName={exercise.icon} />
                      <span className={styles.exerciseName}>{exercise.name}</span>
                    </span>
                    <span className={styles.cardMeta}>
                      <span className={styles.badge}>{exercise.equipment[0]}</span>
                      <span>{exercise.difficulty}</span>
                    </span>
                  </button>
                ))}
              </div>
            </section>
          ))
        )}
      </div>

      {selectedExercise ? (
        <ExerciseDetail exercise={selectedExercise} onClose={() => setSelectedExercise(null)} />
      ) : null}
    </section>
  );
}
