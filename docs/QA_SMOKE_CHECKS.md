# QA Smoke Test Checklist

**Purpose:** Verify that refactoring and UI updates have not changed core functionality or user-visible behavior.

**Test Environment:**
- iOS 18.0+ (Simulator or Device)
- Xcode 15.0+
- Fresh app install (delete and reinstall)

---

## Pre-Test Setup

- [ ] Delete app from simulator/device
- [ ] Clean build folder (⌘⇧K)
- [ ] Build and install fresh (⌘R)
- [ ] Verify app launches successfully

---

## 1. First Launch & Initialization

### Test Case 1.1: Default Exercise Population

**Steps:**
1. Launch app for the first time
2. Wait for splash screen to complete
3. Navigate to Exercises tab

**Expected Results:**
- [ ] Splash screen displays for ~0.5 seconds
- [ ] App loads without crashes
- [ ] Exactly 28 exercises are pre-loaded
- [ ] Exercises are grouped by muscle group (7 groups)

**Verification Query:**
```swift
// Expected counts by muscle group:
// Chest: 4, Back: 4, Legs: 4, Shoulders: 4
// Arms: 4, Core: 4, Full Body: 4
```

---

## 2. Workout Logging Flow

### Test Case 2.1: Add Weight Training Set

**Steps:**
1. Navigate to Workout tab
2. Verify date defaults to today
3. Tap "Add Workout" button
4. Select "Weight Training"
5. Select "Chest" muscle group
6. Select "Bench Press" exercise
7. Enter Weight: 100
8. Enter Reps: 5
9. Optionally set RPE: 7
10. Tap "Add Workout"

**Expected Results:**
- [ ] Sheet modal presents smoothly
- [ ] Three-tier selection works (Type → Muscle → Exercise)
- [ ] Weight and Reps fields accept numeric input
- [ ] RPE slider functions (1-10 range)
- [ ] Save button is enabled when required fields filled
- [ ] Haptic feedback on save
- [ ] Sheet dismisses on save
- [ ] New workout appears in Workout Log
- [ ] Workout displays: "Bench Press - 100 kg x 5 reps"

**Data Verification:**
- [ ] WorkoutSet saved to UserDefaults
- [ ] Exercise ID correctly linked
- [ ] Date is today

### Test Case 2.2: Add Bodyweight Set

**Steps:**
1. Add Workout
2. Select "Bodyweight"
3. Select "Core"
4. Select "Plank"
5. Enter Reps: 60 (seconds held)
6. Save

**Expected Results:**
- [ ] Weight field hidden for bodyweight exercises
- [ ] Reps field accepts decimal values
- [ ] Set saves successfully
- [ ] Displays without weight: "Plank - 60 reps"

### Test Case 2.3: Input Validation

**Steps:**
1. Add Workout
2. Try to save with empty reps

**Expected Results:**
- [ ] Error alert displays: "Reps must be greater than 0"
- [ ] Save button disabled or validation prevents save

---

## 3. Personal Record Detection

### Test Case 3.1: 1RM PR Detection

**Steps:**
1. Add a workout: Bench Press, 100 kg, 5 reps
2. Add another workout: Bench Press, 110 kg, 3 reps
3. Navigate to Records tab
4. Select "Bench Press" from exercise picker
5. Select "All Time" time range

**Expected Results:**
- [ ] First set triggers PR notification (first 1RM)
- [ ] Second set triggers PR notification (higher 1RM)
- [ ] PR chart shows two data points
- [ ] Chart Y-axis shows 1RM values (calculated via Brzycki)

**Manual Calculation Verification:**
```
Set 1: 100 × (36 / (37 - 5)) = 100 × 1.125 = 112.5 kg
Set 2: 110 × (36 / (37 - 3)) = 110 × 1.06 = 116.4 kg
```

- [ ] Chart values match calculations (±1 kg tolerance)

### Test Case 3.2: Weight-at-Reps PR

**Steps:**
1. Add: Squat, 100 kg, 5 reps
2. Add: Squat, 105 kg, 5 reps (same rep count)
3. Check Records tab

**Expected Results:**
- [ ] PR notification on second set
- [ ] PR dashboard shows improvement
- [ ] Only tracks best weight at 5 reps (not mixing rep ranges)

---

## 4. Volume Analytics

### Test Case 4.1: Volume Calculation

**Steps:**
1. Add 3 sets of Bench Press:
   - Set 1: 80 kg × 10 reps = 800 kg
   - Set 2: 80 kg × 8 reps = 640 kg
   - Set 3: 80 kg × 6 reps = 480 kg
