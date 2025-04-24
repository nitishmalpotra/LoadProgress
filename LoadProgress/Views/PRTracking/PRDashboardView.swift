import SwiftUI
import Charts

struct PRDashboardView: View {
    @EnvironmentObject var dataManager: DataManager
    @EnvironmentObject var prManager: PRManager
    @State private var selectedExercise: Exercise?
    @State private var timeRange: TimeRange = .month
    @State private var showingPRAlert = false
    @State private var latestPR: PersonalRecord?
    
    enum TimeRange: String, CaseIterable {
        case week = "Week"
        case month = "Month"
        case year = "Year"
        case all = "All Time"
        
        var days: Int {
            switch self {
            case .week: return 7
            case .month: return 30
            case .year: return 365
            case .all: return Int.max
            }
        }
    }
    
    var body: some View {
        NavigationView {
            List {
                // Time Range Picker
                Section {
                    Picker("Time Range", selection: $timeRange) {
                        ForEach(TimeRange.allCases, id: \.self) { range in
                            Text(range.rawValue).tag(range)
                        }
                    }
                    .pickerStyle(.segmented)
                }
                
                // Exercise Selection
                if let exercise = selectedExercise {
                    exerciseDetailSection(for: exercise)
                } else {
                    exerciseSelectionSection
                }
                
                // Recent PRs
                if !filteredPRs.isEmpty {
                    Section("Recent Personal Records") {
                        ForEach(filteredPRs.prefix(5)) { pr in
                            PRRow(pr: pr, exercise: exerciseFor(pr))
                        }
                    }
                }
            }
            .navigationTitle("Personal Records")
            .alert("New Personal Record! 🎉", isPresented: $showingPRAlert) {
                Button("OK", role: .cancel) {}
            } message: {
                if let pr = latestPR, let exercise = exerciseFor(pr) {
                    Text("You set a new \(pr.type.rawValue) record for \(exercise.name)!")
                }
            }
            .onReceive(NotificationCenter.default.publisher(for: .newPersonalRecord)) { notification in
                if let pr = notification.userInfo?["pr"] as? PersonalRecord {
                    latestPR = pr
                    showingPRAlert = true
                }
            }
        }
    }
    
    private var exerciseSelectionSection: some View {
        Section("Select Exercise") {
            ForEach(Exercise.ExerciseType.allCases, id: \.self) { type in
                DisclosureGroup(type.rawValue) {
                    ForEach(exercisesForType(type)) { exercise in
                        Button(action: { selectedExercise = exercise }) {
                            HStack {
                                Text(exercise.name)
                                Spacer()
                                if hasPersonalRecords(for: exercise) {
                                    Image(systemName: "trophy.fill")
                                        .foregroundColor(.yellow)
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    
    private func exerciseDetailSection(for exercise: Exercise) -> some View {
        VStack {
            Section {
                HStack {
                    Text(exercise.name)
                        .font(.headline)
                    Spacer()
                    Button("Change") {
                        selectedExercise = nil
                    }
                }
            }
            
            // PR Charts
            if let prs = personalRecords(for: exercise) {
                Section("Progress Chart") {
                    Chart(prs) { pr in
                        LineMark(
                            x: .value("Date", pr.date),
                            y: .value("Value", pr.value)
                        )
                        .foregroundStyle(by: .value("Type", pr.type.rawValue))
                        PointMark(
                            x: .value("Date", pr.date),
                            y: .value("Value", pr.value)
                        )
                        .foregroundStyle(by: .value("Type", pr.type.rawValue))
                    }
                    .frame(height: 200)
                    .chartLegend(position: .bottom)
                }
                
                // PR Details
                Section("Personal Records") {
                    ForEach(PRType.allCases, id: \.self) { type in
                        if let pr = latestPR(type: type, for: exercise) {
                            HStack {
                                VStack(alignment: .leading) {
                                    Text(type.rawValue)
                                        .font(.subheadline)
                                        .foregroundStyle(.secondary)
                                    Text(String(format: "%.1f", pr.value))
                                        .font(.headline)
                                }
                                Spacer()
                                Text(pr.date.formatted(date: .abbreviated, time: .omitted))
                                    .font(.caption)
                                    .foregroundStyle(.secondary)
                            }
                        }
                    }
                }
            }
        }
    }
    
    // MARK: - Helper Methods
    
    private var filteredPRs: [PersonalRecord] {
        let cutoffDate = Calendar.current.date(
            byAdding: .day,
            value: -timeRange.days,
            to: Date()
        ) ?? Date()
        
        return prManager.personalRecords
            .filter { $0.date >= cutoffDate }
            .sorted { $0.date > $1.date }
    }
    
    private func exercisesForType(_ type: Exercise.ExerciseType) -> [Exercise] {
        dataManager.exercises
            .filter { $0.type == type }
            .sorted { $0.name < $1.name }
    }
    
    private func hasPersonalRecords(for exercise: Exercise) -> Bool {
        prManager.personalRecords.contains { $0.exerciseId == exercise.id }
    }
    
    private func personalRecords(for exercise: Exercise) -> [PersonalRecord]? {
        let records = prManager.personalRecords
            .filter { $0.exerciseId == exercise.id }
            .sorted { $0.date < $1.date }
        return records.isEmpty ? nil : records
    }
    
    private func latestPR(type: PRType, for exercise: Exercise) -> PersonalRecord? {
        prManager.personalRecords
            .filter { $0.exerciseId == exercise.id && $0.type == type }
            .max { $0.value < $1.value }
    }
    
    private func exerciseFor(_ pr: PersonalRecord) -> Exercise? {
        dataManager.exercises.first { $0.id == pr.exerciseId }
    }
}

// MARK: - Supporting Views

struct PRRow: View {
    let pr: PersonalRecord
    let exercise: Exercise?
    
    var body: some View {
        HStack {
            VStack(alignment: .leading) {
                Text(exercise?.name ?? "Unknown Exercise")
                    .font(.headline)
                Text(pr.type.rawValue)
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
            }
            
            Spacer()
            
            VStack(alignment: .trailing) {
                Text(String(format: "%.1f", pr.value))
                    .font(.headline)
                Text(pr.date.formatted(date: .abbreviated, time: .omitted))
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
        }
    }
}

#Preview {
    PRDashboardView()
        .environmentObject(DataManager())
        .environmentObject(PRManager(dataManager: DataManager()))
}
