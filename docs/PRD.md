# PRD — LoadProgress: Recomposition Plan + Tracking

**Status:** Ready for build · **Owner:** Nitish / Nimisha · **Last updated:** June 20, 2026

> Supersedes the standalone "Body Recomposition Tracker" v1.0 draft. Where the draft
> assumed a Claude Artifact, `window.storage`, a Hevy dependency, an in-app LLM, or a
> food/meal database, those are dropped — the app is built into the existing
> offline-first LoadProgress PWA (React 19 + Vite + Dexie + Zustand + recharts, on Vercel),
> single-user, greenfield (no migrations, no backward-compat).

---

## Problem Statement

I'm pursuing body recomposition — losing fat and gaining muscle at the same time. To do
it I have to juggle a training plan, calorie and macro targets, what to eat, supplements,
where I am in my menstrual cycle, and my week-to-week progress. Today that's smeared
across a notes app, a workout logger, a calorie app, and a spreadsheet. Nothing knows
about anything else: my plan lives in one place and my logging in another, and neither is
tailored to my actual stats, diet, or physiology. I already log my workouts in
LoadProgress — but it only remembers what I *did*, never tells me what I *should* do, and
holds none of the nutrition, cycle, or body-trend context that decides whether the plan is
working.

## Solution

LoadProgress becomes the single place that holds both the **plan** ("what to do") and the
**tracking** ("what I did"), personalized from a profile I fill once. From my stats, goal,
activity, diet, and sex it calculates my calorie and macro targets; it holds an editable
weekly training plan that feeds directly into the set-logging I already use; it lets me
tally macros and log my weight and measurements with a smoothed weekly trend; and — if I
opt in — it adapts guidance to my cycle phase. Reference material (protein sources,
supplements, a check-in playbook, a 12-week roadmap) sits alongside the live numbers.
Everything works offline, with no second app to cross-reference and no account to create.

## User Stories

1. As a recomp user, I want to enter my stats (weight, height, age, sex) once, so that the
   app can personalize every number for me.
2. As a recomp user, I want to set my goal (lose fat / gain muscle / recomposition), so
   that my calorie target reflects what I'm actually trying to do.
3. As a recomp user, I want to set my activity level, so that my TDEE isn't a generic guess.
4. As a recomp user, I want to declare my diet style (e.g. semi-vegetarian) and location,
   so that food and supplement guidance fits how and where I eat.
5. As a recomp user, I want to edit my profile later, so that when my weight changes every
   downstream target updates automatically.
6. As a new user with no profile yet, I want the app to drop me on the profile form on
   first launch, so that I know where to start — without being trapped behind a wall.
7. As a user who hasn't filled my profile, I want to still log workouts and browse the
   library, so that the app is useful before I commit my stats.
8. As a user opening a profile-dependent screen with no profile, I want a clear prompt to
   add my stats, so that I understand why it's empty and how to fix it.
9. As a recomp user, I want to see my BMR, TDEE, and recommended calorie target, so that I
   know my daily energy budget.
10. As a recomp user, I want my protein/carb/fat targets in grams and calories, so that I
    have concrete macro goals.
11. As a recomp user, I want my macro targets shown as progress bars, so that I can read
    them at a glance.
12. As a recomp user, I want an explanation of why recomposition uses a small deficit, so
    that I don't crash-diet.
13. As a recomp user, I want a "reality check" that the scale may move slowly, so that I
    judge progress by measurements and strength instead of panicking.
14. As a lifter, I want an editable weekly training plan (Push / Pull / Lower / Run / Rest
    per day), so that I know what each day's session is.
15. As a lifter, I want the app to ship with a sensible starter plan, so that I'm not
    staring at an empty week on day one.
16. As a lifter, I want the starter plan to obviously signal it's editable, so that I don't
    assume it's locked.
17. As a lifter, I want to add, remove, and reassign exercises on any day, so that the plan
    becomes mine.
18. As a lifter, I want each planned exercise to show target sets and reps and a short note,
    so that I know how to perform it.
19. As a lifter, I want my running sessions (an easy Zone 2 run and an interval session) in
    the plan, so that cardio is scheduled, not an afterthought.
20. As a lifter, I want today's planned session shown on the Today tab, so that I open the
    app and immediately know what to train.
21. As a lifter, I want to tap a planned exercise and have it pre-fill the set logger, so
    that logging against the plan is fast.
22. As a lifter, I want to still log exercises that aren't in today's plan, so that swaps
    and improvisation are never blocked.
23. As a lifter, I want a planned exercise to show as done once I've logged a set for it,
    so that I can see session progress without extra taps.
24. As a lifter, I want rest days clearly marked, so that I don't think I'm missing a
    workout.
25. As a recomp user, I want to tally my daily protein, carbs, and fat against my targets,
    so that I can see if I hit them — without searching a food database.
26. As a recomp user, I want my calories derived from my macro tally, so that I don't have
    to maintain a separate number.
27. As a semi-vegetarian, I want a ranked list of high-protein foods I can actually eat, so
    that hitting protein is easier.
