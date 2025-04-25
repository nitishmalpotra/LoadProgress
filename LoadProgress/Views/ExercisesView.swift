import SwiftUI

struct ExercisesView: View {
    @EnvironmentObject var dataManager: DataManager
    @State private var selectedTab: Exercise.ExerciseType = .weightTraining
    @State private var searchText = ""
    @State private var showingAddExercise = false
    
    // Add environment variable for reduce motion
    @Environment(\.accessibilityReduceMotion) var reduceMotion

    var filteredExercises: [Exercise] {
        if searchText.isEmpty {
            return dataManager.exercises.filter { $0.type == selectedTab }
        }
        return dataManager.exercises.filter { exercise in
            exercise.type == selectedTab &&
            exercise.name.localizedCaseInsensitiveContains(searchText)
        }
    }
    
    var groupedExercises: [(Exercise.MuscleGroup, [Exercise])] {
        Dictionary(grouping: filteredExercises) { $0.muscleGroup }
            .map { ($0.key, $0.value.sorted { $0.name < $1.name }) }
            .sorted { $0.0.rawValue < $1.0.rawValue }
    }
    
    var body: some View {
        NavigationView {
            VStack(spacing: 0) {
                // Custom Tab Picker
                Picker("Exercise Type", selection: $selectedTab) {
                    ForEach(Exercise.ExerciseType.allCases, id: \.self) { type in
                        Text(type.rawValue)
                            .tag(type)
                    }
                }
                .pickerStyle(.segmented)
                .padding() // Standard padding
                .background(Color(.systemBackground))
                
                ScrollView {
                    // Use standard spacing for LazyVStack
                    LazyVStack(spacing: 16, pinnedViews: .sectionHeaders) { 
                        ForEach(groupedExercises, id: \.0) { muscleGroup, exercises in
                            Section {
                                // Use standard spacing for inner VStack
                                VStack(spacing: 12) { 
                                    ForEach(exercises) { exercise in
                                        NavigationLink(destination: ExerciseDetailView(exercise: exercise)) {
                                            ExerciseCardView(exercise: exercise)
                                        }
                                    }
                                }
                                .padding(.horizontal)
                            } header: {
                                MuscleGroupHeader(muscleGroup: muscleGroup, count: exercises.count)
                            }
                        }
                    }
                }
                .background(Color(.systemGroupedBackground))
            }
            .searchable(text: $searchText, prompt: "Search exercises")
            .navigationTitle("Exercises")
            .toolbar {
                Button(action: { showingAddExercise = true }) {
                    Image(systemName: "plus.circle.fill")
                        .font(.title2)
                }
            }
            .sheet(isPresented: $showingAddExercise) {
                AddExerciseView()
            }
            // Add reduce motion check for animation
            .animation(reduceMotion ? .none : .default, value: showingAddExercise) 
        }
    }
}

struct MuscleGroupHeader: View {
    let muscleGroup: Exercise.MuscleGroup
    let count: Int
    
    var muscleGroupIcon: String {
        switch muscleGroup {
        case .chest: return "figure.strengthtraining.traditional"
        case .back: return "figure.pull.ups"
        case .legs: return "figure.walk"
        case .shoulders: return "figure.arms.open"
        case .arms: return "figure.boxing"
        case .core: return "figure.core.training"
        case .fullBody: return "figure.mixed.cardio"
        case .forearms: return "figure.boxing"
        case .glutes: return "figure.walk"
        case .upperBack: return "figure.pull.ups"
        case .lowerBack: return "figure.strengthtraining.traditional"
        }
    }
    
