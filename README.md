# LoadProgress

[![License: MIT](https://img.shields.io/badge/License-MIT-0f766e?style=for-the-badge)](LICENSE)

LoadProgress is a local-first React PWA for strength training. It preserves the original iOS
workout tracker's Liquid Glass aesthetic, automatic personal record detection, volume analytics, and
offline-first gym workflow while running entirely in the browser.


## Features

- Liquid Glass design tokens: translucent surfaces, glass borders, specular highlights, depth
  shadows, rounded system typography, spring button transitions, and reusable CSS module utilities.
- Progressive overload engine: logs weight, reps, RPE, rest time, notes, and failure sets, then
  detects new 1RM, daily volume, and weight-at-reps records with Brzycki estimates.
- Local-first storage: Dexie persists exercises, workout sets, personal records, and backup data in
  IndexedDB with no hosted database or account requirement.
- Offline PWA: Vite PWA service worker caches app shell, scripts, styles, fonts, and images, then
  prompts users when a fresh version is available.
- Responsive training cockpit: mobile bottom tabs, desktop sidebar navigation, workout logging,
  exercise history, records, analytics, and progress trend views.
- Recharts analytics: muscle-group volume breakdowns and exercise-level trend charts for weight,
  reps, and training history.

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

`src/db/database.ts` defines the Dexie database and seeds the 28 default exercises once on first
open.

| Table             | Purpose                                                                                   | Indexed Fields             |
| ----------------- | ----------------------------------------------------------------------------------------- | -------------------------- |
| `exercises`       | Exercise catalog with muscle group, type, equipment, difficulty, icon, and form cues.     | `id`                       |
| `workoutSets`     | Logged sets with exercise, weight, reps, date, RPE, rest time, notes, and failure marker. | `id`, `exerciseId`, `date` |
| `personalRecords` | Generated records for 1RM, volume, and weight-at-reps achievements.                       | `id`, `exerciseId`, `type` |

`src/store/useWorkoutStore.ts` is the Zustand state layer. It loads Dexie records, maintains O(1)
lookup maps for exercises, sets, and records, applies validation rules, and runs PR checks when new
sets are added.

`src/views/` contains the routed React interface. Recharts powers the analytics and progress views,
while CSS modules consume the Liquid Glass tokens from `src/views/styles/Theme.module.css` and
global app foundations from `src/index.css`.

## Progressive Overload Rules

- Reps must be 1-100, weight must be greater than 0 and at most 1000, and future-dated sets are
  rejected.
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
  db/                 Dexie schema, seeding, backup helpers, and database tests
  models/             Exercise, workout set, and personal record TypeScript types
  store/              Zustand workout store and progressive overload tests
  views/              Routed UI views, components, hooks, analytics helpers, and CSS modules
docs/                 Implementation plan, prompts, design notes, and product references
ios-archive/          Archived source from the original native iOS implementation
```

## License

MIT. See [LICENSE](LICENSE).
