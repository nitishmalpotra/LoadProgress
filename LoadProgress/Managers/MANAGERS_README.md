# Managers

Business logic layer implementing the ViewModel pattern for LoadProgress.

---

## Overview

Managers serve as the intermediary between the UI layer (Views) and the data layer (Models). They encapsulate business logic, data processing, state management, and coordinate complex operations. Following the MVVM pattern, managers act as ViewModels that Views observe for state changes.

**Key Responsibilities:**
- Business logic execution
- Data persistence and retrieval
- Cache management and optimization
- State management with reactive updates
- Cross-module coordination via NotificationCenter

---

## Architecture Pattern

```
┌─────────────────────┐
│   SwiftUI Views     │  @EnvironmentObject
└──────────┬──────────┘
           │ Observes
           ▼
┌─────────────────────┐
│     Managers        │  ObservableObject
│  (ViewModels)       │  @Published properties
└──────────┬──────────┘
           │ Manages
           ▼
┌─────────────────────┐
│      Models         │  Codable structs
└─────────────────────┘
```

---

## Managers

### DataManager.swift

**Location:** `LoadProgress/Managers/DataManager.swift`

**Purpose:** Core data management for exercises and workout sets

**Responsibilities:**
- CRUD operations for exercises and workout sets
- Data persistence via UserDefaults + JSON encoding
- Multi-level caching (by ID, by exercise, by date)
- Cache expiration and validation (1-hour TTL)
- Default exercise population (28 pre-loaded exercises)
- Data cleanup (removes records older than 3 months)
- Backup and recovery coordination

**Key Methods:**

```swift
// Exercise Management
func addExercise(_ exercise: Exercise)
func getExercise(by id: UUID) -> Exercise?

// Workout Set Management
func addWorkoutSet(_ set: WorkoutSet)
func deleteWorkoutSets(_ sets: [WorkoutSet]) throws
func getWorkoutSets(for exerciseId: UUID) -> [WorkoutSet]
func getWorkoutSets(for date: Date) -> [WorkoutSet]

// Maintenance
func cleanupOldWorkouts()
func attemptDataRecovery()
```

**Published Properties:**
```swift
@Published private(set) var exercises: [Exercise]
@Published private(set) var workoutSets: [WorkoutSet]
```

**Caching Strategy:**
- **exerciseCache**: `[UUID: Exercise]` - O(1) lookups by ID
- **workoutSetsByExercise**: `[UUID: [WorkoutSet]]` - Filter by exercise
- **workoutSetsByDate**: `[Date: [WorkoutSet]]` - Filter by date
- **Incremental Updates**: Only updates affected cache entries
- **Automatic Expiration**: 1-hour TTL with validation on read
- **Rollback on Failure**: Reverts changes if save fails

**Performance Optimizations:**
```swift
// ✅ Incremental cache updates (O(1) instead of O(n))
private func updateCacheForWorkoutSet(_ set: WorkoutSet) {
    workoutSetsByExercise[set.exerciseId, default: []].append(set)
    workoutSetsByDate[startOfDay, default: []].append(set)
}

// ✅ Rollback mechanism on save failure
func addExercise(_ exercise: Exercise) {
    exercises.append(exercise)
    exerciseCache[exercise.id] = exercise

    do {
        try saveData()
    } catch {
        exercises.removeLast()  // Rollback
        exerciseCache.removeValue(forKey: exercise.id)
    }
}
```

---

### PRManager.swift

**Location:** `LoadProgress/Managers/PRManager.swift`

**Purpose:** Personal record tracking and detection

**Responsibilities:**
- Automatic PR detection on new workout sets
- 1RM calculation using Brzycki formula
- PR categorization (1RM, volume, weight-at-reps)
- Multi-level caching for O(1) PR lookups
- NotificationCenter broadcasts for PR achievements
- Analytics event logging

**Key Methods:**

```swift
// PR Detection
func checkForPRs(set: WorkoutSet)
func checkVolumeRecord(metrics: VolumeMetrics)

// PR Calculations
func calculateOneRepMax(weight: Double, reps: Int) -> Double

// Queries (cache-backed, O(1) performance)
func getPRs(for exerciseId: UUID) -> [PersonalRecord]
func getBestPR(for exerciseId: UUID, type: PRType) -> PersonalRecord?
```

**Published Properties:**
```swift
@Published private(set) var personalRecords: [PersonalRecord]
```

**Caching Strategy:**
- **prCache**: `[UUID: [PersonalRecord]]` - All PRs per exercise
- **prTypeCache**: `[UUID: [PRType: PersonalRecord]]` - Best PR per type
- **dateCache**: `[Date: [PersonalRecord]]` - PRs by date achieved
- **O(1) Lookups**: No linear searches, all dictionary-based
- **Incremental Updates**: Only updates affected entries

**1RM Calculation:**
```swift
// Brzycki Formula: weight × (36 / (37 - reps))
func calculateOneRepMax(weight: Double, reps: Int) -> Double {
    guard reps > 0 && reps < 37 else { return weight }
    return weight * (36 / (37 - Double(reps)))
}
```

**Thread Safety:**
- Background queue for PR calculations
- Main queue for UI updates (@Published properties)
- Proper weak self captures in closures

