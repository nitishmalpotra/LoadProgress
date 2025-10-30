# LoadProgress - Design Specification

**Version:** 1.0
**Last Updated:** January 2025
**Design System:** iOS 26 Liquid Glass

---

## 1. Visual Overview

LoadProgress implements the **iOS 26 Liquid Glass** aesthetic, characterized by:
- Translucent frosted glass materials
- Layered depth through elevation and shadow
- Subtle specular highlights and borders
- Floating card interfaces
- Spring-based animations
- Full Dark Mode adaptation

**Design Principles:**
1. **Clarity**: Information hierarchy is immediately apparent
2. **Efficiency**: Minimal taps to complete actions
3. **Beauty**: Modern, refined aesthetic
4. **Consistency**: Unified design language across all screens
5. **Accessibility**: WCAG 2.1 AA compliant throughout

---

## 2. Design System

### 2.1 Color Palette

#### Primary Colors

| Token | Light Mode | Dark Mode | Usage |
|-------|------------|-----------|-------|
| `primary` | System Accent | System Accent | Primary CTAs, highlights |
| `secondary` | Teal | Teal | Secondary actions, badges |
| `tertiary` | Indigo | Indigo | Tertiary elements |

#### Semantic Colors

| Token | Color | Usage |
|-------|-------|-------|
| `success` | Green | PR notifications, success states |
| `warning` | Orange | Warnings, caution states |
| `error` | Red | Errors, destructive actions |
| `info` | Blue | Informational messages |

#### Glass Morphism Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `glassOverlay` | White 8% | Glass surface tint |
| `glassBorder` | White 18% | Glass element borders |
| `glassHighlight` | White 25% | Specular highlights |

#### Shadows

| Level | Opacity | Radius | Y-Offset | Usage |
|-------|---------|--------|----------|-------|
| `shadowLight` | 8% | 4pt | 2pt | Subtle elevation |
| `shadowMedium` | 12% | 10pt | 6pt | Cards |
| `shadowHeavy` | 18% | 20pt | 12pt | Floating elements |

### 2.2 Typography

**Font Family:** SF Rounded (system)

| Style | Size | Weight | Line Height | Usage |
|-------|------|--------|-------------|-------|
| Large Title | 34pt | Bold | 41pt | Hero text |
| Title | 28pt | Bold | 34pt | Screen titles |
| Title 2 | 22pt | Semibold | 28pt | Section headers |
| Title 3 | 20pt | Semibold | 25pt | Card headers |
| Headline | 17pt | Semibold | 22pt | Emphasized text |
| Body | 17pt | Regular | 22pt | Body text |
| Callout | 16pt | Regular | 21pt | Secondary text |
| Subheadline | 15pt | Medium | 20pt | Metadata |
| Footnote | 13pt | Regular | 18pt | Fine print |
| Caption | 12pt | Regular | 16pt | Labels |

### 2.3 Spacing Scale

| Token | Value | Usage |
|-------|-------|-------|
| `spacingXS` | 4pt | Compact spacing |
| `spacingS` | 8pt | Tight spacing |
| `spacingM` | 12pt | Default spacing |
| `spacingL` | 16pt | Comfortable spacing |
| `spacingXL` | 20pt | Generous spacing |
| `spacingXXL` | 24pt | Section spacing |

### 2.4 Corner Radii

| Token | Value | Usage |
|-------|-------|-------|
| `cornerRadiusXS` | 8pt | Chips, badges |
| `cornerRadiusS` | 12pt | Input fields |
| `cornerRadiusM` | 16pt | Default cards, buttons |
| `cornerRadiusL` | 20pt | Large cards |
| `cornerRadiusXL` | 24pt | Modal sheets |

### 2.5 Materials

| Material | Translucency | Usage |
|----------|--------------|-------|
| Ultra Thin | 90% | Cards, overlays |
| Thin | 80% | Navigation bars |
| Regular | 70% | Modal backgrounds |
| Thick | 60% | Heavy overlays |
| Ultra Thick | 50% | Full-screen modals |

---

## 3. Components Library

### 3.1 Glass Card

**Appearance:**
- Ultra thin material background
- 16pt corner radius
- White 18% border with overlay blend
- Medium shadow (12%, 10pt radius, 6pt offset)
- 16pt internal padding

**States:**
- Default
- Pressed (scale 0.98, reduce shadow)

**Usage:** Primary content containers

**Code:**
```swift
VStack { ... }
    .glassCard()
```

