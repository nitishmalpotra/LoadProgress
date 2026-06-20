import { useEffect, useState } from 'react';
import { ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react';
import type { Exercise, RoutineExercise, TrainingRoutine } from '@/models';
import { DAY_LABELS, useRoutineStore } from '@/store/useRoutineStore';
import { useWorkoutStore } from '@/store/useWorkoutStore';
import styles from '@/views/styles/Training.module.css';

const DAY_TYPES: TrainingRoutine['type'][] = ['Push', 'Pull', 'Lower', 'Run', 'Rest'];

// ---- ExerciseRow ----

type ExerciseRowProps = {
  exercise: RoutineExercise;
  index: number;
  dayId: string;
  name: string;
  isFirst: boolean;
  isLast: boolean;
};

function ExerciseRow({ exercise, index, dayId, name, isFirst, isLast }: ExerciseRowProps) {
  const removeExercise = useRoutineStore((s) => s.removeExercise);
  const moveExercise = useRoutineStore((s) => s.moveExercise);
  const updateExercise = useRoutineStore((s) => s.updateExercise);

  const [sets, setSets] = useState(String(exercise.targetSets));
  const [reps, setReps] = useState(String(exercise.targetReps));
  const [note, setNote] = useState(exercise.note ?? '');

  // Sync when exercise data changes (e.g. after a move remounts via key)
  useEffect(() => {
    setSets(String(exercise.targetSets));
    setReps(String(exercise.targetReps));
    setNote(exercise.note ?? '');
  }, [exercise.targetSets, exercise.targetReps, exercise.note]);

  const persistSets = () => {
    const n = parseInt(sets, 10);
    if (n > 0) void updateExercise(dayId, index, { targetSets: n });
  };
  const persistReps = () => {
    const n = parseInt(reps, 10);
    if (n > 0) void updateExercise(dayId, index, { targetReps: n });
  };
  const persistNote = () => void updateExercise(dayId, index, { note: note.trim() || undefined });

  return (
    <div className={styles.exerciseRow}>
      <div className={styles.exerciseTop}>
        <span className={styles.exerciseName}>{name}</span>
        <div className={styles.exerciseActions}>
          <button
            aria-label="Move up"
            className={styles.iconBtn}
            disabled={isFirst}
            type="button"
            onClick={() => void moveExercise(dayId, index, index - 1)}
          >
            <ChevronUp size={13} />
          </button>
          <button
            aria-label="Move down"
            className={styles.iconBtn}
            disabled={isLast}
            type="button"
            onClick={() => void moveExercise(dayId, index, index + 1)}
          >
            <ChevronDown size={13} />
          </button>
          <button
            aria-label="Remove exercise"
            className={`${styles.iconBtn} ${styles.iconBtnDanger}`}
            type="button"
            onClick={() => void removeExercise(dayId, index)}
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>
      <div className={styles.exerciseMeta}>
        <span className={styles.setsRepsLabel}>Sets</span>
        <input
          aria-label="Sets"
          className={styles.smallInput}
          inputMode="numeric"
          min="1"
          type="number"
          value={sets}
          onBlur={persistSets}
          onChange={(e) => setSets(e.target.value)}
        />
        <span className={styles.setsRepsLabel}>×</span>
        <input
          aria-label="Reps"
          className={styles.smallInput}
          inputMode="numeric"
          min="1"
          type="number"
          value={reps}
          onBlur={persistReps}
          onChange={(e) => setReps(e.target.value)}
        />
        <input
          aria-label="Note"
          className={styles.noteInput}
          placeholder="Note (optional)"
          type="text"
          value={note}
          onBlur={persistNote}
          onChange={(e) => setNote(e.target.value)}
        />
      </div>
    </div>
  );
}

// ---- AddExerciseForm ----

type AddExerciseFormProps = {
  dayId: string;
  exercises: Exercise[];
};

function AddExerciseForm({ dayId, exercises }: AddExerciseFormProps) {
  const addExercise = useRoutineStore((s) => s.addExercise);
  const [exerciseId, setExerciseId] = useState('');
  const [sets, setSets] = useState('3');
  const [reps, setReps] = useState('10');

  const sorted = [...exercises].sort((a, b) => a.name.localeCompare(b.name));

  const handleAdd = () => {
    if (!exerciseId) return;
    void addExercise(dayId, {
      exerciseId,
      targetSets: Math.max(1, parseInt(sets, 10) || 3),
      targetReps: Math.max(1, parseInt(reps, 10) || 10),
    });
    setExerciseId('');
    setSets('3');
    setReps('10');
  };

  return (
    <div className={styles.addForm}>
      <div className={styles.addRow}>
        <select
          aria-label="Select exercise to add"
          className={styles.addSelect}
          value={exerciseId}
          onChange={(e) => setExerciseId(e.target.value)}
        >
          <option value="">Add exercise…</option>
          {sorted.map((ex) => (
            <option key={ex.id} value={ex.id}>
              {ex.name}
            </option>
          ))}
        </select>
      </div>
      <div className={styles.addMeta}>
        <span className={styles.addLabel}>Sets</span>
        <input
          aria-label="New exercise sets"
          className={styles.smallInput}
          inputMode="numeric"
          min="1"
          type="number"
          value={sets}
          onChange={(e) => setSets(e.target.value)}
        />
        <span className={styles.addLabel}>× Reps</span>
        <input
          aria-label="New exercise reps"
          className={styles.smallInput}
          inputMode="numeric"
          min="1"
          type="number"
          value={reps}
          onChange={(e) => setReps(e.target.value)}
        />
        <button
          className={styles.addBtn}
          disabled={!exerciseId}
          type="button"
          onClick={handleAdd}
        >
          <Plus size={13} />
          Add
        </button>
      </div>
    </div>
  );
}

// ---- DayCard ----

type DayCardProps = {
  day: TrainingRoutine;
  dayLabel: string;
  exerciseMap: Map<string, string>;
  exercises: Exercise[];
};

function DayCard({ day, dayLabel, exerciseMap, exercises }: DayCardProps) {
  const updateDayType = useRoutineStore((s) => s.updateDayType);

  return (
    <div className={styles.dayCard}>
      <div className={styles.dayHeader}>
        <span className={styles.dayLabel}>{dayLabel}</span>
        <select
          aria-label={`${dayLabel} session type`}
          className={styles.typeSelect}
          value={day.type}
          onChange={(e) =>
            void updateDayType(day.id, e.target.value as TrainingRoutine['type'])
          }
        >
          {DAY_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      {day.exercises.length > 0 ? (
        <div className={styles.exerciseList}>
          {day.exercises.map((ex, i) => (
            <ExerciseRow
              key={`${day.id}-${i}`}
              dayId={day.id}
              exercise={ex}
              index={i}
              isFirst={i === 0}
              isLast={i === day.exercises.length - 1}
              name={exerciseMap.get(ex.exerciseId) ?? 'Unknown exercise'}
            />
          ))}
        </div>
      ) : (
        <p className={styles.emptyDay}>
          {day.type === 'Run' ? 'Running session — no exercises to log.' : 'No exercises yet.'}
        </p>
      )}

      <AddExerciseForm dayId={day.id} exercises={exercises} />
    </div>
  );
}

// ---- TrainingTab ----

export function TrainingTab() {
  const routine = useRoutineStore((s) => s.routine);
  const isLoading = useRoutineStore((s) => s.isLoading);
  const loadRoutine = useRoutineStore((s) => s.loadRoutine);
  const exercises = useWorkoutStore((s) => s.exercises);

  useEffect(() => {
    void loadRoutine();
  }, [loadRoutine]);

  const exerciseMap = new Map(exercises.map((e) => [e.id, e.name]));

  if (isLoading) return <p>Loading…</p>;

  return (
    <section aria-labelledby="training-title" className={styles.page}>
      <header className={styles.header}>
        <p className={styles.eyebrow}>Plan</p>
        <h1 id="training-title">Training</h1>
      </header>

      <p className={styles.editHint}>Your weekly plan — edit any day below.</p>

      {routine.map((day, i) => (
        <DayCard
          key={day.id}
          day={day}
          dayLabel={DAY_LABELS[i]}
          exerciseMap={exerciseMap}
          exercises={exercises}
        />
      ))}
    </section>
  );
}
