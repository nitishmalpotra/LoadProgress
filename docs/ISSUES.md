# Issues — LoadProgress: Recomposition Plan + Tracking

Vertical-slice (tracer-bullet) breakdown of [`docs/PRD.md`](./PRD.md). Each slice cuts
through every layer (schema → store → UI → tests) and is demoable on its own. Listed in
dependency order; "Blocked by" references the issue numbers below.

**Backup rule:** there is no standalone backup issue. Issue 0.5 declares all tables and
stubs the backup module to cover them; every table-introducing slice then **fills in its
own validators + round-trip test in the same change** — baked into each issue's acceptance
criteria.

## Agent execution notes

These issues are written for autonomous (AFK) agents that start cold from a single issue.
To avoid collisions and re-derived context:

- **Merge the two foundations first.** Issues **0** (nav) and **0.5** (data foundation) are
  prefactors with no blockers — build and merge both before fanning out. They remove the
  two biggest sources of contention: shared nav structure and the shared Dexie schema +
  backup module.
- **Schema is declared once, in 0.5.** Feature issues add *logic, UI, validators, and
  tests* against an already-declared table — they must **not** add new Dexie schema
  versions. This prevents six agents fighting over the `version().stores()` block.
- **Global constraints every issue inherits** (restated here because agents may not re-read
  the PRD): offline-first, fully client-side, **no backend, no network calls, no LLM**, no
  new runtime dependency. Persist via Dexie only — never localStorage.
- **Expect rebases on shared files.** `backup.ts`, the Dexie schema, and `Layout` nav are
  touched by multiple issues. Run table issues serially, or accept rebasing if running them
  concurrently.

**Dependency graph:** `0` (nav) and `0.5` (data) are the roots — merge both first.
Then: `{0, 0.5} → 1, 3, 5`; `0 → 9`; `1 → 2`; `{1, 0.5} → 8`; `{2, 0.5} → 7`; `3 → 4`; `5 → 6`.

---

## Issue 0 — Nav restructure: hubs + sub-tab routing (prefactor)

### What to build
Restructure the bottom navigation from five flat tabs to five destinations — **Today,
Plan, Progress, Library, Profile** — where **Plan** and **Progress** are hubs containing
sub-tabs. The existing set-logging becomes **Today**; the existing Trends, Volume, and PRs
surfaces move under **Progress** as sub-tabs; **Library** is unchanged; **Profile** is a
new destination (placeholder until Issue 1). Establish the hub → sub-tab routing pattern so
later features slot in as sub-tabs without re-architecting navigation. This is a prefactor:
no behavior changes to existing logging/records/analytics beyond their new location.

### Acceptance criteria
- [ ] Bottom nav shows exactly five destinations: Today, Plan, Progress, Library, Profile
- [ ] Plan and Progress render as hubs with a routable, deep-linkable sub-tab strip
- [ ] Progress shows Trends / Volume / PRs sub-tabs; **Plan's strip may be empty until
  feature sub-tabs land** (an empty hub is the expected prefactor state — do not invent placeholder sub-tabs)
- [ ] Existing Trends, Volume, and PRs keep unchanged behavior in their new location
- [ ] Existing set-logging is reachable as Today with unchanged behavior
- [ ] Profile destination exists (placeholder content acceptable)
- [ ] Existing view/route tests updated to the new structure

### Blocked by
- None — can start immediately.

---

## Issue 0.5 — Data foundation: schema + backup scaffold (prefactor)

### What to build
Declare **all** new Dexie tables in a single schema up front so feature issues add logic
against already-existing tables instead of restructuring shared files. Tables: `profile`
(single record), `trainingRoutine`, `bodyWeights`, `measurements`, `nutritionLog`,
`cycleState`. In the same change, redesign the backup module **once** into a single clean
schema covering the existing three tables plus these six — export/import wired for every
table, with the new tables permitted to be empty. Per-table validators may start minimal;
each feature issue tightens its own. This is a prefactor: no UI, no feature behavior.

Table shapes (decision-encoding): `bodyWeights { id, date, weight }` ·
`measurements { id, date, waist, hips }` · `nutritionLog { id, date, protein, carbs, fat }` ·
`cycleState { phase, updatedAt }` · `trainingRoutine` = 7 day-slots →
`{ type, exercises: [{ exerciseId, targetSets, targetReps, note }] }` · `profile` single record.

