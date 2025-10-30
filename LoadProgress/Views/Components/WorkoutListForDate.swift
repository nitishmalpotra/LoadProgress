import SwiftUI

struct WorkoutListForDate: View {
    @EnvironmentObject var dataManager: DataManager
    @State private var showingError = false
    @State private var errorMessage = ""
    let date: Date

    var workoutsForDate: [WorkoutSet] {
        dataManager.workoutSets
            .filter { Calendar.current.isDate($0.date, inSameDayAs: date) }
            .sorted { $0.date > $1.date }
    }

    private func deleteWorkout(_ set: WorkoutSet) {
        do {
            try dataManager.deleteWorkoutSets([set])
            Logger.shared.log("Deleted workout set \(set.id)", level: .info)
        } catch {
            showError("Failed to delete workout set")
        }
    }

    private func showError(_ message: String) {
        errorMessage = message
        showingError = true
        Logger.shared.log(message, level: .error)
    }

    var body: some View {
        VStack(alignment: .leading, spacing: AppTheme.Metrics.verticalSpacing) {
            if workoutsForDate.isEmpty {
                ContentUnavailableView(
                    "No Workouts",
                    systemImage: "figure.strengthtraining.traditional",
                    description: Text("Add a workout to get started")
                )
                .glassCard()
            } else {
                LazyVStack(spacing: AppTheme.Metrics.verticalSpacing) {
                    ForEach(workoutsForDate) { set in
                        if let exercise = dataManager.exercises.first(where: { $0.id == set.exerciseId }) {
                            WorkoutSetRow(exercise: exercise, set: set)
                                .glassBackground()
                                .contextMenu {
                                    Button(role: .destructive) {
                                        deleteWorkout(set)
                                    } label: {
                                        Label("Delete", systemImage: "trash")
                                    }
                                }
                                .swipeActions(edge: .trailing, allowsFullSwipe: true) {
                                    Button(role: .destructive) {
                                        deleteWorkout(set)
                                    } label: {
                                        Label("Delete", systemImage: "trash")
                                    }
                                }
                        } else {
                            Text("Invalid Exercise")
                                .font(AppTheme.Fonts.subheadline())
                                .foregroundStyle(.red)
                                .glassBackground()
                                .onAppear {
                                    Logger.shared.log("Found workout set with invalid exercise ID: \(set.exerciseId)", level: .error)
                                }
                        }
                    }
                }
                .padding(AppTheme.Metrics.cardPadding)
            }
        }
        .background(.clear)
        .alert("Error", isPresented: $showingError) {
            Button("OK", role: .cancel) { }
        } message: {
            Text(errorMessage)
        }
    }
}
