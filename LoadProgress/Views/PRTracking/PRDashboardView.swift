import SwiftUI
import Charts

struct PRDashboardView: View {
    @EnvironmentObject var dataManager: DataManager
    @EnvironmentObject var prManager: PRManager
    @State private var selectedExercise: Exercise?
    @State private var timeRange: TimeRange = .month
    @State private var showingPRAlert = false
    @State private var latestPR: PersonalRecord?

    enum TimeRange: String, CaseIterable {
        case week = "Week"
        case month = "Month"
        case year = "Year"
        case all = "All Time"

        var days: Int {
            switch self {
            case .week: return 7
            case .month: return 30
            case .year: return 365
            case .all: return Int.max
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

                        if let exercise = selectedExercise, let prs = personalRecords(for: exercise) {
                            glassSection {
                                HStack {
                                    VStack(alignment: .leading, spacing: 4) {
                                        Text(exercise.name)
                                            .font(AppTheme.Fonts.title())
                                        Text(exercise.muscleGroup.rawValue)
                                            .font(AppTheme.Fonts.subheadline())
                                            .foregroundStyle(.secondary)
                                    }
                                    Spacer()
                                    Button("Change") {
                                        selectedExercise = nil
                                    }
                                    .buttonStyle(SecondaryButtonStyle())
                                }
                            }

                            glassSection(title: "Progress Chart") {
                                Chart(prs) { pr in
                                    LineMark(
                                        x: .value("Date", pr.date),
                                        y: .value("Value", pr.value)
                                    )
                                    .foregroundStyle(by: .value("Type", pr.type.rawValue))
                                    PointMark(
                                        x: .value("Date", pr.date),
                                        y: .value("Value", pr.value)
                                    )
                                    .foregroundStyle(by: .value("Type", pr.type.rawValue))
                                }
                                .frame(height: 240)
                                .chartLegend(.visible)
                            }

                            glassSection(title: "Personal Records") {
                                VStack(spacing: 12) {
                                    ForEach(PRType.allCases, id: \.self) { type in
                                        if let pr = latestPR(type: type, for: exercise) {
                                            HStack {
                                                VStack(alignment: .leading, spacing: 4) {
                                                    Text(type.rawValue)
                                                        .font(AppTheme.Fonts.headline())
                                                    Text(pr.date.formatted(date: .abbreviated, time: .omitted))
                                                        .font(AppTheme.Fonts.footnote())
                                                        .foregroundStyle(.secondary)
                                                }
                                                Spacer()
                                                Text(String(format: "%.1f", pr.value))
                                                    .font(AppTheme.Fonts.title())
                                            }
                                            .accessibilityElement(children: .combine)
                                            .accessibilityLabel("Best \(type.rawValue) record")
                                            .accessibilityValue("\(String(format: "%.1f", pr.value)) on \(pr.date, style: .date)")
                                        }
                                    }
                                }
                            }
                        } else {
                            glassSection(title: "Select Exercise") {
                                ForEach(Exercise.ExerciseType.allCases, id: \.self) { type in
                                    DisclosureGroup(type.rawValue) {
                                        ForEach(exercisesForType(type)) { exercise in
                                            Button {
                                                withAnimation(.spring(response: 0.3, dampingFraction: 0.8)) {
                                                    selectedExercise = exercise
                                                }
                                            } label: {
                                                HStack {
                                                    Text(exercise.name)
                                                        .font(AppTheme.Fonts.headline())
                                                    Spacer()
                                                    if hasPersonalRecords(for: exercise) {
                                                        Image(systemName: "trophy.fill")
                                                            .foregroundColor(.yellow)
                                                    }
                                                }
                                                .padding(.vertical, 6)
                                            }
                                            .buttonStyle(.plain)
                                        }
                                    }
                                }
                            }
                        }

                        if !filteredPRs.isEmpty {
                            glassSection(title: "Recent Personal Records") {
                                VStack(spacing: AppTheme.Metrics.verticalSpacing) {
                                    ForEach(filteredPRs.prefix(5)) { pr in
                                        PRRow(pr: pr, exercise: exerciseFor(pr))
                                    }
                                }
                            }
                        }
                    }
                }
            }
            .navigationTitle("Personal Records")
            .toolbarBackground(.ultraThinMaterial, for: .navigationBar)
            .toolbarBackground(.visible, for: .navigationBar)
            .alert("New Personal Record! 🎉", isPresented: $showingPRAlert) {
                Button("OK", role: .cancel) {}
            } message: {
                if let pr = latestPR, let exercise = exerciseFor(pr) {
                    Text("You set a new \(pr.type.rawValue) record for \(exercise.name)!")
                }
            }
            .onReceive(NotificationCenter.default.publisher(for: .newPersonalRecord)) { notification in
                if let pr = notification.userInfo?["pr"] as? PersonalRecord {
                    latestPR = pr
                    showingPRAlert = true
                }
            }
        }
    }

    private func glassSection<Content: View>(title: String? = nil, @ViewBuilder content: () -> Content) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            if let title {
                Text(title)
                    .font(AppTheme.Fonts.title())
            }
            content()
        }
        .glassCard()
        .padding(.horizontal, AppTheme.Metrics.horizontalPadding)
        .padding(.top, AppTheme.Metrics.verticalSpacing)
    }

    private var filteredPRs: [PersonalRecord] {
        let cutoffDate = Calendar.current.date(
            byAdding: .day,
            value: -timeRange.days,
            to: Date()
        ) ?? Date()

        return prManager.personalRecords
            .filter { timeRange == .all || $0.date >= cutoffDate }
            .sorted { $0.date > $1.date }
    }

    private func exercisesForType(_ type: Exercise.ExerciseType) -> [Exercise] {
        dataManager.exercises
            .filter { $0.type == type }
            .sorted { $0.name < $1.name }
    }

    private func hasPersonalRecords(for exercise: Exercise) -> Bool {
        prManager.personalRecords.contains { $0.exerciseId == exercise.id }
    }

    private func personalRecords(for exercise: Exercise) -> [PersonalRecord]? {
        let records = prManager.personalRecords
            .filter { $0.exerciseId == exercise.id }
            .sorted { $0.date < $1.date }
        return records.isEmpty ? nil : records
    }

    private func latestPR(type: PRType, for exercise: Exercise) -> PersonalRecord? {
        prManager.personalRecords
            .filter { $0.exerciseId == exercise.id && $0.type == type }
            .max { $0.value < $1.value }
    }

    private func exerciseFor(_ pr: PersonalRecord) -> Exercise? {
        dataManager.exercises.first { $0.id == pr.exerciseId }
    }
}

