import styles from '@/views/styles/Guide.module.css';

const CHECKIN_STEPS = [
  'Log any weight readings from the week and note the average.',
  'Record waist and hips if it has been roughly a month since the last measurement.',
  'Review training: did you complete all planned sessions? If not, what got in the way?',
  'Review nutrition: did you hit protein targets on most days?',
  'Rate your energy and recovery this week (1–5). Low scores point at sleep or calories.',
  'Run through the decision-trigger table below — make one adjustment at a time.',
  'Set one focus for next week and note it somewhere visible.',
];

const DECISION_TRIGGERS: Array<{ condition: string; action: string }> = [
  {
    condition: 'Scale up >0.5 kg/week for 2+ weeks, body fat visibly increasing',
    action: 'Cut 200 kcal from carbs',
  },
  {
    condition: 'Scale stalled 2–3 weeks, strength declining',
    action: 'Add 100–150 kcal (carbs on training days first)',
  },
  {
    condition: 'Scale stalled 2–3 weeks, strength holding or improving',
    action: 'Stay the course — recomp is working; scale will lag',
  },
  {
    condition: 'Protein consistently below target most days',
    action: 'Prioritise protein first; add a shake if whole-food sources fall short',
  },
  {
    condition: 'Energy consistently low throughout the day',
    action: 'Check sleep quality; try adding 100 kcal of carbs on training days',
  },
  {
    condition: 'Strength plateaued 3+ consecutive weeks',
    action: 'Deload: drop volume ~40% for one week, then return and push',
  },
  {
    condition: 'Waist/hips unchanged for 4 weeks, scale also flat',
    action: 'Audit nutrition logging accuracy; consider a 1-week maintenance break',
  },
  {
    condition: 'Missing 2+ planned sessions per week',
    action: 'Reduce the routine to what you will actually do — consistency beats perfect',
  },
];

const ROADMAP: Array<{ weeks: string; title: string; focus: string[] }> = [
  {
    weeks: 'Weeks 1–4',
    title: 'Foundation',
    focus: [
      'Establish training consistency — show up, not hero weight.',
      'Learn your true maintenance via scale trends; week 1 noise is high.',
      'Hit protein target most days before fine-tuning carbs or fat.',
      'Take baseline measurements (waist, hips) on day 1.',
    ],
  },
  {
    weeks: 'Weeks 5–8',
    title: 'Calibration',
    focus: [
      'First real trend data — apply decision triggers as needed.',
      'Progressive overload should start showing in your training logs.',
      'Scale should be flat or very slightly down; measurements may already shift.',
      'If nothing has changed, audit one variable at a time.',
    ],
  },
  {
    weeks: 'Weeks 9–12',
    title: 'Optimisation',
    focus: [
      'Adjust calories or macros based on 8 weeks of real trend data.',
      'Consider a 1-week maintenance break to reset hunger hormones.',
      'Compare week 12 measurements to week 1 baseline — the scale may lie; these will not.',
      'Strength gains are most visible now; use them as the primary progress signal.',
    ],
  },
];

export function GuideTab() {
  return (
    <section aria-labelledby="guide-title" className={styles.page}>
      <header className={styles.header}>
        <p className={styles.eyebrow}>Plan</p>
        <h1 id="guide-title">Guide</h1>
        <p>Weekly check-in playbook, adjustment triggers, and a 12-week roadmap.</p>
      </header>

      <div className={styles.card}>
        <h2>Weekly check-in</h2>
        <p className={styles.cardSub}>Run through these each week — Sunday works well.</p>
        <ol className={styles.stepList}>
          {CHECKIN_STEPS.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </div>

      <div className={styles.card}>
        <h2>Decision triggers</h2>
        <p className={styles.cardSub}>
          Make one change at a time, then wait two weeks before changing again.
          Auto-detection from your weight trend is deferred — check manually for now.
        </p>
        <div className={styles.tableWrap}>
          <table className={styles.triggerTable}>
            <thead>
              <tr>
                <th>If this happens…</th>
                <th>Do this</th>
              </tr>
            </thead>
            <tbody>
              {DECISION_TRIGGERS.map(({ condition, action }) => (
                <tr key={condition}>
                  <td>{condition}</td>
                  <td>{action}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className={styles.card}>
        <h2>12-week roadmap</h2>
        <div className={styles.roadmap}>
          {ROADMAP.map(({ weeks, title, focus }) => (
            <div className={styles.phase} key={weeks}>
              <div className={styles.phaseLabel}>
                <span className={styles.phaseWeeks}>{weeks}</span>
                <span className={styles.phaseTitle}>{title}</span>
              </div>
              <ul className={styles.focusList}>
                {focus.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
