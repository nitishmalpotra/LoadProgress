# Unit Tests

This directory contains unit tests for the LoadProgress application.

## Overview

The unit tests in this directory verify the functionality of individual components in isolation. They focus on testing business logic, data processing, and utility functions to ensure correctness and prevent regressions.

## Test Categories

### LoadProgressTests

`LoadProgressTests.swift` contains basic tests for core functionality.

### PRManagerTests

`PRManagerTests.swift` tests the personal record tracking functionality:
- Detection of new personal records
- Comparison with previous records
- Notification generation for achievements

### PerformanceTests

`PerformanceTests.swift` verifies the performance characteristics of critical operations:
- Data loading and saving
- Cache efficiency
- Memory usage

### VolumeAnalyticsTests

`VolumeAnalyticsTests.swift` tests the workout volume calculation and analytics:
- Volume calculations for different exercise types
- Trend analysis over time periods
- Statistical calculations

## Best Practices

1. Follow the AAA pattern (Arrange, Act, Assert) for test structure
2. Test both success and failure cases
3. Use descriptive test names that explain what is being tested
4. Keep tests independent - one test should not depend on another
5. Mock external dependencies to isolate the component being tested
6. Use XCTAssert functions appropriately for different types of assertions
7. Aim for high test coverage of business logic and data processing

## Running Tests

Tests can be run from Xcode using:
- ⌘U to run all tests
- ⌃⌘U to run only the selected test class or method

## Example Test

```swift
func testPersonalRecordDetection() {
    // Arrange
    let prManager = PRManager()
    let exercise = Exercise(name: "Bench Press", type: .weightTraining, ...)
    let previousBest = WorkoutSet(exercise: exercise, weight: 100, reps: 5, ...)
    
    // Act
    let newSet = WorkoutSet(exercise: exercise, weight: 110, reps: 5, ...)
    let isPR = prManager.checkForPersonalRecord(newSet: newSet, previousBest: previousBest)
    
    // Assert
    XCTAssertTrue(isPR, "A heavier weight with the same reps should be detected as a PR")
}
```
