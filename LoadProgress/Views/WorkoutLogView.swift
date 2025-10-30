import SwiftUI

struct WorkoutLogView: View {
    @EnvironmentObject var dataManager: DataManager
    @State private var showingAddWorkout = false
    @State private var selectedDate = Date()
    @State private var showingError = false
    @State private var errorMessage = ""

    private func showError(_ message: String) {
        errorMessage = message
        showingError = true
        Logger.shared.log(message, level: .error)
    }

    var body: some View {
        NavigationStack {
            ZStack {
                AppTheme.Colors.backgroundGradient
                    .ignoresSafeArea()

                ScrollView {
                    VStack(spacing: AppTheme.Metrics.verticalSpacing) {
                        VStack(alignment: .leading, spacing: 12) {
                            Text("Select Date")
                                .font(AppTheme.Fonts.headline())
                                .foregroundStyle(.secondary)

                            DatePicker(
                                "Select Date",
                                selection: $selectedDate,
                                displayedComponents: .date
                            )
                            .labelsHidden()
                            .datePickerStyle(.graphical)
                            .tint(AppTheme.Colors.primaryAccent)
                        }
                        .padding(.horizontal, AppTheme.Metrics.horizontalPadding)
                        .padding(.top, AppTheme.Metrics.cardPadding)
                        .glassBackground()

                        WorkoutListForDate(date: selectedDate)
                            .padding(.horizontal, AppTheme.Metrics.horizontalPadding)

                        Button {
                            Logger.shared.log("Opening Add Workout sheet", level: .debug)
                            showingAddWorkout = true
                            HapticManager.shared.playSelection()
                        } label: {
                            HStack(spacing: 8) {
                                Image(systemName: "plus.circle.fill")
                                Text("Add Workout")
                            }
                            .frame(maxWidth: .infinity)
                        }
                        .buttonStyle(PrimaryButtonStyle())
                        .padding(.horizontal, AppTheme.Metrics.horizontalPadding)
                        .padding(.bottom, 12)
                    }
                    .padding(.vertical, AppTheme.Metrics.verticalSpacing)
                }
            }
            .navigationTitle("Workout Log")
            .toolbarBackground(.ultraThinMaterial, for: .navigationBar)
            .toolbarBackground(.visible, for: .navigationBar)
            .sheet(isPresented: $showingAddWorkout) {
                AddWorkoutView(date: selectedDate)
                    .presentationDetents([.medium, .large])
                    .presentationBackground(.ultraThinMaterial)
            }
            .alert("Error", isPresented: $showingError) {
                Button("OK", role: .cancel) { }
            } message: {
                Text(errorMessage)
            }
        }
    }
}