**NotificationCenter Integration:**
```swift
// Posts notifications on PR achievements
NotificationCenter.default.post(
    name: .newPersonalRecord,
    object: nil,
    userInfo: ["pr": pr]
)

// Observes workout changes
NotificationCenter.default.addObserver(
    self,
    selector: #selector(workoutDataChanged),
    name: .workoutDataChanged,
    object: nil
)
```

---

## Usage in SwiftUI

### Initialization

Managers are created as `@StateObject` in the app root to ensure they persist throughout the app lifecycle:

```swift
// LoadProgressApp.swift
@main
struct LoadProgressApp: App {
    @StateObject private var dataManager = DataManager()
    @StateObject private var prManager: PRManager

    init() {
        let sharedManager = DataManager()
        _dataManager = StateObject(wrappedValue: sharedManager)
        _prManager = StateObject(wrappedValue: PRManager(dataManager: sharedManager))
    }

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(dataManager)
                .environmentObject(prManager)
        }
    }
}
```

### Access in Views

Views access managers via `@EnvironmentObject`:

```swift
struct WorkoutLogView: View {
    @EnvironmentObject var dataManager: DataManager
    @EnvironmentObject var prManager: PRManager

    var body: some View {
        List(dataManager.workoutSets) { set in
            WorkoutSetRow(set: set)
        }
    }
}
```

---

## Best Practices

### 1. **Keep Managers Focused**
Each manager should have a single, well-defined responsibility:
- ✅ DataManager handles data persistence
- ✅ PRManager handles PR tracking
- ❌ Don't mix responsibilities

### 2. **Use Dependency Injection**
```swift
// ✅ Good: Testable, flexible
init(dataManager: DataManager) {
    self.dataManager = dataManager
}

// ❌ Bad: Hard-coded dependency
init() {
    self.dataManager = DataManager.shared
}
```

### 3. **Implement Proper Error Handling**
```swift
// ✅ Good: Specific error types, proper logging
do {
    try saveData()
} catch {
    Logger.shared.log("Failed to save: \(error)", level: .error)
    throw AppError.dataSaveFailed
}
```

### 4. **Use Background Queues for Heavy Operations**
```swift
// ✅ Good: Non-blocking
queue.async { [weak self] in
    let result = self?.performExpensiveCalculation()
    DispatchQueue.main.async {
        self?.updateUI(with: result)
    }
}
```

### 5. **Maintain Cache Consistency**
Always update caches when data changes:
```swift
func addWorkoutSet(_ set: WorkoutSet) {
    workoutSets.append(set)
    updateCacheForWorkoutSet(set)  // ✅ Sync cache
    try saveData()
}
```

---

## Testing Managers

### Unit Test Example

```swift
func testDataManagerCaching() {
    // Arrange
    let dataManager = DataManager()
    let exercise = Exercise(name: "Bench Press", ...)

    // Act
    dataManager.addExercise(exercise)
    let retrieved = dataManager.getExercise(by: exercise.id)

    // Assert
    XCTAssertEqual(retrieved?.id, exercise.id)
    XCTAssertEqual(retrieved?.name, "Bench Press")
}
```

### Mock Manager for View Testing

```swift
class MockDataManager: DataManager {
    var mockExercises: [Exercise] = []

    override var exercises: [Exercise] {
        mockExercises
    }
}
```

---

## Performance Characteristics

| Operation | Time Complexity | Notes |
|-----------|----------------|-------|
| Add Exercise | O(1) | With incremental cache update |
| Get Exercise by ID | O(1) | Dictionary lookup |
| Get Workout Sets by Exercise | O(1) | Dictionary lookup |
| Add Workout Set | O(1) | With incremental cache update |
| Find PR | O(1) | Dictionary lookup in prTypeCache |
| Calculate 1RM | O(1) | Simple arithmetic |

---

## Common Pitfalls

### ❌ Creating Multiple Instances

```swift
// Bad: Creates separate instances with different state
@StateObject private var dataManager1 = DataManager()
@StateObject private var dataManager2 = DataManager()
```

### ✅ Share Single Instance

```swift
// Good: Single source of truth
let sharedManager = DataManager()
_dataManager = StateObject(wrappedValue: sharedManager)
_prManager = StateObject(wrappedValue: PRManager(dataManager: sharedManager))
```

### ❌ Blocking Main Thread

```swift
// Bad: Synchronous expensive operation
let result = expensiveCalculation()
updateUI(result)
```

### ✅ Use Background Queue

```swift
// Good: Async with main thread UI update
queue.async {
    let result = expensiveCalculation()
    DispatchQueue.main.async {
        self.updateUI(result)
    }
}
```

---

## Related Documentation

- [Models README](../Models/MODELS_README.md) - Data structure definitions
- [Views README](../Views/VIEWS_README.md) - UI layer consuming managers
- [Utilities README](../Utilities/UTILITIES_README.md) - Support services used by managers

---

## TODO

- [ ] Consider migrating from UserDefaults to CoreData for better scalability
- [ ] Add memory pressure handling in cache management
- [ ] Implement data export/import functionality
- [ ] Add comprehensive unit tests for all manager methods