### 3.2 Floating Card

**Appearance:**
- Ultra thin material background
- 20pt corner radius (larger)
- White 18% border
- Heavy shadow (18%, 20pt radius, 12pt offset)
- 16pt internal padding

**States:**
- Default
- Pressed

**Usage:** Hero elements, featured content

### 3.3 Primary Button

**Appearance:**
- Solid accent color fill
- White text
- 16pt corner radius
- 20pt horizontal padding, 12pt vertical
- Medium shadow (scales on press)

**States:**
- Default (scale 1.0, shadow full)
- Pressed (scale 0.97, shadow reduced)
- Disabled (50% opacity)

**Animation:** Spring (0.3s response, 0.75 damping)

### 3.4 Secondary Button

**Appearance:**
- Thin material background
- Primary text color
- 16pt corner radius
- White 18% border overlay
- 20pt horizontal padding, 12pt vertical
- Light shadow

**States:**
- Default (scale 1.0)
- Pressed (scale 0.98)
- Disabled (50% opacity)

### 3.5 Glass Button

**Appearance:**
- Ultra thin material
- Accent color text
- 12pt corner radius
- 16pt horizontal padding, 8pt vertical
- Subtle shadow

**States:**
- Default
- Pressed (scale 0.95)

**Usage:** Inline actions, filter chips

### 3.6 Pill Button

**Appearance:**
- Capsule shape
- Customizable fill color
- White text (default)
- 20pt horizontal padding, 12pt vertical
- Medium shadow

**Animation:** Bouncy spring (0.28s response, 0.7 damping)

**Usage:** Modern CTAs, quick actions

### 3.7 Input Field

**Appearance:**
- Thin material background
- 12pt corner radius
- White 18% border
- 12pt padding
- Body font

**States:**
- Inactive
- Active (highlighted border)
- Error (red border)

### 3.8 Section Header

**Appearance:**
- Title 3 font (20pt semibold)
- Primary text color
- 8pt bottom spacing

**Usage:** Section dividers

---

## 4. Screen-by-Screen Specifications

### 4.1 ContentView (Tab Container)

**Layout:**
- TabView with 5 tabs
- Background: Gradient (systemBackground 85% → secondarySystemBackground 95%)
- Accent color: Primary
- Tab bar: Standard iOS appearance with glass material

**Tabs:**
1. Workout (SF Symbol: `figure.strengthtraining.traditional`)
2. Records (SF Symbol: `trophy.fill`)
3. Analytics (SF Symbol: `chart.bar.fill`)
4. Exercises (SF Symbol: `dumbbell.fill`)
5. Progress (SF Symbol: `chart.line.uptrend.xyaxis`)

**States:**
- Normal (5 tabs visible)
- Error (alert overlay)

---

### 4.2 WorkoutLogView (Workout Tab)

**Purpose:** Log workout sets for selected date

**Layout:**
```
Navigation Stack
├─ Date Picker (Wheel style)
├─ Workout List (ScrollView)
│  ├─ WorkoutSetRow (repeating)
│  └─ Empty State ("No workouts for this date")
└─ Floating Action Button ("Add Workout")
```

**Components:**
- **Date Picker**: Glass card, compact style
- **Workout List**: Vertical stack with 16pt spacing
- **Empty State**: Center-aligned text with icon
- **FAB**: Primary pill button, fixed bottom-right

**States:**
- Loading (skeleton placeholders)
- Empty (no workouts for date)
- Populated (workout list visible)
- Adding workout (sheet presented)

---

### 4.3 AddWorkoutView (Sheet Modal)

**Purpose:** Three-tier exercise selection and set logging

**Layout:**
```
Form (Grouped Style)
├─ Section: Exercise Type
│  └─ Segmented Control (Weight Training / Bodyweight)
├─ Section: Muscle Group
│  └─ List (filtered by type)
├─ Section: Exercise
│  └─ List (filtered by type + muscle group)
├─ Section: Set Details
│  ├─ Weight Field (conditional)
│  ├─ Reps Field
│  ├─ RPE Slider (1-10)
│  ├─ Rest Time Display (if timer used)
│  ├─ Notes Field
│  └─ Failure Toggle
└─ Button Row
    ├─ Cancel (secondary)
    └─ Add Workout (primary)
```

**Presentation:**
- Sheet with medium detent
- Glass background
- Dismiss on cancel or save

