import SwiftUI

struct WorkoutListForDate: View {
    @EnvironmentObject var dataManager: DataManager
    @State private var showingError = false
    @State private var errorMessage = ""
    let date: Date
    
    var workoutsForDate: [WorkoutSet] {
        dataManager.workoutSets.filter { Calendar.current.isDate($0.date, inSameDayAs: date) }
    }
    
    private func deleteWorkout(at offsets: IndexSet) {
        let setsToDelete = offsets.map { workoutsForDate[$0] }
        do {
            try dataManager.deleteWorkoutSets(setsToDelete)
            Logger.shared.log("Deleted \(setsToDelete.count) workout sets", level: .info)
        } catch {
            showError("Failed to delete workout sets")
        }
    }
    
    private func showError(_ message: String) {
        errorMessage = message
        showingError = true
        Logger.shared.log(message, level: .error)
    }
    
    var body: some View {
        Group {
            if workoutsForDate.isEmpty {
                ContentUnavailableView(
                    "No Workouts",
                    systemImage: "figure.strengthtraining.traditional",
                    description: Text("Add a workout to get started")
                )
            } else {
                List {
                    ForEach(workoutsForDate) { set in
                        if let exercise = dataManager.exercises.first(where: { $0.id == set.exerciseId }) {
                            WorkoutSetRow(exercise: exercise, set: set)
                        } else {
                            Text("Invalid Exercise")
                                .foregroundColor(.red)
                                .onAppear {
                                    Logger.shared.log("Found workout set with invalid exercise ID: \(set.exerciseId)", level: .error)
                                }
                        }
                    }
                    .onDelete(perform: deleteWorkout)
                }
            }
        }
        .alert("Error", isPresented: $showingError) {
            Button("OK", role: .cancel) { }
        } message: {
            Text(errorMessage)
        }
    }
} 