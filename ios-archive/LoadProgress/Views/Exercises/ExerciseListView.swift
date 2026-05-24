import SwiftUI

struct ExerciseListView: View {
    @EnvironmentObject private var dataManager: DataManager
    @State private var showingAddExercise = false
    @State private var searchText = ""
    @State private var selectedMuscleGroup: Exercise.MuscleGroup?

    private var filteredExercises: [Exercise] {
        var exercises = dataManager.exercises

        if let muscleGroup = selectedMuscleGroup {
            exercises = exercises.filter {
                $0.muscleGroup == muscleGroup || $0.secondaryMuscleGroups.contains(muscleGroup)
            }
        }

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
        NavigationStack {
            ZStack {
                AppTheme.Colors.backgroundGradient
                    .ignoresSafeArea()

                ScrollView {
                    VStack(spacing: AppTheme.Metrics.verticalSpacing) {
                        filterMenu

                        if !searchText.isEmpty || selectedMuscleGroup != nil {
                            LazyVStack(spacing: AppTheme.Metrics.verticalSpacing) {
                                ForEach(filteredExercises) { exercise in
                                    ExerciseRow(exercise: exercise)
                                }
                            }
                            .padding(.horizontal, AppTheme.Metrics.horizontalPadding)
                        } else {
                            LazyVStack(spacing: AppTheme.Metrics.verticalSpacing) {
                                ForEach(groupedExercises, id: \.0) { group, exercises in
                                    VStack(alignment: .leading, spacing: 12) {
                                        Text(group)
                                            .font(AppTheme.Fonts.title())
                                            .foregroundStyle(.secondary)
                                        ForEach(exercises) { exercise in
                                            ExerciseRow(exercise: exercise)
                                        }
                                    }
                                }
                            }
                            .padding(.horizontal, AppTheme.Metrics.horizontalPadding)
                        }
                    }
                    .padding(.vertical, AppTheme.Metrics.verticalSpacing)
                }
            }
            .navigationTitle("Exercises")
            .searchable(text: $searchText, prompt: "Search exercises")
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button {
                        showingAddExercise = true
                        HapticManager.shared.playSelection()
                    } label: {
                        Image(systemName: "plus.circle.fill")
                            .font(.title2)
                            .symbolRenderingMode(.hierarchical)
                    }
                }
            }
            .toolbarBackground(.ultraThinMaterial, for: .navigationBar)
            .toolbarBackground(.visible, for: .navigationBar)
            .sheet(isPresented: $showingAddExercise) {
                AddExerciseView()
                    .presentationDetents([.medium, .large])
                    .presentationBackground(.ultraThinMaterial)
            }
        }
    }

    private var filterMenu: some View {
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
                .padding(.horizontal, AppTheme.Metrics.horizontalPadding)
                .padding(.vertical, 8)
                .glassBackground()
        }
    }
}

struct ExerciseRow: View {
    let exercise: Exercise

    var body: some View {
        NavigationLink {
            ExerciseDetailView(exercise: exercise)
        } label: {
            HStack(spacing: 14) {
                Group {
                    switch exercise.icon {
                    case .custom(let name):
                        Text(String(name.prefix(1)).uppercased())
                            .font(AppTheme.Fonts.headline())
                            .foregroundStyle(.white)
                            .frame(width: 40, height: 40)
                            .background(AppTheme.Colors.primaryAccent)
                            .clipShape(Circle())
                    default:
                        Image(systemName: exercise.icon.systemName)
                            .font(.title3)
                            .frame(width: 40, height: 40)
                            .foregroundStyle(AppTheme.Colors.primaryAccent)
                            .background(.ultraThinMaterial)
                            .clipShape(Circle())
                    }
                }

                VStack(alignment: .leading, spacing: 4) {
                    Text(exercise.name)
                        .font(AppTheme.Fonts.headline())
                    HStack(spacing: 6) {
                        Text(exercise.muscleGroup.rawValue)
                            .font(AppTheme.Fonts.subheadline())
                            .foregroundStyle(.secondary)
                        if !exercise.secondaryMuscleGroups.isEmpty {
                            Text("+ \(exercise.secondaryMuscleGroups.count)")
                                .font(.caption)
                                .foregroundStyle(.secondary)
                        }
                    }
                }

                Spacer()

                Circle()
                    .fill(difficultyColor)
                    .frame(width: 10, height: 10)
                    .accessibilityHidden(true)
            }
            .padding(AppTheme.Metrics.cardPadding)
            .glassBackground()
        }
        .buttonStyle(.plain)
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
