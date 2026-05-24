import { Activity, Dumbbell, Trophy } from 'lucide-react';

function App() {
  return (
    <main className="app-shell">
      <section className="hero-panel" aria-labelledby="page-title">
        <div className="brand-mark" aria-hidden="true">
          <Dumbbell size={32} strokeWidth={2.4} />
        </div>
        <div>
          <p className="eyebrow">Local-first PWA</p>
          <h1 id="page-title">LoadProgress</h1>
          <p className="lede">
            A React portfolio rebuild for progressive overload tracking, offline workouts,
            personal records, and training analytics.
          </p>
        </div>
        <div className="metric-grid" aria-label="Feature preview">
          <article>
            <Activity aria-hidden="true" />
            <span>Workout logging</span>
          </article>
          <article>
            <Trophy aria-hidden="true" />
            <span>Personal records</span>
          </article>
        </div>
      </section>
    </main>
  );
}

export default App;