2. Navigate to Analytics tab
3. Select "Week" time range
4. View Chest volume

**Expected Results:**
- [ ] Total Chest volume = 1920 kg
- [ ] Bar chart displays chest volume
- [ ] Tapping Chest opens exercise breakdown
- [ ] Bench Press shows 1920 kg volume

**Data Verification:**
- [ ] Volume = 800 + 640 + 480 = 1920 ✓

---

## 5. Progress Charts

### Test Case 5.1: Weight Progression

**Steps:**
1. Add workouts over multiple days:
   - Day 1: Deadlift, 100 kg, 5 reps
   - Day 2: Deadlift, 105 kg, 5 reps
   - Day 3: Deadlift, 110 kg, 5 reps
2. Navigate to Progress tab
3. Select: Weight Training → Back → Deadlift
4. Select "Week" time range

**Expected Results:**
- [ ] Weight chart shows upward trend
- [ ] Three data points visible
- [ ] X-axis shows dates
- [ ] Y-axis shows weights (100, 105, 110)
- [ ] Line connects points

---

## 6. Exercise Management

### Test Case 6.1: Custom Exercise Creation

**Steps:**
1. Navigate to Exercises tab
2. Tap "Add Exercise" button
3. Enter Name: "Bulgarian Split Squat"
4. Select Type: Weight Training
5. Select Muscle Group: Legs
6. Select Icon: dumbbell
7. Select Difficulty: Intermediate
8. Add Equipment: Dumbbell
9. Save

**Expected Results:**
- [ ] Form accepts all inputs
- [ ] Validation passes (name 2-50 chars)
- [ ] Exercise saves successfully
- [ ] Appears in Exercises list under "Legs"
- [ ] Available in workout logging flow

### Test Case 6.2: Exercise Detail View

**Steps:**
1. Navigate to Exercises tab
2. Tap any exercise (e.g., "Bench Press")

**Expected Results:**
- [ ] Detail view opens
- [ ] Displays: Name, Icon, Type, Difficulty
- [ ] Shows muscle groups and equipment
- [ ] Shows description and form cues
- [ ] Displays workout history (if any sets logged)

---

## 7. Rest Timer

### Test Case 7.1: Timer Functionality

**Steps:**
1. Open Rest Timer (from Add Workout or standalone)
2. Tap "90s" preset
3. Tap Play
4. Wait 10 seconds
5. Tap Pause
6. Tap Reset

**Expected Results:**
- [ ] Timer starts at 90 seconds
- [ ] Counts down smoothly (1 second intervals)
- [ ] Progress ring animates
- [ ] Pause stops countdown
- [ ] Resume continues from paused time
- [ ] Reset returns to initial time
- [ ] Haptic feedback on completion (if run to 0)

---

## 8. Data Persistence

### Test Case 8.1: Data Survives App Restart

**Steps:**
1. Add 3 workouts
2. Close app (swipe up from multitasking)
3. Relaunch app
4. Navigate to Workout tab

**Expected Results:**
- [ ] All 3 workouts still present
- [ ] Data loaded from UserDefaults
- [ ] No data loss

### Test Case 8.2: Workout Deletion

**Steps:**
1. Swipe left on a workout set
2. Tap "Delete"
3. Confirm deletion

**Expected Results:**
- [ ] Confirmation alert appears
- [ ] Workout removed from list
- [ ] Data removed from UserDefaults
- [ ] Cache updated
- [ ] Volume analytics reflect deletion

---

## 9. Accessibility

### Test Case 9.1: Dynamic Type

**Steps:**
1. Go to iOS Settings → Accessibility → Display & Text Size
2. Drag "Larger Text" slider to maximum
3. Return to app

**Expected Results:**
- [ ] All text scales appropriately
- [ ] No text truncation
- [ ] Touch targets remain ≥44×44 pt
- [ ] Layouts reflow correctly

### Test Case 9.2: VoiceOver

**Steps:**
1. Enable VoiceOver (Settings → Accessibility → VoiceOver)
2. Navigate app with swipe gestures

**Expected Results:**
- [ ] All buttons have labels
- [ ] All interactive elements are focusable
- [ ] Labels are descriptive ("Add Workout" not "Button")
- [ ] Charts have accessibility descriptions

### Test Case 9.3: Dark Mode

**Steps:**
1. Toggle Dark Mode (Settings or Control Center)
2. Navigate all screens

**Expected Results:**
- [ ] All screens adapt to Dark Mode
- [ ] Text remains legible (sufficient contrast)
- [ ] Glass materials adjust translucency
- [ ] Shadows remain visible

