import SwiftUI

struct AddWorkoutView: View {
    @Environment(\.dismiss) var dismiss
    @EnvironmentObject var dataManager: DataManager
    let date: Date
    
    @State private var selectedType: Exercise.ExerciseType?
    @State private var selectedMuscleGroup: Exercise.MuscleGroup?
    @State private var selectedExercise: Exercise?
    @State private var weight: String = ""
    @State private var reps: String = ""
    @State private var showingError = false
    @State private var errorMessage = ""
    
    enum FormState {
        case idle
        case loading
        case error(String)
        case success
    }
    
    @State private var formState: FormState = .idle
    
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
    
    private func validateInput() -> Bool {
        guard let exercise = selectedExercise else {
            showError("Please select an exercise")
            return false
        }
        
        if exercise.type == .weightTraining {
            guard let weightValue = Double(weight), weightValue > 0 else {
                showError("Please enter a valid weight")
                return false
            }
        }
        
        guard let repsValue = Double(reps), repsValue > 0 else {
            showError("Please enter valid reps")
            return false
        }
        
        return true
    }
    
    private func showError(_ message: String) {
        errorMessage = message
        showingError = true
        Logger.shared.log("Validation error: \(message)", level: .warning)
    }
    
    private func updateFormState(_ newState: FormState) {
        formState = newState
        switch newState {
        case .error(let message):
            HapticManager.shared.playError()
            showError(message)
        case .success:
            HapticManager.shared.playSuccess()
        default:
            break
        }
    }
    
    var body: some View {
        NavigationView {
            Form {
                Section("Select Exercise Details") {
                    // Exercise Type Picker
                    Picker("Type", selection: $selectedType) {
                        Text("Select Type").tag(Optional<Exercise.ExerciseType>.none)
                        ForEach(Exercise.ExerciseType.allCases, id: \.self) { type in
                            Text(type.rawValue).tag(Optional(type))
                        }
                    }
                    .onChange(of: selectedType) { oldValue, newValue in
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
                        .onChange(of: selectedMuscleGroup) { oldValue, newValue in
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
                    }
                }
                
                if let exercise = selectedExercise {
                    Section {
                        if exercise.type == .weightTraining {
                            HStack {
                                Image(systemName: "scalemass.fill")
                                    .foregroundColor(.blue)
                                TextField("Weight", text: $weight)
                                    .keyboardType(.decimalPad)
                                Text("kg")
                                    .foregroundColor(.secondary)
                            }
                            .frame(minHeight: 44)
                        }
                        
                        HStack {
                            Image(systemName: "repeat")
                                .foregroundColor(.green)
                            TextField("Reps", text: $reps)
                                .keyboardType(.numberPad)
                        }
                        .frame(minHeight: 44)
                    }
                }
            }
            .navigationTitle("Add Workout")
            .navigationBarItems(
                leading: Button("Cancel") { dismiss() },
                trailing: Button("Save") {
                    saveWorkout()
                }
                .disabled(selectedExercise == nil)
            )
        }
        .alert("Error", isPresented: $showingError) {
            Button("OK", role: .cancel) { }
        } message: {
            Text(errorMessage)
        }
    }
    
    private func saveWorkout() {
        guard validateInput() else { return }
        
        do {
            let workoutSet = try WorkoutSet(
                weight: selectedExercise?.type == .weightTraining ? Double(weight) : nil,
                reps: Double(reps),
                date: date,
                exerciseId: selectedExercise!.id
            )
            
            dataManager.addWorkoutSet(workoutSet)
            Logger.shared.log("Workout saved successfully", level: .info)
            dismiss()
        } catch {
            Logger.shared.log("Failed to save workout: \(error)", level: .error)
            showError("Failed to save workout")
        }
    }
} 