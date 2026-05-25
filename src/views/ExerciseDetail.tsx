import { CalendarDays, Trophy, X } from 'lucide-react';
import type { Exercise, WorkoutSet } from '@/models';
import { calculateOneRepMax, useWorkoutStore } from '@/store/useWorkoutStore';
import { ExerciseIcon } from '@/views/components/ExerciseIcon';
import styles from '@/views/styles/Exercises.module.css';

type ExerciseDetailProps = {
  exercise: Exercise;
  onClose: () => void;
};

type ExerciseStats = {
  totalSets: number;
  totalReps: number;
  averageWeight: number;
  estimatedOneRepMax: number;
  lifetimeVolume: number;
  frequency: number;
};

const dayKey = (date: Date) => {
  const localDate = new Date(date);
  localDate.setHours(0, 0, 0, 0);
  return localDate.toISOString();
};

const formatDate = (date: Date) =>
  new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(date);

const formatNumber = (value: number, maximumFractionDigits = 0) =>
  value.toLocaleString(undefined, { maximumFractionDigits });

export function getExerciseStats(sets: WorkoutSet[]): ExerciseStats {
  const weightedSets = sets.filter((set) => set.weight !== undefined);
  const totalReps = sets.reduce((total, set) => total + set.reps, 0);
  const lifetimeVolume = sets.reduce((total, set) => total + (set.weight ?? 0) * set.reps, 0);
  const estimatedOneRepMax = weightedSets.reduce(
    (best, set) => Math.max(best, calculateOneRepMax(set.weight ?? 0, set.reps)),
    0
  );
  const totalWeight = weightedSets.reduce((total, set) => total + (set.weight ?? 0), 0);
  const performanceDays = new Set(sets.map((set) => dayKey(set.date))).size;

  return {
    totalSets: sets.length,
    totalReps,
    averageWeight: weightedSets.length ? totalWeight / weightedSets.length : 0,
    estimatedOneRepMax,
    lifetimeVolume,
    frequency: performanceDays
  };
}

function groupSetsByDate(sets: WorkoutSet[]) {
  return sets
    .slice()
    .sort((left, right) => right.date.getTime() - left.date.getTime())
    .reduce<Array<{ key: string; date: Date; sets: WorkoutSet[] }>>((groups, set) => {
      const key = dayKey(set.date);
      const existingGroup = groups.find((group) => group.key === key);

      if (existingGroup) {
        existingGroup.sets.push(set);
      } else {
        groups.push({ key, date: set.date, sets: [set] });
      }

      return groups;
    }, []);
}

export function ExerciseDetail({ exercise, onClose }: ExerciseDetailProps) {
  const sets = useWorkoutStore((state) => state.workoutSetsByExerciseId[exercise.id] ?? []);
  const stats = getExerciseStats(sets);
  const historyGroups = groupSetsByDate(sets);

  return (
    <div className={styles.detailOverlay} role="presentation">
      <section
        aria-label={`${exercise.name} history`}
        aria-modal="true"
        className={styles.detailSheet}
        role="dialog"
      >
        <div className={styles.sheetHandle} aria-hidden="true" />
        <header className={styles.detailHeader}>
          <div className={styles.detailTitleRow}>
            <ExerciseIcon
              className={styles.detailExerciseIcon}
              iconName={exercise.icon}
              size={24}
            />
            <div>
              <p className={styles.eyebrow}>{exercise.muscleGroup}</p>
              <h2>{exercise.name}</h2>
            </div>
          </div>
          <button className={styles.iconButton} type="button" aria-label="Close" onClick={onClose}>
            <X size={19} />
          </button>
        </header>

        <div className={styles.detailIntro}>
          <p>{exercise.description}</p>
          <div className={styles.requirements}>
            <span>Equipment: {exercise.equipment.join(', ')}</span>
            <span>Target: {exercise.muscleGroup}</span>
            <span>Difficulty: {exercise.difficulty}</span>
          </div>
        </div>

        <section className={styles.cuePanel} aria-labelledby="form-cues-title">
          <h3 id="form-cues-title">Form Cues</h3>
          <ul>
            {exercise.formCues.map((cue) => (
              <li key={cue}>{cue}</li>
            ))}
          </ul>
        </section>

        <section className={styles.statsGrid} aria-label="Key stats">
          <div className={styles.statCard}>
            <span>Total Sets</span>
            <strong>{formatNumber(stats.totalSets)}</strong>
          </div>
          <div className={styles.statCard}>
            <span>Estimated 1RM</span>
            <strong>{formatNumber(stats.estimatedOneRepMax, 1)} kg</strong>
          </div>
          <div className={styles.statCard}>
            <span>Lifetime Volume</span>
            <strong>{formatNumber(stats.lifetimeVolume)} kg reps</strong>
          </div>
          <div className={styles.statCard}>
            <span>Frequency</span>
            <strong>
              {formatNumber(stats.frequency)} day{stats.frequency === 1 ? '' : 's'}
            </strong>
          </div>
          <div className={styles.statCard}>
            <span>Average Weight</span>
            <strong>{formatNumber(stats.averageWeight, 1)} kg</strong>
          </div>
          <div className={styles.statCard}>
            <span>Total Reps</span>
            <strong>{formatNumber(stats.totalReps)}</strong>
          </div>
        </section>

        <section className={styles.historyPanel} aria-labelledby="history-title">
          <div className={styles.historyHeader}>
            <div>
              <h3 id="history-title">Log History</h3>
              <p>
                {sets.length} logged set{sets.length === 1 ? '' : 's'}
              </p>
            </div>
            <Trophy size={18} />
          </div>

          {historyGroups.length === 0 ? (
            <div className={styles.emptyState}>No sets logged for this exercise</div>
          ) : (
            <div className={styles.historyList}>
              {historyGroups.map((group) => (
                <article className={styles.historyGroup} key={group.key}>
                  <h4>
                    <CalendarDays size={16} />
                    {formatDate(group.date)}
                  </h4>
                  <div className={styles.historyRows}>
                    {group.sets.map((set, index) => (
                      <div className={styles.historyRow} key={set.id}>
                        <span>Set {index + 1}</span>
                        <strong>
                          {set.weight === undefined ? 'Bodyweight' : `${set.weight} kg`}
                        </strong>
                        <span>{set.reps} reps</span>
                        {set.rpe ? <span>RPE {set.rpe}</span> : <span />}
                      </div>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </section>
    </div>
  );
}
