import SwiftUI
import Charts

struct VolumeAnalyticsView: View {
    @EnvironmentObject var dataManager: DataManager
    @State private var selectedMuscleGroup: Exercise.MuscleGroup?
    @State private var timeRange: TimeRange = .week
    @State private var showingVolumeGuide = false
    @Environment(\.accessibilityReduceMotion) var reduceMotion

    enum TimeRange: String, CaseIterable {
        case week = "Week"
        case month = "Month"
        case threeMonths = "3 Months"

        var days: Int {
            switch self {
            case .week: return 7
            case .month: return 30
            case .threeMonths: return 90
            }
        }
    }

    var body: some View {
        NavigationStack {
            ZStack {
                AppTheme.Colors.backgroundGradient
                    .ignoresSafeArea()

                ScrollView {
                    VStack(spacing: AppTheme.Metrics.verticalSpacing) {
                        Picker("Time Range", selection: $timeRange) {
                            ForEach(TimeRange.allCases, id: \.self) { range in
                                Text(range.rawValue).tag(range)
                            }
                        }
                        .pickerStyle(.segmented)
                        .padding(.horizontal, AppTheme.Metrics.horizontalPadding)
                        .padding(.top, AppTheme.Metrics.verticalSpacing)

                        glassSection(title: "Volume Overview") {
                            Chart(volumeByMuscleGroup) { data in
                                BarMark(
                                    x: .value("Volume", data.volume),
                                    y: .value("Muscle Group", data.muscleGroup.rawValue)
                                )
                                .foregroundStyle(AppTheme.Colors.primaryAccent.gradient)
                                .cornerRadius(12)
                            }
                            .frame(height: 280)
                            .chartXAxis(.hidden)
                            .chartYAxis {
                                AxisMarks { value in
                                    AxisValueLabel()
                                        .font(.system(size: 12, weight: .medium, design: .rounded))
                                }
                            }

                            VStack(spacing: 12) {
                                ForEach(volumeByMuscleGroup) { data in
                                    VolumeStatRow(data: data)
                                        .onTapGesture {
                                            withAnimation(reduceMotion ? .none : .easeInOut) {
                                                selectedMuscleGroup = data.muscleGroup
                                            }
                                        }
                                }
                            }
                        }

                        if let muscleGroup = selectedMuscleGroup {
                            glassSection(title: "Detailed Analysis: \(muscleGroup.rawValue)") {
                                VolumeProgressChart(
                                    data: volumeProgressData(for: muscleGroup),
                                    timeRange: timeRange
                                )
                                .frame(height: 220)
                                .animation(reduceMotion ? .none : .easeInOut(duration: 0.35), value: selectedMuscleGroup)

                                Divider().background(Color.white.opacity(0.1))

                                VStack(alignment: .leading, spacing: 12) {
                                    Text("Exercise Breakdown")
                                        .font(AppTheme.Fonts.headline())
                                        .foregroundStyle(.secondary)

                                    ForEach(exercisesForMuscleGroup(muscleGroup)) { exercise in
                                        ExerciseVolumeRow(
                                            exercise: exercise,
                                            volume: totalVolume(for: exercise)
                                        )
                                    }
                                }
                            }
                        }

                        Button("View Volume Guidelines") {
                            showingVolumeGuide = true
                            HapticManager.shared.playSelection()
                        }
                        .buttonStyle(SecondaryButtonStyle())
                        .padding(.horizontal, AppTheme.Metrics.horizontalPadding)
                        .padding(.bottom, AppTheme.Metrics.verticalSpacing)
                    }
                }
            }
            .navigationTitle("Volume Analytics")
            .toolbarBackground(.ultraThinMaterial, for: .navigationBar)
            .toolbarBackground(.visible, for: .navigationBar)
            .sheet(isPresented: $showingVolumeGuide) {
                VolumeGuideView()
                    .presentationDetents([.medium, .large])
                    .presentationBackground(.ultraThinMaterial)
            }
        }
    }

