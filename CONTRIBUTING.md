# Contributing to LoadProgress

Thank you for your interest in contributing to LoadProgress! This document provides guidelines and best practices for contributing to the project.

---

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Architecture Guidelines](#architecture-guidelines)
- [Testing Requirements](#testing-requirements)
- [Pull Request Process](#pull-request-process)
- [Documentation](#documentation)

---

## Code of Conduct

Be respectful, inclusive, and constructive in all interactions. Focus on what is best for the community and the project.

---

## Getting Started

### Prerequisites

- macOS Ventura (13.0) or later
- Xcode 15.0 or later
- Swift 5.0+
- iOS 18.0+ SDK
- Git

### Fork & Clone

```bash
# Fork the repository on GitHub, then:
git clone https://github.com/YOUR_USERNAME/LoadProgress.git
cd LoadProgress
git remote add upstream https://github.com/nitishmalpotra/LoadProgress.git
```

### Build the Project

```bash
open LoadProgress.xcodeproj
# Press ⌘R to build and run
```

---

## Development Workflow

### 1. Branch Strategy

Create feature branches from `main`:

```bash
git checkout main
git pull upstream main
git checkout -b feature/your-feature-name
```

**Branch Naming Conventions:**
- Feature: `feature/add-workout-templates`
- Bug Fix: `fix/pr-calculation-error`
- Refactor: `refactor/improve-caching`
- Docs: `docs/update-readme`
- Chore: `chore/update-dependencies`

### 2. Commit Messages

Follow **Conventional Commits** format:

```
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `refactor`: Code refactoring (no functionality change)
- `perf`: Performance improvement
- `docs`: Documentation changes
- `test`: Adding or updating tests
- `chore`: Build process, tooling, dependencies

**Examples:**
```
feat(pr-tracking): add total reps PR type
fix(cache): resolve cache expiration bug
refactor(data-manager): simplify save logic
docs(readme): update installation instructions
```

### 3. Keep Your Fork Synced

```bash
git fetch upstream
git checkout main
git merge upstream/main
git push origin main
```

---

## Coding Standards

### Swift Style Guide

Follow the [Swift API Design Guidelines](https://swift.org/documentation/api-design-guidelines/) with these specifics:

#### File Structure

```swift
// 1. Imports
import SwiftUI
import Foundation

// 2. Type Definition
struct MyView: View {
    // 3. MARK: - Properties (Published first, then State, then computed)
    @Published var data: [Item] = []
    @State private var isLoading = false
    
    // 4. MARK: - Initialization
    init() { }
    
    // 5. MARK: - Body
    var body: some View { }
    
    // 6. MARK: - Private Methods
    private func loadData() { }
}
```

#### Naming Conventions

**Types:** PascalCase
```swift
struct WorkoutSet { }
class DataManager { }
enum LogLevel { }
```

**Functions/Variables:** camelCase
```swift
func addWorkoutSet() { }
var exerciseId: UUID
let maxRetries = 3
```

**Constants:** camelCase (not SCREAMING_SNAKE_CASE)
```swift
let cornerRadius: CGFloat = 16
let cacheExpirationInterval: TimeInterval = 3600
```

**Private Properties:** Prefix with `private`
```swift
private var cache: [UUID: Exercise] = [:]
private let queue = DispatchQueue(label: "com.app.queue")
```

### Code Organization

**Use MARK comments:**
```swift
// MARK: - Properties
// MARK: - Initialization
// MARK: - Public Methods
// MARK: - Private Methods
// MARK: - Helper Functions
```

**Extract magic numbers:**
```swift
// Bad
if count > 100 { }

// Good
private let maxCacheSize = 100
if count > maxCacheSize { }
```

**Prefer guard for early returns:**
```swift
// Bad
if let value = optional {
    // Long logic
}

// Good
guard let value = optional else { return }
// Continue with logic
```

### SwiftUI Best Practices

**Extract views for readability:**
```swift
// When body exceeds 10 lines, extract subviews
var body: some View {
    VStack {
        headerView
        contentView
        footerView
    }
}

private var headerView: some View {
    Text("Header")
}
```

**Use ViewModifiers:**
```swift
// Prefer custom modifiers over repeated code
extension View {
    func glassCard() -> some View {
        modifier(GlassCard())
    }
}
```

**Environment Objects:**
```swift
// Inject dependencies at root
@StateObject private var dataManager = DataManager()

ContentView()
    .environmentObject(dataManager)
```

---

## Architecture Guidelines

### MVVM Pattern

**Views:**
- Pure SwiftUI, no business logic
- Observe ViewModels via `@EnvironmentObject` or `@ObservedObject`
- Handle user input, delegate actions to ViewModels

**ViewModels (Managers):**
- Conform to `ObservableObject`
- Use `@Published` for reactive state
- Contain business logic
- Handle data persistence
- Async operations on background queues

**Models:**
- Value types (`struct`) preferred
- Conform to `Codable`, `Identifiable`, `Hashable`
- Immutable when possible
- Failable initializers with validation

### Data Flow

```
User Action (View)
    ↓
Manager Method Call
    ↓
Model Update
    ↓
Persistence (UserDefaults)
    ↓
Cache Update
    ↓
@Published triggers SwiftUI update
    ↓
View Refresh
```

### Dependency Injection

Use `@EnvironmentObject` for app-wide dependencies:

```swift
// Root level
@StateObject private var dataManager = DataManager()
@StateObject private var prManager = PRManager(dataManager: dataManager)

ContentView()
    .environmentObject(dataManager)
    .environmentObject(prManager)

// Child views
struct MyView: View {
    @EnvironmentObject var dataManager: DataManager
}
```

### Error Handling

Use `Result` type for operations that can fail:

```swift
enum AppError: LocalizedError {
    case invalidInput(String)
    case dataLoadFailed
    case dataSaveFailed
    
    var errorDescription: String? {
        switch self {
        case .invalidInput(let message): return message
        case .dataLoadFailed: return "Failed to load data"
        case .dataSaveFailed: return "Failed to save data"
        }
    }
}

func validate(_ input: String) -> Result<String, AppError> {
    guard !input.isEmpty else {
        return .failure(.invalidInput("Input cannot be empty"))
    }
    return .success(input)
}
```

---

## Testing Requirements

### Unit Tests

**Coverage Targets:**
- Managers (ViewModels): 90%+
- Models: 80%+
- Utilities: 80%+

**Test Naming:**
```swift
func test<MethodName>_<Condition>_<ExpectedResult>() {
    // Example:
    func testOneRepMaxCalculation_With5Reps_ReturnsCorrectValue()
}
```

**AAA Pattern:**
```swift
func testAddWorkoutSet() {
    // Arrange
    let dataManager = DataManager()
    let set = try! WorkoutSet(weight: 100, reps: 5, date: Date(), exerciseId: UUID())
    
    // Act
    dataManager.addWorkoutSet(set)
    
    // Assert
    XCTAssertEqual(dataManager.workoutSets.count, 1)
}
```

### UI Tests

**Focus on critical user flows:**
1. Add workout set
2. View PR dashboard
3. Browse exercises
4. Create custom exercise

**Example:**
```swift
func testAddWorkout() {
    let app = XCUIApplication()
    app.launch()
    
    app.buttons["Add Workout"].tap()
    // ... complete flow
    XCTAssertTrue(app.staticTexts["Workout added"].exists)
}
```

---

## Pull Request Process

### Before Submitting

- [ ] Code compiles without warnings
- [ ] All tests pass (`⌘U`)
- [ ] New features have unit tests
- [ ] UI changes have been tested on multiple devices
- [ ] Code follows style guidelines
- [ ] No commented-out code or debug prints
- [ ] Documentation updated (if applicable)

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Refactoring
- [ ] Documentation update

## Testing
How has this been tested?

## Screenshots (if applicable)
Before | After

## Checklist
- [ ] Tests pass
- [ ] Code follows style guide
- [ ] Documentation updated
```

### Review Process

1. Create PR with descriptive title
2. Fill out PR template completely
3. Link related issues
4. Request review from maintainers
5. Address feedback promptly
6. Squash commits before merge (if requested)

---

## Documentation

### Code Comments

**When to comment:**
- Complex algorithms
- Non-obvious decisions
- Performance optimizations
- Workarounds

**When NOT to comment:**
- Self-explanatory code
- Redundant descriptions

```swift
// Bad: Redundant
// Set the name to "Test"
name = "Test"

// Good: Explains why
// Using Brzycki formula for 1-10 rep range accuracy
return weight * (36 / (37 - Double(reps)))
```

### Documentation Comments

Use Swift's `///` documentation syntax:

```swift
/// Calculates estimated one-rep max using Brzycki formula
/// - Parameters:
///   - weight: The weight lifted
///   - reps: Number of repetitions performed
/// - Returns: Estimated 1RM in the same units as weight
/// - Note: Accurate for 1-10 reps, less accurate for higher reps
func calculateOneRepMax(weight: Double, reps: Int) -> Double {
    // Implementation
}
```

---

## Design System

### Using Theme Tokens

**Always use theme constants:**
```swift
// Bad
.cornerRadius(16)
.padding(20)

// Good
.cornerRadius(AppTheme.Metrics.cornerRadius)
.padding(AppTheme.Metrics.paddingXL)
```

### Creating New Components

Follow Liquid Glass principles:
```swift
struct MyComponent: View {
    var body: some View {
        VStack {
            // Content
        }
        .glassCard()  // Use existing modifiers
    }
}
```

---

## Performance Guidelines

### Caching

- Use O(1) lookups (dictionaries) over O(n) scans (arrays)
- Implement cache expiration
- Incremental updates over full rebuilds

### Threading

- UI updates on main thread
- Heavy operations on background queues
- Use `@MainActor` for SwiftUI classes

```swift
DispatchQueue.main.async {
    self.data = newData  // @Published update
}
```

### Memory

- Avoid retain cycles with `[weak self]`
- Clean up observers in `deinit`
- Limit cache sizes

---

## Questions?

- Check existing issues and discussions
- Ask in GitHub Discussions
- Tag maintainers if urgent

---

## Thank You!

Your contributions make LoadProgress better for everyone. Happy coding!
