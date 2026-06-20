import { useEffect, useState } from 'react';
import { computeMacros } from '@/utils/macros';
import { useNutritionStore } from '@/store/useNutritionStore';
import { useProfileStore } from '@/store/useProfileStore';
import { NoProfileEmptyState } from '@/views/components/NoProfileEmptyState';
import styles from '@/views/styles/Nutrition.module.css';

const todayISO = () => new Date().toISOString().slice(0, 10);

const PROTEIN_SOURCES = [
  { food: 'Chicken breast',    per: '100g', protein: 31 },
  { food: 'Canned tuna',       per: '100g', protein: 28 },
  { food: 'Canned salmon',     per: '100g', protein: 20 },
  { food: 'Whey protein',      per: '30g scoop', protein: 25 },
  { food: 'Tempeh',            per: '100g', protein: 19 },
  { food: 'Eggs (2 large)',    per: '~120g', protein: 13 },
  { food: 'Cottage cheese',    per: '100g', protein: 11 },
  { food: 'Edamame',           per: '100g', protein: 11 },
  { food: 'Greek yogurt',      per: '100g', protein: 10 },
  { food: 'Lentils (cooked)',  per: '100g', protein: 9  },
  { food: 'Firm tofu',         per: '100g', protein: 8  },
];

type MacroBarProps = {
  label: string;
  logged: number;
  target: number;
  kcalPer: number;
  fillClass: string;
};

function MacroBar({ label, logged, target, kcalPer, fillClass }: MacroBarProps) {
  const pct = target > 0 ? Math.min(100, Math.round((logged / target) * 100)) : 0;
  const over = logged > target;
  return (
    <div className={styles.macroRow}>
      <div className={styles.macroMeta}>
        <span className={styles.macroName}>{label}</span>
        <span className={styles.macroNums}>
          {logged}g / {target}g · {Math.round(logged * kcalPer)} kcal
        </span>
      </div>
      <div className={styles.barTrack}>
        <div
          className={`${styles.barFill} ${over ? styles.barOver : fillClass}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export function NutritionTab() {
  const profile = useProfileStore((s) => s.profile);
  const entries = useNutritionStore((s) => s.entries);
  const loadNutrition = useNutritionStore((s) => s.loadNutrition);
  const logNutrition = useNutritionStore((s) => s.logNutrition);

  const today = todayISO();
  const todayEntry = entries.find((e) => e.date === today);

  const [proteinInput, setProteinInput] = useState('');
  const [carbsInput, setCarbsInput] = useState('');
  const [fatInput, setFatInput] = useState('');

  useEffect(() => {
    void loadNutrition();
  }, [loadNutrition]);

  useEffect(() => {
    setProteinInput(todayEntry ? String(todayEntry.protein) : '');
    setCarbsInput(todayEntry ? String(todayEntry.carbs) : '');
    setFatInput(todayEntry ? String(todayEntry.fat) : '');
  }, [todayEntry]);

  if (!profile) return <NoProfileEmptyState />;

  const { proteinG, carbsG, fatG, calorieTarget } = computeMacros(profile);

  const loggedProtein = Math.max(0, parseFloat(proteinInput) || 0);
  const loggedCarbs   = Math.max(0, parseFloat(carbsInput)   || 0);
  const loggedFat     = Math.max(0, parseFloat(fatInput)     || 0);
  const loggedKcal    = Math.round(loggedProtein * 4 + loggedCarbs * 4 + loggedFat * 9);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (loggedProtein > 0 || loggedCarbs > 0 || loggedFat > 0) {
      void logNutrition(today, loggedProtein, loggedCarbs, loggedFat);
    }
  };

  return (
    <section aria-labelledby="nutrition-title" className={styles.page}>
      <header className={styles.header}>
        <p className={styles.eyebrow}>Plan</p>
        <h1 id="nutrition-title">Nutrition</h1>
        <p>Log today's total protein, carbs, and fat. Update any time.</p>
      </header>

      <div className={styles.logPanel}>
        <form className={styles.logForm} onSubmit={handleSubmit}>
          <label className={styles.logLabel}>
            Protein (g)
            <input
              className={styles.logInput}
              inputMode="decimal"
              min="0"
              placeholder="e.g. 150"
              step="1"
              type="number"
              value={proteinInput}
              onChange={(e) => setProteinInput(e.target.value)}
            />
          </label>
          <label className={styles.logLabel}>
            Carbs (g)
            <input
              className={styles.logInput}
              inputMode="decimal"
              min="0"
              placeholder="e.g. 200"
              step="1"
              type="number"
              value={carbsInput}
              onChange={(e) => setCarbsInput(e.target.value)}
            />
          </label>
          <label className={styles.logLabel}>
            Fat (g)
            <input
              className={styles.logInput}
              inputMode="decimal"
              min="0"
              placeholder="e.g. 70"
              step="1"
              type="number"
              value={fatInput}
              onChange={(e) => setFatInput(e.target.value)}
            />
          </label>
          <button className={styles.logButton} type="submit">
            {todayEntry ? 'Update' : 'Log'}
          </button>
        </form>
      </div>

      <div className={styles.macroSection}>
        <h2>Today vs. target</h2>
        <MacroBar
          fillClass={styles.barProtein}
          kcalPer={4}
          label="Protein"
          logged={loggedProtein}
          target={proteinG}
        />
        <MacroBar
          fillClass={styles.barCarbs}
          kcalPer={4}
          label="Carbs"
          logged={loggedCarbs}
          target={carbsG}
        />
        <MacroBar
          fillClass={styles.barFat}
          kcalPer={9}
          label="Fat"
          logged={loggedFat}
          target={fatG}
        />
        <div className={styles.kcalRow}>
          <span className={styles.kcalLabel}>Calories</span>
          <span className={styles.kcalValue}>
            {loggedKcal} / {calorieTarget} kcal
          </span>
        </div>
      </div>

      <div className={styles.infoCard}>
        <h2>High-protein foods</h2>
        <table className={styles.foodTable}>
          <thead>
            <tr>
              <th>Food</th>
              <th>Serving</th>
              <th>Protein</th>
            </tr>
          </thead>
          <tbody>
            {PROTEIN_SOURCES.map((row) => (
              <tr key={row.food}>
                <td>{row.food}</td>
                <td>{row.per}</td>
                <td>{row.protein}g</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className={styles.infoCard}>
        <h2>Supplements</h2>
        <p>
          <strong>Creatine monohydrate</strong> — 3–5g daily, any time, mix with water or juice.
          The most studied supplement for strength and muscle gain. No loading phase needed.
        </p>
        <p style={{ marginTop: 10 }}>
          <strong>Whey protein</strong> — 20–40g per serving. Convenient way to hit daily protein
          targets, especially post-workout.
        </p>
        <p className={styles.veganNote}>
          Vegan? Swap whey for pea or soy protein — comparable leucine content and similar
          muscle-building response in studies.
        </p>
      </div>
    </section>
  );
}
