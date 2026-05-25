# Implementation Plan - LoadProgress Web PWA

LoadProgress is a local-first React/TypeScript PWA for strength training. The original web port is complete, and the current product direction is a full mobile-first redesign: light-first visual system, phone-sized app shell on desktop, muscle-first Library, safer detail navigation, and preserved workout logging, analytics, backup, and offline functionality.

---

## User Review Required

> [!IMPORTANT]
> **Key Architecture Decisions (Approved via Interview):**
>
> 1.  **Local-First Persistence**: Data remains completely client-side in browser storage via IndexedDB (using Dexie.js), avoiding any database hosting cost.
> 2.  **Vite + React + TS**: Client-side single page app deployment structure directly at the root of the repository.
> 3.  **Vanilla CSS & CSS Modules**: Fine-tuned control over a custom mobile-first design system without framework limits.
> 4.  **Lucide React**: Vector icon replacement for SF Symbols.
> 5.  **Recharts**: Interactive SVG charts matching Swift Charts.
> 6.  **PWA Configuration**: Service workers handle offline caching, enabling gym usage without internet connection. Displays a bottom glass update toast notification when a new version is fetched.
> 7.  **Mobile-First Layout**: The app should render as a phone-sized experience first. Desktop browsers should center the same mobile app shell instead of becoming a separate sidebar-first dashboard.
> 8.  **Vercel Deployment**: Uses Vercel's hosting with `vercel.json` rewrites supporting HTML5 history routing.

---

## Context Synchronization & Progress Tracking