    // MARK: - Data Models

    struct VolumeData: Identifiable {
        let id = UUID()
        let muscleGroup: Exercise.MuscleGroup
        let volume: Double
        let setCount: Int
        let exerciseCount: Int
    }

    struct VolumeProgressPoint: Identifiable, Equatable {
        let id = UUID()
        let date: Date
        let volume: Double
    }

    // MARK: - Computed Properties

    private var volumeByMuscleGroup: [VolumeData] {
        Exercise.MuscleGroup.allCases.map { group in
            let exercises = exercisesForMuscleGroup(group)
            let volume = exercises.reduce(0.0) { sum, exercise in
                sum + totalVolume(for: exercise)
            }
            let setCount = exercises.reduce(0) { sum, exercise in
                sum + workoutSets(for: exercise).count
            }

            return VolumeData(
                muscleGroup: group,
                volume: volume,
                setCount: setCount,
                exerciseCount: exercises.count
            )
        }
        .sorted { $0.volume > $1.volume }
    }

    // MARK: - Helper Methods

    private func glassSection<Content: View>(title: String, @ViewBuilder content: () -> Content) -> some View {
        VStack(alignment: .leading, spacing: 16) {
            Text(title)
                .font(AppTheme.Fonts.title())
            content()
        }
        .glassCard()
        .padding(.horizontal, AppTheme.Metrics.horizontalPadding)
    }

    private func exercisesForMuscleGroup(_ group: Exercise.MuscleGroup) -> [Exercise] {
        dataManager.exercises
            .filter { $0.muscleGroup == group }
            .sorted { $0.name < $1.name }
    }

    private func workoutSets(for exercise: Exercise) -> [WorkoutSet] {
        let cutoffDate = Calendar.current.date(
            byAdding: .day,
            value: -timeRange.days,
            to: Date()
        ) ?? Date()

        return dataManager.workoutSets
            .filter { $0.exerciseId == exercise.id && $0.date >= cutoffDate }
    }

    private func totalVolume(for exercise: Exercise) -> Double {
        workoutSets(for: exercise).reduce(0.0) { sum, set in
            if let weight = set.weight {
                return sum + (weight * set.reps)
            }
            return sum
        }
    }

    private func volumeProgressData(for muscleGroup: Exercise.MuscleGroup) -> [VolumeProgressPoint] {
        let calendar = Calendar.current
        let endDate = Date()
        let startDate = calendar.date(
            byAdding: .day,
            value: -timeRange.days,
            to: endDate
        ) ?? endDate

        var points: [VolumeProgressPoint] = []
        var currentDate = startDate

        while currentDate <= endDate {
            let dayStart = calendar.startOfDay(for: currentDate)
            let dayEnd = calendar.date(byAdding: .day, value: 1, to: dayStart) ?? currentDate

            let dayVolume = dataManager.workoutSets
                .filter { set in
                    guard let exercise = dataManager.exercises.first(where: { $0.id == set.exerciseId }),
                          exercise.muscleGroup == muscleGroup else { return false }
                    return set.date >= dayStart && set.date < dayEnd
                }
                .reduce(0.0) { sum, set in
                    if let weight = set.weight {
                        return sum + (weight * set.reps)
                    }
                    return sum
                }

            points.append(VolumeProgressPoint(date: currentDate, volume: dayVolume))
            currentDate = calendar.date(byAdding: .day, value: 1, to: currentDate) ?? endDate
        }

        return points
    }
}

// MARK: - Supporting Views

struct VolumeStatRow: View {
    let data: VolumeAnalyticsView.VolumeData

    var body: some View {
        HStack {
            VStack(alignment: .leading, spacing: 4) {
                Text(data.muscleGroup.rawValue)
                    .font(AppTheme.Fonts.headline())
                Text("\(data.exerciseCount) exercises, \(data.setCount) sets")
                    .font(AppTheme.Fonts.subheadline())
                    .foregroundStyle(.secondary)
            }

            Spacer()

            Text(String(format: "%.0f", data.volume))
                .font(AppTheme.Fonts.title())
                .foregroundColor(AppTheme.Colors.primaryAccent)
                .accessibilityLabel("Total volume \(String(format: "%.0f", data.volume))")
        }
        .padding(.vertical, 6)
    }
}

