import { useEffect, useMemo, useState } from 'react';
import { CalendarDays, CheckCircle2, Plus, RefreshCw } from 'lucide-react';
import { AddWorkoutModal } from '@/views/components/AddWorkoutModal';
import { useWorkoutStore } from '@/store/useWorkoutStore';
import { useRoutineStore } from '@/store/useRoutineStore';
import { derivePlanCompletion, todayRoutineId } from '@/utils/planCompletion';
import type { RoutineExercise, WorkoutSet } from '@/models';
import styles from '@/views/styles/Workout.module.css';

const dayFormatter = new Intl.DateTimeFormat(undefined, { weekday: 'short' });
const monthDayFormatter = new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' });
const selectedDateFormatter = new Intl.DateTimeFormat(undefined, {
  weekday: 'long',
  month: 'long',
  day: 'numeric'
});

function startOfDay(date: Date) {
  const nextDate = new Date(date);
  nextDate.setHours(0, 0, 0, 0);
  return nextDate;
}

function dayKey(date: Date) {
  return startOfDay(date).toISOString();
}

function buildDateWindow() {
  const today = startOfDay(new Date());

  return Array.from({ length: 14 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (13 - index));
    return date;
  });
}

function groupSetsByExercise(sets: WorkoutSet[]) {
  return sets.reduce<Record<string, WorkoutSet[]>>((groups, workoutSet) => {
    groups[workoutSet.exerciseId] = [...(groups[workoutSet.exerciseId] ?? []), workoutSet];
    return groups;
  }, {});
}

