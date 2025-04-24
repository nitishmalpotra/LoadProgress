# Models

This directory contains the core data models for the LoadProgress application.

## Overview

The models in this directory define the data structures that represent the fundamental entities in the application. These models are designed to be simple, immutable data structures that conform to the necessary protocols for serialization and persistence.

## Models

### Exercise

`Exercise.swift` defines the structure for workout exercises, including:
- Properties like name, type, muscle groups, difficulty, etc.
- Exercise classifications (types, muscle groups, difficulty levels)
- Validation logic for exercise creation

### ExerciseIcon

`ExerciseIcon.swift` contains an enumeration of all available exercise icons in the app, organized by:
- General equipment icons
- Muscle-specific exercise icons
- Custom icons

### PersonalRecord

`PersonalRecord.swift` represents personal records achieved by the user, tracking:
- Exercise information
- Record metrics (weight, reps, etc.)
- Date achieved
- Comparison with previous records

### WorkoutSet

`WorkoutSet.swift` models individual sets within a workout, including:
- Exercise reference
- Weight, reps, and other performance metrics
- Completion status
- Notes

### VolumeMetrics

`VolumeMetrics.swift` provides structures for analyzing workout volume and intensity:
- Total volume calculations
- Intensity metrics
- Trend analysis helpers

## Usage

Models should be treated as immutable value types. Create new instances rather than modifying existing ones to maintain data integrity throughout the application lifecycle.

## Best Practices

1. Keep models simple and focused on data representation
2. Use extensions to add functionality without cluttering the core model
3. Ensure all models conform to necessary protocols (Codable, Identifiable, Hashable)
4. Validate data at creation time using factory methods or validators
