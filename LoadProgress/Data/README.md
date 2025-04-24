# Data

This directory contains default and seed data for the LoadProgress application.

## Overview

The data files in this directory provide initial content and reference data that is used to populate the application when a user first launches it or resets their data. This ensures that new users have a good starting point with pre-populated exercises and examples.

## Files

### DefaultExercises

`DefaultExercises.swift` contains a curated collection of common exercises with:
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
// In DataManager.swift
private func loadDefaultExercisesIfNeeded() {
    if exercises.isEmpty {
        exercises = DefaultExercises.exercises
        saveExercises()
    }
}
```
