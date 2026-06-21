# LoadProgress

[![License: MIT](https://img.shields.io/badge/License-MIT-0f766e?style=for-the-badge)](LICENSE)

LoadProgress is a local-first React PWA for strength training and body recomposition. It runs
entirely in the browser, stores everything locally with IndexedDB, detects personal records
automatically, and turns logged workouts into volume, progress, and body-composition analytics.

The interface is a mobile-first app shell: desktop browsers render the same phone-sized app
centered on the page, with bottom-tab navigation, a light-first design system, and muscle-first
exercise browsing.

## Features

- **Today** — plan-aware workout logging. Pick a date, add sets (weight, reps, RPE, notes, failure
  marker), and quick-log the day's planned routine.
- **Plan** — recomposition planning: calorie and macro targets from your profile, a weekly training
  routine, daily nutrition logging, optional cycle tracking, and a guide.
- **Progress** — exercise trend charts, muscle-group volume analytics, the personal-records board,
  and body metrics (weight and measurements over time).
- **Library** — muscle-first exercise catalog with search, custom exercises, and recoverable detail
  screens (per-exercise route with a visible back path).
- **Profile** — body stats, goal, activity level, diet style, units, plus one-tap JSON backup and
  restore.
- **Progressive overload engine** — detects new 1RM, daily volume, weight-at-reps, and total-reps
  records using Brzycki estimates.
- **Offline PWA** — the service worker caches the app shell, scripts, styles, and fonts, then
  prompts when a fresh version is available.

## Developer Setup

Prerequisites: Node.js 20 or newer and npm.

```bash
git clone https://github.com/nitishmalpotra/LoadProgress.git
cd LoadProgress
npm install
npm run dev
```

The dev server prints a local URL, usually `http://localhost:5173`.

Run the project checks before opening a pull request:

```bash
npm run test
npm run lint
npm run format
npm run build
```

## Core Architecture

`src/db/database.ts` defines the Dexie database (schema v2) and seeds the 51 default exercises once
on first open.

| Table             | Purpose                                                            | Indexed Fields             |
| ----------------- | ------------------------------------------------------------------ | -------------------------- |
| `exercises`       | Exercise catalog: muscle group, type, equipment, difficulty, cues. | `id`                       |
| `workoutSets`     | Logged sets: weight, reps, date, RPE, notes, failure marker.       | `id`, `exerciseId`, `date` |
| `personalRecords` | Generated 1RM, volume, weight-at-reps, and total-reps records.     | `id`, `exerciseId`, `type` |
| `profile`         | User profile: stats, goal, activity, diet style, units.            | `id`                       |
| `trainingRoutine` | Weekly training routine and its exercises.                         | `id`                       |
| `bodyWeights`     | Body-weight log over time.                                         | `id`, `date`               |
| `measurements`    | Body measurements (waist, hips, …) over time.                      | `id`, `date`               |
| `nutritionLog`    | Daily protein, carbs, and fat entries.                             | `id`, `date`               |
| `cycleState`      | Optional menstrual-cycle phase tracking.                           | `id`                       |

State lives in Zustand stores under `src/store/`:

- `useWorkoutStore` — exercises, sets, and records with O(1) lookup maps, validation, and the
  progressive-overload engine.
- `useProfileStore`, `useRoutineStore`, `useBodyWeightStore`, `useMeasurementStore`,
  `useNutritionStore`, `useCycleStore` — the recomposition-tracking slices.

`src/db/backup.ts` exports and validates the full JSON backup. `src/views/` holds the routed UI;
Recharts powers the analytics views, and CSS modules consume tokens from
`src/views/styles/Theme.module.css` and global foundations from `src/index.css`. Routes are
lazy-loaded, so Recharts and the secondary screens stay out of the initial bundle and the Today
view loads fast.

Routes (bottom tabs: **Today · Plan · Progress · Library · Profile**):

- `/` — Today (workout logging)
- `/plan` — calories, training, nutrition, cycle, guide
- `/progress` — trends, volume, records, body
- `/exercises` and `/exercises/:exerciseId` — Library and exercise detail
- `/profile` — profile and backup/restore
- `/styleguide` — design-system reference

## Progressive Overload Rules

- Reps must be 1-100, weight (when given) must be greater than 0 and at most 1000, and future-dated
  sets are rejected.
- Estimated 1RM uses the Brzycki formula: `weight * (36 / (37 - reps))`.
- Daily volume is `sum(weight * reps)` for the exercise on the selected date.
- Weight-at-reps records are tracked separately per exercise and rep count.
- Store caches update incrementally after writes, with full rebuilds reserved for initial load and
  destructive set deletions.

## Quality Tooling

- ESLint checks TypeScript, React hooks, and Vite React refresh boundaries.
- Prettier enforces the shared code and documentation format.
- Vitest covers database seeding, store logic, charts, layout behavior, backup tools, and key UI
  workflows.
- TypeScript and Vite compile the production bundle with PWA assets.

## Project Structure

```text
src/
  db/       Dexie schema, seeding, backup helpers, and tests
  models/   TypeScript types for exercises, sets, records, and profile data
  store/    Zustand stores (workout engine plus recomposition slices)
  utils/    Macro/calorie targets and plan-completion helpers
  views/    Routed UI views, components, hooks, analytics helpers, and CSS modules
docs/       PRD, implementation plan, issues, deployment, and design notes
```

## License

MIT. See [LICENSE](LICENSE).
</content>
