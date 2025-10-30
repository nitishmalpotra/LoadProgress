# Project Assumptions

**Document Purpose:** Record assumptions made during the refactoring, UI modernization, and documentation process.

**Version:** 1.0  
**Last Updated:** January 2025

---

## 1. Architecture & Design Assumptions

### 1.1 MVVM Pattern Adherence

**Assumption:** The codebase follows a strict MVVM pattern with clear separation of concerns.

**Rationale:**
- Managers (`DataManager`, `PRManager`) act as ViewModels
- Models are value types (`struct`) with no business logic
- Views are pure SwiftUI with no direct data manipulation

**Impact:** Documentation and refactoring maintain this pattern without introducing alternative architectures.

---

### 1.2 Local-First Data Strategy

**Assumption:** The app intentionally avoids cloud sync and is designed for single-device local storage only.

**Evidence:**
- UserDefaults persistence strategy
- No network calls in codebase (except NetworkMonitor for connectivity status)
- No authentication system
- `AnalyticsManager` queues events locally without transmission

**Rationale:** Privacy-first design decision.

**Impact:** Documentation reflects this as a core feature, not a limitation to be fixed.

---

### 1.3 iOS 18.0+ Minimum Target

**Assumption:** The app targets iOS 18.0+ intentionally to leverage modern SwiftUI features.

**Evidence:**
- Use of SwiftUI materials (`.ultraThinMaterial`, etc.)
- Swift Charts framework
- Modern async patterns

**Impact:** Documentation does not suggest lowering the deployment target.

---

## 2. Feature Assumptions

### 2.1 28 Exercises Are Intentional

**Assumption:** The 28 pre-loaded exercises are a curated, balanced library, not an incomplete set.

**Evidence:**
- 4 exercises per muscle group × 7 muscle groups = 28
- Balanced coverage of compound and isolation movements
- Mix of beginner, intermediate, and advanced exercises

**Impact:** Documentation presents 28 as a feature, not a placeholder.

---

### 2.2 Brzycki Formula for 1RM

**Assumption:** The Brzycki formula is the chosen standard for 1RM calculation.

**Formula:** `1RM = weight × 36 / (37 - reps)`

**Alternatives Considered:**
- Epley: `1RM = weight × (1 + 0.0333 × reps)`
- Lombardi: `1RM = weight × reps^0.10`

**Rationale:** Brzycki is most widely accepted in strength training community.

**Impact:** Formula is documented as intentional, not arbitrary.

---

### 2.3 Three PR Types

**Assumption:** The three PR types (1RM, Volume, Weight-at-Reps) are sufficient and intentional.

**Evidence:**
- Cover different training goals (strength, hypertrophy, endurance)
- No "total reps" PR type implemented (though data model supports it)

**Impact:** Documentation does not suggest adding more PR types.

---

## 3. UI/UX Assumptions

### 3.1 Liquid Glass Aesthetic

**Assumption:** The iOS 26 Liquid Glass design system is appropriate for this app's aesthetic.

**Characteristics:**
- Translucent materials
- Floating cards with depth
- Refined shadows
- SF Rounded typography

**Rationale:** Modern, premium feel aligns with target user persona (serious athletes).

**Impact:** All UI updates follow this design language.

---

### 3.2 Tab-Based Navigation

**Assumption:** The 5-tab structure is the optimal navigation pattern.

**Evidence:**
- All features naturally fit into 5 categories
- No nested hierarchies required
- Each tab is self-contained

**Impact:** Documentation does not suggest alternative navigation patterns (e.g., sidebar).

---

### 3.3 Three-Tier Exercise Selection

**Assumption:** The Type → Muscle Group → Exercise selection flow is optimal for usability.

**Rationale:**
- Reduces cognitive load (narrows choices progressively)
- Familiar pattern for fitness apps
- Prevents overwhelming users with 28+ exercises at once

**Impact:** Documentation presents this as intentional UX design, not a workaround.

---

## 4. Data & Persistence Assumptions

### 4.1 UserDefaults Capacity

**Assumption:** UserDefaults is sufficient for the expected data scale (~5000 workout sets max).

**Evidence:**
- UserDefaults recommended limit: ~1 MB
- Typical WorkoutSet JSON: ~200 bytes
- 5000 sets × 200 bytes = 1 MB (at capacity limit)

**Implication:** For datasets beyond 5000 sets, migration to CoreData or SQLite would be required.

