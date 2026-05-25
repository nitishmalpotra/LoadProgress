import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Dumbbell, Plus, RefreshCw, Search, Weight } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
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
const allMuscleGroups = 'All';

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
  return muscleGroups
    .map((muscleGroup) => ({
      muscleGroup,
      exercises: exercises.filter((exercise) => exercise.muscleGroup === muscleGroup)
    }))
    .filter((group) => group.exercises.length > 0);
}

export function ExercisesTab() {
  const exercises = useWorkoutStore((state) => state.exercises);
  const exercisesById = useWorkoutStore((state) => state.exercisesById);
  const isLoading = useWorkoutStore((state) => state.isLoading);
  const error = useWorkoutStore((state) => state.error);
  const addExercise = useWorkoutStore((state) => state.addExercise);
  const loadWorkoutData = useWorkoutStore((state) => state.loadWorkoutData);
  const navigate = useNavigate();
  const { exerciseId } = useParams();
  const [exerciseType, setExerciseType] = useState<ExerciseType>('Weight Training');
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<
    MuscleGroup | typeof allMuscleGroups
  >(allMuscleGroups);
  const [query, setQuery] = useState('');
  const [isAddingExercise, setIsAddingExercise] = useState(false);
  const [customExercise, setCustomExercise] = useState(emptyExercise);
  const [customError, setCustomError] = useState('');

  useEffect(() => {
    void loadWorkoutData().catch(() => undefined);
  }, [loadWorkoutData]);

  const muscleCounts = useMemo(
    () =>
      muscleGroups.reduce<Record<MuscleGroup, number>>(
        (counts, muscleGroup) => ({
          ...counts,
          [muscleGroup]: exercises.filter(
            (exercise) => exercise.type === exerciseType && exercise.muscleGroup === muscleGroup
          ).length
        }),
        {} as Record<MuscleGroup, number>
      ),
    [exerciseType, exercises]
  );

  const visibleExercises = useMemo(
    () =>
      exercises
        .filter((exercise) => exercise.type === exerciseType)
        .filter(
          (exercise) =>
            selectedMuscleGroup === allMuscleGroups ||
            exercise.muscleGroup === selectedMuscleGroup ||
            exercise.secondaryMuscleGroups.includes(selectedMuscleGroup)
        )
        .filter((exercise) => matchesSearch(exercise, query))
        .sort((left, right) => left.name.localeCompare(right.name)),
    [exerciseType, exercises, query, selectedMuscleGroup]
  );
  const groupedExercises = useMemo(() => groupExercises(visibleExercises), [visibleExercises]);
  const routeExercise = exerciseId ? exercisesById[exerciseId] : null;

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

    setExerciseType(customExercise.type);
    setSelectedMuscleGroup(customExercise.muscleGroup);
    setCustomExercise(emptyExercise);
    setCustomError('');
    setIsAddingExercise(false);
    navigate(`/exercises/${savedId}`);
  };

  const clearFilters = () => {
    setSelectedMuscleGroup(allMuscleGroups);
    setQuery('');
  };

  if (exerciseId) {
    return routeExercise ? (
      <ExerciseDetail exercise={routeExercise} onBack={() => navigate('/exercises')} />
    ) : (
      <section className={styles.detailFallback} aria-labelledby="missing-exercise-title">
        <button className={styles.backButton} type="button" onClick={() => navigate('/exercises')}>
          <ArrowLeft size={18} />
          Back to Library
        </button>
        <div className={styles.emptyState}>
          <h1 id="missing-exercise-title">Exercise not found</h1>
          <p>This Library detail link no longer matches an exercise on this device.</p>
        </div>
      </section>
    );
  }

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
        <div className={styles.muscleBrowser} aria-label="Browse by muscle group">
          <button
            aria-pressed={selectedMuscleGroup === allMuscleGroups}
            className={
              selectedMuscleGroup === allMuscleGroups
                ? styles.muscleChipSelected
                : styles.muscleChip
            }
            type="button"
            onClick={() => setSelectedMuscleGroup(allMuscleGroups)}
          >
            <span>All</span>
            <strong>{exercises.filter((exercise) => exercise.type === exerciseType).length}</strong>
          </button>
          {muscleGroups.map((group) => (
            <button
              aria-pressed={selectedMuscleGroup === group}
              className={
                selectedMuscleGroup === group ? styles.muscleChipSelected : styles.muscleChip
              }
              key={group}
              type="button"
              onClick={() => setSelectedMuscleGroup(group)}
            >
              <ExerciseIcon className={styles.muscleChipIcon} muscleGroup={group} size={17} />
              <span>{group}</span>
              <strong>{muscleCounts[group]}</strong>
            </button>
          ))}
        </div>

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
          <button
            className={styles.cancelButton}
            type="button"
            onClick={() => setIsAddingExercise(false)}
          >
            <ArrowLeft size={18} />
            Back to Library
          </button>
          <button className={styles.saveButton} type="submit">
            Save Exercise
          </button>
        </form>
      ) : null}

      <div className={styles.exerciseList}>
        {error ? (
          <div className={styles.emptyState} role="alert">
            <h2>Library could not load</h2>
            <p>{error}</p>
            <button
              className={styles.cancelButton}
              type="button"
              onClick={() => void loadWorkoutData().catch(() => undefined)}
            >
              <RefreshCw size={17} />
              Retry
            </button>
          </div>
        ) : isLoading && groupedExercises.length === 0 ? (
          <div className={styles.emptyState}>
            <h2>Loading Library</h2>
            <p>Reading exercises saved on this device.</p>
          </div>
        ) : groupedExercises.length === 0 ? (
          <div className={styles.emptyState}>
            <h2>No exercises match this search</h2>
            <p>Clear filters or create a custom exercise.</p>
            <button className={styles.cancelButton} type="button" onClick={clearFilters}>
              Clear filters
            </button>
          </div>
        ) : (
          groupedExercises.map((group) => (
            <section className={styles.exerciseGroup} key={group.muscleGroup}>
              <h2>{group.muscleGroup}</h2>
              <div className={styles.exerciseCards}>
                {group.exercises.map((exercise) => (
                  <Link
                    className={styles.exerciseCard}
                    key={exercise.id}
                    to={`/exercises/${exercise.id}`}
                  >
                    <span className={styles.exerciseTitle}>
                      <ExerciseIcon
                        className={styles.exerciseCardIcon}
                        iconName={exercise.icon}
                        muscleGroup={exercise.muscleGroup}
                      />
                      <span className={styles.exerciseName}>{exercise.name}</span>
                    </span>
                    <span className={styles.cardMeta}>
                      <span className={styles.badge}>{exercise.equipment[0]}</span>
                      <span>{exercise.difficulty}</span>
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          ))
        )}
      </div>
    </section>
  );
}