**Validation:**
- Weight > 0 (if provided)
- Reps > 0 (required)
- RPE 1-10 (if provided)
- Real-time error display

---

### 4.4 PRDashboardView (Records Tab)

**Purpose:** Visualize PR progression over time

**Layout:**
```
VStack
├─ Time Range Picker (Week/Month/Year/All)
├─ Exercise Picker (Dropdown)
├─ Chart
│  └─ Line Chart (Date vs Value)
└─ Legend (Glass card)
```

**Chart Configuration:**
- Line color: Primary accent
- Point color: Primary accent
- Grid lines: Subtle gray
- X-axis: Date
- Y-axis: Weight or Volume
- Background: Transparent

**States:**
- No data (empty state message)
- Loading (skeleton chart)
- Data loaded (interactive chart)

---

### 4.5 VolumeAnalyticsView (Analytics Tab)

**Purpose:** Volume breakdown by muscle group

**Layout:**
```
VStack
├─ Time Range Picker (Week/Month/3 Months)
├─ Volume by Muscle Group
│  └─ Horizontal Bar Chart
├─ Tap to Expand
│  └─ Sheet: Exercise-level breakdown
└─ Guidelines Button
    └─ Sheet: Optimal volume ranges
```

**Chart:**
- Bar color: Muscle group specific (color-coded)
- Bar height: Proportional to volume
- Labels: Muscle group name + volume value

**States:**
- No data
- Data loaded
- Expanded view (exercise breakdown)
- Guidelines sheet

---

### 4.6 ExercisesView (Exercises Tab)

**Purpose:** Browse exercise library

**Layout:**
```
VStack
├─ Type Picker (Weight Training / Bodyweight)
├─ Search Bar
├─ Exercise List (Grouped by Muscle Group)
│  └─ ExerciseListView (repeating)
└─ Add Exercise Button
```

**Exercise Row:**
- Icon (24pt)
- Name (headline font)
- Type badge
- Muscle group label (secondary text)
- Chevron (navigation indicator)

**States:**
- Loading
- Populated
- Filtered (search active)
- Empty (no matches)

---

### 4.7 ProgressView (Progress Tab)

**Purpose:** Weight and reps trends per exercise

**Layout:**
```
VStack
├─ Exercise Type Picker
├─ Muscle Group Picker (filtered)
├─ Exercise Picker (filtered)
├─ Time Range Picker
├─ Weight Chart (Line)
└─ Reps Chart (Line)
```

**Charts:**
- Dual charts stacked vertically
- Same styling as PR charts
- Synchronized zoom

**States:**
- No selection
- No data for exercise
- Charts loaded

---

### 4.8 ExerciseDetailView

**Purpose:** Comprehensive exercise information and history

**Layout:**
```
ScrollView
├─ Header
│  ├─ Icon (48pt)
│  ├─ Name (Title font)
│  ├─ Type badge
│  └─ Difficulty badge
├─ Details Section (Glass card)
│  ├─ Muscle groups
│  ├─ Equipment
│  ├─ Description
│  └─ Form cues (numbered list)
├─ Statistics Section (Glass card)
│  ├─ Total sets
│  ├─ Total volume
│  ├─ Average weight
│  ├─ Average reps
│  └─ Last performed
└─ History Section
    └─ Workout sets (grouped by date)
```

---

### 4.9 RestTimer (Component)

**Purpose:** Countdown timer for rest periods

**Layout:**
```
VStack (Glass Card)
├─ Circular Progress Ring
├─ Time Display (MM:SS)
├─ Control Buttons
│  ├─ Play/Pause
│  └─ Reset
└─ Preset Chips (30s, 60s, 90s, 2m, 3m, 5m)
```

**Animation:**
- Progress ring decrements smoothly
- Spring animation on press
- Haptic feedback on completion

---

## 5. Navigation Flow

```
ContentView (TabView)
├─ Tab 1: Workout
│  ├─ WorkoutLogView
│  └─ Sheet: AddWorkoutView
│      └─ RestTimer (optional)
├─ Tab 2: Records
│  └─ PRDashboardView
├─ Tab 3: Analytics
│  ├─ VolumeAnalyticsView
│  ├─ Sheet: Exercise Breakdown
│  └─ Sheet: Volume Guidelines
├─ Tab 4: Exercises
│  ├─ ExercisesView
│  ├─ Nav: ExerciseDetailView
│  └─ Sheet: AddExerciseView
└─ Tab 5: Progress
    └─ ProgressView
```

