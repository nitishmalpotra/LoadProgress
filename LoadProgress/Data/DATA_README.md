# Data

This directory *would typically* contain default and seed data for the LoadProgress application, however, the current implementation defines default data directly within the `DataManager`.

## Overview

Default data provides initial content and reference data used to populate the application when a user first launches it or resets their data. This ensures new users have a starting point with pre-populated exercises.

In the current structure, this default data (specifically exercises) is initialized within the `DataManager.swift` file.

## Files

*(Currently, this directory is empty or does not contain data files directly used for default population. Default exercises are hardcoded in `DataManager.swift`)*

### Default Data Logic (in DataManager.swift)

The `populateDefaultExercises()` method within `DataManager.swift` contains a curated collection of common exercises with:
- Comprehensive exercise details (name, type, muscle groups, etc.)
- Form cues for proper execution
- Appropriate difficulty ratings
- Required equipment information

## Usage

The default data is loaded by the DataManager when the application is first launched or when the user chooses to reset to default data. It serves as both reference data and as examples to help users understand how to create their own custom exercises.

## Maintenance Guidelines

When updating the default data:

1. Ensure all exercises have complete and accurate information
2. Maintain a good balance of different exercise types and difficulty levels
3. Include exercises for all major muscle groups
4. Provide clear, concise form cues that focus on safety and effectiveness
5. Verify that all exercise types match the current ExerciseType enum values
6. Test the application with the updated data to ensure it loads correctly

## Example

```swift
// In DataManager.swift, during initialization:
init() {
    loadData()
    if exercises.isEmpty {
        populateDefaultExercises() // Populates with hardcoded exercises
    }
    updateCache()
}

private func populateDefaultExercises() {
    let defaultExercises: [Exercise] = [
        // ... exercise definitions ...
    ]
    
    do {
        exercises = defaultExercises
        try saveData()
    } catch {
        Logger.shared.log("Failed to save default exercises: \(error)", level: .error)
    }
}
