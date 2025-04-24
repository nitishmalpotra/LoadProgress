# Views

This directory contains all the SwiftUI views for the LoadProgress application.

## Overview

The views in this directory follow a hierarchical structure, organized by feature and responsibility. All UI components are built using SwiftUI, with a focus on reusability, composability, and performance.

## Directory Structure

- **Root Views**: Main navigation and container views
- **Exercises/**: Views related to exercise browsing and management
- **Components/**: Reusable UI components used across multiple screens
- **Analytics/**: Data visualization and analytics views
- **PRTracking/**: Personal record tracking and celebration views
- **Styles/**: Custom SwiftUI styles and modifiers

## Key Views

### ContentView

The main container view that handles top-level navigation and app structure.

### ExercisesView

Displays a list of exercises organized by muscle group and type, with filtering capabilities.

### WorkoutLogView

Allows users to log and review their workout sessions.

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
