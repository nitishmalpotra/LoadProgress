import SwiftUI
import Charts

struct ExerciseDetailView: View {
    @EnvironmentObject var dataManager: DataManager
    @State private var showingError = false
    @State private var errorMessage = ""
    let exercise: Exercise

    var exerciseSets: [WorkoutSet] {
        dataManager.workoutSets
            .filter { $0.exerciseId == exercise.id }
            .sorted { $0.date > $1.date }
    }

    private func showError(_ message: String) {
        errorMessage = message
        showingError = true
        Logger.shared.log(message, level: .error)
    }

    var body: some View {
        ZStack {
            AppTheme.Colors.backgroundGradient
                .ignoresSafeArea()

            ScrollView {
                VStack(spacing: AppTheme.Metrics.verticalSpacing) {
                    if exercise.type == .weightTraining {
                        glassSection(title: "Weight Progress") {
                            if exerciseSets.isEmpty {
                                ContentUnavailableView(
                                    "No Data",
                                    systemImage: "chart.line.uptrend.xyaxis",
                                    description: Text("Add workouts to see your progress")
                                )
                            } else {
                                Chart {
                                    ForEach(exerciseSets) { set in
                                        if let weight = set.weight {
                                            LineMark(
                                                x: .value("Date", set.date),
                                                y: .value("Weight", weight)
                                            )
                                            .interpolationMethod(.catmullRom)
                                            .foregroundStyle(AppTheme.Colors.primaryAccent)
                                            .symbol(.circle)
                                        }
                                    }
                                }
                                .chartYAxis {
                                    AxisMarks(position: .leading)
                                }
                                .frame(height: 220)
                                .accessibilityLabel("Weight progress chart")
                            }
                        }
                    }

                    glassSection(title: "Recent Sets") {
                        if exerciseSets.isEmpty {
                            ContentUnavailableView(
                                "No Sets",
                                systemImage: "dumbbell.fill",
                                description: Text("Add your first set to get started")
                            )
                        } else {
                            VStack(spacing: AppTheme.Metrics.verticalSpacing) {
                                ForEach(exerciseSets.prefix(10)) { set in
                                    WorkoutSetRow(exercise: exercise, set: set)
                                }
                            }
                        }
                    }

                    glassSection(title: "Exercise Info") {
                        VStack(alignment: .leading, spacing: 12) {
                            infoRow(icon: "bolt.fill", title: "Type", value: exercise.type.rawValue)
                            infoRow(icon: "figure.arms.open", title: "Primary Muscle", value: exercise.muscleGroup.rawValue)

                            if !exercise.secondaryMuscleGroups.isEmpty {
                                infoRow(
                                    icon: "figure.mixed.cardio",
                                    title: "Secondary Muscles",
                                    value: exercise.secondaryMuscleGroups
                                        .map { $0.rawValue }
                                        .joined(separator: ", ")
                                )
                            }

                            if !exercise.formCues.isEmpty {
                                VStack(alignment: .leading, spacing: 8) {
                                    Label("Form Cues", systemImage: "list.bullet")
                                        .font(AppTheme.Fonts.headline())
                                        .foregroundStyle(.secondary)
                                    ForEach(exercise.formCues, id: \.self) { cue in
                                        Text("• \(cue)")
                                            .font(AppTheme.Fonts.subheadline())
                                    }
                                }
                            }
                        }
                    }
                }
                .padding(.horizontal, AppTheme.Metrics.horizontalPadding)
                .padding(.vertical, AppTheme.Metrics.verticalSpacing)
            }
        }
        .navigationTitle(exercise.name)
        .toolbarBackground(.ultraThinMaterial, for: .navigationBar)
        .toolbarBackground(.visible, for: .navigationBar)
        .alert("Error", isPresented: $showingError) {
            Button("OK", role: .cancel) { }
        } message: {
            Text(errorMessage)
        }
        .onAppear {
            Logger.shared.log("Viewing details for exercise: \(exercise.name)", level: .debug)
        }
    }

    private func glassSection<Content: View>(title: String, @ViewBuilder content: () -> Content) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            Text(title)
                .font(AppTheme.Fonts.title())
                .foregroundStyle(.primary)
            content()
        }
        .glassCard()
    }

    private func infoRow(icon: String, title: String, value: String) -> some View {
        HStack(spacing: 12) {
            Image(systemName: icon)
                .foregroundStyle(AppTheme.Colors.primaryAccent)
            VStack(alignment: .leading, spacing: 4) {
                Text(title)
                    .font(AppTheme.Fonts.subheadline())
                    .foregroundStyle(.secondary)
                Text(value)
                    .font(AppTheme.Fonts.headline())
            }
            Spacer()
        }
    }
}
