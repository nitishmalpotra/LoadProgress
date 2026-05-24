import { useEffect, useMemo, useState } from 'react';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import type { ExerciseType, MuscleGroup } from '@/models';
import { useWorkoutStore } from '@/store/useWorkoutStore';
import {
  buildProgressTrend,
  getExerciseTypes,
  getExercisesForSelection,
  getFocusedWeightDomain,
  getLoggedExercises,
  getMuscleGroupsForType
} from '@/views/analyticsMetrics';
import styles from '@/views/styles/Analytics.module.css';

type ChartTooltipProps = {
  active?: boolean;
  payload?: Array<{
    dataKey?: string | number;
    value?: number | string;
    payload?: { sets?: number };
  }>;
  label?: string;
};

function ProgressTooltip({ active, payload, label }: ChartTooltipProps) {
  if (!active || !payload?.length) {
    return null;
  }

  const weight = payload.find((item) => item.dataKey === 'weight')?.value;
  const reps = payload.find((item) => item.dataKey === 'reps')?.value;
  const sets = payload[0].payload?.sets;

  return (
    <div className={styles.tooltip}>
      <strong>{label}</strong>
      <span>Weight: {Number(weight ?? 0).toLocaleString()} kg</span>
      <span>Reps: {Number(reps ?? 0).toLocaleString()}</span>
      <span>Sets logged: {Number(sets ?? 0).toLocaleString()}</span>
    </div>
  );
}

export function ProgressTab() {
  const exercises = useWorkoutStore((state) => state.exercises);
  const workoutSets = useWorkoutStore((state) => state.workoutSets);
  const loadWorkoutData = useWorkoutStore((state) => state.loadWorkoutData);
  const [exerciseType, setExerciseType] = useState<ExerciseType | ''>('');
  const [muscleGroup, setMuscleGroup] = useState<MuscleGroup | ''>('');
  const [exerciseId, setExerciseId] = useState('');

  useEffect(() => {
    void loadWorkoutData();
  }, [loadWorkoutData]);

  const loggedExercises = useMemo(
    () => getLoggedExercises(exercises, workoutSets),
    [exercises, workoutSets]
  );
  const exerciseTypes = useMemo(() => getExerciseTypes(loggedExercises), [loggedExercises]);
  const muscleGroups = useMemo(
    () => getMuscleGroupsForType(loggedExercises, exerciseType),
    [exerciseType, loggedExercises]
  );
  const exerciseOptions = useMemo(
    () => getExercisesForSelection(loggedExercises, exerciseType, muscleGroup),
    [exerciseType, loggedExercises, muscleGroup]
  );

  useEffect(() => {
    if (!exerciseType && exerciseTypes[0]) {
      setExerciseType(exerciseTypes[0]);
    }
  }, [exerciseType, exerciseTypes]);

  useEffect(() => {
    if (exerciseType && !muscleGroups.includes(muscleGroup as MuscleGroup)) {
      setMuscleGroup(muscleGroups[0] ?? '');
    }
  }, [exerciseType, muscleGroup, muscleGroups]);

  useEffect(() => {
    if (!exerciseOptions.some((exercise) => exercise.id === exerciseId)) {
      setExerciseId(exerciseOptions[0]?.id ?? '');
    }
  }, [exerciseId, exerciseOptions]);

  const trend = useMemo(
    () => buildProgressTrend(workoutSets, exerciseId),
    [exerciseId, workoutSets]
  );
  const weightDomain = useMemo(() => getFocusedWeightDomain(trend), [trend]);

  return (
    <section className={styles.analyticsPage} aria-labelledby="progress-title">
      <header className={styles.pageHeader}>
        <p className={styles.eyebrow}>Progress Trends</p>
        <h1 id="progress-title">Trends</h1>
        <p>Drill into an exercise to compare load and rep progression over time.</p>
      </header>

      <div className={styles.controlPanel}>
        <div className={styles.selectorGrid}>
          <label className={styles.selectGroup}>
            <span>Exercise Type</span>
            <select
              className={styles.selectField}
              disabled={exerciseTypes.length === 0}
              value={exerciseType}
              onChange={(event) => {
                setExerciseType(event.target.value as ExerciseType);
                setMuscleGroup('');
                setExerciseId('');
              }}
            >
              {exerciseTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </label>

          <label className={styles.selectGroup}>
            <span>Muscle Group</span>
            <select
              className={styles.selectField}
              disabled={muscleGroups.length === 0}
              value={muscleGroup}
              onChange={(event) => {
                setMuscleGroup(event.target.value as MuscleGroup);
                setExerciseId('');
              }}
            >
              {muscleGroups.map((group) => (
                <option key={group} value={group}>
                  {group}
                </option>
              ))}
            </select>
          </label>

          <label className={styles.selectGroup}>
            <span>Specific Exercise</span>
            <select
              className={styles.selectField}
              disabled={exerciseOptions.length === 0}
              value={exerciseId}
              onChange={(event) => setExerciseId(event.target.value)}
            >
              {exerciseOptions.map((exercise) => (
                <option key={exercise.id} value={exercise.id}>
                  {exercise.name}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <article className={styles.chartPanel}>
        <div className={styles.panelHeader}>
          <div>
            <h2>Weight and Reps</h2>
            <p>
              {trend.length} training day{trend.length === 1 ? '' : 's'}
            </p>
          </div>
        </div>

        {trend.length === 0 ? (
          <div className={styles.emptyState}>Add logs to view progress metrics</div>
        ) : (
          <div className={styles.chartShell}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trend} margin={{ top: 16, right: 8, bottom: 12, left: 0 }}>
                <CartesianGrid stroke="rgba(255,255,255,0.12)" vertical={false} />
                <XAxis
                  axisLine={false}
                  dataKey="label"
                  tickLine={false}
                  tick={{ fill: 'rgba(255,255,255,0.72)', fontSize: 12 }}
                />
                <YAxis
                  axisLine={false}
                  domain={weightDomain}
                  tickLine={false}
                  tick={{ fill: 'rgba(255,255,255,0.72)', fontSize: 12 }}
                  yAxisId="weight"
                />
                <YAxis
                  axisLine={false}
                  orientation="right"
                  tickLine={false}
                  tick={{ fill: 'rgba(255,255,255,0.72)', fontSize: 12 }}
                  yAxisId="reps"
                />
                <Tooltip
                  content={<ProgressTooltip />}
                  cursor={{ stroke: 'rgba(255,255,255,0.18)' }}
                />
                <Legend wrapperStyle={{ color: 'rgba(255,255,255,0.78)', fontSize: 12 }} />
                <Line
                  activeDot={{ r: 6, stroke: 'white', strokeWidth: 2 }}
                  animationDuration={700}
                  dataKey="weight"
                  dot={{ r: 4 }}
                  name="Weight"
                  stroke="hsl(174 72% 54%)"
                  strokeWidth={3}
                  type="monotone"
                  yAxisId="weight"
                />
                <Line
                  activeDot={{ r: 6, stroke: 'white', strokeWidth: 2 }}
                  animationDuration={700}
                  dataKey="reps"
                  dot={{ r: 4 }}
                  name="Reps"
                  stroke="hsl(38 92% 58%)"
                  strokeWidth={3}
                  type="monotone"
                  yAxisId="reps"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </article>
    </section>
  );
}