> [!IMPORTANT]
> **Instructions for Codex (Read before every prompt execution):**
>
> - **Sync Policy**: Before implementing any code, read [IMPLEMENTATION_PLAN.md](file:///Users/nitishmalpotra/Downloads/devDEVdev/portfolio/LoadProgress/docs/IMPLEMENTATION_PLAN.md) and [CODEX_PROMPTS.md](file:///Users/nitishmalpotra/Downloads/devDEVdev/portfolio/LoadProgress/docs/CODEX_PROMPTS.md) to align on what has already been built.
> - **Progress Reporting**: Once you complete a prompt's requirements, update the corresponding checkboxes in **both** files (`[ ]` ➔ `[x]`).
> - **Dynamic Updates**: If any API definitions, state stores, or style patterns change during the coding session, update this file and the prompts file immediately to reflect those changes.

### Refactoring Progress Checklist

- `[x]` **Phase 1: Repository Clean-up & Web Project Initialization** (Prompt 1)
- `[x]` **Phase 2: IndexedDB Data Layer (Dexie.js Schema & Seeding)** (Prompt 2)
- `[x]` **Phase 3: Zustand Store & Progressive Overload Engine (Brzycki 1RM / PR triggers)** (Prompt 3)
- `[x]` **Phase 4: CSS Theme Variables & Glassmorphic Styles** (Prompt 4)
- `[x]` **Phase 5: Responsive Sidebar & HTML5 Routing Navigation** (Prompt 5)
- `[x]` **Phase 6: Workout Logging Tab & Three-Tier Form Sheet** (Prompt 6)
- `[x]` **Phase 7: Background-Safe Rest Timer (Web Worker)** (Prompt 7)
- `[x]` **Phase 8: Volume Analysis & Progress Trend Charts** (Prompt 8)
- `[x]` **Phase 9: Exercise Browser & History Details Sheet** (Prompt 9)
- `[x]` **Phase 10: PWA Offline Caching, Vercel Rewrites & Data Backup Tools** (Prompt 10)
- `[x]` **Phase 11: Open Source Portability, Documentation & Quality Polish** (Prompt 11)
- `[x]` **Phase 12: Modern & Minimalist UI Redesign** (Prompt 12)
- `[x]` **Phase 13: Exercise Library Icons & Seed Data Seeding** (Prompt 13)
- `[x]` **Phase 14: Beginner-Friendly Vercel Deployment Documentation** (Prompt 14)
- `[x]` **Phase 15: Mobile-First Redesign Audit & Product Model**
- `[x]` **Phase 16: Light-First Design System**
- `[x]` **Phase 17: Navigation & Library Information Architecture**
- `[x]` **Phase 18: Redesign Implementation & Regression Verification**

---

## Current Redesign Direction

The next redesign should replace the current dark glassmorphism UI with a mobile-first app model.

### Step 1 Audit Findings

- Current routes are `/`, `/records`, `/analytics`, `/exercises`, `/progress`, and `/styleguide`.
- Library exercise detail is local component state, not a route.
- Baseline fix: Library exercise detail now uses a stable empty-set fallback, so no-history exercises can open without React `Maximum update depth exceeded` loops.
- Exercise detail remains local component state inside `ExercisesTab`, not route-backed. It is currently recoverable through the visible `Close` icon button, which clears `selectedExercise`.
- Route assumption before navigation redesign: `/exercises` owns Library browsing and detail state today; future route-backed detail work should preserve direct return to the Library list/search/filter state.
- Existing automated checks passed: `npm test`, `npm run lint`, and `npm run build`. `npm run format` failed on `README.md` formatting before this documentation update.
- Existing Library icons are generic Lucide icons by exercise string, not muscle-specific anatomical symbols.

### Step 2 Mobile-First Product Model

- Target working width: 360-430px.
- Desktop should center the phone-sized app shell and use the surrounding page as framing only.
- Bottom tabs remain the primary navigation model.
- Every secondary screen needs a visible back action.
- Exercise detail should become route-backed or otherwise recoverable; it should never strand the user in a blank screen.
- Phase 17 decision: Exercise detail is route-backed at `/exercises/:exerciseId`, with an explicit Back to Library action and an invalid-link recovery state.
- Phase 17 navigation: Bottom tabs are the primary navigation at every viewport size, and desktop centers the same phone-sized shell instead of rendering a sidebar.
- Phase 17 Library IA: Library browsing is muscle-first, with muscle-group chips, search, type filtering, and muscle-group icon mappings.
- Screen jobs:
  - `Workout`: today's log, date rail, add-set flow.
  - `Library`: search, filter, and browse exercises by muscle group.
  - `Exercise detail`: cues, equipment, target muscles, stats, and history.
  - `Progress`: focused exercise trend.
  - `Volume`: muscle-group load overview.
  - `Records`: personal bests.

### Step 3 Light-First Design System

- Default palette:
  - Background: `#F7F5F0`
  - Surface: `#FFFFFF`
  - Raised surface: `#F1EFE8`
  - Text: `#171717`
  - Secondary text: `#6B6963`
  - Primary accent: `#176B4D`
- Typography should use system fonts with app-scale headings, not hero-scale page type inside compact screens.
- Use stable spacing tokens: `4`, `8`, `12`, `16`, `20`, and `24`.
- Keep radii mostly between `8px` and `14px`.
- Use compact, scan-friendly cards and rows. Avoid nested cards and decorative glass layers.
- Inputs should be white fields with visible borders.
- Buttons should be primary green filled, secondary outlined, or icon-only for back/close/filter actions.
- Empty, loading, and error states must include explicit recovery paths.
- Muscle groups need consistent colors and muscle-specific icons across Library, detail, Volume, and Progress.
- Dark mode may be added later as a token swap, but it is not the default design baseline.

---

## Proposed Changes

The Vite configuration and codebase files will be generated directly at the root of the workspace.

### [NEW] Web Subproject Layout (Root Level)

#### [NEW] [package.json](file:///Users/nitishmalpotra/Downloads/devDEVdev/portfolio/LoadProgress/package.json)

Define package dependencies including `react`, `react-dom`, `react-router-dom`, `dexie`, `zustand`, `recharts`, `lucide-react`, and devDependencies like `typescript`, `vite`, `vite-plugin-pwa`, `vitest`, `@testing-library/react`.

#### [NEW] [vercel.json](file:///Users/nitishmalpotra/Downloads/devDEVdev/portfolio/LoadProgress/vercel.json)

Redirect configuration mapping source `/(.*)` to destination `/index.html` to avoid Vercel hosting 404 errors on browser page reloads.

#### [NEW] [database.ts](file:///Users/nitishmalpotra/Downloads/devDEVdev/portfolio/LoadProgress/src/db/database.ts)

IndexedDB schemas and tables:

- `exercises`: UUID (primary key), name, type, muscleGroup, secondaryMuscleGroups, icon, difficulty, equipment, description, formCues.
- `workoutSets`: UUID (primary key), exerciseId (indexed), weight, reps, date (indexed), rpe, restTime, notes, isFailureSet.
- `personalRecords`: UUID (primary key), exerciseId (indexed), type (indexed), value, date, reps.

#### [NEW] [useWorkoutStore.ts](file:///Users/nitishmalpotra/Downloads/devDEVdev/portfolio/LoadProgress/src/store/useWorkoutStore.ts)

Zustand global store managing:

- Reactive states for loaded exercises and sets.
- Background PR checking trigger on adding new sets (using the Brzycki formula).
- Automatic cache indexing to mimic iOS caching logic ($O(1)$ lookups).
- Initial database population containing the default exercise library on first launch, with missing default exercises backfilled on existing local databases without duplicating records.

#### [NEW] [Theme.module.css](file:///Users/nitishmalpotra/Downloads/devDEVdev/portfolio/LoadProgress/src/views/styles/Theme.module.css)

Declare design system tokens as CSS Variables (colors, corner-radii, spacing, shadows, glass overlays, animations). Define global utilities for class-based glass styling:

- `.glassCard`
- `.floatingCard`
- `.buttonPrimary`, `.buttonSecondary`, `.buttonGlass`, `.buttonPill`

#### [NEW] Views and Components (`src/views/`)

- `Layout.tsx`: Handle responsive desktop sidebar vs. mobile tab bar views.
- `WorkoutTab.tsx`: Date picker, daily set list, and a floating button trigger for new sets.
- `RecordsTab.tsx`: Personal Records overview and progression charts.
- `AnalyticsTab.tsx`: Horizontal bar chart detailing volume by muscle group.
- `ExercisesTab.tsx`: Filterable list of available exercises.
- `ProgressTab.tsx`: Detailed weight and reps charts for custom exercises.
- `components/AddWorkoutModal.tsx`: Log new exercises with reps, weight, RPE, rest time, and notes.
- `components/RestTimer.tsx`: Circular visual countdown timer with preset values.

#### [NEW] [README.md](file:///Users/nitishmalpotra/Downloads/devDEVdev/portfolio/LoadProgress/README.md)

A comprehensive open-source file including project description, feature summaries, local installation, build, and verification commands, layout design, and structural explanation.

---

## Verification Plan

### Automated Tests

- Run unit tests via Vitest:
  ```bash
  npm run test
  ```
- Verify 1RM calculations (Brzycki formula correctness).
- Verify PR detection logic triggers on set inputs.
- Verify default exercise population succeeds.

### Manual Verification

- Compile static assets and run locally:
  ```bash
  npm run dev
  ```
- Test responsive layouts using Chrome DevTools (switch from Mobile viewports to Desktop).
- Test offline capabilities by toggling network state to "Offline" in browser tools.
- Verify that rest timer, haptic vibrations (`navigator.vibrate`), and backup exports function correctly.
