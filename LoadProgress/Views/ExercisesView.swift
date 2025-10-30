import SwiftUI

struct ExercisesView: View {
    @EnvironmentObject var dataManager: DataManager
    @State private var selectedTab: Exercise.ExerciseType = .weightTraining
    @State private var searchText = ""
    @State private var showingAddExercise = false
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
        NavigationStack {
            ZStack {
                AppTheme.Colors.backgroundGradient
                    .ignoresSafeArea()

                ScrollView {
                    VStack(spacing: AppTheme.Metrics.verticalSpacing) {
                        Picker("Exercise Type", selection: $selectedTab) {
                            ForEach(Exercise.ExerciseType.allCases, id: \.self) { type in
                                Text(type.rawValue)
                                    .tag(type)
                            }
                        }
                        .pickerStyle(.segmented)
                        .padding(.horizontal, AppTheme.Metrics.horizontalPadding)
                        .padding(.top, AppTheme.Metrics.verticalSpacing)

                        LazyVStack(spacing: AppTheme.Metrics.verticalSpacing, pinnedViews: .sectionHeaders) {
                            ForEach(groupedExercises, id: \.0) { muscleGroup, exercises in
                                Section {
                                    VStack(spacing: AppTheme.Metrics.verticalSpacing) {
                                        ForEach(exercises) { exercise in
                                            NavigationLink(destination: ExerciseDetailView(exercise: exercise)) {
                                                ExerciseCardView(exercise: exercise)
                                            }
                                            .buttonStyle(.plain)
                                        }
                                    }
                                    .padding(.horizontal, AppTheme.Metrics.horizontalPadding)
                                } header: {
                                    MuscleGroupHeader(muscleGroup: muscleGroup, count: exercises.count)
                                        .padding(.horizontal, AppTheme.Metrics.horizontalPadding)
                                        .padding(.vertical, 4)
                                        .background(.clear)
                                }
                            }
                        }
                        .padding(.bottom, 40)
                    }
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
                            .symbolRenderingMode(.hierarchical)
                            .font(.title2)
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
            .animation(reduceMotion ? .none : .spring(response: 0.4, dampingFraction: 0.8), value: showingAddExercise)
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
        HStack(spacing: 12) {
            Image(systemName: muscleGroupIcon)
                .font(.title3)
                .foregroundColor(AppTheme.Colors.primaryAccent)
                .frame(width: 44, height: 44)
                .background(.ultraThinMaterial)
                .clipShape(Circle())

            VStack(alignment: .leading, spacing: 2) {
                Text(muscleGroup.rawValue)
                    .font(AppTheme.Fonts.title())
                Text("\(count) exercises")
                    .font(AppTheme.Fonts.subheadline())
                    .foregroundStyle(.secondary)
                    .accessibilityLabel("\(count) exercises")
            }

            Spacer()
        }
        .padding(.vertical, 8)
    }
}

struct ExerciseCardView: View {
    let exercise: Exercise

    var exerciseIcon: String {
        switch (exercise.type, exercise.muscleGroup) {
        case (.weightTraining, .chest): return "dumbbell.fill"
        case (.weightTraining, .back): return "figure.strengthtraining.functional"
        case (.weightTraining, .legs): return "figure.strengthtraining.traditional"
        case (.weightTraining, .shoulders): return "figure.strengthtraining.traditional"
        case (.weightTraining, .arms): return "dumbbell.fill"
        case (.weightTraining, .core): return "figure.core.training"
        case (.weightTraining, .fullBody): return "figure.strengthtraining.traditional"
        case (.weightTraining, .forearms): return "dumbbell.fill"
        case (.weightTraining, .glutes): return "figure.strengthtraining.traditional"
        case (.weightTraining, .upperBack): return "figure.strengthtraining.functional"
        case (.weightTraining, .lowerBack): return "figure.strengthtraining.traditional"
        case (.bodyweight, .chest): return "figure.push.ups"
        case (.bodyweight, .back): return "figure.pull.ups"
        case (.bodyweight, .legs): return "figure.step.training"
        case (.bodyweight, .shoulders): return "figure.cross.training"
        case (.bodyweight, .arms): return "figure.push.ups"
        case (.bodyweight, .core): return "figure.core.training"
        case (.bodyweight, .fullBody): return "figure.highintensity.intervaltraining"
        case (.bodyweight, .forearms): return "figure.boxing"
        case (.bodyweight, .glutes): return "figure.step.training"
        case (.bodyweight, .upperBack): return "figure.pull.ups"
        case (.bodyweight, .lowerBack): return "figure.core.training"
        }
    }

    var iconColor: Color {
        switch exercise.type {
        case .weightTraining: return AppTheme.Colors.primaryAccent
        case .bodyweight: return AppTheme.Colors.secondaryAccent
        }
    }

    var body: some View {
        HStack(spacing: 14) {
            Image(systemName: exerciseIcon)
                .font(.title2)
                .foregroundColor(iconColor)
                .frame(width: 52, height: 52)
                .background(.ultraThinMaterial)
                .clipShape(RoundedRectangle(cornerRadius: AppTheme.Metrics.cornerRadius, style: .continuous))

            VStack(alignment: .leading, spacing: 4) {
                Text(exercise.name)
                    .font(AppTheme.Fonts.headline())
                    .foregroundStyle(.primary)

                Text(exercise.muscleGroup.rawValue)
                    .font(AppTheme.Fonts.subheadline())
                    .foregroundStyle(.secondary)
            }

            Spacer()

            Image(systemName: "chevron.right")
                .font(.footnote.weight(.semibold))
                .foregroundStyle(.secondary)
        }
        .padding(AppTheme.Metrics.cardPadding)
        .glassBackground()
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