28. As a recomp user, I want honest framing that protein is hard as a semi-veg and whey can
    bridge the gap, so that I have a realistic plan.
29. As a recomp user, I want a short, evidence-based supplements note (whey, creatine), so
    that I'm not sold a stack I don't need.
30. As a vegan user, I want the whey note to flag that it doesn't apply to me, so that the
    advice stays relevant.
31. As a female user, I want to opt into cycle tracking, so that the app can adapt guidance
    to my hormonal phases.
32. As a male user or someone opted out, I want the cycle section hidden entirely, so that
    the app isn't cluttered with irrelevant content.
33. As a female user, I want guidance per cycle phase (follicular, ovulatory, luteal,
    menstrual) on energy, training intensity, and nutrition, so that I work with my body.
34. As a female user, I want to manually set my current phase, so that the relevant phase
    card is highlighted — using my external cycle app as the source of truth.
35. As a female user, I want cycle guidance to nudge ("favor more carbs in luteal") rather
    than rewrite my calculated targets, so that the advice never contradicts my numbers.
36. As a recomp user, I want to log my bodyweight, so that I can track the trend over time.
37. As a recomp user, I want a smoothed weekly average of my weight that tolerates skipped
    days, so that daily noise doesn't mislead me.
38. As a recomp user, I want to log my weight whenever I can (ideally mornings) without
    being penalized for gaps, so that tracking stays low-effort.
39. As a recomp user, I want to log waist and hips monthly and see the change over time, so
    that I track recomposition the scale can't show.
40. As a recomp user, I want a weekly check-in protocol, so that I review progress
    consistently.
41. As a recomp user, I want a table of "if this happens, do this" adjustments (e.g. scale
    stalled 2–3 weeks → cut 100 kcal), so that I adjust on triggers, not guesswork.
42. As a recomp user, I want a 12-week milestone roadmap, so that I know what each phase
    should focus on.
43. As a user, I want all my data (workouts, profile, plan, weight, measurements, nutrition,
    cycle) to persist on my device, so that nothing is lost between sessions.
44. As a user, I want to export all my data to a file and re-import it, so that I can back
    up and restore without losing any of it.
45. As a user, I want the app to keep working offline, so that I can use it at the gym with
    no signal.
46. As a user, I want navigation that stays usable on mobile, so that adding all these
    features doesn't bury everything in an unusable tab bar.
47. As a metric user, I want weights in kg and lengths in cm by default, with the existing
    unit toggle available, so that the app matches how I measure.

## Implementation Decisions

**Platform & scope**
- Built into the existing LoadProgress codebase; offline-first, fully client-side, no
  backend, no LLM, no external-app dependency. Greenfield single-user data: schemas
  designed once, no migration or backward-compat layers.

**Navigation / IA** — five bottom-nav destinations, two of them hubs with sub-tabs:
- **Today** · **Plan** (Calories · Training · Nutrition · Cycle · Guide) · **Progress**
  (Trends · Volume · PRs · Body) · **Library** · **Profile**.
- This absorbs the draft's 6 tabs and the app's existing 5 without an 11-tab bar.

**Profile**
- Stored as a single-record table (fixed id), loaded into the app's state. Optional and
  non-blocking: no onboarding wall. First launch with no profile redirects to the Profile
  view (one-line redirect, skippable). Profile-dependent surfaces render an empty state
  linking to the form — onboarding happens at the point of need.
- The `location` and `training days/minutes` fields are captured for future use but are
  **not consumed by v1 logic** (there are no localized meals, and the activity multiplier
  is keyed off the stated activity level, not days/week). Kept so the data exists when a
  consuming feature lands; agents should not wire calculations to them in v1.

**Derived, never stored** — BMR, TDEE, calorie target, macro *targets*, kcal, rolling
averages, and workout-completion status are computed on read. Only profile, true
time-series, and direct user input are persisted.

**Calorie/macro engine** (decision-encoding spec):
1. BMR — Mifflin-St Jeor.
2. TDEE — BMR × activity multiplier (sedentary 1.2 / light 1.375 / moderate 1.55 / very
   active 1.725), keyed off the stated activity level, not a days/week heuristic.
3. Calorie target branches on goal: lose = TDEE − 500 · recomp = TDEE − 250 · gain = TDEE + 200.
4. Protein — by bodyweight, ~2.0 g/kg (not % of calories).
5. Fat — ~0.9 g/kg, floored at 25% of calories (hormonal-health floor).
6. Carbs — remainder, so macro grams sum to the calorie target by construction.

**Training & Today**
- New table holds the weekly routine: 7 day-slots, each `{ type, exercises:
  [{ exerciseId, targetSets, targetReps, note }] }`. One generic, editable starter week
  seeded on first populate from existing library exercises. UI explicitly signals
  editability (persistent helper line + visible edit/add/delete controls).