**Impact:** Documentation notes this as a known limitation for future enhancement.

---

### 4.2 Cache Expiration (1 Hour)

**Assumption:** A 1-hour cache TTL balances freshness and performance.

**Rationale:**
- Workout sessions typically < 2 hours
- Cache invalidates manually on writes
- 1-hour TTL prevents stale reads in edge cases

**Impact:** No user-facing configuration for cache TTL.

---

### 4.3 Old Workout Cleanup (3 Months)

**Assumption:** Workouts older than 3 months are no longer relevant for analytics.

**Evidence:** `cleanupOldWorkouts()` method in `DataManager` (line 115-130)

**Rationale:**
- Most training programs are 8-12 weeks
- Older data less relevant for progressive overload

**Impact:** Documentation notes this as a configurable threshold for future customization.

---

## 5. Performance Assumptions

### 5.1 O(1) Cache Lookups

**Assumption:** In-memory dictionary caches provide acceptable performance.

**Evidence:**
- `exerciseCache: [UUID: Exercise]`
- `workoutSetsByExercise: [UUID: [WorkoutSet]]`
- `prTypeCache: [UUID: [PRType: PersonalRecord]]`

**Trade-off:** Memory usage increases with data size, but lookups remain constant time.

**Impact:** Performance benchmarks target O(1) operations.

---

### 5.2 Background Threading for PR Detection

**Assumption:** PR detection can safely run on background threads without blocking UI.

**Evidence:** PRManager uses `DispatchQueue(label: "com.loadprogress.pr", qos: .userInitiated)`

**Rationale:** Calculation is CPU-bound but fast (< 100ms).

**Impact:** No perceived lag during workout logging.

---

## 6. Accessibility Assumptions

### 6.1 WCAG 2.1 AA Compliance Target

**Assumption:** WCAG 2.1 AA is the appropriate accessibility standard.

**Evidence:**
- Dynamic Type support
- VoiceOver labels
- 4.5:1 color contrast
- 44×44pt touch targets
- Reduce Motion support

**Impact:** Documentation claims AA compliance, not AAA (which has stricter requirements).

---

### 6.2 Reduce Motion as Fallback

**Assumption:** Users with Reduce Motion enabled prefer instant transitions over fade animations.

**Evidence:** `.reduceMotionSafe()` modifier in Theme.swift

**Rationale:** Complete removal of animation is safer than subtle fade (which could still trigger motion sensitivity).

**Impact:** No configurable animation intensity.

---

## 7. Documentation Assumptions

### 7.1 Reverse-Engineered PRD Accuracy

**Assumption:** The PRD accurately reflects product intent based on observed implementation.

**Caveat:** Without access to original product planning docs, intent is inferred from code.

**Methodology:**
- Analyze data models for feature scope
- Examine UI flows for user journey intent
- Infer goals from feature completeness

**Impact:** PRD uses phrasing like "based on observed implementation" to indicate inference.

---

### 7.2 Design Spec Completeness

**Assumption:** All screens and components have been documented in the Design Spec.

**Evidence:**
- 13 screens/views documented
- 8 reusable components defined
- Complete design token reference

**Caveat:** Minor subviews may not be individually documented if they follow established patterns.

---

## 8. Testing Assumptions

### 8.1 Manual Testing Focus

**Assumption:** Manual smoke testing is prioritized over comprehensive automated UI tests.

**Rationale:**
- Unit tests cover business logic
- UI tests are brittle and slow
- Manual testing validates full user experience

**Impact:** QA_SMOKE_CHECKS.md is comprehensive, but not every step is automated.

---

### 8.2 60% Test Coverage is Acceptable

**Assumption:** The current ~60% test coverage is acceptable for the project's stage.

**Evidence:**
- Core logic (PR calculation, validation) is well-tested
- UI components rely on SwiftUI's inherent reliability

**Rationale:** Increasing to 90%+ would provide diminishing returns at this stage.

**Impact:** Documentation targets 80-90% coverage for future iterations.

---

## 9. Behavioral Invariants

### 9.1 No Functionality Changes

**Assumption:** All refactoring and UI updates maintain 100% functional parity.

**Verification Method:**
- QA smoke tests verify all core flows
- PR detection accuracy unchanged
- Data persistence integrity maintained

