import SwiftUI

struct ExerciseListView: View {
    @EnvironmentObject private var dataManager: DataManager
    @State private var showingAddExercise = false
    @State private var searchText = ""
    @State private var selectedMuscleGroup: Exercise.MuscleGroup?
    
    private var filteredExercises: [Exercise] {
        var exercises = dataManager.exercises
        
        // Apply muscle group filter
        if let muscleGroup = selectedMuscleGroup {
            exercises = exercises.filter { 
                $0.muscleGroup == muscleGroup || $0.secondaryMuscleGroups.contains(muscleGroup)
            }
        }
        
        // Apply search filter
        if !searchText.isEmpty {
            exercises = exercises.filter {
                $0.name.localizedCaseInsensitiveContains(searchText)
            }
        }
        
        return exercises.sorted { $0.name < $1.name }
    }
    
    private var groupedExercises: [(String, [Exercise])] {
        Dictionary(grouping: filteredExercises) {
            $0.muscleGroup.rawValue
        }
        .map { ($0.key, $0.value.sorted { $0.name < $1.name }) }
        .sorted { $0.0 < $1.0 }
    }
    
    var body: some View {
        NavigationView {
            List {
                if !searchText.isEmpty || selectedMuscleGroup != nil {
                    // Show flat list when searching or filtering
                    ForEach(filteredExercises) { exercise in
                        ExerciseRow(exercise: exercise)
                    }
                } else {
                    // Show grouped list
                    ForEach(groupedExercises, id: \.0) { group, exercises in
                        Section(group) {
                            ForEach(exercises) { exercise in
                                ExerciseRow(exercise: exercise)
                            }
                        }
                    }
                }
            }
            .searchable(text: $searchText, prompt: "Search exercises")
            .navigationTitle("Exercises")
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Menu {
                        Button {
                            selectedMuscleGroup = nil
                        } label: {
                            Label("All Muscles", systemImage: "line.3.horizontal")
                        }
                        
                        Divider()
                        
                        ForEach(Exercise.MuscleGroup.allCases, id: \.self) { group in
                            Button {
                                selectedMuscleGroup = group
                            } label: {
                                Label(group.rawValue, systemImage: selectedMuscleGroup == group ? "checkmark" : "")
                            }
                        }
                    } label: {
                        Label("Filter", systemImage: "line.3.horizontal.decrease.circle")
                            .foregroundStyle(selectedMuscleGroup != nil ? .blue : .primary)
                    }
                }
                
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button {
                        showingAddExercise = true
                    } label: {
                        Image(systemName: "plus")
                    }
                }
            }
            .sheet(isPresented: $showingAddExercise) {
                AddExerciseView()
            }
        }
    }
}

struct ExerciseRow: View {
    let exercise: Exercise
    
    var body: some View {
        NavigationLink {
            ExerciseDetailView(exercise: exercise)
        } label: {
            HStack {
                // Icon with background for custom exercises
                Group {
                    switch exercise.icon {
                    case .custom(let name):
                        Text(String(name.prefix(1)).uppercased())
                            .font(.headline)
                            .foregroundStyle(.white)
                            .frame(width: 32, height: 32)
                            .background(.blue)
                            .clipShape(Circle())
                    default:
                        Image(systemName: exercise.icon.systemName)
                            .font(.title3)
                            .frame(width: 32, height: 32)
                    }
                }
                
                VStack(alignment: .leading) {
                    Text(exercise.name)
                        .font(.headline)
                    
                    HStack {
                        Text(exercise.muscleGroup.rawValue)
                            .font(.caption)
                            .foregroundStyle(.secondary)
                        
                        if !exercise.secondaryMuscleGroups.isEmpty {
                            Text("+ \(exercise.secondaryMuscleGroups.count)")
                                .font(.caption2)
                                .foregroundStyle(.secondary)
                        }
                    }
                }
                
                Spacer()
                
                // Difficulty indicator
                Circle()
                    .fill(difficultyColor)
                    .frame(width: 8, height: 8)
            }
        }
    }
    
    private var difficultyColor: Color {
        switch exercise.difficulty {
        case .beginner:
            return .green
        case .intermediate:
            return .yellow
        case .advanced:
            return .orange
        case .expert:
            return .red
        }
    }
}