- Today augments the existing free-form set-logger with a derived "today's plan" section
  (today's weekday → routine slot). Tapping a planned exercise pre-fills the existing
  Add-Set flow. Unplanned logging is always allowed.
- Workout completion is derived from logged sets (exercise done = ≥1 set today; session
  done = all planned exercises have sets). No completion table. The "trainer diff" /
  Hevy-import panel from the draft is cut.

**Nutrition**
- New per-day table `{ date, protein, carbs, fat }` (grams), upsert one row per day; kcal
  derived. UI = three editable macro totals shown as progress bars against the derived
  targets. No food database, no per-meal solver.
- Supplements fold in here as a small static card (whey + creatine only; vegan note on
  whey). The standalone Supplements tab and D3/magnesium/omega-3 cards are dropped.

**Cycle**
- New small state `{ phase, updatedAt }`. Section is conditionally visible (female + cycle
  opt-in). Four static phase cards + a manual phase selector that highlights the active
  card. Qualitative guidance only — never recomputes targets. No phase prediction.

**Body metrics** — two date-indexed tables: `bodyWeights { date, weight }` (upsert one per
day; trailing 7-calendar-day average computed on read; raw + smoothed line chart) and
`measurements { date, waist, hips }` (monthly; current + delta). Rendered as a "Body"
sub-tab in the Progress hub. The draft's suggestion to merge the two is rejected — Dexie
has no per-key cost and the cadences differ.

**Guide** — static content from the dissolved "Track & Adjust" tab: weekly check-in
protocol, a 12-week roadmap, and a decision-trigger table stored as structured
`{ condition, action }` data (rendered as a table; auto-detection deferred).

**Backup** — the backup module is redesigned once as a single clean schema covering all
tables (existing three + six new), with explicit per-table export/import and lightweight
validators (valid-date + finite-number) at the import trust boundary. No generic
table-dump; no backward-compat layer. Rule: any new table is added to backup in the same
change that introduces it.

**Units** — default metric (kg/cm); reuse the store's existing unit-system toggle; no new
conversions until needed.

**Build sequence** — Profile + Calories → Today + Training → Body metrics → Nutrition +
supplements → Cycle + Guide.

## Testing Decisions

A good test asserts **external behavior**, not implementation details: given inputs (a
profile, a set of logged sets, a list of weight entries), assert the observable output
(targets, completion status, the smoothed average) — never the shape of internal caches.
Three seams, all reusing the app's existing test patterns (no new seam types):

1. **Pure calculation module** — a new deterministic, DB-free, React-free module with an
   injectable `now`, holding `calculateTargets(profile)`, the trailing-7-day weekly
   average, and session-completion derivation. Tested directly with plain inputs/outputs.
   *Prior art:* the existing analytics-metrics pure-function tests.
2. **The store** — a parallel store created via the existing injectable-database pattern,
   covering persistence, upsert-by-day, and derived state for profile, routine,
   bodyWeights, measurements, nutritionLog, and cycleState. Tested with `fake-indexeddb`.
   *Prior art:* the existing workout-store tests. (Decision: parallel store, not an
   extension of the workout store, to keep each store focused — same seam either way.)
3. **Backup round-trip** — the existing backup module, extended for the new tables, tested
   as export → import producing identical data with no loss, plus validator rejection of
   corrupt rows. *Prior art:* the existing backup tests.

The pure math (seam 1) is deliberately kept out of IndexedDB-backed tests — that
separation is why analytics metrics already live apart from the store. View/component
behavior (empty states, conditional cycle visibility, plan-prefills-logger) is covered by
the existing testing-library + jsdom approach where it adds signal.

## Out of Scope

- Food/calorie database, barcode or photo logging, per-meal macro solving.
- In-app LLM / "thinking engine" of any provider.
- Dependency on any external app (Hevy, MyFitnessPal).
- Medical diagnosis or prescription — educational guidance only.
- Multi-user, social, or public sharing.
- Automated cycle-phase prediction (external app + manual input only).
- Wearable / health-platform integrations.
- Profile-aware / auto-generated training routines — the starter week is generic and
  hand-edited (considered and deliberately deferred during design).
- Localized / region-specific meal generation — the `location` field is captured but not
  consumed in v1.

## Further Notes

- **Deferred, not dropped (phase 2):** weight-trigger auto-detection (the Guide's
  decision-triggers reading the rolling average to light up a fired row — needs 3+ weeks of
  data and carries a mild trust edge), and multi-device access via a hosted backend.
- **Persistent stats/plan-summary header** (from the original draft) is **consciously
  dropped** in v1 — core stats live on the Profile tab and targets live on the Calories
  sub-tab, so a global header is redundant. Reinstate later if a glanceable summary proves
  useful.
- **Running warm-up/cool-down structure** (easy Zone 2 + intervals) is left as
  implementation-level content for the routine; it's not a separate requirement.
- The existing `docs/IMPLEMENTATION_PLAN.md`, `CODEX_PROMPTS.md`, and `ANALYSIS_RESULTS.md`
  describe the current pre-recomp app and will drift; treat this PRD as the forward source
  of truth.
- Tracker note: the `ready-for-agent` label and Matt-Pocock triage vocabulary are not set
  up in this repo, so this PRD is published as a doc rather than a tracker issue. Run
  `/setup-matt-pocock-skills` to enable issue-based publishing.