**Evidence:** No changes to:
- Data models (Exercise, WorkoutSet, PersonalRecord)
- Public API methods
- Business logic algorithms (Brzycki formula)

---

### 9.2 Data Migration Not Required

**Assumption:** Refactored code reads existing UserDefaults data without migration.

**Evidence:**
- JSON encoding/decoding unchanged
- Storage keys unchanged ("savedExercises", "savedWorkoutSets", etc.)
- Codable conformance maintained

**Impact:** Users upgrading to refactored version experience zero data loss.

---

## 10. Future Enhancement Assumptions

### 10.1 Cloud Sync is Opt-In

**Assumption:** If cloud sync is added, it will be optional, not mandatory.

**Rationale:** Privacy-first users value local-only option.

**Impact:** Documentation frames cloud sync as "future enhancement" not "missing feature".

---

### 10.2 Analytics Backend is Opt-In

**Assumption:** `AnalyticsManager` is designed to send events to a backend only if users opt in.

**Evidence:** Events queue locally with no transmission code.

**Impact:** No telemetry concerns in current implementation.

---

## 11. Ambiguities & Open Questions

### 11.1 Volume Guidelines Source

**Question:** Are the volume guidelines (12-20 sets/week per muscle group) based on specific research?

**Assumption:** Guidelines are based on general strength training consensus (Renaissance Periodization, Stronger by Science).

**Resolution:** Documented as research-based recommendations in PRD Appendix.

---

### 11.2 Metric vs. Imperial Default

**Question:** Should the app default to metric (kg) or imperial (lbs) based on locale?

**Current Implementation:** Defaults to metric.

**Assumption:** Metric is international standard for strength training.

**Impact:** SettingsManager allows manual toggle.

---

### 11.3 Rest Timer Integration

**Question:** Should rest timer auto-start after logging a set?

**Current Implementation:** Manual activation.

**Assumption:** Users prefer manual control over auto-start.

**Impact:** No auto-start feature implemented.

---

## 12. Constraints Acknowledged

### 12.1 No External Dependencies

**Assumption:** Zero-dependency architecture is a design goal, not a temporary state.

**Evidence:**
- Pure SwiftUI implementation
- No CocoaPods, SPM, or Carthage packages
- All charts use native Swift Charts

**Rationale:** Reduces app size, build complexity, and dependency risks.

**Impact:** Future features must be native-first.

---

### 12.2 Single Language (English Only)

**Assumption:** English is the only supported language for initial release.

**Evidence:** No localization files (`Localizable.strings`).

**Rationale:** Strings are externalized for future localization readiness.

**Impact:** Documentation notes localization as future enhancement.

---

## 13. Risk Mitigation

### 13.1 Data Loss Prevention

**Assumption:** Rollback logic in save operations prevents data loss.

**Evidence:**
- `addExercise` rolls back cache on save failure (line 60-62)
- `addWorkoutSet` rolls back on failure (line 92-93)

**Impact:** Documented as production-ready data safety.

---

### 13.2 Performance Degradation Beyond 5000 Sets

**Assumption:** Performance degrades gracefully beyond 5000 workout sets, not catastrophically.

**Rationale:**
- O(1) lookups maintained
- Memory pressure increases linearly
- iOS will evict caches if needed

**Impact:** Documentation warns users to export/backup data regularly.

---

## 14. Decision Log

| Decision | Date | Rationale |
|----------|------|-----------|
| Use UserDefaults instead of CoreData | Initial | Simplicity, no relational queries needed |
| Brzycki formula for 1RM | Initial | Industry standard |
| iOS 18.0+ minimum target | Initial | Leverage modern SwiftUI |
| Liquid Glass design system | Jan 2025 | Modernize UI, align with iOS 26 |
| Local-only analytics | Initial | Privacy-first approach |
| 28 exercise library | Initial | Balanced, curated set |

---

## 15. Validation Checklist

- [ ] All assumptions documented
- [ ] Rationale provided for each
- [ ] Impact on project clearly stated
- [ ] Ambiguities acknowledged
- [ ] Constraints documented
- [ ] Decision log maintained

---

## 16. Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | Jan 2025 | Initial assumptions document created during refactoring |

---

## Conclusion

This document records assumptions made during the refactoring and documentation process. It serves as a reference for understanding design decisions and provides context for future enhancements.

**Next Steps:**
- Validate assumptions with stakeholders
- Update as new decisions are made
- Review quarterly for outdated assumptions
