import { useProfileStore } from '@/store/useProfileStore';
import { computeMacros } from '@/utils/macros';
import { NoProfileEmptyState } from '@/views/components/NoProfileEmptyState';
import styles from '@/views/styles/Calories.module.css';

function MacroBar({
  label,
  grams,
  kcalPerG,
  totalKcal,
  fillClass,
}: {
  label: string;
  grams: number;
  kcalPerG: number;
  totalKcal: number;
  fillClass: string;
}) {
  const kcal = grams * kcalPerG;
  const pct = Math.min(100, Math.round((kcal / totalKcal) * 100));
  return (
    <div className={styles.macroRow}>
      <div className={styles.macroMeta}>
        <span className={styles.macroName}>{label}</span>
        <span className={styles.macroNums}>
          {grams}g · {kcal} kcal
        </span>
      </div>
      <div className={styles.barTrack}>
        <div className={`${styles.barFill} ${fillClass}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export function CaloriesTab() {
  const profile = useProfileStore((s) => s.profile);

  if (!profile) return <NoProfileEmptyState />;

  const { bmr, tdee, calorieTarget, proteinG, fatG, carbsG } = computeMacros(profile);

  return (
    <section aria-labelledby="calories-title" className={styles.page}>
      <header className={styles.header}>
        <p className={styles.eyebrow}>Plan</p>
        <h1 id="calories-title">Calories</h1>
        <p>Your personalised energy and macro targets.</p>
      </header>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <p className={styles.statValue}>{bmr}</p>
          <p className={styles.statLabel}>BMR</p>
        </div>
        <div className={styles.statCard}>
          <p className={styles.statValue}>{tdee}</p>
          <p className={styles.statLabel}>TDEE</p>
        </div>
        <div className={styles.statCard}>
          <p className={styles.statValue}>{calorieTarget}</p>
          <p className={styles.statLabel}>Target</p>
        </div>
      </div>

      <div className={styles.macroSection}>
        <h2>Macro targets</h2>
        <MacroBar
          fillClass={styles.barProtein}
          grams={proteinG}
          kcalPerG={4}
          label="Protein"
          totalKcal={calorieTarget}
        />
        <MacroBar
          fillClass={styles.barCarbs}
          grams={carbsG}
          kcalPerG={4}
          label="Carbs"
          totalKcal={calorieTarget}
        />
        <MacroBar
          fillClass={styles.barFat}
          grams={fatG}
          kcalPerG={9}
          label="Fat"
          totalKcal={calorieTarget}
        />
      </div>

      {(profile.goal === 'lose' || profile.goal === 'recomposition') && (
        <div className={styles.infoCard}>
          <h2>Why a small deficit?</h2>
          <p>
            A {profile.goal === 'lose' ? '500' : '250'} kcal daily deficit creates steady fat
            loss while preserving the muscle you build in the gym. Larger cuts accelerate muscle
            loss and tank performance — the small deficit is the efficient path.
          </p>
        </div>
      )}

      {profile.goal === 'recomposition' && (
        <div className={styles.infoCard}>
          <h2>Recomp reality check</h2>
          <p>
            Recomposition — losing fat and gaining muscle simultaneously — is real but slow.
            Expect scale weight to stay roughly flat for weeks while your body composition
            shifts. Progress shows up in measurements, photos, and how your clothes fit, not
            the scale.
          </p>
        </div>
      )}
    </section>
  );
}
