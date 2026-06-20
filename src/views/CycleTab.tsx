import { useEffect } from 'react';
import { useCycleStore, type CyclePhase } from '@/store/useCycleStore';
import { useProfileStore } from '@/store/useProfileStore';
import { NoProfileEmptyState } from '@/views/components/NoProfileEmptyState';
import styles from '@/views/styles/Cycle.module.css';

const PHASES: Array<{
  id: CyclePhase;
  label: string;
  days: string;
  energy: string;
  training: string;
  nutrition: string;
}> = [
  {
    id: 'follicular',
    label: 'Follicular',
    days: 'Days ~1–13',
    energy: 'Steadily rising. Estrogen climbs — mood and motivation often improve.',
    training: 'Good window for progressive overload and higher-volume sessions.',
    nutrition: 'Regular protein and carb targets. Carbs are well-tolerated as activity ramps up.',
  },
  {
    id: 'ovulatory',
    label: 'Ovulatory',
    days: 'Days ~14–16',
    energy: 'Peak energy and strength for many. Estrogen is at its highest.',
    training: 'Push heavier or test PRs. High-intensity sessions suit this window.',
    nutrition: 'Maintain protein targets. Prioritize iron-rich foods if appetite dips.',
  },
  {
    id: 'luteal',
    label: 'Luteal',
    days: 'Days ~17–28',
    energy: 'Progesterone rises; energy may plateau or dip in the second half.',
    training: 'Moderate intensity. Steady-state cardio or skill work if fatigue builds.',
    nutrition: 'Complex carbs help with cravings. Magnesium from leafy greens and nuts may ease PMS.',
  },
  {
    id: 'menstrual',
    label: 'Menstrual',
    days: 'Days ~1–5',
    energy: 'Often lowest energy of the cycle. Rest without guilt.',
    training: 'Easy walks, yoga, or gentle mobility. Skip intense sessions if your body says no.',
    nutrition: 'Iron-rich foods (red meat, lentils) to replenish. Omega-3s may ease discomfort.',
  },
];

export function CycleTab() {
  const profile = useProfileStore((s) => s.profile);
  const phase = useCycleStore((s) => s.phase);
  const loadCycle = useCycleStore((s) => s.loadCycle);
  const setPhase = useCycleStore((s) => s.setPhase);

  useEffect(() => {
    void loadCycle();
  }, [loadCycle]);

  if (!profile) return <NoProfileEmptyState />;

  if (profile.sex !== 'female' || !profile.cycleTrackingOptIn) {
    return (
      <section className={styles.page}>
        <p className={styles.gated}>
          Cycle tracking is available for female profiles with cycle tracking enabled. Update your
          profile to access this tab.
        </p>
      </section>
    );
  }

  return (
    <section aria-labelledby="cycle-title" className={styles.page}>
      <header className={styles.header}>
        <p className={styles.eyebrow}>Plan</p>
        <h1 id="cycle-title">Cycle</h1>
        <p>
          Select your current phase to highlight its guidance. These are qualitative notes — they
          do not change your calorie or macro targets.
        </p>
      </header>

      <div className={styles.phaseGrid}>
        {PHASES.map((p) => (
          <button
            aria-pressed={phase === p.id}
            className={`${styles.phaseCard} ${phase === p.id ? styles.phaseCardActive : ''}`}
            key={p.id}
            type="button"
            onClick={() => void setPhase(p.id)}
          >
            <div className={styles.phaseHeader}>
              <span className={styles.phaseName}>{p.label}</span>
              <span className={styles.phaseDays}>{p.days}</span>
            </div>
            <dl className={styles.phaseGuide}>
              <dt>Energy</dt>
              <dd>{p.energy}</dd>
              <dt>Training</dt>
              <dd>{p.training}</dd>
              <dt>Nutrition</dt>
              <dd>{p.nutrition}</dd>
            </dl>
          </button>
        ))}
      </div>
    </section>
  );
}
