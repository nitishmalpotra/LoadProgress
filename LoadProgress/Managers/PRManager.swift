import Foundation


final class PRManager: ObservableObject {
    // MARK: - Published Properties
    @Published private(set) var personalRecords: [PersonalRecord] = []
    
    // MARK: - Cache Properties
    private var prCache: [UUID: [PersonalRecord]] = [:] // Exercise ID to PRs
    private var prTypeCache: [UUID: [PRType: PersonalRecord]] = [:] // Exercise ID to PR type
    private var dateCache: [Date: [PersonalRecord]] = [:] // Date to PRs
    
    private let performanceMonitor = PerformanceMonitor.shared
    private let analyticsManager = AnalyticsManager.shared
    private let queue = DispatchQueue(label: "com.loadprogress.pr", qos: .userInitiated)
    
    // MARK: - Constants
    private enum StorageKeys {
        static let personalRecords = "savedPersonalRecords"
        static let cacheTimestamp = "prCacheTimestamp"
    }
    
    private let dataManager: DataManager
    
    init(dataManager: DataManager) {
        self.dataManager = dataManager
        loadPRs()
        updateCache()
        
        // Setup observation of workout changes
        NotificationCenter.default.addObserver(
            self,
            selector: #selector(workoutDataChanged),
            name: .workoutDataChanged,
            object: nil
        )
    }
    
    // MARK: - PR Calculations
    
    func calculateOneRepMax(weight: Double, reps: Int) -> Double {
        // Brzycki Formula
        return weight * (36 / (37 - Double(reps)))
    }
    
    func checkForPRs(set: WorkoutSet) {
        performanceMonitor.trackOperation(PerformanceMetric.prCalculation) { [weak self] in
            self?.queue.async { [weak self] in
                self?.performPRCheck(set: set)
            }
        }
        guard let weight = set.weight else { return }
        
        // Check for weight PR at this rep range
        let existingPR = personalRecords.first {
            $0.exerciseId == set.exerciseId &&
            $0.type == .weightAtReps &&
            $0.reps == Int(set.reps)
        }
        
        if existingPR == nil || existingPR!.value < weight {
            let newPR = PersonalRecord(
                exerciseId: set.exerciseId,
                type: .weightAtReps,
                value: weight,
                reps: Int(set.reps)
            )
            addPersonalRecord(newPR)
        }
        
        // Calculate and check 1RM
        let oneRM = calculateOneRepMax(weight: weight, reps: Int(set.reps))
        let existingOneRM = personalRecords.first {
            $0.exerciseId == set.exerciseId && $0.type == .oneRepMax
        }
        
        if existingOneRM == nil || existingOneRM!.value < oneRM {
            let newPR = PersonalRecord(
                exerciseId: set.exerciseId,
                type: .oneRepMax,
                value: oneRM
            )
            addPersonalRecord(newPR)
        }
    }
    
    func checkVolumeRecord(metrics: VolumeMetrics) {
        let existingPR = personalRecords.first {
            $0.exerciseId == metrics.exerciseId && $0.type == .volume
        }
        
        if existingPR == nil || existingPR!.value < metrics.totalVolume {
            let newPR = PersonalRecord(
                exerciseId: metrics.exerciseId,
                type: .volume,
                value: metrics.totalVolume
            )
            addPersonalRecord(newPR)
        }
    }
    
    // MARK: - Data Management
    
    private func addPersonalRecord(_ pr: PersonalRecord) {
        queue.async { [weak self] in
            guard let self = self else { return }
            
            // Add the record to the array
            DispatchQueue.main.async {
                self.personalRecords.append(pr)
                self.updateCacheForRecord(pr)
                self.savePRs()
                
                // Post notification and log analytics on main thread
                NotificationCenter.default.post(
                    name: .newPersonalRecord,
                    object: nil,
                    userInfo: ["pr": pr]
                )
                
                self.analyticsManager.logEvent(AnalyticsEvent(
                    name: "new_personal_record",
                    parameters: [
                        "type": pr.type.rawValue,
                        "exercise_id": pr.exerciseId.uuidString,
                        "value": String(pr.value)
                    ]
                ))
            }
        }
    }
    
    private func savePRs() {
        performanceMonitor.trackOperation(PerformanceMetric.dataFiltering) {
            do {
                let data = try JSONEncoder().encode(personalRecords)
                UserDefaults.standard.set(data, forKey: StorageKeys.personalRecords)
            } catch {
                Logger.shared.log("Failed to save PRs: \(error)", level: .error)
                analyticsManager.logEvent(AnalyticsEvent(
                    name: "error_saving_prs",
                    parameters: ["error": error.localizedDescription]
                ))
            }
        }
    }
    
    private func loadPRs() {
        performanceMonitor.trackOperation(PerformanceMetric.dataFiltering) {
            guard let data = UserDefaults.standard.data(forKey: StorageKeys.personalRecords) else { return }
            do {
                personalRecords = try JSONDecoder().decode([PersonalRecord].self, from: data)
            } catch {
                Logger.shared.log("Failed to load PRs: \(error)", level: .error)
                analyticsManager.logEvent(AnalyticsEvent(
                    name: "error_loading_prs",
                    parameters: ["error": error.localizedDescription]
                ))
            }
        }
    }
    
    // MARK: - Cache Management
    
    private func updateCache() {
        performanceMonitor.trackOperation(PerformanceMetric.cacheUpdate) {
            // Update PR cache by exercise
            prCache = Dictionary(grouping: personalRecords) { $0.exerciseId }
            
            // Update PR type cache
            prTypeCache = [:]
            for pr in personalRecords {
                if prTypeCache[pr.exerciseId] == nil {
                    prTypeCache[pr.exerciseId] = [:]
                }
                
                // Only keep the highest value for each type
                if let existing = prTypeCache[pr.exerciseId]?[pr.type] {
                    if pr.value > existing.value {
                        prTypeCache[pr.exerciseId]?[pr.type] = pr
                    }
                } else {
                    prTypeCache[pr.exerciseId]?[pr.type] = pr
                }
            }
            
            // Update date cache
            dateCache = Dictionary(grouping: personalRecords) {
                Calendar.current.startOfDay(for: $0.date)
            }
        }
    }
    
    private func updateCacheForRecord(_ pr: PersonalRecord) {
        performanceMonitor.trackOperation(PerformanceMetric.cacheUpdate) {
            // Update PR cache
            if prCache[pr.exerciseId] == nil {
                prCache[pr.exerciseId] = []
            }
            prCache[pr.exerciseId]?.append(pr)
            
            // Update PR type cache
            if prTypeCache[pr.exerciseId] == nil {
                prTypeCache[pr.exerciseId] = [:]
            }
            if let existing = prTypeCache[pr.exerciseId]?[pr.type] {
                if pr.value > existing.value {
                    prTypeCache[pr.exerciseId]?[pr.type] = pr
                }
            } else {
                prTypeCache[pr.exerciseId]?[pr.type] = pr
            }
            
            // Update date cache
            let day = Calendar.current.startOfDay(for: pr.date)
            if dateCache[day] == nil {
                dateCache[day] = []
            }
            dateCache[day]?.append(pr)
        }
    }
    
    // MARK: - Notification Handling
    
    @objc private func workoutDataChanged() {
        queue.async { [weak self] in
            self?.updateCache()
        }
    }
    
    // This method is already implemented in checkForPRs and is duplicated here
    // Removing this duplicate implementation to avoid confusion
    private func performPRCheck(set: WorkoutSet) {
        // Implementation moved to checkForPRs method
    }
}
