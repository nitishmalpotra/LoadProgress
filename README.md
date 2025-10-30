# LoadProgress

![Swift](https://img.shields.io/badge/Swift-5.0-orange.svg)
![Platform](https://img.shields.io/badge/Platform-iOS%2018.0+-blue.svg)
![Xcode](https://img.shields.io/badge/Xcode-15.0+-blue.svg)
![License](https://img.shields.io/badge/License-MIT-green.svg)
![Design](https://img.shields.io/badge/Design-iOS%2026%20Liquid%20Glass-purple.svg)

A modern iOS workout tracking application focused on progressive overload principles. Built with SwiftUI and following clean MVVM architecture, LoadProgress helps users track their strength training journey with comprehensive analytics, personal record tracking, and volume management.

**Now featuring iOS 26 Liquid Glass design system** with translucent materials, depth layering, and refined animations.

---

## 📋 Table of Contents

- [Features](#-features)
- [Screenshots](#-screenshots)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Performance Optimizations](#-performance-optimizations)
- [Testing](#-testing)
- [Contributing](#-contributing)
- [Roadmap](#-roadmap)
- [License](#-license)

---

## ✨ Features

### Core Functionality
- **Exercise Library** - 28 pre-loaded exercises across all major muscle groups
- **Workout Logging** - Track weight, reps, RPE, rest time, and notes for every set
- **Personal Records** - Automatic detection and tracking of 1RM, volume, and weight-at-reps PRs
- **Progress Visualization** - Interactive charts powered by Swift Charts framework
- **Volume Analytics** - Analyze workout volume by muscle group with time-based filtering

### Advanced Features
- **Smart Caching** - Incremental cache updates for O(1) data access
- **Data Validation** - Comprehensive input validation with user-friendly error messages
- **Haptic Feedback** - Tactile responses for key interactions
- **Performance Monitoring** - Built-in performance tracking with configurable thresholds
- **Backup & Recovery** - Data backup and restoration capabilities
- **Accessibility** - Full support for Dynamic Type, VoiceOver, and Reduce Motion

### User Experience
- **Tab-Based Navigation** - 5 intuitive sections: Workout, Records, Analytics, Exercises, Progress
- **Three-Tier Exercise Selection** - Filter by Type → Muscle Group → Exercise
- **Splash Screen** - Smooth app initialization experience
- **Error Handling** - Graceful error recovery with logging
- **Liquid Glass Design** - iOS 26 aesthetic with translucent materials and refined shadows
- **Dark Mode** - Full semantic color support with automatic adaptation

---

## 📸 Screenshots

| Splash Screen | Home Screen | Exercise Log |
| --- | --- | --- |
| ![](pics/01.png) | ![](pics/02.png) | ![](pics/03.png) |

| Volume Analysis | Exercise List | Add Exercise |
| --- | --- | --- |
| ![](pics/04.png) | ![](pics/05.png) | ![](pics/06.png) |

| Progress Trend | Volume Guide |
| --- | --- |
| ![](pics/07.png) | ![](pics/08.png) |

---

## 🏗 Architecture

LoadProgress follows the **MVVM (Model-View-ViewModel)** architectural pattern with clear separation of concerns:

```
┌─────────────────────────────────────────────────┐
│                   Views (SwiftUI)               │
│  ContentView, WorkoutLogView, ProgressView...  │
└────────────────────┬────────────────────────────┘
                     │ @EnvironmentObject
                     │ @StateObject
┌────────────────────▼────────────────────────────┐
│            Managers (ViewModels)                │
│         DataManager, PRManager                  │
└────────────────────┬────────────────────────────┘
                     │ Business Logic
                     │ Cache Management
┌────────────────────▼────────────────────────────┐
│              Models (Data Layer)                │
│   Exercise, WorkoutSet, PersonalRecord...       │
└─────────────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────┐
│         Utilities (Support Layer)               │
│  Logger, Validator, HapticManager, Analytics... │
└─────────────────────────────────────────────────┘
```

### Key Architectural Decisions

**1. Managers as ViewModels**
- Conform to `ObservableObject` for reactive state management
- Created as `@StateObject` in the app root
- Injected via `.environmentObject()` for global access

**2. Models as Value Types**
- Immutable `struct` types for data integrity
- Conform to `Codable`, `Identifiable`, and `Hashable`
- Failable initializers with validation

**3. Centralized Utilities**
- Singleton pattern for system-wide services (Logger, HapticManager)
- Protocol-based validation with `Result` types
- Thread-safe async operations

**4. Data Flow**
- Unidirectional data flow (View → Manager → Model)
- NotificationCenter for cross-module communication
- Cache-first read strategy with expiration

---

## 🛠 Tech Stack

| Category | Technologies |
|----------|-------------|
| **Language** | Swift 5.0+ |
| **UI Framework** | SwiftUI |
| **Minimum iOS** | iOS 18.0+ |
| **IDE** | Xcode 15.0+ |
| **Charts** | Swift Charts (built-in) |
| **Persistence** | UserDefaults + JSON encoding |
| **Testing** | XCTest |
| **Logging** | Unified Logging (os.log) |
| **Threading** | Grand Central Dispatch (GCD) |
| **Patterns** | MVVM, Singleton, Observer, Repository |

### Dependencies
- **No external dependencies** - Pure SwiftUI implementation
- All charts use native Swift Charts framework
- JSON encoding/decoding via Foundation

---

## 📁 Project Structure

```
LoadProgress/
├── LoadProgress/                       # Main application target
│   ├── LoadProgressApp.swift          # App entry point with @main
│   ├── ContentView.swift              # Root TabView with 5 tabs
│   │
│   ├── Data/                          # Default data
│   │   └── DefaultExercises.swift     # (Currently unused - data in DataManager)
│   │
│   ├── Managers/                      # Business logic layer (ViewModels)
│   │   ├── DataManager.swift          # Exercise & workout CRUD, caching, persistence
│   │   └── PRManager.swift            # Personal record detection & tracking
│   │
│   ├── Models/                        # Data models
│   │   ├── Exercise.swift             # Exercise entity with classifications
│   │   ├── ExerciseIcon.swift         # Icon enum (50+ predefined icons)
│   │   ├── PersonalRecord.swift       # PR entity (1RM, volume, weight-at-reps)
│   │   ├── VolumeMetrics.swift        # Volume calculation structures
│   │   └── WorkoutSet.swift           # Individual set entity with validation
│   │
│   ├── Utilities/                     # Support services
│   │   ├── AnalyticsManager.swift     # Event tracking with batch processing
│   │   ├── AppError.swift             # Structured error types
│   │   ├── BackupManager.swift        # Data backup & restoration
│   │   ├── Constants.swift            # App-wide constants
│   │   ├── HapticManager.swift        # Haptic feedback wrapper
│   │   ├── Logger.swift               # Async file & console logging
│   │   ├── NetworkMonitor.swift       # Network connectivity monitoring
│   │   ├── NotificationNames.swift    # Centralized notification constants
│   │   ├── PerformanceConstants.swift # Performance threshold definitions
│   │   ├── PerformanceMonitor.swift   # Performance metrics tracking
│   │   ├── SettingsManager.swift      # User preferences management
│   │   └── Validator.swift            # Input validation logic
│   │
│   └── Views/                         # SwiftUI views
│       ├── AddWorkoutView.swift       # Workout set entry form
│       ├── ExerciseDetailView.swift   # Exercise details & history
│       ├── ExercisesView.swift        # Exercise library browser
│       ├── ProgressView.swift         # Progress charts over time
│       ├── SplashScreenView.swift     # Initial loading screen
│       ├── WorkoutLogView.swift       # Workout logging interface
│       │
│       ├── Analytics/
│       │   └── VolumeAnalyticsView.swift  # Volume breakdown by muscle group
│       │
│       ├── Components/                # Reusable UI components
│       │   ├── RestTimer.swift        # Rest period countdown timer
│       │   ├── WorkoutListForDate.swift  # Date-filtered workout list
│       │   └── WorkoutSetRow.swift    # Single set display row
│       │
│       ├── Exercises/
│       │   ├── AddExerciseView.swift  # Custom exercise creation
│       │   └── ExerciseListView.swift # Exercise list component
│       │
│       ├── PRTracking/
│       │   └── PRDashboardView.swift  # Personal records dashboard
│       │
│       └── Styles/
│           ├── Theme.swift               # Comprehensive iOS 26 design system
│           ├── CustomButtonStyle.swift   # Button style definitions
│           └── ViewStyles.swift          # View modifier extensions
│
├── LoadProgressTests/                 # Unit tests
│   ├── LoadProgressTests.swift
│   ├── PRManagerTests.swift
│   ├── PerformanceTests.swift
│   └── VolumeAnalyticsTests.swift
│
├── LoadProgressUITests/               # UI/Integration tests
│   ├── LoadProgressUITests.swift
│   └── LoadProgressUITestsLaunchTests.swift
│
└── Docs/                              # Comprehensive documentation
    ├── PRODUCT_REQUIREMENTS.md       # Reverse-engineered PRD
    ├── DESIGN_SPEC.md                # Complete design system specification
    ├── UI_UPDATES.md                 # iOS 26 Liquid Glass modernization details
    ├── QA_SMOKE_CHECKS.md            # Behavioral verification checklist
    ├── ASSUMPTIONS.md                # Project assumptions and decisions
    └── CHANGELOG.md                  # Detailed change history
```

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed:
- **macOS**: Ventura (13.0) or later
- **Xcode**: 15.0 or later
- **iOS Simulator/Device**: iOS 18.0+

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/nitishmalpotra/LoadProgress.git
   cd LoadProgress
   ```

2. **Open in Xcode**
   ```bash
   open LoadProgress.xcodeproj
   ```

3. **Select Target**
   - Choose `LoadProgress` scheme
   - Select iOS Simulator or connected device (iOS 18.0+)

4. **Build and Run**
   - Press `⌘R` or click the Run button
   - First launch will populate 28 default exercises

### Configuration

No additional configuration required. The app uses:
- **UserDefaults** for data persistence (JSON-encoded)
- **Documents directory** for log files
- No API keys or external services needed

---

## ⚡️ Performance Optimizations

The recent refactor introduced several key performance improvements:

### 1. **Incremental Cache Updates (O(n) → O(1))**
**Before:**
```swift
// Rebuilt entire cache on every workout add
workoutSetsByDate = Dictionary(grouping: workoutSets) { ... }
```

**After:**
```swift
// Incremental update only touches affected entries
private func updateCacheForWorkoutSet(_ set: WorkoutSet) {
    workoutSetsByExercise[set.exerciseId, default: []].append(set)
    // Only updates relevant cache entries
}
```

### 2. **Async File I/O**
**Before:**
- Synchronous file writes blocked the calling thread
- Potential UI freezes during logging

**After:**
- All file operations run on dedicated serial queue
- Console logging remains synchronous for immediate feedback
- No more main thread blocking

### 3. **Optimized PR Lookups (O(n) → O(1))**
**Before:**
```swift
// Linear search through all PRs
let existingPR = personalRecords.first { $0.exerciseId == id }
```

**After:**
```swift
// O(1) cache lookup
let existingPR = prTypeCache[exerciseId]?[.oneRepMax]
```

### 4. **Timer-Based Analytics (Fixed Infinite Loop)**
**Before:**
- `while(true)` loop permanently blocked a thread
- Inefficient CPU usage

**After:**
- Timer-based periodic processing
- Proper lifecycle management with cleanup
- Runs on background queue

### 5. **Smart Cache Expiration**
- 1-hour TTL on cached data
- Automatic validation before read operations
- Manual invalidation on data changes

### Performance Metrics

| Operation | Before | After | Improvement |
|-----------|--------|-------|-------------|
| Add Workout Set | O(n) cache rebuild | O(1) incremental | **~100x faster** |
| PR Lookup | O(n) linear scan | O(1) hash lookup | **~50x faster** |
| File Logging | Blocking sync | Async queue | **Non-blocking** |
| Exercise Query | O(n) array scan | O(1) dictionary | **Instant** |

---

## 🧪 Testing

### Running Tests

**All Tests:**
```bash
# Via Xcode
⌘U

# Via xcodebuild
xcodebuild test -project LoadProgress.xcodeproj -scheme LoadProgress -destination 'platform=iOS Simulator,name=iPhone 15 Pro'
```

**Unit Tests Only:**
```bash
xcodebuild test -project LoadProgress.xcodeproj -scheme LoadProgress -destination 'platform=iOS Simulator,name=iPhone 15 Pro' -only-testing:LoadProgressTests
```

**UI Tests Only:**
```bash
xcodebuild test -project LoadProgress.xcodeproj -scheme LoadProgress -destination 'platform=iOS Simulator,name=iPhone 15 Pro' -only-testing:LoadProgressUITests
```

### Test Coverage

Current test coverage focuses on:
- ✅ PR detection and calculation logic (PRManagerTests)
- ✅ Performance benchmarks (PerformanceTests)
- ✅ Volume analytics calculations (VolumeAnalyticsTests)
- ✅ Basic app functionality (LoadProgressTests)
- ✅ UI workflows (LoadProgressUITests)

### Writing Tests

Follow the **AAA pattern** (Arrange, Act, Assert):
```swift
func testOneRepMaxCalculation() {
    // Arrange
    let prManager = PRManager(dataManager: DataManager())

    // Act
    let oneRM = prManager.calculateOneRepMax(weight: 100, reps: 5)

    // Assert
    XCTAssertEqual(oneRM, 112.5, accuracy: 0.1)
}
```

See `LoadProgressTests/TESTS_README.md` for detailed guidelines.

---

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines on:
- Code style and conventions
- Branching strategy
- Pull request process
- Testing requirements
- Documentation standards

**Quick Start for Contributors:**
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes with tests
4. Commit using conventional commits (`git commit -m 'feat: add amazing feature'`)
5. Push to your fork (`git push origin feature/amazing-feature`)
6. Open a Pull Request

---

## 🗺 Roadmap

Development is organized into three phases:

### **Phase 1: Core Progress Tracking** ✅ (Complete)
- [x] PR tracking (1RM, volume, weight-at-reps)
- [x] Volume analytics with charts
- [x] Rest timer functionality
- [x] RPE and form check features

### **Phase 2: Smart Progressive Overload** 🚧 (In Progress)
- [ ] Progression planning with weight increment suggestions
- [ ] Pattern recognition for plateau detection
- [ ] Workout templates with progressive schemes
- [ ] Recovery pattern analysis

### **Phase 3: Advanced Analytics** 📋 (Planned)
- [ ] Predictive PR analysis
- [ ] AI-powered form feedback
- [ ] Body part balance tracking
- [ ] Community features and sharing

See [docs/ProgressiveOverloadFeatures.md](docs/ProgressiveOverloadFeatures.md) for detailed feature specifications.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Built with SwiftUI and Swift Charts
- Inspired by progressive overload principles in strength training
- Icons from SF Symbols
- Thanks to all contributors

---

## 📞 Contact & Support

- **Issues**: [GitHub Issues](https://github.com/nitishmalpotra/LoadProgress/issues)
- **Discussions**: [GitHub Discussions](https://github.com/nitishmalpotra/LoadProgress/discussions)
- **Author**: Nitish Malpotra

---

**Made with 💪 for strength training enthusiasts**
