# LoadProgress Web Refactoring - Codex Prompts

This is a dynamic, live tracking document containing structured, production-grade prompts designed for the Codex Mac app. These prompts guide Codex to incrementally rewrite the LoadProgress iOS app into a premium, local-first React PWA directly at the root of the repository.

---

## 🔄 Dynamic Context Synchronization Rules

> [!IMPORTANT]
> **Instructions for Codex (Read before every prompt execution):**
>
> 1.  **Read Context First**: Before writing any code, always read [IMPLEMENTATION_PLAN.md](file:///Users/nitishmalpotra/Downloads/devDEVdev/portfolio/LoadProgress/docs/IMPLEMENTATION_PLAN.md) and [CODEX_PROMPTS.md](file:///Users/nitishmalpotra/Downloads/devDEVdev/portfolio/LoadProgress/docs/CODEX_PROMPTS.md).
> 2.  **Maintain Single Source of Truth**: At the end of every prompt execution, update the status checkboxes in both the [IMPLEMENTATION_PLAN.md](file:///Users/nitishmalpotra/Downloads/devDEVdev/portfolio/LoadProgress/docs/IMPLEMENTATION_PLAN.md) and [CODEX_PROMPTS.md](file:///Users/nitishmalpotra/Downloads/devDEVdev/portfolio/LoadProgress/docs/CODEX_PROMPTS.md) documents to mark completed modules.
> 3.  **Sync Modifications**: If during implementation the user changes a design decision or feature detail, immediately update the relevant section of both files to reflect the change before proceeding.

---

## 🛠 Refactoring Roadmap & Prompts

- `[x]` **Prompt 1**: Repository Clean-up & Web Project Initialization
- `[x]` **Prompt 2**: IndexedDB Data Layer (Dexie.js)
- `[x]` **Prompt 3**: Zustand Store & Progressive Overload Engine (1RM / PR Calculations)
- `[x]` **Prompt 4**: Liquid Glass Design Tokens & Component Styles (Vanilla CSS)
- `[x]` **Prompt 5**: Responsive Layout & History Navigation Architecture
- `[x]` **Prompt 6**: Workout Log & Add Workout Form Views (Validation & Caching)
- `[x]` **Prompt 7**: Background-Safe Rest Timer Component
- `[x]` **Prompt 8**: Analytics & Progress Charts (Recharts)
- `[x]` **Prompt 9**: Exercises Library & History Detail Views
- `[x]` **Prompt 10**: PWA Caching & Vercel Configuration Setup
- `[x]` **Prompt 11**: Open Source Portability, Documentation & Quality Polish
- `[x]` **Prompt 12**: Modern & Minimalist UI Redesign
- `[x]` **Prompt 13**: Exercise Library Icons & Seed Data Seeding
- `[x]` **Prompt 14**: Beginner-Friendly Vercel Deployment Documentation

---

### Prompt 1: Repository Clean-up & Web Project Initialization

```markdown
Read the implementation plan [docs/IMPLEMENTATION_PLAN.md] and the prompts file [docs/CODEX_PROMPTS.md] to check project context.

Prepare the repository for a pure web PWA portfolio representation. Move all existing iOS directories (`LoadProgress`, `LoadProgressTests`, `LoadProgressUITests`, and `LoadProgress.xcodeproj`) into a new archived folder `ios-archive/` at the root. Then, initialize a Vite + React + TypeScript + Vanilla CSS project directly at the root of the repository. Configure Vitest for unit testing.

#### 📦 Tech Stack & Dependencies:

1. React 18+ with TypeScript.
2. Build Tool: Vite (configured directly at root).
3. Database: `dexie` and `dexie-react-hooks`.
4. State: `zustand`.
5. Icons: `lucide-react`.
6. Charts: `recharts`.
7. Tests: `vitest`, `@testing-library/react`, and `@testing-library/jest-dom`.
8. PWA: `vite-plugin-pwa`.
9. Router: `react-router-dom` (to support HTML5 History routing).

#### 🧪 Tests to Run:

- Run a basic Vitest environment sanity test: `npm run test` (assert that 1 + 1 === 2 and that a dummy React component renders correctly).

#### 🛡 Validations to Run:

- Verify that `package.json` does not include TailwindCSS or other CSS utility libraries (Vanilla CSS is required for the Liquid Glass specification).
- Check that the TS configuration resolves absolute path aliases (e.g., `@/*` maps to `src/*`).

#### ✅ Acceptance Criteria:

- Running `npm run dev` starts the local web server without TS or bundler errors.
- `index.html` loads a simple placeholder layout demonstrating that Lucide React icons render.
- The TS build (`npm run build`) runs and creates static build outputs.
- Update [docs/IMPLEMENTATION_PLAN.md] and [docs/CODEX_PROMPTS.md] marking Prompt 1 as complete [x].
```

---

### Prompt 2: IndexedDB Data Layer (Dexie.js)

```markdown
Read the implementation plan [docs/IMPLEMENTATION_PLAN.md] and the prompts file [docs/CODEX_PROMPTS.md] to check project context.

Implement a local-first asynchronous persistence layer using Dexie.js in `src/db/database.ts` and `src/models/` to replace the iOS UserDefaults architecture.

#### 📋 Database Schema Configuration:

1. `exercises` table: `id` (primary key, uuid), `name`, `type`, `muscleGroup`, `secondaryMuscleGroups`, `icon`, `difficulty`, `equipment`, `description`, `formCues`.
2. `workoutSets` table: `id` (primary key, uuid), `exerciseId` (indexed), `weight`, `reps`, `date` (indexed), `rpe`, `restTime`, `notes`, `isFailureSet`.
3. `personalRecords` table: `id` (primary key, uuid), `exerciseId` (indexed), `type` (indexed), `value`, `date`, `reps`.

On database creation, pre-populate the `exercises` table with the 28 default exercises mapped exactly from the iOS `populateDefaultExercises()` method in `DataManager.swift`.

#### 🧪 Tests to Run:

- Write unit tests using an in-memory IndexedDB mock (or Dexie in-memory config) verifying:
  - Default database initialization pre-populates exactly 28 exercises.
  - Successfully adding a custom exercise.
  - Querying workout sets by date returns correct records.

#### 🛡 Validations to Run:

- Ensure all exercise IDs and set IDs use RFC 4122 compliant UUID strings.
- Verify that default database seeding runs once and does not duplicate entries on page refresh.

#### ✅ Acceptance Criteria:

- Dexie database initializes, opens, and seeds default exercises on the first load of the app.
- Database operations run asynchronously without blocking the UI thread.
- Update [docs/IMPLEMENTATION_PLAN.md] and [docs/CODEX_PROMPTS.md] marking Prompt 2 as complete [x].
```

---

### Prompt 3: Zustand Store & Progressive Overload Engine

```markdown
Read the implementation plan [docs/IMPLEMENTATION_PLAN.md] and the prompts file [docs/CODEX_PROMPTS.md] to check project context.

Implement a reactive, state-managed progressive overload engine in `src/store/useWorkoutStore.ts` using Zustand, replacing the business logic of `DataManager.swift` and `PRManager.swift`.

#### 🧠 Store Requirements:

1. **State & CRUD Actions**:
   - Add/delete/edit workout sets, updating the IndexedDB database.
   - Query exercises, tracking active lists with in-memory caching.
2. **PR Engine**:
   - Implement the Brzycki 1RM formula: `1RM = weight * (36 / (37 - reps))`.
   - On adding a new workout set, asynchronously check if it establishes a new PR. Detect 3 PR types: `1RM`, `Volume` (calculated via VolumeMetrics for the exercise on that day), and `Weight-at-Reps`.
   - Add records to the `personalRecords` table if records are broken.
3. **Caching**:
   - Maintain O(1) in-memory dictionaries mapping `exercises` by ID, `workoutSets` by exercise ID, and `personalRecords` by exercise ID + type.

#### 🧪 Tests to Run:

- Write comprehensive unit tests for the Zustand store:
  - Test `calculateOneRepMax` against Brzycki expectations (e.g., 100kg for 5 reps outputs 112.5kg).
  - Assert that logging a set heavier than the current 1RM triggers a new PR record.
  - Assert that logging a set does not trigger a PR if it's weaker than the existing PR.
  - Test deletion of sets: verify that caches rebuild correctly.

#### 🛡 Validations to Run:

- Enforce strict input checks inside the store: do not save weights > 1000, reps > 100, or dates in the future.
- Verify that cache updates run incrementally to guarantee O(1) performance instead of rebuilding the entire dictionary on every single add.

#### ✅ Acceptance Criteria:

- Action hooks update the store state React-responsively, mirroring Dexie database contents.
- Automatic PR checks detect and persist records reliably.
- Update [docs/IMPLEMENTATION_PLAN.md] and [docs/CODEX_PROMPTS.md] marking Prompt 3 as complete [x].
```

---

### Prompt 4: Liquid Glass Design Tokens & Component Styles

```markdown
Read the implementation plan [docs/IMPLEMENTATION_PLAN.md] and the prompts file [docs/CODEX_PROMPTS.md] to check project context.

Translate the "iOS 26 Liquid Glass" style guide from `Theme.swift` into modular Vanilla CSS styles in `src/views/styles/Theme.module.css` and base setups in `src/index.css`.

#### 🎨 CSS Token Requirements:

1. **Theme Variables**:
   - Colors: Accent background, Teal secondary, Indigo tertiary, system success (green), warning (orange), error (red).
   - Glassmorphism: `glassOverlay` (`rgba(255, 255, 255, 0.08)`), `glassBorder` (`rgba(255, 255, 255, 0.18)`), `glassHighlight` (`rgba(255, 255, 255, 0.25)`).
   - Shadows: Light, Medium, Heavy/Floating using HSL configurations.
   - Fonts: System rounded (`system-ui`, `-apple-system`, `BlinkMacSystemFont`, etc.) matching SF Rounded.
2. **Glass Layout Modifiers**:
   - `.glassCard`: Thin material with `backdrop-filter: blur(12px) saturate(180%)`, border gradient specular highlights, and medium shadows.
   - `.floatingCard`: Heavy shadows, thicker radius, for hero components.
3. **Buttons**:
   - `.buttonPrimary`, `.buttonSecondary`, `.buttonGlass`, `.buttonPill` matching scale transformations (e.g., `scale(0.97)` on click) and spring transitions (`cubic-bezier(0.34, 1.56, 0.64, 1)`).

#### 🧪 Tests to Run:

- Implement a style guide display component `/styleguide` displaying each button type, cards, and input styles. Write a React Testing Library test to verify all theme class names are correctly bound.

#### 🛡 Validations to Run:

- Ensure contrast ratio meets WCAG 2.1 AA (at least 4.5:1 for standard text, 7:1 for headers).
- Confirm that backdrop filters do not glitch or compound when stacking cards up to 3 layers deep.

#### ✅ Acceptance Criteria:

- Glass components render beautifully with smooth backdrop blurs and borders in modern desktop and mobile browsers.
- Buttons respond to active presses with bouncy transitions.
- Update [docs/IMPLEMENTATION_PLAN.md] and [docs/CODEX_PROMPTS.md] marking Prompt 4 as complete [x].
```

---

### Prompt 5: Responsive Layout & History Navigation Architecture

```markdown
Read the implementation plan [docs/IMPLEMENTATION_PLAN.md] and the prompts file [docs/CODEX_PROMPTS.md] to check project context.

Build the responsive layout container in `src/views/Layout.tsx` and configure the routing environment using `react-router-dom` to support HTML5 History routing.

#### 📐 Layout Specifications:

- **Mobile breakpoint (< 768px)**:
  - Render a fixed bottom tab bar with glassmorphic backing (`backdrop-filter`).
  - Navigation Paths: `/` (Workout Log), `/records` (PRs), `/analytics` (Volume), `/exercises` (Library), `/progress` (Trends).
  - Single-column scrolling content area.
- **Desktop breakpoint (>= 768px)**:
  - Render a sidebar navigation drawer containing the same tabs.
  - Multi-column grid containers for main dashboards.

#### 🧪 Tests to Run:

- Write unit tests that simulate layout rendering at a viewport width of `375px` (assert bottom tab navigation is visible) and `1200px` (assert sidebar navigation is visible).
- Verify that clicking navigation elements updates the browser history path.

#### 🛡 Validations to Run:

- Ensure safe area spacing is applied to bottom tab bar items to prevent overlap with native iOS home indicators.
- Confirm keyboard focus trapping and aria-labels are set up for accessibility on drawer transitions.

#### ✅ Acceptance Criteria:

- Layout switches smoothly on window resize without causing page overflow or component layout breaks.
- All views successfully route within the layout template.
- Update [docs/IMPLEMENTATION_PLAN.md] and [docs/CODEX_PROMPTS.md] marking Prompt 5 as complete [x].
```

---

### Prompt 6: Workout Log & Add Workout Form Views

```markdown
Read the implementation plan [docs/IMPLEMENTATION_PLAN.md] and the prompts file [docs/CODEX_PROMPTS.md] to check project context.

Develop the main workout logging view in `src/views/WorkoutTab.tsx` and the logging wizard modal in `src/views/components/AddWorkoutModal.tsx`.

#### 📝 Feature Implementation Details:

1. **WorkoutTab**:
   - Date selector (horizontal calendar day cards, swipeable or wheel-style scrollable).
   - Display a list of sets logged for the chosen date (grouped by exercise, listing weight, reps, RPE, notes, and failure markers).
   - Floating Action Button (FAB) at bottom-right corner triggering `AddWorkoutModal`.
2. **AddWorkoutModal (Sheet Detent)**:
   - Three-Tier selection flow: Choose exercise type (Weight Training / Bodyweight) → Select Muscle Group → Select Exercise.
   - Input fields: Weight (with metric/imperial toggle configuration from store), Reps, RPE (1-10 slider), Notes, and a Failure Set Toggle.

#### 🧪 Tests to Run:

- Write tests utilizing React Testing Library:
  - Log a workout set: Fill the form, tap "Add", check that the store save function is invoked.
  - Test input validations: Submit empty reps or negative weight, verify helper error labels render.
  - Confirm empty state message: "No workouts for this date" renders when date has no sets.

#### 🛡 Validations to Run:

- Enforce strict validation: reps must be positive integers, weights must be positive numbers.
- Prevent future date selections inside the picker.

#### ✅ Acceptance Criteria:

- Users can log a workout set in under 3 taps once exercise is selected.
- AddWorkoutModal slides up smoothly with liquid glass design styling.
- Update [docs/IMPLEMENTATION_PLAN.md] and [docs/CODEX_PROMPTS.md] marking Prompt 6 as complete [x].
```

---

### Prompt 7: Background-Safe Rest Timer Component

```markdown
Read the implementation plan [docs/IMPLEMENTATION_PLAN.md] and the prompts file [docs/CODEX_PROMPTS.md] to check project context.

Build the interactive countdown rest timer in `src/views/components/RestTimer.tsx`.

#### ⏱ Rest Timer Requirements:

1. **Visual Interface**:
   - Circular visual progress ring (SVG based) that decrements smoothly.
   - Text display showing `MM:SS`.
   - Play/Pause/Reset controller buttons.
   - Presets row: 30s, 60s, 90s, 2m, 3m, 5m chips.
2. **Background Accuracy**:
   - Standard browser timers (`setInterval`) throttle to 1s intervals when the tab is backgrounded.
   - Implement a lightweight inline Web Worker or use timestamps (`Date.now()`) delta comparisons to prevent time drifting when the screen locks or tabs switch.
3. **Vibrations**:
   - Trigger a pulse sequence on completion (`navigator.vibrate([100, 50, 100])`) if supported.

#### 🧪 Tests to Run:

- Test the countdown timer state updates:
  - Simulate setting a timer to 10s, trigger play, advance Vitest timers by 5s, assert that the remaining display is `00:05`.
  - Verify callback execution on completion.

#### 🛡 Validations to Run:

- Verify that backgrounding the page (minimizing tab/switching app) and returning after some seconds correctly jumps to the current elapsed timestamp instead of pausing in background.

#### ✅ Acceptance Criteria:

- Rest timer behaves accurately to the second.
- Visual rings animate smoothly using CSS transition variables.
- Update [docs/IMPLEMENTATION_PLAN.md] and [docs/CODEX_PROMPTS.md] marking Prompt 7 as complete [x].
```

---

### Prompt 8: Analytics & Progress Charts

```markdown
Read the implementation plan [docs/IMPLEMENTATION_PLAN.md] and the prompts file [docs/CODEX_PROMPTS.md] to check project context.

Implement the data analytics views using Recharts in `src/views/AnalyticsTab.tsx` and `src/views/ProgressTab.tsx` to visualize progressive overload progress.

#### 📈 Chart Specifications:

1. **AnalyticsTab (Volume Breakdown)**:
   - Time filter options: Week, Month, 3 Months.
   - Horizontal bar chart calculating total volume ($sets \times reps \times weight$) per major muscle group.
   - Muscle groups must be color-coded matching the branding theme.
2. **ProgressTab (Progress trends over time)**:
   - Dropdown selectors to drill down: Exercise Type → Muscle Group → Specific Exercise.
   - Double line chart tracking: Weight trend (primary axis) and Reps trend (secondary axis) plotted over date.
   - Points on the line chart should render details in custom styled glassmorphic tooltips on hover.

#### 🧪 Tests to Run:

- Write tests confirming calculations:
  - Given a mock set array, verify volume metrics calculations yield matching group totals.
  - Assert that when no exercise data is recorded, the charts display a clean empty state: "Add logs to view progress metrics".

#### 🛡 Validations to Run:

- Ensure line charts handle scale calculations gracefully (e.g., if weight ranges from 100kg to 105kg, chart bounds auto-focus on 95-110kg instead of starting from 0).

#### ✅ Acceptance Criteria:

- Volume breakdowns and trend charts adapt responsively to resizing.
- Charts animate in with smooth transitions on initial load.
- Update [docs/IMPLEMENTATION_PLAN.md] and [docs/CODEX_PROMPTS.md] marking Prompt 8 as complete [x].
```

---

### Prompt 9: Exercises Library & History Detail Views

```markdown
Read the implementation plan [docs/IMPLEMENTATION_PLAN.md] and the prompts file [docs/CODEX_PROMPTS.md] to check project context.

Build the exercise browser in `src/views/ExercisesTab.tsx` and the exercise history overlay/detail sheet in `src/views/ExerciseDetail.tsx`.

#### 📚 Exercises View Details:

1. **ExercisesTab**:
   - Filter bar: Weight training vs. Bodyweight toggle.
   - Search input (queries exercise titles/muscle groups).
   - Grouped list of exercises by muscle group (Chest, Back, Legs, etc.), showing exercise name, equipment badge, and difficulty.
   - A button to add a new custom exercise.
2. **ExerciseDetail**:
   - Displays description, form cues list, and requirements (equipment, target muscle).
   - Key Stats: Total sets performed, estimated 1RM, lifetime volume, and performance frequency.
   - Log history list: Vertical scrolling list of all logged sets for this exercise, grouped by performance date.

#### 🧪 Tests to Run:

- Verify search functionality: Inputting "Bench" filters out squats and curls.
- Assert details view correctly aggregates average weight and total repetitions.

#### 🛡 Validations to Run:

- Verify that custom-created exercises successfully populate the database and immediately appear in the selection dropdown inside the `AddWorkoutModal`.

#### ✅ Acceptance Criteria:

- Interface is highly readable, conforming to rounded typography standards.
- History tables scroll smoothly without layout lag.
- Update [docs/IMPLEMENTATION_PLAN.md] and [docs/CODEX_PROMPTS.md] marking Prompt 9 as complete [x].
```

---

### Prompt 10: PWA Caching & Vercel Configuration Setup

```markdown
Read the implementation plan [docs/IMPLEMENTATION_PLAN.md] and the prompts file [docs/CODEX_PROMPTS.md] to check project context.

Configure the production configurations for deployment, including service workers and routing redirect rules for Vercel.

#### 📦 PWA & Deployment Requirements:

1. **Service Worker (Vite PWA)**:
   - Configure a `registerType: 'prompt'` rule inside `vite.config.ts`.
   - Build a custom React hook `useServiceWorkerUpdate` that catches the `onNeedRefresh` trigger.
   - Build a glassmorphic toast notification component that slides in from the bottom asking the user to update when a new build is fetched, executing the `updateServiceWorker(true)` reload callback on tap.
   - Configure static asset caching rules.
2. **Vercel Routing Rewrites**:
   - Create a `vercel.json` file in the root folder of the project.
   - Define a routing rewrite rule: `{"source": "/(.*)", "destination": "/index.html"}` to ensure that client-side React routes (like `/records`, `/progress`) don't yield 404 errors when reloaded by visitors.
3. **Backup & Restore Tooling**:
   - Implement JSON file export handler: Serializes the Dexie database tables (`exercises`, `workoutSets`, `personalRecords`) into a downloadable JSON file.
   - Implement JSON file import handler: Parses a file uploaded via `FileReader`, validates fields, performs conflict resolution, and saves them to IndexedDB.

#### 🧪 Tests to Run:

- Mock the file upload event and verify database import logic successfully decodes a valid JSON schema, populating the store state.
- Assert backup export outputs valid JSON structures.

#### 🛡 Validations to Run:

- Validate schemas on import: discard malformed JSON files and alert the user without crashing the app.
- Check service worker status in Chrome application tools during local builds.

#### ✅ Acceptance Criteria:

- Users can export their logs and restore them on clean device browsers.
- App continues loading and functions without active internet connection.
- Update [docs/IMPLEMENTATION_PLAN.md] and [docs/CODEX_PROMPTS.md] marking Prompt 10 as complete [x].
```

---

### Prompt 11: Open Source Portability, Documentation & Quality Polish

```markdown
Read the implementation plan [docs/IMPLEMENTATION_PLAN.md] and the prompts file [docs/CODEX_PROMPTS.md] to check project context.

Complete the open-source packaging for the public GitHub repository. Set up standard code quality linters, code formatting tools, contributor guides, and a highly polished, professional portfolio `README.md` at the root.

#### 📋 File Implementations & Configurations:

1. **Root README.md**:
   - Project Name, Description, and clean high-resolution badges (MIT License, Vercel Deploy Status, PWA Status).
   - "Live Demo" button linking to your Vercel URL.
   - Features section detailing the Liquid Glass UI tokens and the progressive overload rules.
   - Step-by-step developer instructions: cloning, local installation (`npm install`), starting the server (`npm run dev`), running unit tests (`npm run test`), and building for production (`npm run build`).
   - Core Architecture overview detailing Dexie database tables, Zustand stores, and Recharts.
2. **CONTRIBUTING.md**:
   - Simple guidelines detailing how to format code, create feature branches, run tests before submitting pull requests, and use conventional commits.
3. **Formatting & Quality (Prettier & ESLint)**:
   - Configure Prettier (`.prettierrc`) and ESLint (`.eslintrc.json`) for code formatting.
   - Add verification commands to package scripts: `npm run lint` and `npm run format`.

#### 🧪 Tests to Run:

- Run the full test suite one last time: `npm run test`.
- Run the verification linter: `npm run lint`.
- Verify the build compiles error-free: `npm run build`.

#### 🛡 Validations to Run:

- Check that all development instructions in `README.md` run correctly out of the box when executing commands on a clean directory.
- Confirm there are no absolute file paths or hardcoded developer configurations in the repo.

#### ✅ Acceptance Criteria:

- The project is fully complete and self-documenting. A developer can clone and run it within 2 minutes.
- All code format and lint checks pass cleanly.
- Update [docs/IMPLEMENTATION_PLAN.md] and [docs/CODEX_PROMPTS.md] marking Prompt 11 as complete [x].
```

---

### Prompt 12: Modern & Minimalist UI Redesign

```markdown
Read the implementation plan [docs/IMPLEMENTATION_PLAN.md] and prompts list [docs/CODEX_PROMPTS.md] to check project context.

Refactor the styling system to make the UI look exceptionally modern, minimalist, and premium. Focus on cleaning up custom properties, glassmorphism tokens, and layout spacing.

#### 🎨 Target Styles (Modify src/index.css and src/views/styles/Theme.module.css):

1. **Simplified Color Palette**:
   - Dark Mode: Deep dark blue-gray background (`hsl(222 47% 8%)`), lighter surface cards, and a primary accent color of soft indigo (`hsl(243 75% 63%)`) or vibrant teal (`hsl(174 72% 44%)`).
   - High Contrast Typography: Use clean font spacing, proper font-weights, and lighter text colors (`hsl(210 40% 98%)`) for titles.
2. **Refined Glassmorphism**:
   - Make card borders thinner (`border: 1px solid rgba(255, 255, 255, 0.08)`).
   - Use high-saturation blurs (`backdrop-filter: blur(16px) saturate(180%)`).
   - Use deep, soft shadows to create a natural hierarchy and depth overlay.
3. **Buttons & Form Inputs**:
   - Simplify inputs to have a solid dark backdrop with a thin glass border that animates to a brighter focus outline on active focus.
   - Clean up spacing inside the logging sheets, modals, and date picker, ensuring items do not look crowded.
4. **Layout Alignment**:
   - Ensure the layout is centered, responsive, and has comfortable padding (at least 24px) around content containers on all views.

#### 🧪 Tests to Run:

- Run `npm run test` to verify style guide rendering and layout snapshot integrity.

#### 🛡 Validations to Run:

- Open Chrome DevTools and verify that no margins or paddings cause horizontal scrollbars (overflow-x).
- Check contrast ratios for secondary labels to ensure they meet accessibility targets (at least 4.5:1).

#### ✅ Acceptance Criteria:

- The UI feels premium, clean, and modern. Card elements stack and space out elegantly.
- Buttons respond with smooth transformations.
- Update [docs/IMPLEMENTATION_PLAN.md] and [docs/CODEX_PROMPTS.md] marking Prompt 12 as complete [x].
```

---

### Prompt 13: Exercise Library Icons & Seed Data Seeding

```markdown
Read the implementation plan [docs/IMPLEMENTATION_PLAN.md] and prompts list [docs/CODEX_PROMPTS.md] to check project context.

Populate the exercise library with all common exercises, complete with appropriate Lucide React icons, while maintaining the ability to add custom exercises.

#### 📋 Coding Tasks:

1. **Create an Icon Utility**:
   - Create a helper component `getExerciseIcon(iconName: string)` or a mapping configuration in `src/views/components/ExerciseIcon.tsx`.
   - Map exercise icon strings (e.g. 'benchPress', 'squat', 'deadlift', 'bicepCurl', 'plank', 'custom') to semantic Lucide icons:
     - Chest exercises (e.g., benchPress, pushUp, dips) ➔ `Dumbbell` or `Flame`
     - Back exercises (e.g., pullUp, deadlift, bentOverRow) ➔ `Activity` or `ArrowUpCircle`
     - Leg exercises (e.g., squat, romanianDeadlift, legPress) ➔ `Zap` (for lower-body power)
     - Shoulder exercises (e.g., overheadPress, lateralRaise) ➔ `Target`
     - Arm exercises (e.g., bicepCurl, tricepExtension) ➔ `Flame`
     - Core exercises (e.g., plank, legRaise) ➔ `Shield`
     - Full Body exercises (e.g., burpees, turkishGetUp) ➔ `Sparkles` or `Heart`
     - Fallbacks/Custom exercises ➔ `Dumbbell` or `Award`
2. **Update Seeding Data**:
   - Open `src/db/database.ts` and inspect the `DEFAULT_EXERCISES` list. Expand it to ensure all common movements are seeded with matching string identifiers for the `icon` field.
3. **Render Icons in Views**:
   - Open `src/views/ExercisesTab.tsx`. Update the exercise card element to render the Lucide icon to the left of the exercise name.
   - Open `src/views/ExerciseDetail.tsx`. Display the exercise icon in the header next to the title.

#### 🧪 Tests to Run:

- Run `npm run test` and verify that the exercise list component renders icons alongside names.

#### 🛡 Validations to Run:

- Adding a custom exercise from the UI defaults to the generic `Dumbbell` icon without causing rendering errors.

#### ✅ Acceptance Criteria:

- The exercise list renders a distinct Lucide icon for each category.
- Seeding data initializes without duplicating records.
- Update [docs/IMPLEMENTATION_PLAN.md] and [docs/CODEX_PROMPTS.md] marking Prompt 13 as complete [x].
```

---

### Prompt 14: Beginner-Friendly Vercel Deployment Documentation

```markdown
Read the implementation plan [docs/IMPLEMENTATION_PLAN.md] and prompts list [docs/CODEX_PROMPTS.md] to check project context.

Create a highly polished, beginner-friendly deployment guide in `docs/DEPLOYMENT.md` explaining how to host the LoadProgress Web PWA on Vercel.

#### 📋 Guide Requirements (Create docs/DEPLOYMENT.md):

1. **Introduction**:
   - Briefly explain what Vercel is and why it's perfect for hosting our local-first Web PWA (it is static, fast, and free).
2. **Prerequisites**:
   - A free Vercel account.
   - Git installed, and the project pushed to a public GitHub repository.
3. **Step-by-Step Vercel Dashboard Deployment**:
   - Detailed instructions on importing the Git repository via the Vercel UI.
   - Detail the required build parameters:
     - Framework Preset: `Other` or `Vite` (Vercel auto-detects Vite).
     - Build Command: `npm run build`
     - Output Directory: `dist`
     - Install Command: `npm install`
   - Point out that no environment variables are needed since data is stored locally in IndexedDB.
4. **Vercel CLI Deployment (Alternative)**:
   - Provide command examples: installing CLI (`npm install -g vercel`), logging in (`vercel login`), running deployment commands (`vercel`), and deploying to production (`vercel --prod`).
5. **Route Rewrite Importance**:
   - Explain why `vercel.json` is critical. Point out that it redirects all navigation traffic back to `index.html` so that client-side HTML5 history routing works without producing 404 errors.
6. **Verifying PWA on the Deployed URL**:
   - Instruct how to check PWA installability (the install icon in the browser address bar) and verifying that the app loads offline once visited.
7. **Deploy Status Badge**:
   - Add instructions on how to add a Vercel Deploy Badge (build status) to the root `README.md`.

#### 🧪 Tests to Run:

- Test that the build script runs successfully locally: `npm run build`.

#### 🛡 Validations to Run:

- Check that the language used in the guide is accessible and beginner-friendly, avoiding unnecessary technical jargon where possible.

#### ✅ Acceptance Criteria:

- A new file `docs/DEPLOYMENT.md` is successfully created.
- The instructions are clear, complete, and formatted in standard, readable markdown.
- Update [docs/IMPLEMENTATION_PLAN.md] and [docs/CODEX_PROMPTS.md] marking Prompt 14 as complete [x].
```
