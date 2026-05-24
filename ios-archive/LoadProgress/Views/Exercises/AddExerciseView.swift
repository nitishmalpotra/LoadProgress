import SwiftUI

struct AddExerciseView: View {
    @Environment(\.dismiss) private var dismiss
    @EnvironmentObject private var dataManager: DataManager

    @State private var name = ""
    @State private var type = Exercise.ExerciseType.weightTraining
    @State private var muscleGroup = Exercise.MuscleGroup.chest
    @State private var secondaryMuscleGroups: Set<Exercise.MuscleGroup> = []
    @State private var difficulty = Exercise.Difficulty.beginner
    @State private var equipment: Set<Exercise.Equipment> = []
    @State private var description = ""
    @State private var formCues: [String] = [""]
    @State private var showingError = false
    @State private var errorMessage = ""

    var body: some View {
        NavigationStack {
            ZStack {
                AppTheme.Colors.backgroundGradient
                    .ignoresSafeArea()

                Form {
                    basicInfoSection
                    secondaryMuscleSection
                    equipmentSection
                    difficultySection
                    descriptionSection
                    formCuesSection
                }
                .formStyle(.grouped)
                .scrollContentBackground(.hidden)
            }
            .navigationTitle("Add Exercise")
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }
                        .buttonStyle(SecondaryButtonStyle())
                }

                ToolbarItem(placement: .confirmationAction) {
                    Button("Save") { saveExercise() }
                        .buttonStyle(PrimaryButtonStyle())
                        .disabled(!isValid)
                        .opacity(isValid ? 1 : 0.6)
                }
            }
            .toolbarBackground(.ultraThinMaterial, for: .navigationBar)
            .toolbarBackground(.visible, for: .navigationBar)
            .alert("Error", isPresented: $showingError) {
                Button("OK", role: .cancel) {}
            } message: {
                Text(errorMessage)
            }
        }
    }

    private var isValid: Bool {
        !name.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty &&
        !equipment.isEmpty &&
        !description.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty &&
        formCues.contains(where: { !$0.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty })
    }

    private var basicInfoSection: some View {
        Section("Basic Information") {
            TextField("Exercise Name", text: $name)
                .textInputAutocapitalization(.words)

            Picker("Type", selection: $type) {
                ForEach(Exercise.ExerciseType.allCases, id: \.self) { type in
                    Text(type.rawValue).tag(type)
                }
            }

            Picker("Primary Muscle Group", selection: $muscleGroup) {
                ForEach(Exercise.MuscleGroup.allCases, id: \.self) { group in
                    Text(group.rawValue).tag(group)
                }
            }
            .onChange(of: muscleGroup) { _, newValue in
                secondaryMuscleGroups.remove(newValue)
            }
        }
    }

    private var secondaryMuscleSection: some View {
        Section("Secondary Muscle Groups") {
            ForEach(Exercise.MuscleGroup.allCases, id: \.self) { group in
                if group != muscleGroup {
                    Toggle(group.rawValue, isOn: binding(for: group))
                }
            }
        }
    }

    private var equipmentSection: some View {
        Section("Required Equipment") {
            ForEach(Exercise.Equipment.allCases, id: \.self) { item in
                Toggle(item.rawValue, isOn: binding(for: item))
            }
        }
    }

    private var difficultySection: some View {
        Section("Difficulty") {
            Picker("Difficulty Level", selection: $difficulty) {
                ForEach(Exercise.Difficulty.allCases, id: \.self) { level in
                    Text(level.rawValue).tag(level)
                }
            }
            .pickerStyle(.segmented)
        }
    }

    private var descriptionSection: some View {
        Section("Description") {
            TextEditor(text: $description)
                .frame(height: 120)
        }
    }

    private var formCuesSection: some View {
        Section("Form Cues") {
            ForEach(formCues.indices, id: \.self) { index in
                HStack {
                    TextField("Form Cue \(index + 1)", text: $formCues[index])
                    if index > 0 {
                        Button(role: .destructive) {
                            formCues.remove(at: index)
                        } label: {
                            Image(systemName: "minus.circle.fill")
                                .foregroundColor(.red)
                        }
                    }
                }
            }

            Button("Add Form Cue") {
                formCues.append("")
                HapticManager.shared.playSelection()
            }
            .buttonStyle(SecondaryButtonStyle())
        }
    }

    private func binding(for muscleGroup: Exercise.MuscleGroup) -> Binding<Bool> {
        Binding(
            get: { secondaryMuscleGroups.contains(muscleGroup) },
            set: { isSelected in
                if isSelected {
                    secondaryMuscleGroups.insert(muscleGroup)
                } else {
                    secondaryMuscleGroups.remove(muscleGroup)
                }
            }
        )
    }

    private func binding(for equipment: Exercise.Equipment) -> Binding<Bool> {
        Binding(
            get: { self.equipment.contains(equipment) },
            set: { isSelected in
                if isSelected {
                    self.equipment.insert(equipment)
                } else {
                    self.equipment.remove(equipment)
                }
            }
        )
    }

    private func saveExercise() {
        guard isValid else {
            showError("Please complete all required fields")
            return
        }

        let icon = ExerciseIcon.custom(name)
        let validFormCues = formCues.filter {
            !$0.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
        }

        let exercise = Exercise(
            name: name.trimmingCharacters(in: .whitespacesAndNewlines),
            type: type,
            muscleGroup: muscleGroup,
            secondaryMuscleGroups: Array(secondaryMuscleGroups),
            icon: icon,
            difficulty: difficulty,
            equipment: Array(equipment),
            description: description.trimmingCharacters(in: .whitespacesAndNewlines),
            formCues: validFormCues
        )

        dataManager.addExercise(exercise)
        dismiss()
    }

    private func showError(_ message: String) {
        errorMessage = message
        showingError = true
        Logger.shared.log(message, level: .error)
    }
}
