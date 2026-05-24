# Models

Core data structures for the LoadProgress application.

---

## Overview

Models represent the fundamental data entities in the application. Following value semantics, all models are implemented as immutable `struct` types that conform to necessary protocols for serialization, identification, and hashing. Models contain no business logic—they are pure data containers.

**Design Principles:**
- Value types (`struct`) for safety and immutability
- Protocol conformance: `Codable`, `Identifiable`, `Hashable`
- Failable initializers with validation
- Computed properties for derived values
- Comprehensive enumerations for classifications

---

## Model Files

### Exercise.swift

**Purpose:** Represents a workout exercise with comprehensive metadata

**Location:** `LoadProgress/Models/Exercise.swift`

**Structure:**
```swift
struct Exercise: Codable, Identifiable, Hashable {
    let id: UUID
    let name: String
    let type: ExerciseType
    let muscleGroup: MuscleGroup
    let secondaryMuscleGroups: [MuscleGroup]
    let icon: ExerciseIcon
    let difficulty: Difficulty
    let equipment: [Equipment]
    let description: String
    let formCues: [String]
}
```

**Nested Enumerations:**

```swift
// Exercise Types
enum ExerciseType: String, Codable, CaseIterable {
    case weightTraining = "Weight Training"
    case bodyweight = "Bodyweight"
}

// Muscle Groups (12 total)
enum MuscleGroup: String, Codable, CaseIterable {
    case chest, back, legs, shoulders, arms, core
    case fullBody, forearms, glutes, upperBack, lowerBack
}

// Difficulty Levels
enum Difficulty: String, Codable, CaseIterable {
    case beginner, intermediate, advanced, expert
}

// Equipment Types (12 total)
enum Equipment: String, Codable, CaseIterable {
    case barbell, dumbbell, kettlebell, resistanceBand
    case cable, smithMachine, bodyweight, machine
    case plate, bench, pullupBar, foam
}
```

**Factory Method:**
```swift
static func createValidated(
    name: String,
    type: ExerciseType,
    muscleGroup: MuscleGroup,
    // ... other parameters
) throws -> Exercise
```

**Usage:**
```swift
// Standard initialization
let exercise = Exercise(
    name: "Bench Press",
    type: .weightTraining,
    muscleGroup: .chest,
    icon: .benchPress,
    difficulty: .intermediate,
    equipment: [.barbell, .bench],
    description: "Classic compound chest exercise",
    formCues: ["Retract shoulder blades", "Keep feet planted"]
)

// Validated creation
let validatedExercise = try Exercise.createValidated(
    name: userInput,
    type: .weightTraining,
    muscleGroup: .chest
)
```

---

### ExerciseIcon.swift

**Purpose:** Icon representation for exercises

**Location:** `LoadProgress/Models/ExerciseIcon.swift`

**Structure:**
```swift
enum ExerciseIcon: Codable, Hashable {
    // Equipment (6 cases)
    case dumbbell, barbell, bodyweight, machine, kettlebell, resistanceBand

    // Muscle-specific exercises (50+ predefined cases)
    case benchPress, pushUp, inclineBench, deadlift, squat, pullUp
    // ... 40+ more

    // Custom icons
    case custom(String)

    var systemName: String { /* SF Symbol name */ }
}
```

**Key Features:**
- 50+ predefined exercise icons organized by muscle group
- Custom icon support via associated value
- Optimized equality/hashing using identifier string
- Automatic SF Symbol name generation

**Refactoring Improvements:**
- Reduced equality operator from 50+ lines to 1 line using `identifier`
- Simplified hashing logic
- Cleaner encoding/decoding with helper method

**Usage:**
```swift
let icon: ExerciseIcon = .benchPress
let systemName = icon.systemName  // "figure.strengthtraining.functional"

// Custom icon
let customIcon: ExerciseIcon = .custom("My Custom Exercise")
```

---

### WorkoutSet.swift

**Purpose:** Individual set within a workout session

**Location:** `LoadProgress/Models/WorkoutSet.swift`

**Structure:**
```swift
struct WorkoutSet: Codable, Identifiable {
    let id: UUID
    let exerciseId: UUID
    let weight: Double?           // Optional (bodyweight exercises)
    let reps: Double
    let date: Date
    let rpe: Double?              // Rate of Perceived Exertion (1-10)
    let restTime: TimeInterval?
    let notes: String?
    let isFailureSet: Bool
}
```

**Validated Initialization:**
```swift
init(
    weight: Double? = nil,
    reps: Double? = nil,
    date: Date,
    exerciseId: UUID,
    rpe: Double? = nil,
    restTime: TimeInterval? = nil,
    notes: String? = nil,
    isFailureSet: Bool = false
) throws
```

**Validation Rules:**
- `weight`: Must be > 0 if provided
- `reps`: Must be > 0 (required)
- `rpe`: Must be between 1-10 if provided
- `restTime`: Must be >= 0 if provided

**Refactoring Improvements:**
- Validation happens **before** property assignment (prevents invalid state)
- Added RPE validation (1-10 range)
- Added rest time validation (non-negative)
- Better error messages with context

**Usage:**
```swift
// Valid set
let set = try WorkoutSet(
    weight: 100.0,
    reps: 10,
    date: Date(),
    exerciseId: exercise.id,
    rpe: 8.0
)

// Validation errors
try WorkoutSet(weight: -50, ...) // Throws: "Weight must be greater than 0"
try WorkoutSet(rpe: 11, ...)     // Throws: "RPE must be between 1 and 10"
```

---

### PersonalRecord.swift

**Purpose:** Personal record achievement tracking

**Location:** `LoadProgress/Models/PersonalRecord.swift`

