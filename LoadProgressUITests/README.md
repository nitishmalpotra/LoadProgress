# UI Tests

This directory contains UI tests for the LoadProgress application.

## Overview

The UI tests in this directory verify the application's functionality from an end-user perspective. They simulate user interactions with the app and verify that the UI responds correctly, ensuring a smooth user experience across different scenarios.

## Test Categories

### LoadProgressUITests

`LoadProgressUITests.swift` contains tests for core UI functionality:
- Navigation between screens
- Exercise browsing and filtering
- Workout logging workflow
- Settings and preferences

### LoadProgressUITestsLaunchTests

`LoadProgressUITestsLaunchTests.swift` tests the application launch performance and behavior:
- Launch time measurements
- Initial state verification
- First-run experience

## Best Practices

1. Structure tests to follow typical user flows
2. Use meaningful identifiers for UI elements to make tests robust
3. Include assertions that verify both UI state and data correctness
4. Keep tests independent and idempotent
5. Consider edge cases like device rotation, background/foreground transitions
6. Test accessibility features where applicable
7. Use appropriate waiting mechanisms instead of hard-coded delays

## Running Tests

UI tests can be run from Xcode using:
- ⌘U to run all tests (including UI tests)
- Select the specific UI test target and press ⌘U to run only UI tests

## Example Test

```swift
func testAddNewExercise() {
    let app = XCUIApplication()
    app.launch()
    
    // Navigate to exercises tab
    app.tabBars.buttons["Exercises"].tap()
    
    // Tap the add button
    app.navigationBars["Exercises"].buttons["Add"].tap()
    
    // Fill in exercise details
    let nameField = app.textFields["Exercise Name"]
    nameField.tap()
    nameField.typeText("Test Exercise")
    
    // Select exercise type
    app.segmentedControls["Exercise Type"].buttons["Weight Training"].tap()
    
    // Save the exercise
    app.buttons["Save"].tap()
    
    // Verify the exercise was added
    XCTAssertTrue(app.staticTexts["Test Exercise"].exists)
}
```
