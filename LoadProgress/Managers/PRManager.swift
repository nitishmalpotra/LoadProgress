import Foundation

/// Manages personal records (PRs) for workout tracking
final class PRManager: ObservableObject {
    // MARK: - Published Properties

    @Published private(set) var personalRecords: [PersonalRecord] = []

    // MARK: - Cache Properties

    private var prCache: [UUID: [PersonalRecord]] = [:] // Exercise ID to PRs
    private var prTypeCache: [UUID: [PRType: PersonalRecord]] = [:] // Exercise ID to PR type
    private var dateCache: [Date: [PersonalRecord]] = [:] // Date to PRs

    // MARK: - Dependencies

    private let performanceMonitor = PerformanceMonitor.shared
    private let analyticsManager = AnalyticsManager.shared
    private let dataManager: DataManager

    // MARK: - Queue

    private let queue = DispatchQueue(label: "com.loadprogress.pr", qos: .userInitiated)

    // MARK: - Constants

    private enum StorageKeys {
        static let personalRecords = "savedPersonalRecords"
        static let cacheTimestamp = "prCacheTimestamp"
    }

    // MARK: - Initialization

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

    deinit {
        NotificationCenter.default.removeObserver(self)
    }

    // MARK: - PR Calculations

    /// Calculates estimated one-rep max using Brzycki formula
    /// - Parameters:
    ///   - weight: The weight lifted
    ///   - reps: Number of repetitions performed
    /// - Returns: Estimated 1RM in the same units as weight
    func calculateOneRepMax(weight: Double, reps: Int) -> Double {
        guard reps > 0 && reps < 37 else { return weight }
        return weight * (36 / (37 - Double(reps)))
    }

    /// Checks if the given set establishes any personal records
    /// - Parameter set: The workout set to check
    func checkForPRs(set: WorkoutSet) {
        performanceMonitor.trackOperation(PerformanceMetric.prCalculation) { [weak self] in
            self?.queue.async { [weak self] in
                self?.performPRCheckInternal(set: set)
            }
        }
    }

    /// Checks if the given volume metrics establish a volume record
    /// - Parameter metrics: The volume metrics to check
    func checkVolumeRecord(metrics: VolumeMetrics) {
        queue.async { [weak self] in
            guard let self = self else { return }

            // Use cache for faster lookup
            let existingPR = self.prTypeCache[metrics.exerciseId]?[.volume]

            if existingPR == nil || existingPR!.value < metrics.totalVolume {
                let newPR = PersonalRecord(
                    exerciseId: metrics.exerciseId,
                    type: .volume,
                    value: metrics.totalVolume
                )
                self.addPersonalRecord(newPR)
            }
        }
    }

    // MARK: - Public Query Methods

    /// Returns all PRs for a specific exercise
    /// - Parameter exerciseId: The exercise ID to query
    /// - Returns: Array of personal records for the exercise
    func getPRs(for exerciseId: UUID) -> [PersonalRecord] {
        prCache[exerciseId] ?? []
    }

    /// Returns the best PR of a specific type for an exercise
    /// - Parameters:
    ///   - exerciseId: The exercise ID
    ///   - type: The PR type to query
    /// - Returns: The personal record if it exists
    func getBestPR(for exerciseId: UUID, type: PRType) -> PersonalRecord? {
        prTypeCache[exerciseId]?[type]
    }

    // MARK: - Private Methods

    /// Internal method to check for PRs on the background queue
    private func performPRCheckInternal(set: WorkoutSet) {
        guard let weight = set.weight else { return }

        // Check for weight PR at this rep range using cache
        let existingWeightPR = prTypeCache[set.exerciseId]?[.weightAtReps]
        let shouldUpdateWeightPR: Bool

        if let existingPR = existingWeightPR {
            // Check if this is for the same rep range
            shouldUpdateWeightPR = existingPR.reps == Int(set.reps) && existingPR.value < weight
        } else {
            shouldUpdateWeightPR = true
        }

        if shouldUpdateWeightPR {
            let newPR = PersonalRecord(
                exerciseId: set.exerciseId,
                type: .weightAtReps,
                value: weight,
                reps: Int(set.reps)
            )
            addPersonalRecord(newPR)
        }

        // Calculate and check 1RM using cache
        let oneRM = calculateOneRepMax(weight: weight, reps: Int(set.reps))
        let existingOneRM = prTypeCache[set.exerciseId]?[.oneRepMax]

        if existingOneRM == nil || existingOneRM!.value < oneRM {
            let newPR = PersonalRecord(
                exerciseId: set.exerciseId,
                type: .oneRepMax,
                value: oneRM
            )
            addPersonalRecord(newPR)
        }
    }

