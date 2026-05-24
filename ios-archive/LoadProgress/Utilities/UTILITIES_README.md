# Utilities

This directory contains utility classes, extensions, and helper functions that support the LoadProgress application.

## Overview

The utilities in this directory provide common functionality that is used across different parts of the application. They are designed to be reusable, focused, and well-tested.

## Components

### Constants

`Constants.swift` defines application-wide constants to ensure consistency and avoid magic numbers/strings.

### PerformanceConstants

`PerformanceConstants.swift` contains threshold values and metrics related to app performance.

### Validator

`Validator.swift` provides validation logic for user inputs and data structures.

### Logger

`Logger.swift` implements a centralized logging system with different severity levels and categories.

### HapticManager

`HapticManager.swift` encapsulates haptic feedback functionality for providing tactile feedback to users.

### AnalyticsManager

`AnalyticsManager.swift` handles event tracking and analytics with batch processing capabilities.

### BackupManager

`BackupManager.swift` manages data backup and restoration functionality.

### NetworkMonitor

`NetworkMonitor.swift` monitors network connectivity and provides status updates.

### PerformanceMonitor

`PerformanceMonitor.swift` tracks app performance metrics and provides warnings when thresholds are exceeded.

### SettingsManager

`SettingsManager.swift` handles user preferences and application settings.

### AppError

`AppError.swift` defines a structured error type system for the application.

### NotificationNames

`NotificationNames.swift` centralizes notification name constants used for internal app communication.

## Best Practices

1. Keep utility functions focused on a single responsibility
2. Write comprehensive unit tests for all utilities
3. Document public APIs thoroughly
4. Consider performance implications, especially for functions called frequently
5. Use proper error handling and avoid force unwrapping
6. Prefer value types (structs) over reference types (classes) when appropriate

## Usage Example

```swift
// Using the Logger
Logger.log(.info, category: .data, message: "Loading exercise data")

// Using the Validator
do {
    let validatedName = try Validator.validateExerciseName(userInput)
    // Proceed with valid name
} catch {
    // Handle validation error
}

// Using the HapticManager
HapticManager.shared.playSuccessFeedback()
```