**Structure:**
```swift
struct PersonalRecord: Codable, Identifiable {
    let id: UUID
    let exerciseId: UUID
    let type: PRType
    let value: Double
    let date: Date
    let reps: Int?  // For weightAtReps type
}

enum PRType: String, Codable {
    case oneRepMax      // Estimated 1RM
    case volume         // Total volume in session
    case weightAtReps   // Best weight at specific rep count
}
```

**PR Types Explained:**

1. **One Rep Max (1RM)**
   - Calculated using Brzycki formula
   - `value` = estimated max weight

2. **Volume**
   - Total weight × reps in a session
   - `value` = total volume in kg

3. **Weight At Reps**
   - Best weight achieved at a specific rep count
   - `value` = weight, `reps` = rep count

**Usage:**
```swift
// 1RM record
let oneRM = PersonalRecord(
    exerciseId: exercise.id,
    type: .oneRepMax,
    value: 112.5
)

// Volume record
let volume = PersonalRecord(
    exerciseId: exercise.id,
    type: .volume,
    value: 5000.0
)

// Weight at specific reps
let weightPR = PersonalRecord(
    exerciseId: exercise.id,
    type: .weightAtReps,
    value: 100.0,
    reps: 10
)
```

---

### VolumeMetrics.swift

**Purpose:** Workout volume calculation and analysis

**Location:** `LoadProgress/Models/VolumeMetrics.swift`

**Structure:**
```swift
struct VolumeMetrics: Codable {
    let exerciseId: UUID
    let totalVolume: Double      // Sum of (weight × reps)
    let setCount: Int
    let averageWeight: Double
    let averageReps: Double
    let date: Date
}
```

**Calculation Example:**
```swift
// For 3 sets: 100kg × 10, 100kg × 8, 100kg × 6
let metrics = VolumeMetrics(
    exerciseId: benchPress.id,
    totalVolume: 2400.0,  // (100×10) + (100×8) + (100×6)
    setCount: 3,
    averageWeight: 100.0,
    averageReps: 8.0,
    date: Date()
)
```

---

## Design Patterns

### Value Semantics

All models use `struct` for automatic value semantics:

```swift
var set1 = try WorkoutSet(weight: 100, reps: 10, ...)
var set2 = set1
set2.weight = 110  // ❌ Won't compile - immutable

// Must create new instance
let set2 = try WorkoutSet(weight: 110, reps: 10, ...)
```

### Protocol Conformance

**Codable:**
```swift
// Automatic JSON encoding/decoding
let encoder = JSONEncoder()
let data = try encoder.encode(exercise)

let decoder = JSONDecoder()
let decoded = try decoder.decode(Exercise.self, from: data)
```

**Identifiable:**
```swift
// Automatic ForEach compatibility
ForEach(exercises) { exercise in
    Text(exercise.name)
}
```

**Hashable:**
```swift
// Set operations, dictionary keys
let uniqueExercises = Set(exercises)
let exerciseDict = [exercise.id: exercise]
```

---

## Best Practices

### 1. **Immutability**

```swift
// ✅ Good: Create new instance
func withUpdatedReps(_ newReps: Double) -> WorkoutSet {
    try! WorkoutSet(
        weight: weight,
        reps: newReps,
        date: date,
        exerciseId: exerciseId
    )
}

// ❌ Bad: Mutable properties
var reps: Double
```

### 2. **Validation at Creation**

```swift
// ✅ Good: Failable initializer
init(weight: Double?) throws {
    guard let weight = weight, weight > 0 else {
        throw AppError.invalidInput("Weight must be positive")
    }
    self.weight = weight
}
```

### 3. **Default Parameter Values**

```swift
// ✅ Good: Sensible defaults
init(
    rpe: Double? = nil,
    notes: String? = nil,
    isFailureSet: Bool = false
) { ... }
```

---

## Common Pitfalls

### ❌ Skipping Validation

```swift
// Bad: No validation
let set = WorkoutSet(weight: -100, reps: 0, ...)
```

### ✅ Proper Validation

```swift
// Good: Throws on invalid input
let set = try WorkoutSet(weight: 100, reps: 10, ...)
```

### ❌ Mutable State

```swift
// Bad: Mutable reference type
class WorkoutSet {
    var weight: Double
}
```

### ✅ Immutable Value Type

```swift
// Good: Immutable value type
struct WorkoutSet {
    let weight: Double
}
```

---

## Testing Models

### Validation Testing

```swift
func testWorkoutSetValidation() {
    // Valid set
    XCTAssertNoThrow(try WorkoutSet(weight: 100, reps: 10, ...))

    // Invalid weight
    XCTAssertThrowsError(try WorkoutSet(weight: -50, reps: 10, ...))

    // Invalid reps
    XCTAssertThrowsError(try WorkoutSet(weight: 100, reps: 0, ...))

    // Invalid RPE
    XCTAssertThrowsError(try WorkoutSet(rpe: 11, ...))
}
```

### Codability Testing

```swift
func testExerciseCoding() throws {
    let exercise = Exercise(...)

    // Encode
    let data = try JSONEncoder().encode(exercise)

    // Decode
    let decoded = try JSONDecoder().decode(Exercise.self, from: data)

    // Verify
    XCTAssertEqual(exercise.id, decoded.id)
    XCTAssertEqual(exercise.name, decoded.name)
}
```

---

## Related Documentation

- [Managers README](../Managers/MANAGERS_README.md) - Business logic using these models
- [Utilities/Validator README](../Utilities/UTILITIES_README.md) - Validation utilities

---

## TODO

- [ ] Add unit tests for all validation scenarios
- [ ] Consider adding Equatable conformance for easier testing
- [ ] Add convenience initializers for common use cases
- [ ] Document edge cases in validation logic
