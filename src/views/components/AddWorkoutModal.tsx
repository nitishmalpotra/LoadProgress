import { useEffect, useMemo, useState } from 'react';
import { Check, Dumbbell, Weight, X } from 'lucide-react';
import type { Exercise, ExerciseType, MuscleGroup } from '@/models';
import { useWorkoutStore } from '@/store/useWorkoutStore';
import styles from '@/views/styles/Workout.module.css';

type AddWorkoutModalProps = {
  date: Date;
  isOpen: boolean;
  onClose: () => void;
  prefilledExerciseId?: string;
};

type FormErrors = {
  reps?: string;
  weight?: string;
  exercise?: string;
};

const exerciseTypes: ExerciseType[] = ['Weight Training', 'Bodyweight'];

function uniqueMuscleGroups(exercises: Exercise[], exerciseType: ExerciseType | null) {
  return Array.from(
    new Set(
      exercises
        .filter((exercise) => !exerciseType || exercise.type === exerciseType)
        .map((exercise) => exercise.muscleGroup)
    )
  ).sort();
}

export function AddWorkoutModal({
  date,
  isOpen,
  onClose,
  prefilledExerciseId
}: AddWorkoutModalProps) {
  const exercises = useWorkoutStore((state) => state.exercises);
  const addWorkoutSet = useWorkoutStore((state) => state.addWorkoutSet);
  const unitSystem = useWorkoutStore((state) => state.unitSystem);
  const setUnitSystem = useWorkoutStore((state) => state.setUnitSystem);
  const [exerciseType, setExerciseType] = useState<ExerciseType | null>(null);
  const [muscleGroup, setMuscleGroup] = useState<MuscleGroup | null>(null);
  const [exerciseId, setExerciseId] = useState('');
  const [weight, setWeight] = useState('');
  const [reps, setReps] = useState('');
  const [rpe, setRpe] = useState(7);
  const [notes, setNotes] = useState('');
  const [isFailureSet, setIsFailureSet] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSaving, setIsSaving] = useState(false);

  // Reset form (and apply prefill) each time the modal opens
  useEffect(() => {
    if (!isOpen) return;
    const prefilled = prefilledExerciseId
      ? exercises.find((e) => e.id === prefilledExerciseId)
      : undefined;
    setExerciseType(prefilled?.type ?? null);
    setMuscleGroup(prefilled?.muscleGroup ?? null);
    setExerciseId(prefilledExerciseId ?? '');
    setWeight('');
    setReps('');
    setRpe(7);
    setNotes('');
    setIsFailureSet(false);
    setErrors({});
    // ponytail: intentionally omit exercises — stable after load; re-running on exercises change mid-open is wrong
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, prefilledExerciseId]);

  const muscleGroups = useMemo(
    () => uniqueMuscleGroups(exercises, exerciseType),
    [exercises, exerciseType]
  );
  const selectedExercise = exercises.find((exercise) => exercise.id === exerciseId);
  const visibleExercises = exercises
    .filter((exercise) => !exerciseType || exercise.type === exerciseType)
    .filter((exercise) => !muscleGroup || exercise.muscleGroup === muscleGroup);
  const shouldCollectWeight = selectedExercise?.type !== 'Bodyweight';
  const weightUnit = unitSystem === 'metric' ? 'kg' : 'lb';

  if (!isOpen) {
    return null;
  }

  const resetSelection = (nextType: ExerciseType) => {
    setExerciseType(nextType);
    setMuscleGroup(null);
    setExerciseId('');
    setErrors({});
  };

  const validate = () => {
    const nextErrors: FormErrors = {};
    const numericReps = Number(reps);
    const numericWeight = Number(weight);

    if (!exerciseId) {
      nextErrors.exercise = 'Choose an exercise.';
    }

    if (!Number.isInteger(numericReps) || numericReps <= 0) {
      nextErrors.reps = 'Reps must be a positive whole number.';
    }

    if (shouldCollectWeight && (!Number.isFinite(numericWeight) || numericWeight <= 0)) {
      nextErrors.weight = 'Weight must be a positive number.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      return;
    }

    setIsSaving(true);

    try {
      await addWorkoutSet({
        exerciseId,
        weight: shouldCollectWeight ? Number(weight) : undefined,
        reps: Number(reps),
        date,
        rpe,
        notes: notes.trim() || undefined,
        isFailureSet
      });
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={styles.sheetOverlay} role="presentation">
      <section
        aria-label="Add workout set"
        aria-modal="true"
        className={styles.sheet}
        role="dialog"
      >
        <div className={styles.sheetHandle} aria-hidden="true" />
        <header className={styles.sheetHeader}>
          <div>
            <p className={styles.eyebrow}>Log Set</p>
            <h2>Add Workout</h2>
          </div>
          <button className={styles.iconButton} type="button" aria-label="Close" onClick={onClose}>
            <X size={19} />
          </button>
        </header>

        <div className={styles.wizardSection}>
          <span className={styles.inputLabel}>Type</span>
          <div className={styles.segmentedRow}>
            {exerciseTypes.map((type) => (
              <button
                className={exerciseType === type ? styles.segmentSelected : styles.segment}
                key={type}
                type="button"
                onClick={() => resetSelection(type)}
              >
                {type === 'Weight Training' ? <Weight size={17} /> : <Dumbbell size={17} />}
                {type}
              </button>
            ))}
          </div>
        </div>

        {exerciseType ? (
          <div className={styles.wizardSection}>
            <span className={styles.inputLabel}>Muscle Group</span>
            <div className={styles.chipScroller}>
              {muscleGroups.map((group) => (
                <button
                  className={muscleGroup === group ? styles.chipSelected : styles.chip}
                  key={group}
                  type="button"
                  onClick={() => {
                    setMuscleGroup(group);
                    setExerciseId('');
                    setErrors({});
                  }}
                >
                  {group}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {muscleGroup ? (
          <div className={styles.wizardSection}>
            <span className={styles.inputLabel}>Exercise</span>
            <div className={styles.exerciseGrid}>
              {visibleExercises.map((exercise) => (
                <button
                  className={
                    exerciseId === exercise.id
                      ? styles.exerciseOptionSelected
                      : styles.exerciseOption
                  }
                  key={exercise.id}
                  type="button"
                  onClick={() => {
                    setExerciseId(exercise.id);
                    setErrors({});
                  }}
                >
                  <span>{exercise.name}</span>
                  <small>{exercise.equipment.join(', ')}</small>
                </button>
              ))}
            </div>
            {errors.exercise ? <span className={styles.errorText}>{errors.exercise}</span> : null}
          </div>
        ) : null}

        {selectedExercise ? (
          <div className={styles.formGrid}>
            {shouldCollectWeight ? (
              <label className={styles.inputGroup}>
                <span className={styles.inputLabel}>Weight</span>
                <div className={styles.inputWithToggle}>
                  <input
                    aria-invalid={Boolean(errors.weight)}
                    className={styles.inputField}
                    inputMode="decimal"
                    min="0"
                    placeholder={`0 ${weightUnit}`}
                    type="number"
                    value={weight}
                    onChange={(event) => setWeight(event.target.value)}
                  />
                  <button
                    className={styles.unitToggle}
                    type="button"
                    onClick={() => setUnitSystem(unitSystem === 'metric' ? 'imperial' : 'metric')}
                  >
                    {weightUnit}
                  </button>
                </div>
                {errors.weight ? <span className={styles.errorText}>{errors.weight}</span> : null}
              </label>
            ) : null}

            <label className={styles.inputGroup}>
              <span className={styles.inputLabel}>Reps</span>
              <input
                aria-invalid={Boolean(errors.reps)}
                className={styles.inputField}
                inputMode="numeric"
                min="1"
                placeholder="8"
                type="number"
                value={reps}
                onChange={(event) => setReps(event.target.value)}
              />
              {errors.reps ? <span className={styles.errorText}>{errors.reps}</span> : null}
            </label>

            <label className={styles.inputGroup}>
              <span className={styles.inputLabel}>RPE {rpe}</span>
              <input
                className={styles.rangeField}
                max="10"
                min="1"
                type="range"
                value={rpe}
                onChange={(event) => setRpe(Number(event.target.value))}
              />
            </label>

            <label className={styles.inputGroup}>
              <span className={styles.inputLabel}>Notes</span>
              <textarea
                className={styles.textareaField}
                placeholder="Tempo, setup, pain, or cue"
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
              />
            </label>

            <label className={styles.toggleRow}>
              <input
                checked={isFailureSet}
                type="checkbox"
                onChange={(event) => setIsFailureSet(event.target.checked)}
              />
              <span>Failure set</span>
            </label>

            <button
              className={styles.addButton}
              disabled={isSaving}
              type="button"
              onClick={handleSubmit}
            >
              <Check size={18} />
              Add
            </button>
          </div>
        ) : null}
      </section>
    </div>
  );
}
