# Managers

This directory contains manager classes that handle business logic and data operations for the LoadProgress application.

## Overview

Managers serve as the bridge between the data layer and the UI, implementing business logic, data processing, and state management. They follow the singleton pattern to provide global access to their functionality throughout the app.

## Managers

### DataManager

`DataManager.swift` is responsible for:
- Loading and saving exercise and workout data
- Managing the in-memory data store
- Providing CRUD operations for exercises and workouts
- Implementing caching and indexing for optimized data access
- Handling data persistence

### PRManager

`PRManager.swift` handles personal record tracking:
- Detecting new personal records
- Storing and retrieving PR history
- Calculating progress metrics
- Providing notifications for PR achievements

## Implementation Details

Each manager is implemented as a class that conforms to ObservableObject, allowing SwiftUI views to observe and react to changes in the data. They use a combination of published properties and methods to expose functionality to the rest of the application.

## Best Practices

1. Keep managers focused on a specific domain of functionality
2. Use dependency injection to allow for testing
3. Implement proper error handling and logging
4. Optimize for performance, especially for operations that might block the UI
5. Use background processing for expensive operations
6. Maintain thread safety when accessing shared resources

## Usage Example

```swift
// In a SwiftUI view
struct ExercisesView: View {
    @EnvironmentObject var dataManager: DataManager
    
    var body: some View {
        List(dataManager.exercises) { exercise in
            ExerciseRow(exercise: exercise)
        }
    }
}

// In the app entry point
@main
struct LoadProgressApp: App {
    // Create managers as StateObjects to ensure they persist
    @StateObject private var dataManager = DataManager()
    
    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(dataManager)
        }
    }
}
```