---

## 6. Animations & Transitions

### 6.1 Screen Transitions

- Tab changes: Fade (0.2s)
- Sheet presentation: Slide up (0.3s spring)
- Navigation push: Slide from right (0.3s)

### 6.2 Component Animations

- Button press: Scale + shadow (spring 0.3s)
- Card tap: Scale 0.98 (quick 0.2s)
- List item delete: Slide + fade (0.3s)
- Chart load: Fade in + scale (0.4s)

### 6.3 Accessibility

- Reduce Motion: All animations disabled, instant transitions
- Crossfade fallback for critical UI changes

---

## 7. Accessibility & Responsiveness

### 7.1 Dynamic Type

- All text scales with system font size
- Minimum touch targets: 44×44pt
- Layout reflows at all text sizes

### 7.2 VoiceOver

- All interactive elements labeled
- Custom labels for charts and graphs
- Logical reading order

### 7.3 Color Contrast

- Primary text: 7:1 contrast minimum
- Secondary text: 4.5:1 contrast minimum
- Passes WCAG 2.1 AA in both modes

### 7.4 Dark Mode

- Semantic colors adapt automatically
- Glass materials adjust translucency
- Shadows remain visible

### 7.5 Device Support

- iPhone SE (320pt width) through Pro Max (428pt)
- iPad (landscape + portrait)
- Safe area insets respected
- Adaptive spacing and padding

---

## 8. Component Hierarchy (Example: WorkoutLogView)

```
NavigationStack
└─ VStack
    ├─ DatePicker [Glass Card]
    ├─ ScrollView
    │   └─ LazyVStack
    │       └─ ForEach(workouts)
    │           └─ WorkoutSetRow [Glass Card]
    │               ├─ HStack
    │               │   ├─ Image (exercise icon)
    │               │   ├─ VStack
    │               │   │   ├─ Text (exercise name) [Headline]
    │               │   │   └─ Text (weight x reps) [Body]
    │               │   └─ Spacer()
    │               ├─ HStack (badges)
    │               │   ├─ RPE Badge [Pill]
    │               │   └─ Failure Badge [Pill]
    │               └─ Divider
    └─ FAB [Floating Card]
        └─ Button("Add Workout") [Primary Pill]
```

---

## 9. Constraints & Limitations

### 9.1 Design Constraints

- iOS 18.0+ only (SwiftUI materials)
- No custom fonts (SF Rounded only)
- Limited to system SF Symbols
- No dark/light mode toggle (system preference only)

### 9.2 Technical Constraints

- Charts require iOS 16+ (Swift Charts)
- Glass materials may reduce performance on older devices
- Material stacking limited to 3 layers for performance

---

## 10. Future Design Enhancements

1. **Custom Themes**: User-selectable color schemes
2. **Widget Design**: Home screen widgets for quick logging
3. **Apple Watch Face**: Complications for workout data
4. **Haptic Patterns**: Custom haptic sequences for PRs
5. **Particle Effects**: Celebration animations
6. **3D Touch**: Peek and pop for workout details

---

## 11. Design Files & Assets

**Asset Catalog:**
- AppIcon (1024×1024)
- LaunchScreen (SF Symbol based)
- SF Symbols (50+ exercise icons)

**No Custom Assets:** 100% SF Symbols and system colors

---

## 12. Design Review Checklist

- [ ] All screens use AppTheme tokens
- [ ] Corner radii consistent (8/12/16/20/24pt)
- [ ] Spacing uses scale (4/8/12/16/20/24pt)
- [ ] Typography uses SF Rounded weights
- [ ] Glass materials don't exceed 3 layers
- [ ] Shadows use predefined configs
- [ ] Animations respect Reduce Motion
- [ ] Touch targets ≥ 44×44pt
- [ ] Color contrast ≥ 4.5:1
- [ ] Dark Mode tested
- [ ] Dynamic Type tested (XS → XXXL)
- [ ] VoiceOver labels present

---

## 13. Summary

LoadProgress implements a cohesive, modern design system based on iOS 26 Liquid Glass principles. The visual language prioritizes clarity, efficiency, and beauty while maintaining strict accessibility compliance. All components are reusable, responsive, and performant.

**Design Highlights:**
- 400+ lines of design system code
- 50+ design tokens
- 8 reusable components
- 13 screens/views
- WCAG 2.1 AA compliant
- Full Dark Mode support