// MARK: - Supporting Views

struct PRRow: View {
    let pr: PersonalRecord
    let exercise: Exercise?

    var body: some View {
        HStack(spacing: 12) {
            VStack(alignment: .leading, spacing: 4) {
                Text(exercise?.name ?? "Unknown Exercise")
                    .font(AppTheme.Fonts.headline())
                Text(pr.type.rawValue)
                    .font(AppTheme.Fonts.subheadline())
                    .foregroundStyle(.secondary)
            }

            Spacer()

            VStack(alignment: .trailing, spacing: 4) {
                Text(String(format: "%.1f", pr.value))
                    .font(AppTheme.Fonts.title())
                Text(pr.date.formatted(date: .abbreviated, time: .omitted))
                    .font(AppTheme.Fonts.footnote())
                    .foregroundStyle(.secondary)
            }
        }
        .glassBackground()
        .padding(.horizontal, AppTheme.Metrics.cardPadding * 0.5)
        .padding(.vertical, AppTheme.Metrics.cardPadding * 0.4)
        .accessibilityElement(children: .combine)
        .accessibilityLabel("Personal Record for \(exercise?.name ?? "Unknown Exercise")")
        .accessibilityValue("\(String(format: "%.1f", pr.value)) on \(pr.date, style: .date)")
    }
}

#Preview {
    PRDashboardView()
        .environmentObject(DataManager())
        .environmentObject(PRManager(dataManager: DataManager()))
}