### Test Case 9.4: Reduce Motion

**Steps:**
1. Enable Reduce Motion (Settings → Accessibility)
2. Navigate app

**Expected Results:**
- [ ] Button press animations disabled or reduced
- [ ] Sheet presentations use fade instead of slide
- [ ] Chart animations disabled
- [ ] No parallax or motion effects

---

## 10. Edge Cases

### Test Case 10.1: Empty States

**Steps:**
1. Fresh install (no workouts logged)
2. Navigate to each tab

**Expected Results:**
- [ ] Workout tab: "No workouts for this date"
- [ ] Records tab: "No personal records yet"
- [ ] Analytics tab: "No volume data"
- [ ] Progress tab: "Select an exercise"
- [ ] Exercises tab: 28 exercises displayed

### Test Case 10.2: Large Dataset

**Steps:**
1. Log 50+ workout sets
2. Navigate app
3. Test performance

**Expected Results:**
- [ ] No lag when scrolling workout list
- [ ] Charts render within 500ms
- [ ] Cache lookups remain O(1)
- [ ] No memory warnings

### Test Case 10.3: Invalid Inputs

**Steps:**
1. Try to enter invalid data:
   - Weight: 0 (should fail)
   - Weight: 1001 (should fail, max 1000)
   - Reps: 0 (should fail)
   - Reps: 101 (should fail, max 100)
   - Exercise name: "A" (should fail, min 2 chars)

**Expected Results:**
- [ ] Each validation error displays appropriate message
- [ ] Save button disabled for invalid inputs
- [ ] No crashes on invalid input

---

## 11. Performance Benchmarks

### Test Case 11.1: Cache Performance

**Requirement:** Exercise lookup must be O(1) < 50ms

**Steps:**
1. Log in console or use performance tests
2. Verify cache hit rate > 95%

**Expected Results:**
- [ ] Exercise lookups use `exerciseCache` (O(1))
- [ ] Workout queries use `workoutSetsByExercise` (O(1))
- [ ] PR queries use `prTypeCache` (O(1))

### Test Case 11.2: Save Operation Speed

**Requirement:** Workout set save < 200ms

**Steps:**
1. Add workout
2. Measure time from tap to sheet dismiss

**Expected Results:**
- [ ] Total operation < 200ms
- [ ] No UI blocking
- [ ] Haptic feedback feels immediate

---

## 12. UI/UX Validation

### Test Case 12.1: Liquid Glass Theme

**Steps:**
1. Navigate all screens
2. Verify visual consistency

**Expected Results:**
- [ ] All cards use glass material (`.ultraThinMaterial`)
- [ ] Corner radii consistent (16pt default)
- [ ] Shadows use predefined configs
- [ ] Borders use white 18% overlay
- [ ] Buttons use theme styles (Primary/Secondary/Glass/Pill)

### Test Case 12.2: Button Interactions

**Steps:**
1. Tap various buttons
2. Observe animations

**Expected Results:**
- [ ] Primary buttons: scale 0.97, spring animation
- [ ] Secondary buttons: scale 0.98, quick animation
- [ ] Glass buttons: scale 0.95
- [ ] Pill buttons: bouncy spring animation
- [ ] Shadows adjust on press

---

## Regression Checklist

After refactoring, verify:

- [ ] No crashes on launch
- [ ] No crashes during workout logging
- [ ] No crashes on tab switching
- [ ] All core features functional
- [ ] Data persistence works
- [ ] PR detection accurate
- [ ] Charts render correctly
- [ ] Accessibility maintained
- [ ] Performance meets benchmarks
- [ ] UI theme consistent

---

## Test Results Template

**Tester:** ___________  
**Date:** ___________  
**Device:** ___________ (e.g., iPhone 15 Pro Simulator)  
**iOS Version:** ___________  

**Overall Result:** ☐ Pass ☐ Fail ☐ Partial

**Failed Tests:**
1. Test Case #: _____ - Issue: __________
2. Test Case #: _____ - Issue: __________

**Blocker Issues:**
- None / List any blockers

**Sign-off:** ___________ (Ready for Production: Yes/No)

---

## Summary

This smoke test suite covers:
- ✅ Core workout logging
- ✅ PR detection accuracy
- ✅ Volume analytics
- ✅ Progress charts
- ✅ Exercise management
- ✅ Data persistence
- ✅ Accessibility
- ✅ Performance
- ✅ UI consistency
- ✅ Edge cases

**Estimated Test Duration:** 45-60 minutes (full manual pass)

**Recommendation:** Run full suite before each release and after major refactorings.
