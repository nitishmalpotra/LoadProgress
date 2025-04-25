# Views

This directory contains all the SwiftUI views for the LoadProgress application.

## Overview

The views in this directory follow a hierarchical structure. Some primary views reside directly in this folder, while others are organized into subdirectories by feature and responsibility. All UI components are built using SwiftUI, with a focus on reusability, composability, and performance.

## Directory Structure

- **Root (`Views/`)**: Contains some primary views like `ExercisesView`, `WorkoutLogView`, `SplashScreenView`, etc.
- **Exercises/**: Views related to exercise browsing and management
- **Components/**: Reusable UI components used across multiple screens
- **Analytics/**: Data visualization and analytics views
- **PRTracking/**: Personal record tracking and celebration views
- **Styles/**: Custom SwiftUI styles and modifiers

## Key Views

*(Note: `ContentView` is the main app view, typically configured in `LoadProgressApp.swift`, not listed here)*

### SplashScreenView

The initial view shown when the app launches.

### ExercisesView

Displays a list of exercises organized by muscle group and type, with filtering capabilities.

### WorkoutLogView

Allows users to log and review their workout sessions.

### AddWorkoutView

Provides the interface for adding new workout sets for an exercise.

### ProgressView

Visualizes progress over time using charts and metrics.

### ExerciseDetailView

Shows detailed information about a specific exercise, including form guidance and history.

## UI Principles

1. **Consistency**: Maintain consistent styling and interaction patterns
2. **Accessibility**: Support Dynamic Type, VoiceOver, and other accessibility features
3. **Performance**: Optimize for smooth scrolling and transitions
4. **Modularity**: Build small, focused components that can be composed together

## Best Practices

1. Use `@EnvironmentObject` for shared data that needs to be accessed by many views
2. Prefer small, focused views over large, complex ones
3. Extract reusable components to the Components directory
4. Use custom ViewModifiers for consistent styling
5. Keep business logic out of views - delegate to managers or view models
6. Use preview providers for all views to facilitate development