    /// Adds a new personal record
    /// - Parameter pr: The personal record to add
    private func addPersonalRecord(_ pr: PersonalRecord) {
        // Add on main queue since we're updating @Published property
        DispatchQueue.main.async { [weak self] in
            guard let self = self else { return }

            self.personalRecords.append(pr)
            self.updateCacheForRecord(pr)
            self.savePRs()

            // Post notification
            NotificationCenter.default.post(
                name: .newPersonalRecord,
                object: nil,
                userInfo: ["pr": pr]
            )

            // Log analytics event
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

    /// Saves PRs to persistent storage
    private func savePRs() {
        performanceMonitor.trackOperation(PerformanceMetric.dataFiltering) {
            do {
                let data = try JSONEncoder().encode(self.personalRecords)
                UserDefaults.standard.set(data, forKey: StorageKeys.personalRecords)
            } catch {
                Logger.shared.log("Failed to save PRs: \(error)", level: .error)
                self.analyticsManager.logEvent(AnalyticsEvent(
                    name: "error_saving_prs",
                    parameters: ["error": error.localizedDescription]
                ))
            }
        }
    }

    /// Loads PRs from persistent storage
    private func loadPRs() {
        performanceMonitor.trackOperation(PerformanceMetric.dataFiltering) {
            guard let data = UserDefaults.standard.data(forKey: StorageKeys.personalRecords) else { return }
            do {
                self.personalRecords = try JSONDecoder().decode([PersonalRecord].self, from: data)
            } catch {
                Logger.shared.log("Failed to load PRs: \(error)", level: .error)
                self.analyticsManager.logEvent(AnalyticsEvent(
                    name: "error_loading_prs",
                    parameters: ["error": error.localizedDescription]
                ))
            }
        }
    }

    // MARK: - Cache Management

    /// Updates all caches from the current PR list
    private func updateCache() {
        performanceMonitor.trackOperation(PerformanceMetric.cacheUpdate) {
            // Update PR cache by exercise
            self.prCache = Dictionary(grouping: self.personalRecords) { $0.exerciseId }

            // Update PR type cache - keep only the best value for each type
            self.prTypeCache = [:]
            for pr in self.personalRecords {
                if self.prTypeCache[pr.exerciseId] == nil {
                    self.prTypeCache[pr.exerciseId] = [:]
                }

                // Only keep the highest value for each type
                if let existing = self.prTypeCache[pr.exerciseId]?[pr.type] {
                    if pr.value > existing.value {
                        self.prTypeCache[pr.exerciseId]?[pr.type] = pr
                    }
                } else {
                    self.prTypeCache[pr.exerciseId]?[pr.type] = pr
                }
            }

            // Update date cache
            self.dateCache = Dictionary(grouping: self.personalRecords) {
                Calendar.current.startOfDay(for: $0.date)
            }
        }
    }

    /// Incrementally updates caches for a single new record
    /// - Parameter pr: The newly added personal record
    private func updateCacheForRecord(_ pr: PersonalRecord) {
        performanceMonitor.trackOperation(PerformanceMetric.cacheUpdate) {
            // Update PR cache
            if self.prCache[pr.exerciseId] == nil {
                self.prCache[pr.exerciseId] = []
            }
            self.prCache[pr.exerciseId]?.append(pr)

            // Update PR type cache
            if self.prTypeCache[pr.exerciseId] == nil {
                self.prTypeCache[pr.exerciseId] = [:]
            }
            if let existing = self.prTypeCache[pr.exerciseId]?[pr.type] {
                if pr.value > existing.value {
                    self.prTypeCache[pr.exerciseId]?[pr.type] = pr
                }
            } else {
                self.prTypeCache[pr.exerciseId]?[pr.type] = pr
            }

            // Update date cache
            let day = Calendar.current.startOfDay(for: pr.date)
            if self.dateCache[day] == nil {
                self.dateCache[day] = []
            }
            self.dateCache[day]?.append(pr)
        }
    }

    // MARK: - Notification Handling

    @objc private func workoutDataChanged() {
        queue.async { [weak self] in
            self?.updateCache()
        }
    }
}
