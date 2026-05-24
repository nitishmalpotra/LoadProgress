import { Activity, Dumbbell, Palette, Trophy } from 'lucide-react';
import { Link, Route, Routes } from 'react-router-dom';
import { StyleGuide } from '@/views/StyleGuide';

function Home() {
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
        <Link className="styleguide-link" to="/styleguide">
          <Palette aria-hidden="true" size={18} />
          Style guide
        </Link>
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

function App() {
  return (
    <Routes>
      <Route element={<Home />} path="/" />
      <Route element={<StyleGuide />} path="/styleguide" />
    </Routes>
  );
}

export default App;