### Acceptance criteria
- [ ] All six new tables are declared in one Dexie schema version; app boots with them empty
- [ ] Backup export/import covers all nine tables (existing three + six new) and round-trips an empty new-table set without loss
- [ ] No feature UI is added; existing behavior is unchanged
- [ ] Feature issues will add logic/validators/tests, **not** new schema versions

### Blocked by
- None — can start immediately (parallel with Issue 0).

---

## Issue 1 — Profile capture + persistence

### What to build
A profile the user fills once and edits later: weight, height, age, sex, goal
(lose/gain/recomposition), activity level, diet style, location, training days + minutes,
and — if female — cycle-tracking opt-in. Persist as a single on-device record. On first
launch with no profile, land on the Profile view (skippable via any nav tap). Establish the
reusable empty state that profile-dependent surfaces show when no profile exists, linking
to this form. Extend backup to include the profile.

### Acceptance criteria
- [ ] User can create and later edit a profile; values persist across reloads
- [ ] First launch with no profile redirects to Profile; any nav tap escapes it
- [ ] A reusable "add your stats" empty state links to the Profile form
- [ ] Units default to metric, reusing the existing unit-system toggle
- [ ] Profile is included in export and restored on import (round-trip test)
- [ ] Profile store covered by tests using the fake-IndexedDB pattern

### Blocked by
- Issue 0 (nav: Profile destination)
- Issue 0.5 (schema: `profile` table + backup scaffold)

---

## Issue 2 — Calories & macros engine (Calories sub-tab)

### What to build
From the profile, compute and display the energy and macro plan in **Plan → Calories**.
Pure calculation, nothing persisted. Show macro targets as progress-bar visuals alongside
the "why a small deficit" and "recomp reality check" copy. Recompute live when the profile
changes; show the Issue 1 empty state when there is no profile.

Calculation spec (decision-encoding):
1. BMR — Mifflin-St Jeor
2. TDEE — BMR × activity multiplier (sedentary 1.2 / light 1.375 / moderate 1.55 / very active 1.725)
3. Calorie target — branch on goal: lose = TDEE − 500 · recomp = TDEE − 250 · gain = TDEE + 200
4. Protein — ~2.0 g/kg bodyweight
5. Fat — ~0.9 g/kg, floored at 25% of calories
6. Carbs — remainder (so grams sum to the target by construction)

### Acceptance criteria
- [ ] Calories sub-tab shows BMR, TDEE, calorie target, and protein/carb/fat in grams and kcal
- [ ] Macro grams sum to the calorie target within ±5%
- [ ] Editing the profile updates every number without a reload
- [ ] Small-deficit explanation and recomp reality-check copy are present
- [ ] No-profile state shows the empty-state CTA
- [ ] Calculation covered by pure-function tests (no DB, injectable `now` where relevant)

### Blocked by
- Issue 1

---

## Issue 3 — Weekly training routine (Training sub-tab)

### What to build
An editable weekly plan in **Plan → Training**: seven day-slots, each with a type
(Push/Pull/Lower/Run/Rest) and an ordered list of library exercises carrying target
sets/reps and an optional note. Ship one generic, editable starter week seeded on first run
from existing library exercises, including the two running sessions (easy Zone 2 +
intervals). The UI makes editability explicit. Persist edits; extend backup.

Routine shape (decision-encoding): 7 day-slots →
`{ type, exercises: [{ exerciseId, targetSets, targetReps, note }] }`.

### Acceptance criteria
- [ ] A seeded starter week is present on first run, built from existing library exercises
- [ ] User can change a day's type and add/remove/reorder exercises with sets/reps/notes
- [ ] Editability is visually explicit (persistent helper line + visible edit/add/delete controls)
- [ ] Edits persist across reloads and round-trip through backup
- [ ] Routine store covered by tests using fake IndexedDB

### Blocked by
- Issue 0 (nav: Plan hub)
- Issue 0.5 (schema: `trainingRoutine` table + backup scaffold)

---

## Issue 4 — Today: plan-aware logging

### What to build
Show today's planned session (derived from the routine by weekday) above the existing
free-form logger on **Today**. Planned exercises render as tappable rows with target
sets/reps; tapping pre-fills the existing Add-Set flow. A planned exercise shows done once
≥1 set is logged for it today; the session shows complete when all planned exercises have
sets. Rest days are labeled with the logger still available. Logging unplanned exercises is
always allowed.