struct VolumeProgressChart: View {
    let data: [VolumeAnalyticsView.VolumeProgressPoint]
    let timeRange: VolumeAnalyticsView.TimeRange

    var body: some View {
        Chart(data) { point in
            LineMark(
                x: .value("Date", point.date),
                y: .value("Volume", point.volume)
            )
            .interpolationMethod(.catmullRom)
            .foregroundStyle(AppTheme.Colors.primaryAccent)

            AreaMark(
                x: .value("Date", point.date),
                y: .value("Volume", point.volume)
            )
            .interpolationMethod(.catmullRom)
            .foregroundStyle(AppTheme.Colors.primaryAccent.opacity(0.15))
        }
        .chartXAxis {
            AxisMarks(values: .stride(by: .day, count: timeRange == .week ? 1 : 7)) { value in
                if value.as(Date.self) != nil {
                    AxisValueLabel(format: .dateTime.day().month())
                }
            }
        }
        .chartYAxis {
            AxisMarks(position: .leading)
        }
        .accessibilityLabel("Volume trend chart")
    }
}

struct ExerciseVolumeRow: View {
    let exercise: Exercise
    let volume: Double

    var body: some View {
        HStack {
            Text(exercise.name)
                .font(AppTheme.Fonts.subheadline())
            Spacer()
            Text(String(format: "%.0f", volume))
                .font(AppTheme.Fonts.subheadline())
                .foregroundStyle(.secondary)
        }
        .padding(.vertical, 4)
    }
}

struct VolumeGuideView: View {
    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 16) {
                    Section("Weekly Volume Recommendations") {
                        ForEach(Exercise.MuscleGroup.allCases, id: \.self) { group in
                            VStack(alignment: .leading, spacing: 8) {
                                Text(group.rawValue)
                                    .font(AppTheme.Fonts.headline())
                                Text(volumeGuide(for: group))
                                    .font(AppTheme.Fonts.subheadline())
                                    .foregroundStyle(.secondary)
                            }
                            .glassCard()
                        }
                    }

                    Section("Important Notes") {
                        VStack(alignment: .leading, spacing: 8) {
                            Text("• Volume recommendations are general guidelines and should be adjusted based on individual recovery capacity and goals")
                            Text("• Progressive overload should be implemented gradually")
                            Text("• Pay attention to form and technique as volume increases")
                            Text("• Rest and recovery are crucial for optimal results")
                        }
                        .font(AppTheme.Fonts.subheadline())
                        .foregroundStyle(.secondary)
                        .glassCard()
                    }
                }
                .padding(.horizontal, AppTheme.Metrics.horizontalPadding)
                .padding(.vertical, AppTheme.Metrics.verticalSpacing)
            }
            .background(AppTheme.Colors.backgroundGradient.ignoresSafeArea())
            .navigationTitle("Volume Guidelines")
            .navigationBarTitleDisplayMode(.inline)
        }
    }

    private func volumeGuide(for group: Exercise.MuscleGroup) -> String {
        switch group {
        case .chest: return "10-20 sets per week"
        case .back: return "10-20 sets per week"
        case .legs: return "12-20 sets per week"
        case .shoulders: return "8-16 sets per week"
        case .arms: return "6-12 sets per week"
        case .core: return "8-16 sets per week"
        case .fullBody: return "Depends on exercise selection"
        case .forearms: return "4-8 sets per week"
        case .glutes: return "8-16 sets per week"
        case .upperBack: return "10-20 sets per week"
        case .lowerBack: return "6-12 sets per week"
        }
    }
}

#Preview {
    VolumeAnalyticsView()
        .environmentObject(DataManager())
}