    var body: some View {
        HStack {
            Image(systemName: muscleGroupIcon)
                .font(.title3)
                .foregroundColor(.blue)
            
            VStack(alignment: .leading, spacing: 4) {
                Text(muscleGroup.rawValue)
                    .font(.headline)
                    .padding(.bottom, 5)

                // Use explicit cases for muscle groups, remove default
                switch muscleGroup {
                case .chest: Text("Chest Exercises").font(.subheadline).foregroundColor(.secondary)
                case .back: Text("Back Exercises").font(.subheadline).foregroundColor(.secondary)
                case .legs: Text("Leg Exercises").font(.subheadline).foregroundColor(.secondary)
                case .shoulders: Text("Shoulder Exercises").font(.subheadline).foregroundColor(.secondary)
                case .arms: Text("Arm Exercises").font(.subheadline).foregroundColor(.secondary)
                case .core: Text("Core Exercises").font(.subheadline).foregroundColor(.secondary)
                case .fullBody: Text("Full Body Exercises").font(.subheadline).foregroundColor(.secondary)
                case .forearms: Text("Forearm Exercises").font(.subheadline).foregroundColor(.secondary)
                case .glutes: Text("Glute Exercises").font(.subheadline).foregroundColor(.secondary)
                case .upperBack: Text("Upper Back Exercises").font(.subheadline).foregroundColor(.secondary)
                case .lowerBack: Text("Lower Back Exercises").font(.subheadline).foregroundColor(.secondary)
                }
            }
            
            Spacer()
            
            Text("\(count)")
                .font(.subheadline)
                .foregroundColor(.secondary)
                .padding(.horizontal, 8)
                .padding(.vertical, 4)
                .background(Color(.systemGray6))
                .cornerRadius(8)
        }
        .padding()
        .background(Color(.systemBackground))
        // Accessibility Improvement
        .accessibilityElement(children: .combine)
        .accessibilityLabel("\(muscleGroup.rawValue) Exercises Section Header")
    }
}

struct ExerciseCardView: View {
    let exercise: Exercise
    
    var exerciseIcon: String {
        switch (exercise.type, exercise.muscleGroup) {
        // Weight Training Icons
        case (.weightTraining, .chest):
            return "dumbbell.fill"
        case (.weightTraining, .back):
            return "figure.strengthtraining.functional"
        case (.weightTraining, .legs):
            return "figure.strengthtraining.traditional"
        case (.weightTraining, .shoulders):
            return "figure.strengthtraining.traditional"
        case (.weightTraining, .arms):
            return "dumbbell.fill"
        case (.weightTraining, .core):
            return "figure.core.training"
        case (.weightTraining, .fullBody):
            return "figure.strengthtraining.traditional"
        case (.weightTraining, .forearms):
            return "dumbbell.fill"
        case (.weightTraining, .glutes):
            return "figure.strengthtraining.traditional"
        case (.weightTraining, .upperBack):
            return "figure.strengthtraining.functional"
        case (.weightTraining, .lowerBack):
            return "figure.strengthtraining.traditional"
            
        // Bodyweight Exercise Icons
        case (.bodyweight, .chest):
            return "figure.push.ups"
        case (.bodyweight, .back):
            return "figure.pull.ups"
        case (.bodyweight, .legs):
            return "figure.step.training"
        case (.bodyweight, .shoulders):
            return "figure.cross.training"
        case (.bodyweight, .arms):
            return "figure.push.ups"
        case (.bodyweight, .core):
            return "figure.core.training"
        case (.bodyweight, .fullBody):
            return "figure.highintensity.intervaltraining"
        case (.bodyweight, .forearms):
            return "figure.boxing"
        case (.bodyweight, .glutes):
            return "figure.step.training"
        case (.bodyweight, .upperBack):
            return "figure.pull.ups"
        case (.bodyweight, .lowerBack):
            return "figure.core.training"
            
        // Default case for any other combinations
        default:
            return "figure.strengthtraining.functional"
        }
    }
    
    var iconColor: Color {
        switch exercise.type {
        case .weightTraining:
            return .blue
        case .bodyweight:
            return .green
        }
    }
    
    var body: some View {
        HStack(spacing: 12) {
            Image(systemName: exerciseIcon)
                .font(.title2)
                .foregroundColor(iconColor)
                .frame(width: 44, height: 44)
                .background(
                    Circle()
                        .fill(iconColor.opacity(0.1))
                )
            
            VStack(alignment: .leading, spacing: 4) {
                Text(exercise.name)
                    .font(.headline)
                    .foregroundColor(.primary)
                
                Text(exercise.muscleGroup.rawValue)
                    .font(.subheadline)
                    .foregroundColor(.secondary)
            }
            
            Spacer()
            
            Image(systemName: "chevron.right")
                .font(.subheadline)
                .foregroundColor(.secondary)
        }
        .padding() // Standard padding
        .background(Color(.systemBackground))
        .cornerRadius(12)
        .shadow(color: .black.opacity(0.05), radius: 5) // Keep existing shadow or refine if needed
        // Accessibility Improvement
        .accessibilityElement(children: .combine)
        .accessibilityLabel("\(exercise.name), \(exercise.muscleGroup.rawValue)")
        .accessibilityHint("View details for this exercise")
    }
}

// MARK: - Preview
struct ExercisesView_Previews: PreviewProvider {
    static var previews: some View {
        ExercisesView()
            .environmentObject(DataManager.preview)
    }
}