### Acceptance criteria
- [ ] On a training day, Today shows the planned exercises with their targets
- [ ] Tapping a planned exercise pre-fills the set logger
- [ ] A planned exercise is marked done after a set is logged for it today
- [ ] The session shows complete when all planned exercises have sets
- [ ] Rest days are labeled; logger stays usable; unplanned logging works
- [ ] Completion derivation covered by pure-function tests

### Blocked by
- Issue 3

---

## Issue 5 — Body metrics: weight + weekly trend (Body sub-tab)

### What to build
In **Progress → Body**, let the user log bodyweight (one entry per day, upsert) and see a
chart of raw points plus a smoothed trailing-7-calendar-day average that tolerates skipped
days. Framing encourages morning weigh-ins without penalizing gaps. Persist; extend backup.

### Acceptance criteria
- [ ] User can log or overwrite today's weight; entries persist
- [ ] Chart shows raw weights plus a trailing-7-day average line, correct when days are missing
- [ ] Renders correctly with at least two data points
- [ ] Weight data round-trips through backup
- [ ] Rolling average covered by pure-function tests; store covered with fake IndexedDB

### Blocked by
- Issue 0 (nav: Progress hub + Body sub-tab)
- Issue 0.5 (schema: `bodyWeights` table + backup scaffold)

---

## Issue 6 — Measurements (Body sub-tab)

### What to build
Add monthly waist/hips logging to **Progress → Body**, showing each measurement and its
change over time. Persist; extend backup.

### Acceptance criteria
- [ ] User can log waist/hips entries that persist
- [ ] Change-over-time (delta) is shown
- [ ] Measurements round-trip through backup
- [ ] Store covered with fake IndexedDB

### Blocked by
- Issue 5 (Body sub-tab)
- Issue 0.5 (schema: `measurements` table + backup scaffold)

---

## Issue 7 — Nutrition tally + supplements card (Nutrition sub-tab)

### What to build
In **Plan → Nutrition**, let the user tally the day's protein/carbs/fat (one row per day,
upsert) shown as progress bars against the derived targets; calories derived from macros.
Include a ranked high-protein-foods reference card and a small static supplements card
(whey + creatine, with a vegan note on whey). No food database, no per-meal solver.
Persist; extend backup.

### Acceptance criteria
- [ ] User can enter and adjust today's protein/carb/fat totals; they persist
- [ ] Totals show as progress bars against the derived targets; kcal derived (not stored)
- [ ] Protein-source reference card and supplements card present (vegan note on whey)
- [ ] Nutrition data round-trips through backup
- [ ] Store covered with fake IndexedDB

### Blocked by
- Issue 2 (derived macro targets + Plan hub)
- Issue 0.5 (schema: `nutritionLog` table + backup scaffold)

---

## Issue 8 — Cycle sync (Cycle sub-tab)

### What to build
A **Plan → Cycle** sub-tab shown only when the profile is female and cycle tracking is
opted in. Four static phase cards (follicular / ovulatory / luteal / menstrual) with energy,
training-intensity, and nutrition guidance; a manual phase selector persists the current
phase and highlights its card. Guidance is qualitative and must not alter calculated
targets. Persist cycle state; extend backup.

### Acceptance criteria
- [ ] Cycle sub-tab is visible only for female + opted-in profiles; hidden otherwise
- [ ] Four phase cards render with their guidance
- [ ] Manual phase selection persists and highlights the active card
- [ ] Cycle guidance does not change Calories/Nutrition numbers
- [ ] Cycle state round-trips through backup; conditional visibility covered by tests

### Blocked by
- Issue 1 (profile: sex + cycle opt-in) — transitively brings nav Plan hub
- Issue 0.5 (schema: `cycleState` + backup scaffold)

---

## Issue 9 — Guide (static, Plan sub-tab)

### What to build
A **Plan → Guide** sub-tab with static reference content: the weekly check-in protocol, a
decision-trigger table backed by structured `{ condition, action }` data (rendered as a
table; auto-detection is deferred), and a 12-week milestone roadmap.

### Acceptance criteria
- [ ] Guide sub-tab shows the check-in protocol, decision-trigger table, and 12-week roadmap
- [ ] Decision triggers are stored as structured data and rendered as a table
- [ ] Renders within the Plan hub

### Blocked by
- Issue 0

---

_Note: published as a doc, not to the issue tracker — the `ready-for-agent` label and
Matt-Pocock triage vocabulary are not set up in this repo. Run `/setup-matt-pocock-skills`
to enable issue-based publishing, after which these map 1:1 to tracker issues._
