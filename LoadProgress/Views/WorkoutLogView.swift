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
        NavigationView {
            VStack(spacing: 16) {
                // Date Picker with custom styling
                DatePicker("Select Date",
                          selection: $selectedDate,
                          displayedComponents: .date)
                    .datePickerStyle(.graphical)
                    .padding()
                    .background(Color(.systemBackground))
                    .cornerRadius(12)
                    .shadow(color: .black.opacity(0.05), radius: 5)
                    .padding(.horizontal)
                
                // Workout List
                WorkoutListForDate(date: selectedDate)
                    .background(Color(.systemBackground))
                
                // Add Workout Button
                Button(action: {
                    Logger.shared.log("Opening Add Workout sheet", level: .debug)
                    showingAddWorkout = true
                }) {
                    HStack {
                        Image(systemName: "plus.circle.fill")
                            .font(.title2)
                        Text("Add Workout")
                            .font(.headline)
                    }
                    .frame(maxWidth: .infinity)
                }
                .buttonStyle(PrimaryButtonStyle())
                .padding(.horizontal)
                .padding(.bottom, 8)
            }
            .navigationTitle("Workout Log")
            .background(Color(.systemGroupedBackground))
            .sheet(isPresented: $showingAddWorkout) {
                AddWorkoutView(date: selectedDate)
            }
            .alert("Error", isPresented: $showingError) {
                Button("OK", role: .cancel) { }
            } message: {
                Text(errorMessage)
            }
        }
    }
} 