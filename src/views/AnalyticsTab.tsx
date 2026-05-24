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
  Chest: 'hsl(174 72% 54%)',
  Back: 'hsl(213 94% 64%)',
  Legs: 'hsl(142 68% 54%)',
  Shoulders: 'hsl(262 82% 72%)',
  Arms: 'hsl(38 92% 58%)',
  Core: 'hsl(348 86% 66%)',
  'Full Body': 'hsl(188 84% 60%)',
  Forearms: 'hsl(24 86% 62%)',
  Glutes: 'hsl(316 78% 68%)',
  'Upper Back': 'hsl(199 90% 62%)',
  'Lower Back': 'hsl(158 64% 55%)'
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
  const loadWorkoutData = useWorkoutStore((state) => state.loadWorkoutData);

  useEffect(() => {
    void loadWorkoutData();
  }, [loadWorkoutData]);

  const volumeMetrics = useMemo(
    () => calculateVolumeByMuscleGroup(workoutSets, exercisesById, volumeWindow),
    [exercisesById, volumeWindow, workoutSets]
  );

  return (
    <section className={styles.analyticsPage} aria-labelledby="analytics-title">
      <header className={styles.pageHeader}>
        <p className={styles.eyebrow}>Training Volume</p>
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
            <p>{volumeMetrics.length} active muscle group{volumeMetrics.length === 1 ? '' : 's'}</p>
          </div>
        </div>

        {volumeMetrics.length === 0 ? (
          <div className={styles.emptyState}>Add logs to view progress metrics</div>
        ) : (
          <div className={styles.chartShell}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={volumeMetrics}
                layout="vertical"
                margin={{ top: 12, right: 24, bottom: 12, left: 18 }}
              >
                <CartesianGrid stroke="rgba(255,255,255,0.12)" horizontal={false} />
                <XAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'rgba(255,255,255,0.72)', fontSize: 12 }}
                  type="number"
                />
                <YAxis
                  axisLine={false}
                  dataKey="muscleGroup"
                  tickLine={false}
                  tick={{ fill: 'rgba(255,255,255,0.82)', fontSize: 12, fontWeight: 700 }}
                  type="category"
                  width={92}
                />
                <Tooltip content={<VolumeTooltip />} cursor={{ fill: 'rgba(255,255,255,0.06)' }} />
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