export function WorkoutTab() {
  const [selectedDate, setSelectedDate] = useState(() => startOfDay(new Date()));
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [prefilledExerciseId, setPrefilledExerciseId] = useState<string | undefined>(undefined);
  const [quickWeights, setQuickWeights] = useState<Record<string, string>>({});
  const exercisesById = useWorkoutStore((state) => state.exercisesById);
  const workoutSetsByDate = useWorkoutStore((state) => state.workoutSetsByDate);
  const unitSystem = useWorkoutStore((state) => state.unitSystem);
  const isLoading = useWorkoutStore((state) => state.isLoading);
  const error = useWorkoutStore((state) => state.error);
  const loadWorkoutData = useWorkoutStore((state) => state.loadWorkoutData);
  const addWorkoutSet = useWorkoutStore((state) => state.addWorkoutSet);
  const routine = useRoutineStore((s) => s.routine);
  const loadRoutine = useRoutineStore((s) => s.loadRoutine);
  const dateWindow = useMemo(buildDateWindow, []);
  const selectedSets = workoutSetsByDate[dayKey(selectedDate)] ?? [];
  const groupedSets = groupSetsByExercise(selectedSets);
  const unitLabel = unitSystem === 'metric' ? 'kg' : 'lb';
  const todayKey = dayKey(new Date());

  // Today's planned session (by weekday)
  const todayDay = routine.find((d) => d.id === todayRoutineId());
  const todaySets = workoutSetsByDate[todayKey] ?? [];
  const { done, sessionDone } = derivePlanCompletion(todayDay?.exercises ?? [], todaySets);

  useEffect(() => {
    void loadWorkoutData().catch(() => undefined);
  }, [loadWorkoutData]);

  useEffect(() => {
    void loadRoutine();
  }, [loadRoutine]);

  const openModal = (exerciseId?: string) => {
    setPrefilledExerciseId(exerciseId);
    setIsModalOpen(true);
  };

  const quickLog = async (ex: RoutineExercise) => {
    const w = parseFloat(quickWeights[ex.exerciseId] ?? '');
    const weight = isNaN(w) || w <= 0 ? undefined : w;
    for (let i = 0; i < ex.targetSets; i++) {
      await addWorkoutSet({ exerciseId: ex.exerciseId, weight, reps: ex.targetReps, date: new Date(), isFailureSet: false });
    }
  };

  return (
    <section className={styles.workoutPage} aria-labelledby="workout-title">
      <header className={styles.pageHeader}>
        <p className={styles.eyebrow}>Workout Log</p>
        <h1 id="workout-title">Today</h1>
        <p>{selectedDateFormatter.format(selectedDate)}</p>
      </header>

      <div className={styles.calendarRail} aria-label="Workout date picker">
        {dateWindow.map((date) => {
          const isSelected = dayKey(date) === dayKey(selectedDate);
          const isFuture = date.getTime() > startOfDay(new Date()).getTime();

          return (
            <button
              aria-pressed={isSelected}
              className={isSelected ? styles.dayCardSelected : styles.dayCard}
              disabled={isFuture}
              key={dayKey(date)}
              type="button"
              onClick={() => setSelectedDate(date)}
            >
              <span>{dayFormatter.format(date)}</span>
              <strong>{date.getDate()}</strong>
              <small>{monthDayFormatter.format(date)}</small>
            </button>
          );
        })}
      </div>

      {/* Today's planned session */}
      {todayDay && (
        <div className={styles.planPanel}>
          <div className={styles.planPanelHeader}>
            <h2>Today's Plan</h2>
            {sessionDone && todayDay.exercises.length > 0 && (
              <span className={styles.sessionDoneBadge}>Session complete</span>
            )}
          </div>
          {todayDay.type === 'Rest' ? (
            <p className={styles.restLabel}>Rest day — free logger is still available below.</p>
          ) : todayDay.exercises.length === 0 ? (
            <p className={styles.restLabel}>
              {todayDay.type.replace('+Run', ' + Run')} session — no exercises planned. Log freely below.
            </p>
          ) : (
            todayDay.exercises.map((ex, i) => (
              <div
                className={done[i] ? styles.planItemDone : styles.planItem}
                key={ex.exerciseId + i}
              >
                <div className={styles.planItemHeader}>
                  <span className={styles.planExerciseName}>
                    {exercisesById[ex.exerciseId]?.name ?? 'Unknown exercise'}
                  </span>
                  <span className={styles.planExerciseMeta}>
                    {ex.targetSets}×{ex.targetReps}
                    {done[i] && <CheckCircle2 aria-label="Done" className={styles.planExerciseDoneIcon} size={15} />}
                  </span>
                </div>
                {!done[i] && (
                  <div className={styles.quickLog}>
                    <input
                      aria-label={`Weight for ${exercisesById[ex.exerciseId]?.name ?? 'exercise'}`}
                      className={styles.quickWeightInput}
                      inputMode="decimal"
                      min="0"
                      placeholder={`Weight (${unitLabel})`}
                      step="0.5"
                      type="number"
                      value={quickWeights[ex.exerciseId] ?? ''}
                      onChange={(e) => setQuickWeights((prev) => ({ ...prev, [ex.exerciseId]: e.target.value }))}
                    />
                    <button
                      className={styles.quickLogBtn}
                      type="button"
                      onClick={() => void quickLog(ex)}
                    >
                      Log {ex.targetSets} sets
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      <div className={styles.dailyPanel}>
        <div className={styles.panelHeader}>
          <div>
            <h2>Logged Sets</h2>
            <p>
              {selectedSets.length} set{selectedSets.length === 1 ? '' : 's'}
            </p>
          </div>
          <CalendarDays aria-hidden="true" size={21} />
        </div>

        {error ? (
          <div className={styles.emptyState} role="alert">
            <strong>Workout log could not load</strong>
            <span>{error}</span>
            <button type="button" onClick={() => void loadWorkoutData().catch(() => undefined)}>
              <RefreshCw size={17} />
              Retry
            </button>
          </div>
        ) : isLoading && selectedSets.length === 0 ? (
          <div className={styles.emptyState}>
            <strong>Loading workout log</strong>
            <span>Reading sets saved on this device.</span>
          </div>
        ) : selectedSets.length === 0 ? (
          <div className={styles.emptyState}>
            <strong>No workouts for this date</strong>
            <span>Tap the add button to log the first set.</span>
            <button type="button" onClick={() => openModal()}>
              <Plus size={17} />
              Add set
            </button>
          </div>
        ) : (
          <div className={styles.exerciseGroups}>
            {Object.entries(groupedSets).map(([exerciseId, sets]) => {
              const exercise = exercisesById[exerciseId];

              return (
                <article className={styles.exerciseGroup} key={exerciseId}>
                  <h3>{exercise?.name ?? 'Unknown Exercise'}</h3>
                  <div className={styles.setList}>
                    {sets.map((set, index) => (
                      <div className={styles.setRow} key={set.id}>
                        <span className={styles.setIndex}>Set {index + 1}</span>
                        <span>{set.weight ? `${set.weight} ${unitLabel}` : 'Bodyweight'}</span>
                        <span>{set.reps} reps</span>
                        <span>RPE {set.rpe ?? '-'}</span>
                        {set.isFailureSet ? (
                          <span className={styles.failureBadge}>Failure</span>
                        ) : null}
                        {set.notes ? <p>{set.notes}</p> : null}
                      </div>
                    ))}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      <button
        aria-label="Add workout set"
        className={styles.fab}
        type="button"
        onClick={() => openModal()}
      >
        <Plus size={26} strokeWidth={2.7} />
      </button>

      <AddWorkoutModal
        date={prefilledExerciseId ? new Date() : todayKey === dayKey(selectedDate) ? new Date() : selectedDate}
        isOpen={isModalOpen}
        prefilledExerciseId={prefilledExerciseId}
        onClose={() => setIsModalOpen(false)}
      />
    </section>
  );
}
