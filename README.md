# LoadProgress

[![License: MIT](https://img.shields.io/badge/License-MIT-0f766e?style=for-the-badge)](LICENSE)

LoadProgress is a local-first React PWA for strength training. It runs entirely in the browser,
stores workout data locally with IndexedDB, detects personal records automatically, and provides
volume and progress analytics for strength training.

The product direction is now a mobile-first app experience: desktop browsers should present the
same phone-sized app shell centered on the page, with a light-first interface, bottom-tab
navigation, muscle-first exercise browsing, and recoverable detail screens.

## Features

- Mobile-first app shell: the primary interface is designed around a phone-sized viewport, even when
  opened in a desktop browser.
- Light-first design system: warm neutral backgrounds, white surfaces, charcoal text, restrained
  borders, and a deep green primary action color replace the previous dark glassmorphism baseline.
- Progressive overload engine: logs weight, reps, RPE, rest time, notes, and failure sets, then
  detects new 1RM, daily volume, and weight-at-reps records with Brzycki estimates.
- Local-first storage: Dexie persists exercises, workout sets, personal records, and backup data in
  IndexedDB with no hosted database or account requirement.
- Offline PWA: Vite PWA service worker caches app shell, scripts, styles, fonts, and images, then
  prompts users when a fresh version is available.
- Muscle-first exercise library: exercises are grouped and browsed by target muscle, with
  muscle-specific iconography planned for the Library and detail views.
- Recoverable navigation: secondary screens such as exercise detail should have visible back actions
  and avoid blank-screen failure states.
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
while CSS modules consume app tokens from `src/views/styles/Theme.module.css` and global foundations
from `src/index.css`.

Current routes are `/`, `/records`, `/analytics`, `/exercises`, `/progress`, and `/styleguide`.
Exercise detail currently opens from Library state rather than a route; the redesign should make
that flow recoverable with an explicit back path.

## Redesign Direction

- Treat desktop as a framed mobile app, not a separate sidebar-first product.
- Keep bottom navigation as the primary app model.
- Make `Workout`, `Library`, `Progress`, `Volume`, and `Records` focused single-purpose screens.
- Make Library muscle-first with compact exercise rows/cards and clear detail access.
- Replace generic exercise symbols with consistent muscle-specific icons.
- Design loading, empty, and error states as first-class screens.
- Keep dark mode optional and token-driven later; it is no longer the default design baseline.

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
