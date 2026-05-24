import { useEffect, useMemo, useState } from 'react';
import { CalendarDays, Plus } from 'lucide-react';
import { AddWorkoutModal } from '@/views/components/AddWorkoutModal';
import { useWorkoutStore } from '@/store/useWorkoutStore';
import type { WorkoutSet } from '@/models';
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
  const exercisesById = useWorkoutStore((state) => state.exercisesById);
  const workoutSetsByDate = useWorkoutStore((state) => state.workoutSetsByDate);
  const unitSystem = useWorkoutStore((state) => state.unitSystem);
  const loadWorkoutData = useWorkoutStore((state) => state.loadWorkoutData);
  const dateWindow = useMemo(buildDateWindow, []);
  const selectedSets = workoutSetsByDate[dayKey(selectedDate)] ?? [];
  const groupedSets = groupSetsByExercise(selectedSets);
  const unitLabel = unitSystem === 'metric' ? 'kg' : 'lb';
  const todayKey = dayKey(new Date());

  useEffect(() => {
    void loadWorkoutData();
  }, [loadWorkoutData]);

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

      <div className={styles.dailyPanel}>
        <div className={styles.panelHeader}>
          <div>
            <h2>Logged Sets</h2>
            <p>{selectedSets.length} set{selectedSets.length === 1 ? '' : 's'}</p>
          </div>
          <CalendarDays aria-hidden="true" size={21} />
        </div>

        {selectedSets.length === 0 ? (
          <div className={styles.emptyState}>No workouts for this date</div>
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
                        {set.isFailureSet ? <span className={styles.failureBadge}>Failure</span> : null}
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
        onClick={() => setIsModalOpen(true)}
      >
        <Plus size={26} strokeWidth={2.7} />
      </button>

      <AddWorkoutModal
        date={todayKey === dayKey(selectedDate) ? new Date() : selectedDate}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </section>
  );
}
