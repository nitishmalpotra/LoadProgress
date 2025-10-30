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
        NavigationStack {
            ZStack {
                AppTheme.Colors.backgroundGradient
                    .ignoresSafeArea()

                Form {
                    exerciseSelectionSection
                    exerciseDetailsSection
                }
                .formStyle(.grouped)
                .scrollContentBackground(.hidden)
            }
            .navigationTitle("Add Workout")
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }
                        .buttonStyle(SecondaryButtonStyle())
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Save") { saveWorkout() }
                        .buttonStyle(PrimaryButtonStyle())
                        .disabled(selectedExercise == nil)
                        .opacity(selectedExercise == nil ? 0.6 : 1)
                }
            }
            .toolbarBackground(.ultraThinMaterial, for: .navigationBar)
            .toolbarBackground(.visible, for: .navigationBar)
            .alert("Error", isPresented: $showingError) {
                Button("OK", role: .cancel) { }
            } message: {
                Text(errorMessage)
            }
        }
    }

    private var exerciseSelectionSection: some View {
        Section("Select Exercise Details") {
            Picker("Type", selection: $selectedType) {
                Text("Select Type").tag(Optional<Exercise.ExerciseType>.none)
                ForEach(Exercise.ExerciseType.allCases, id: \.self) { type in
                    Text(type.rawValue).tag(Optional(type))
                }
            }
            .onChange(of: selectedType) { _, _ in
                selectedMuscleGroup = nil
                selectedExercise = nil
            }

            if selectedType != nil {
                Picker("Muscle Group", selection: $selectedMuscleGroup) {
                    Text("Select Muscle Group").tag(Optional<Exercise.MuscleGroup>.none)
                    ForEach(filteredMuscleGroups, id: \.self) { group in
                        Text(group.rawValue).tag(Optional(group))
                    }
                }
                .onChange(of: selectedMuscleGroup) { _, _ in
                    selectedExercise = nil
                }
            }

            if selectedMuscleGroup != nil {
                Picker("Exercise", selection: $selectedExercise) {
                    Text("Select Exercise").tag(Optional<Exercise>.none)
                    ForEach(filteredExercises) { exercise in
                        Text(exercise.name).tag(Optional(exercise))
                    }
                }
            }
        }
    }

    private var exerciseDetailsSection: some View {
        Section("Details") {
            if let exercise = selectedExercise, exercise.type == .weightTraining {
                LabeledContent {
                    HStack(spacing: 8) {
                        TextField("Weight", text: $weight)
                            .keyboardType(.decimalPad)
                            .textFieldStyle(.roundedBorder)
                        Text(SettingsManager.shared.useMetricSystem ? "kg" : "lb")
                            .foregroundStyle(.secondary)
                    }
                } label: {
                    Label("Weight", systemImage: "scalemass.fill")
                }
            }

            LabeledContent {
                TextField("Reps", text: $reps)
                    .keyboardType(.numberPad)
                    .textFieldStyle(.roundedBorder)
            } label: {
                Label("Reps", systemImage: "repeat")
            }
        }
    }

    private func saveWorkout() {
        guard validateInput(),
              let exercise = selectedExercise else {
            showError("Please select an exercise")
            return
        }

        do {
            let workoutSet = try WorkoutSet(
                weight: exercise.type == .weightTraining ? Double(weight) : nil,
                reps: Double(reps),
                date: date,
                exerciseId: exercise.id
            )

            dataManager.addWorkoutSet(workoutSet)
            Logger.shared.log("Workout saved successfully", level: .info)
            HapticManager.shared.playSuccess()
            dismiss()
        } catch {
            Logger.shared.log("Failed to save workout: \(error)", level: .error)
            updateFormState(.error("Failed to save workout"))
        }
    }
}
