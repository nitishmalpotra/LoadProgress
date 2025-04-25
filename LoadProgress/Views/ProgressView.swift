import SwiftUI
import Charts

struct ProgressView: View {
    @EnvironmentObject var dataManager: DataManager
    @State private var selectedType: Exercise.ExerciseType?
    @State private var selectedMuscleGroup: Exercise.MuscleGroup?
    @State private var selectedExercise: Exercise?
    @State private var timeRange: TimeRange = .month
    
    enum TimeRange: String, CaseIterable {
        case week = "Week"
        case month = "Month"
        case year = "Year"
        
        var days: Int {
            switch self {
            case .week: return 7
            case .month: return 30
            case .year: return 365
            }
        }
    }
    
    var filteredMuscleGroups: [Exercise.MuscleGroup] {
        guard let type = selectedType else { return [] }
        return Array(Set(dataManager.exercises
            .filter { $0.type == type }
            .map { $0.muscleGroup }))
            .sorted { $0.rawValue < $1.rawValue }
    }
    
    var filteredExercises: [Exercise] {
        guard let type = selectedType,
              let muscleGroup = selectedMuscleGroup else { return [] }
        return dataManager.exercises
            .filter { $0.type == type && $0.muscleGroup == muscleGroup }
            .sorted { $0.name < $1.name }
    }
    
    @Environment(\.accessibilityReduceMotion) var reduceMotion
    
    var body: some View {
        NavigationView {
            ScrollView {
                VStack(spacing: 16) {
                    // Exercise Type Picker
                    Picker("Type", selection: $selectedType) {
                        Text("Select Type").tag(Optional<Exercise.ExerciseType>.none)
                        ForEach(Exercise.ExerciseType.allCases, id: \.self) { type in
                            Text(type.rawValue).tag(Optional(type))
                        }
                    }
                    .pickerStyle(.menu)
                    .onChange(of: selectedType) { _, _ in
                        selectedMuscleGroup = nil
                        selectedExercise = nil
                    }
                    
                    // Muscle Group Picker
                    if selectedType != nil {
                        Picker("Muscle Group", selection: $selectedMuscleGroup) {
                            Text("Select Muscle Group").tag(Optional<Exercise.MuscleGroup>.none)
                            ForEach(filteredMuscleGroups, id: \.self) { group in
                                Text(group.rawValue).tag(Optional(group))
                            }
                        }
                        .pickerStyle(.menu)
                        .onChange(of: selectedMuscleGroup) { _, _ in
                            selectedExercise = nil
                        }
                    }
                    
                    // Exercise Picker
                    if selectedMuscleGroup != nil {
                        Picker("Exercise", selection: $selectedExercise) {
                            Text("Select Exercise").tag(Optional<Exercise>.none)
                            ForEach(filteredExercises) { exercise in
                                Text(exercise.name).tag(Optional(exercise))
                            }
                        }
                        .pickerStyle(.menu)
                    }
                    
                    if let exercise = selectedExercise {
                        // Time Range Picker
                        Picker("Time Range", selection: $timeRange) {
                            ForEach(TimeRange.allCases, id: \.self) { range in
                                Text(range.rawValue).tag(range)
                            }
                        }
                        .pickerStyle(.segmented)
                        .padding(.horizontal)
                        .padding(.bottom, 8)
                        
                        // Progress Charts
                        VStack(alignment: .leading, spacing: 20) {
                            ProgressCard<Double>(
                                title: "Weight Progress",
                                exercise: exercise,
                                timeRange: timeRange,
                                metric: \.weight,
                                color: .blue,
                                unit: "kg"
                            )
                            .padding(.horizontal)
                            .padding(.bottom, 16)
                            .animation(reduceMotion ? .none : .easeInOut(duration: 0.3), value: exercise)
                            
                            ProgressCard<Double>(
                                title: "Reps Progress",
                                exercise: exercise,
                                timeRange: timeRange,
                                metric: \.reps,
                                color: .green,
                                unit: "reps"
                            )
                            .padding(.horizontal)
                            .padding(.bottom, 16)
                            .animation(reduceMotion ? .none : .easeInOut(duration: 0.3), value: exercise)
                        }
                    } else {
                        ContentUnavailableView(
                            "Select an Exercise",
                            systemImage: "dumbbell.fill",
                            description: Text("Choose an exercise to view your progress over time")
                        )
                        .padding(.top, 40)
                    }
                }
                .padding(.top)
            }
            .background(Color(.systemGroupedBackground))
            .navigationTitle("Progress")
        }
    }
}

// Use an enum to represent either optional or non-optional keypath
enum MetricKeyPath<T> {
    case optional(KeyPath<WorkoutSet, T?>)
    case nonOptional(KeyPath<WorkoutSet, T>)
    
    func getValue(from set: WorkoutSet) -> T? {
        switch self {
        case .optional(let keyPath):
            return set[keyPath: keyPath]
        case .nonOptional(let keyPath):
            return set[keyPath: keyPath]
        }
    }
}

struct ProgressCard<T: BinaryFloatingPoint & Plottable>: View {
    let title: String
    let exercise: Exercise
    let timeRange: ProgressView.TimeRange
    let metricPath: MetricKeyPath<T>
    let color: Color
    let unit: String
    
    // Init for optional metrics like weight
    init(title: String, exercise: Exercise, timeRange: ProgressView.TimeRange, metric: KeyPath<WorkoutSet, T?>, color: Color, unit: String) {
        self.title = title
        self.exercise = exercise
        self.timeRange = timeRange
        self.metricPath = .optional(metric)
        self.color = color
        self.unit = unit
    }
    
    // Init for non-optional metrics like reps
    init(title: String, exercise: Exercise, timeRange: ProgressView.TimeRange, metric: KeyPath<WorkoutSet, T>, color: Color, unit: String) {
        self.title = title
        self.exercise = exercise
        self.timeRange = timeRange
        self.metricPath = .nonOptional(metric)
        self.color = color
        self.unit = unit
    }
    
    @EnvironmentObject var dataManager: DataManager
    
    var filteredSets: [WorkoutSet] {
        let cutoffDate = Calendar.current.date(
            byAdding: .day,
            value: -timeRange.days,
            to: Date()
        ) ?? Date()
        
        return dataManager.workoutSets
            .filter { $0.exerciseId == exercise.id && $0.date >= cutoffDate }
            .sorted { $0.date < $1.date }
    }
    
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text(title)
                .font(.headline)
            
            if filteredSets.isEmpty {
                Text("No data available for this metric.")
                    .font(.subheadline)
            } else {
                Chart {
                    ForEach(filteredSets) { set in
                        if let value = metricPath.getValue(from: set) {
                            LineMark(
                                x: .value("Date", set.date),
                                y: .value("Value", value)
                            )
                            .foregroundStyle(color)
                            .interpolationMethod(.catmullRom)
                        }
                    }
                }
                .frame(height: 200)
                .chartYAxis {
                    AxisMarks(position: .leading)
                }
            }
        }
        .cardStyle()
    }
}