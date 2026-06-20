import { useEffect, useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { Link } from 'react-router-dom';
import { RefreshCw } from 'lucide-react';
import type { MuscleGroup } from '@/models';
import { useWorkoutStore } from '@/store/useWorkoutStore';
import {
  calculateVolumeByMuscleGroup,
  type MuscleVolumeMetric,
  type VolumeWindow
} from '@/views/analyticsMetrics';
import styles from '@/views/styles/Analytics.module.css';

const filterOptions: Array<{ label: string; value: VolumeWindow }> = [
  { label: 'Week', value: 'week' },
  { label: 'Month', value: 'month' },
  { label: '3 Months', value: 'quarter' }
];

const muscleColors: Record<MuscleGroup, string> = {
  Chest: '#176B4D',
  Back: '#4B5F8F',
  Legs: '#4F7B43',
  Shoulders: '#7A5C9E',
  Arms: '#A15C00',
  Core: '#B42318',
  'Full Body': '#2B7886',
  Forearms: '#9A5A2E',
  Glutes: '#9B4F7D',
  'Upper Back': '#3D6F91',
  'Lower Back': '#3F7A61'
};

type ChartTooltipProps = {
  active?: boolean;
  payload?: Array<{ value?: number | string }>;
  label?: string;
};

function VolumeTooltip({ active, payload, label }: ChartTooltipProps) {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div className={styles.tooltip}>
      <strong>{label}</strong>
      <span>{Math.round(Number(payload[0].value)).toLocaleString()} kg reps</span>
    </div>
  );
}

export function AnalyticsTab() {
  const [volumeWindow, setVolumeWindow] = useState<VolumeWindow>('week');
  const exercisesById = useWorkoutStore((state) => state.exercisesById);
  const workoutSets = useWorkoutStore((state) => state.workoutSets);
  const isLoading = useWorkoutStore((state) => state.isLoading);
  const error = useWorkoutStore((state) => state.error);
  const loadWorkoutData = useWorkoutStore((state) => state.loadWorkoutData);

  useEffect(() => {
    void loadWorkoutData().catch(() => undefined);
  }, [loadWorkoutData]);

  const volumeMetrics = useMemo(
    () => calculateVolumeByMuscleGroup(workoutSets, exercisesById, volumeWindow),
    [exercisesById, volumeWindow, workoutSets]
  );

  return (
    <section className={styles.analyticsPage} aria-labelledby="analytics-title">
      <header className={styles.pageHeader}>
        <p className={styles.eyebrow}>Progress</p>
        <h1 id="analytics-title">Volume</h1>
        <p>Total load by primary muscle group across your selected training window.</p>
      </header>

      <div className={styles.controlPanel} aria-label="Volume time filter">
        <div className={styles.segmentedRow}>
          {filterOptions.map((option) => (
            <button
              aria-pressed={volumeWindow === option.value}
              className={volumeWindow === option.value ? styles.segmentSelected : styles.segment}
              key={option.value}
              type="button"
              onClick={() => setVolumeWindow(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <article className={styles.chartPanel}>
        <div className={styles.panelHeader}>
          <div>
            <h2>Volume Breakdown</h2>
            <p>
              {volumeMetrics.length} active muscle group{volumeMetrics.length === 1 ? '' : 's'}
            </p>
          </div>
        </div>

        {error ? (
          <div className={styles.emptyState} role="alert">
            <h3>Volume could not load</h3>
            <p>{error}</p>
            <button type="button" onClick={() => void loadWorkoutData().catch(() => undefined)}>
              <RefreshCw size={17} />
              Retry
            </button>
          </div>
        ) : isLoading && volumeMetrics.length === 0 ? (
          <div className={styles.emptyState}>
            <h3>Loading volume</h3>
            <p>Reading recent sets saved on this device.</p>
          </div>
        ) : volumeMetrics.length === 0 ? (
          <div className={styles.emptyState}>
            <h3>Add logs to view progress metrics</h3>
            <p>Volume appears after weighted sets are logged.</p>
            <Link to="/">Log a set</Link>
          </div>
        ) : (
          <div className={styles.chartShell}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={volumeMetrics}
                layout="vertical"
                margin={{ top: 12, right: 24, bottom: 12, left: 18 }}
              >
                <CartesianGrid stroke="#ded9cf" horizontal={false} />
                <XAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#6b6963', fontSize: 12 }}
                  type="number"
                />
                <YAxis
                  axisLine={false}
                  dataKey="muscleGroup"
                  tickLine={false}
                  tick={{ fill: '#171717', fontSize: 12, fontWeight: 700 }}
                  type="category"
                  width={92}
                />
                <Tooltip content={<VolumeTooltip />} cursor={{ fill: 'rgb(23 107 77 / 0.08)' }} />
                <Bar dataKey="volume" radius={[0, 12, 12, 0]} animationDuration={650}>
                  {volumeMetrics.map((metric: MuscleVolumeMetric) => (
                    <Cell fill={muscleColors[metric.muscleGroup]} key={metric.muscleGroup} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </article>
    </section>
  );
}
