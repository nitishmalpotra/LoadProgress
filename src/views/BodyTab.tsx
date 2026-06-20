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
import { useBodyWeightStore, trailingAverage } from '@/store/useBodyWeightStore';
import { useMeasurementStore } from '@/store/useMeasurementStore';
import { useProfileStore } from '@/store/useProfileStore';
import styles from '@/views/styles/Body.module.css';

const todayISO = () => new Date().toISOString().slice(0, 10);

export function BodyTab() {
  const weights = useBodyWeightStore((s) => s.weights);
  const isLoading = useBodyWeightStore((s) => s.isLoading);
  const loadWeights = useBodyWeightStore((s) => s.loadWeights);
  const logWeight = useBodyWeightStore((s) => s.logWeight);
  const profile = useProfileStore((s) => s.profile);

  const today = todayISO();
  const unit = profile?.unitSystem === 'imperial' ? 'lbs' : 'kg';
  const todayEntry = weights.find((w) => w.date === today);

  const measurements = useMeasurementStore((s) => s.measurements);
  const loadMeasurements = useMeasurementStore((s) => s.loadMeasurements);
  const logMeasurement = useMeasurementStore((s) => s.logMeasurement);

  const todayMeasurement = measurements.find((m) => m.date === today);
  const [waistInput, setWaistInput] = useState('');
  const [hipsInput, setHipsInput] = useState('');
  const [input, setInput] = useState('');

  useEffect(() => {
    void loadWeights();
    void loadMeasurements();
  }, [loadWeights, loadMeasurements]);

  useEffect(() => {
    setInput(todayEntry ? String(todayEntry.weight) : '');
  }, [todayEntry]);

  useEffect(() => {
    setWaistInput(todayMeasurement ? String(todayMeasurement.waist) : '');
    setHipsInput(todayMeasurement ? String(todayMeasurement.hips) : '');
  }, [todayMeasurement]);

  const chartData = useMemo(() => {
    const avgs = trailingAverage(weights);
    return weights.map((w, i) => ({
      label: w.date.slice(5), // MM-DD
      weight: w.weight,
      avg: Number(avgs[i]!.toFixed(1))
    }));
  }, [weights]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(input);
    if (!isNaN(val) && val > 0) void logWeight(today, val);
  };

  const handleMeasurementSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const waist = parseFloat(waistInput);
    const hips = parseFloat(hipsInput);
    if (!isNaN(waist) && waist > 0 && !isNaN(hips) && hips > 0) {
      void logMeasurement(today, waist, hips);
    }
  };

  // delta vs previous entry; shown newest-first in table
  const measurementsDesc = [...measurements].reverse();
  const delta = (i: number, field: 'waist' | 'hips') => {
    // measurementsDesc[i] is current, [i+1] is previous in chronological order
    const prev = measurementsDesc[i + 1];
    if (!prev) return null;
    return measurementsDesc[i]![field] - prev[field];
  };

  return (
    <section aria-labelledby="body-title" className={styles.bodyPage}>
      <header className={styles.pageHeader}>
        <p className={styles.eyebrow}>Body Metrics</p>
        <h1 id="body-title">Body Metrics</h1>
        <p>Log weight each morning for consistent tracking. Measure waist &amp; hips monthly. Gaps are fine.</p>
      </header>

      <div className={styles.logPanel}>
        <form className={styles.logForm} onSubmit={handleSubmit}>
          <label className={styles.logLabel}>
            Today&apos;s weight ({unit})
            <input
              className={styles.logInput}
              min="0"
              placeholder="e.g. 75.0"
              step="0.1"
              type="number"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
          </label>
          <button className={styles.logButton} type="submit">
            {todayEntry ? 'Update' : 'Log'}
          </button>
        </form>
      </div>

      <div className={styles.logPanel}>
        <form className={styles.logForm} onSubmit={handleMeasurementSubmit}>
          <label className={styles.logLabel}>
            Waist ({unit})
            <input
              className={styles.logInput}
              min="0"
              placeholder="e.g. 80"
              step="0.1"
              type="number"
              value={waistInput}
              onChange={(e) => setWaistInput(e.target.value)}
            />
          </label>
          <label className={styles.logLabel}>
            Hips ({unit})
            <input
              className={styles.logInput}
              min="0"
              placeholder="e.g. 95"
              step="0.1"
              type="number"
              value={hipsInput}
              onChange={(e) => setHipsInput(e.target.value)}
            />
          </label>
          <button className={styles.logButton} type="submit">
            {todayMeasurement ? 'Update' : 'Log'}
          </button>
        </form>
      </div>

      {measurements.length > 0 && (
        <article className={styles.chartPanel}>
          <h2>Measurements history</h2>
          <table className={styles.measureTable}>
            <thead>
              <tr>
                <th>Date</th>
                <th>Waist</th>
                <th>Hips</th>
                <th>Δ Waist</th>
                <th>Δ Hips</th>
              </tr>
            </thead>
            <tbody>
              {measurementsDesc.map((m, i) => {
                const dw = delta(i, 'waist');
                const dh = delta(i, 'hips');
                return (
                  <tr key={m.id}>
                    <td>{m.date.slice(5)}</td>
                    <td>{m.waist} {unit}</td>
                    <td>{m.hips} {unit}</td>
                    <td className={dw === null ? '' : dw < 0 ? styles.deltaGood : dw > 0 ? styles.deltaBad : ''}>
                      {dw === null ? '—' : `${dw > 0 ? '+' : ''}${dw.toFixed(1)}`}
                    </td>
                    <td className={dh === null ? '' : dh < 0 ? styles.deltaGood : dh > 0 ? styles.deltaBad : ''}>
                      {dh === null ? '—' : `${dh > 0 ? '+' : ''}${dh.toFixed(1)}`}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </article>
      )}

      <article className={styles.chartPanel}>
        <h2>Weight over time</h2>
        {isLoading && weights.length === 0 ? (
          <div className={styles.emptyState}>Loading…</div>
        ) : weights.length < 2 ? (
          <div className={styles.emptyState}>
            <p>Log at least two entries to see the chart.</p>
          </div>
        ) : (
          <div className={styles.chartShell}>
            <ResponsiveContainer height="100%" width="100%">
              <LineChart data={chartData} margin={{ top: 12, right: 8, bottom: 8, left: 0 }}>
                <CartesianGrid stroke="var(--app-glass-border)" vertical={false} />
                <XAxis
                  axisLine={false}
                  dataKey="label"
                  tick={{ fill: 'var(--app-text-secondary)', fontSize: 12 }}
                  tickLine={false}
                />
                <YAxis
                  axisLine={false}
                  domain={['auto', 'auto']}
                  tick={{ fill: 'var(--app-text-secondary)', fontSize: 12 }}
                  tickLine={false}
                />
                <Tooltip formatter={(v: number) => [`${v} ${unit}`]} />
                <Legend wrapperStyle={{ color: 'var(--app-text-secondary)', fontSize: 12 }} />
                <Line
                  activeDot={{ r: 5 }}
                  dataKey="weight"
                  dot={{ r: 3 }}
                  name={`Weight (${unit})`}
                  stroke="#176B4D"
                  strokeWidth={2}
                  type="monotone"
                />
                <Line
                  connectNulls
                  dataKey="avg"
                  dot={false}
                  name="7-day avg"
                  stroke="#A15C00"
                  strokeDasharray="4 3"
                  strokeWidth={2}
                  type="monotone"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </article>
    </section>
  );
}
