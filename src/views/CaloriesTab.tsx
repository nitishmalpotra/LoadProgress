import { useProfileStore } from '@/store/useProfileStore';
import { computeMacros } from '@/utils/macros';
import { NoProfileEmptyState } from '@/views/components/NoProfileEmptyState';
import styles from '@/views/styles/Calories.module.css';

export function CaloriesTab() {
  const profile = useProfileStore((s) => s.profile);

  if (!profile) return <NoProfileEmptyState />;

  const { bmr, tdee, calorieTarget, proteinG, fatG, carbsG } = computeMacros(profile);

  const proteinKcal = Math.round(proteinG * 4);
  const carbsKcal = Math.round(carbsG * 4);
  const fatKcal = Math.round(fatG * 9);
  const totalMacroKcal = proteinKcal + carbsKcal + fatKcal;

  const pP = Math.round((proteinKcal / totalMacroKcal) * 100);
  const pC = Math.round((carbsKcal / totalMacroKcal) * 100);
  const pF = 100 - pP - pC;

  const macros = [
    { label: 'Protein', grams: proteinG, kcal: proteinKcal, pct: pP, segClass: styles.stackProtein, dotClass: styles.dotProtein },
    { label: 'Carbs',   grams: carbsG,   kcal: carbsKcal,   pct: pC, segClass: styles.stackCarbs,   dotClass: styles.dotCarbs   },
    { label: 'Fat',     grams: fatG,      kcal: fatKcal,     pct: pF, segClass: styles.stackFat,     dotClass: styles.dotFat     },
  ];

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
        <div className={styles.macroHeader}>
          <h2>Macro split</h2>
          <span className={styles.macroSubtitle}>{totalMacroKcal} kcal</span>
        </div>

        <div className={styles.stackBar} role="img" aria-label="Macro distribution bar">
          {macros.map((m) => (
            <div
              key={m.label}
              aria-label={`${m.label} ${m.pct}%`}
              className={`${styles.stackSegment} ${m.segClass}`}
              style={{ width: `${m.pct}%` }}
            />
          ))}
        </div>

        <div className={styles.macroLegend}>
          {macros.map((m) => (
            <div className={styles.macroRow} key={m.label}>
              <span className={`${styles.dot} ${m.dotClass}`} />
              <span className={styles.macroName}>{m.label}</span>
              <span className={styles.macroNums}>{m.grams}g · {m.kcal} kcal</span>
              <span className={styles.macroPct}>{m.pct}%</span>
            </div>
          ))}
        </div>
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
