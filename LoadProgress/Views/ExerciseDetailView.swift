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
        List {
            if exercise.type == .weightTraining {
                Section("Progress Chart") {
                    VStack(alignment: .leading) {
                        Text("Weight Progress")
                            .font(.headline)
                        
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
                                        .symbol(.circle)
                                    }
                                }
                            }
                            .frame(height: 200)
                        }
                    }
                }
            }
            
            Section("Recent Sets") {
                if exerciseSets.isEmpty {
                    ContentUnavailableView(
                        "No Sets",
                        systemImage: "dumbbell.fill",
                        description: Text("Add your first set to get started")
                    )
                } else {
                    ForEach(exerciseSets.prefix(10)) { set in
                        WorkoutSetRow(exercise: exercise, set: set)
                    }
                }
            }
            
            Section("Exercise Info") {
                LabeledContent("Type", value: exercise.type.rawValue)
                LabeledContent("Muscle Group", value: exercise.muscleGroup.rawValue)
            }
        }
        .navigationTitle(exercise.name)
        .alert("Error", isPresented: $showingError) {
            Button("OK", role: .cancel) { }
        } message: {
            Text(errorMessage)
        }
        .onAppear {
            Logger.shared.log("Viewing details for exercise: \(exercise.name)", level: .debug)
        }
    }
} 