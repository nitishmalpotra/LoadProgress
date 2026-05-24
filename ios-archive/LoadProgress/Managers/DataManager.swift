import Foundation
import SwiftUI

/// Manages the persistence and state of exercises and workout data
final class DataManager: ObservableObject {
    // MARK: - Preview Instance

    static var preview: DataManager = {
        let manager = DataManager()
        return manager
    }()

    // MARK: - Published Properties

    @Published private(set) var exercises: [Exercise] = []
    @Published private(set) var workoutSets: [WorkoutSet] = []

    // MARK: - Cache Properties

    private var exerciseCache: [UUID: Exercise] = [:]
    private var workoutSetsByExercise: [UUID: [WorkoutSet]] = [:]
    private var workoutSetsByDate: [Date: [WorkoutSet]] = [:]

    // MARK: - Cache Configuration

    private let cacheExpirationInterval: TimeInterval = 3600 // 1 hour
    private var lastCacheUpdate: Date = Date()

    // MARK: - Constants

    private enum StorageKeys {
        static let exercises = "savedExercises"
        static let workoutSets = "savedWorkoutSets"
    }

    // MARK: - Initialization

    init() {
        loadData()
        if exercises.isEmpty {
            populateDefaultExercises()
        } else {
            updateCache()
        }
    }

    // MARK: - Public Methods

    /// Adds a new exercise to the database
    /// - Parameter exercise: The exercise to add
    func addExercise(_ exercise: Exercise) {
        exercises.append(exercise)
        exerciseCache[exercise.id] = exercise

        do {
            try saveData()
            Logger.shared.log("Exercise '\(exercise.name)' added successfully", level: .info)
        } catch {
            Logger.shared.log("Failed to save exercise: \(error)", level: .error)
            // Rollback cache update on failure
            exercises.removeLast()
            exerciseCache.removeValue(forKey: exercise.id)
        }
    }

    /// Adds a new workout set to the database
    /// - Parameter set: The workout set to add
    func addWorkoutSet(_ set: WorkoutSet) {
        // Validate exercise exists
        guard exerciseCache[set.exerciseId] != nil else {
            Logger.shared.log("Attempted to add workout set for non-existent exercise", level: .error)
            return
        }

        workoutSets.append(set)

        // Incrementally update caches
        updateCacheForWorkoutSet(set)

        do {
            try saveData()
            Logger.shared.log("Added workout set successfully", level: .info)

            // Post notification for PR checking
            NotificationCenter.default.post(
                name: .workoutDataChanged,
                object: nil,
                userInfo: ["workoutSet": set]
            )
        } catch {
            Logger.shared.log("Failed to save workout set: \(error)", level: .error)
            // Rollback on failure
            workoutSets.removeLast()
            removeWorkoutSetFromCache(set)
        }
    }

    /// Deletes workout sets from the database
    /// - Parameter sets: The workout sets to delete
    func deleteWorkoutSets(_ sets: [WorkoutSet]) throws {
        let setsToDelete = Set(sets.map { $0.id })
        workoutSets.removeAll { setsToDelete.contains($0.id) }

        try saveData()

        // Rebuild caches after bulk deletion
        updateCache()

        Logger.shared.log("Successfully deleted \(sets.count) workout sets", level: .info)

        // Post notification
        NotificationCenter.default.post(name: .workoutDataChanged, object: nil)
    }

    /// Cleans up old workout data (older than 3 months)
    func cleanupOldWorkouts() {
        let threeMonthsAgo = Calendar.current.date(byAdding: .month, value: -3, to: Date()) ?? Date()
        let oldCount = workoutSets.count

        workoutSets.removeAll { $0.date < threeMonthsAgo }

        let removedCount = oldCount - workoutSets.count

        do {
            try saveData()
            updateCache()
            Logger.shared.log("Cleaned up \(removedCount) old workout records", level: .info)
        } catch {
            Logger.shared.log("Failed to cleanup old workouts: \(error)", level: .error)
        }
    }

    /// Attempts to recover data from backup
    func attemptDataRecovery() {
        Logger.shared.log("Attempting data recovery", level: .warning)

        do {
            try BackupManager.shared.restoreFromBackup()
            loadData()
            updateCache()
            Logger.shared.log("Data recovery successful", level: .info)
        } catch {
            Logger.shared.log("Recovery failed: \(error)", level: .error)
        }
    }

    // MARK: - Query Methods

    /// Returns the exercise with the given ID
    /// - Parameter id: Exercise UUID
    /// - Returns: Exercise if found, nil otherwise
    func getExercise(by id: UUID) -> Exercise? {
        validateCacheIfNeeded()
        return exerciseCache[id]
    }

    /// Returns all workout sets for a specific exercise
    /// - Parameter exerciseId: Exercise UUID
    /// - Returns: Array of workout sets
    func getWorkoutSets(for exerciseId: UUID) -> [WorkoutSet] {
        validateCacheIfNeeded()
        return workoutSetsByExercise[exerciseId] ?? []
    }

    /// Returns all workout sets for a specific date
    /// - Parameter date: The date to query
    /// - Returns: Array of workout sets
    func getWorkoutSets(for date: Date) -> [WorkoutSet] {
        validateCacheIfNeeded()
        let startOfDay = Calendar.current.startOfDay(for: date)
        return workoutSetsByDate[startOfDay] ?? []
    }

    // MARK: - Cache Management

    /// Updates all caches from current data
    private func updateCache() {
        // Update exercise cache
        exerciseCache = Dictionary(uniqueKeysWithValues: exercises.map { ($0.id, $0) })

        // Update workout sets by exercise cache
        workoutSetsByExercise = Dictionary(grouping: workoutSets) { $0.exerciseId }

        // Update workout sets by date cache
        workoutSetsByDate = Dictionary(grouping: workoutSets) {
            Calendar.current.startOfDay(for: $0.date)
        }

        lastCacheUpdate = Date()
    }

    /// Incrementally updates caches for a single workout set
    /// - Parameter set: The workout set to add to caches
    private func updateCacheForWorkoutSet(_ set: WorkoutSet) {
        // Update by exercise cache
        if workoutSetsByExercise[set.exerciseId] == nil {
            workoutSetsByExercise[set.exerciseId] = []
        }
        workoutSetsByExercise[set.exerciseId]?.append(set)

        // Update by date cache
        let startOfDay = Calendar.current.startOfDay(for: set.date)
        if workoutSetsByDate[startOfDay] == nil {
            workoutSetsByDate[startOfDay] = []
        }
        workoutSetsByDate[startOfDay]?.append(set)
    }

    /// Removes a workout set from caches
    /// - Parameter set: The workout set to remove
    private func removeWorkoutSetFromCache(_ set: WorkoutSet) {
        workoutSetsByExercise[set.exerciseId]?.removeAll { $0.id == set.id }
        let startOfDay = Calendar.current.startOfDay(for: set.date)
        workoutSetsByDate[startOfDay]?.removeAll { $0.id == set.id }
    }

    /// Validates cache and refreshes if expired
    private func validateCacheIfNeeded() {
        let now = Date()
        if now.timeIntervalSince(lastCacheUpdate) > cacheExpirationInterval {
            updateCache()
        }
    }

    // MARK: - Data Persistence

    private func loadData() {
        do {
            exercises = try loadFromUserDefaults(key: StorageKeys.exercises) ?? []
            workoutSets = try loadFromUserDefaults(key: StorageKeys.workoutSets) ?? []
            Logger.shared.log("Data loaded successfully", level: .info)
        } catch {
            Logger.shared.log("Failed to load data: \(error.localizedDescription)", level: .error)
            exercises = []
            workoutSets = []
        }
    }

    private func saveData() throws {
        do {
            try saveToUserDefaults(exercises, key: StorageKeys.exercises)
            try saveToUserDefaults(workoutSets, key: StorageKeys.workoutSets)
            Logger.shared.log("Data saved successfully", level: .info)
        } catch {
            Logger.shared.log("Failed to save data: \(error.localizedDescription)", level: .error)
            throw AppError.dataSaveFailed
        }
    }

    private func loadFromUserDefaults<T: Decodable>(key: String) throws -> T? {
        guard let data = UserDefaults.standard.data(forKey: key) else {
            return nil
        }

        do {
            return try JSONDecoder().decode(T.self, from: data)
        } catch {
            Logger.shared.log("Failed to decode data for key \(key): \(error)", level: .error)
            throw AppError.dataLoadFailed
        }
    }

    private func saveToUserDefaults<T: Encodable>(_ value: T, key: String) throws {
        do {
            let data = try JSONEncoder().encode(value)
            UserDefaults.standard.set(data, forKey: key)
        } catch {
            Logger.shared.log("Failed to encode data for key \(key): \(error)", level: .error)
            throw AppError.dataSaveFailed
        }
    }

    // MARK: - Default Data Population

    private func populateDefaultExercises() {
        let defaultExercises: [Exercise] = [
            // Chest Exercises
            Exercise(name: "Bench Press", type: .weightTraining, muscleGroup: .chest, icon: .benchPress, difficulty: .intermediate, equipment: [.barbell, .bench], description: "Classic compound chest exercise", formCues: ["Retract shoulder blades", "Keep feet planted"]),
            Exercise(name: "Incline Dumbbell Press", type: .weightTraining, muscleGroup: .chest, icon: .inclineBench, difficulty: .intermediate, equipment: [.dumbbell, .bench], description: "Upper chest focused press", formCues: ["Control the weight", "Keep elbows at 45 degrees"]),
            Exercise(name: "Push-Ups", type: .bodyweight, muscleGroup: .chest, icon: .pushUp, difficulty: .beginner, equipment: [.bodyweight], description: "Fundamental pushing exercise", formCues: ["Keep core tight", "Full range of motion"]),
            Exercise(name: "Dips", type: .bodyweight, muscleGroup: .chest, icon: .dips, difficulty: .intermediate, equipment: [.bodyweight], description: "Advanced chest and tricep exercise", formCues: ["Lean forward for chest focus", "Control the descent"]),

            // Back Exercises
            Exercise(name: "Pull-Ups", type: .bodyweight, muscleGroup: .back, icon: .pullUp, difficulty: .intermediate, equipment: [.pullupBar], description: "Upper body pulling movement", formCues: ["Full hang at bottom", "Pull shoulder blades down"]),
            Exercise(name: "Deadlift", type: .weightTraining, muscleGroup: .back, icon: .deadlift, difficulty: .advanced, equipment: [.barbell], description: "Fundamental hip hinge movement", formCues: ["Neutral spine", "Push through floor"]),
            Exercise(name: "Barbell Rows", type: .weightTraining, muscleGroup: .back, icon: .bentOverRow, difficulty: .intermediate, equipment: [.barbell], description: "Horizontal pulling movement", formCues: ["Hinge at hips", "Pull to lower chest"]),
            Exercise(name: "Lat Pulldown", type: .weightTraining, muscleGroup: .back, icon: .latPulldown, difficulty: .beginner, equipment: [.cable], description: "Vertical pulling movement", formCues: ["Pull to upper chest", "Control the weight"]),

            // Legs Exercises
            Exercise(name: "Squats", type: .weightTraining, muscleGroup: .legs, icon: .squat, difficulty: .intermediate, equipment: [.barbell], description: "Fundamental lower body movement", formCues: ["Break at hips and knees", "Keep chest up"]),
            Exercise(name: "Romanian Deadlift", type: .weightTraining, muscleGroup: .legs, icon: .romanianDeadlift, difficulty: .intermediate, equipment: [.barbell], description: "Hamstring focused movement", formCues: ["Hinge at hips", "Soft knee bend"]),
            Exercise(name: "Walking Lunges", type: .bodyweight, muscleGroup: .legs, icon: .bodyweight, difficulty: .beginner, equipment: [.bodyweight], description: "Unilateral leg exercise", formCues: ["Step with control", "Keep torso upright"]),
            Exercise(name: "Leg Press", type: .weightTraining, muscleGroup: .legs, icon: .legPress, difficulty: .beginner, equipment: [.machine], description: "Machine-based leg exercise", formCues: ["Control the weight", "Full range of motion"]),

            // Shoulders Exercises
            Exercise(name: "Overhead Press", type: .weightTraining, muscleGroup: .shoulders, icon: .overheadPress, difficulty: .intermediate, equipment: [.barbell], description: "Vertical pressing movement", formCues: ["Lock out arms", "Engage core"]),
            Exercise(name: "Lateral Raises", type: .weightTraining, muscleGroup: .shoulders, icon: .lateralRaise, difficulty: .beginner, equipment: [.dumbbell], description: "Lateral deltoid isolation", formCues: ["Lead with elbows", "Control descent"]),
            Exercise(name: "Front Raises", type: .weightTraining, muscleGroup: .shoulders, icon: .frontRaise, difficulty: .beginner, equipment: [.dumbbell], description: "Front deltoid isolation", formCues: ["Keep arms straight", "Control movement"]),
            Exercise(name: "Pike Push-Ups", type: .bodyweight, muscleGroup: .shoulders, icon: .pushUp, difficulty: .intermediate, equipment: [.bodyweight], description: "Bodyweight shoulder press", formCues: ["Form inverted V", "Lower with control"]),

            // Arms Exercises
            Exercise(name: "Bicep Curls", type: .weightTraining, muscleGroup: .arms, icon: .bicepCurl, difficulty: .beginner, equipment: [.dumbbell], description: "Basic bicep exercise", formCues: ["Keep elbows still", "Full range of motion"]),
            Exercise(name: "Tricep Extensions", type: .weightTraining, muscleGroup: .arms, icon: .tricepExtension, difficulty: .beginner, equipment: [.dumbbell], description: "Tricep isolation", formCues: ["Keep elbows tucked", "Extend fully"]),
            Exercise(name: "Diamond Push-Ups", type: .bodyweight, muscleGroup: .arms, icon: .pushUp, difficulty: .intermediate, equipment: [.bodyweight], description: "Tricep focused push-up", formCues: ["Diamond hand position", "Keep elbows tucked"]),
            Exercise(name: "Hammer Curls", type: .weightTraining, muscleGroup: .arms, icon: .hammerCurl, difficulty: .beginner, equipment: [.dumbbell], description: "Neutral grip bicep curl", formCues: ["Vertical hand position", "Control the weight"]),

            // Core Exercises
            Exercise(name: "Plank", type: .bodyweight, muscleGroup: .core, icon: .plank, difficulty: .beginner, equipment: [.bodyweight], description: "Core stabilization exercise", formCues: ["Keep body straight", "Engage core"]),
            Exercise(name: "Russian Twists", type: .bodyweight, muscleGroup: .core, icon: .russianTwist, difficulty: .intermediate, equipment: [.bodyweight], description: "Rotational core exercise", formCues: ["Keep feet off ground", "Rotate from core"]),
            Exercise(name: "Leg Raises", type: .bodyweight, muscleGroup: .core, icon: .legRaise, difficulty: .intermediate, equipment: [.bodyweight], description: "Lower abs focused movement", formCues: ["Keep legs straight", "Control descent"]),
            Exercise(name: "Cable Crunches", type: .weightTraining, muscleGroup: .core, icon: .machine, difficulty: .intermediate, equipment: [.cable], description: "Weighted core exercise", formCues: ["Round spine", "Pull with abs"]),

            // Full Body Exercises
            Exercise(name: "Burpees", type: .bodyweight, muscleGroup: .fullBody, icon: .burpee, difficulty: .intermediate, equipment: [.bodyweight], description: "Full body conditioning", formCues: ["Explosive movement", "Control landing"]),
            Exercise(name: "Mountain Climbers", type: .bodyweight, muscleGroup: .fullBody, icon: .mountainClimber, difficulty: .beginner, equipment: [.bodyweight], description: "Dynamic core exercise", formCues: ["Keep hips low", "Alternate legs quickly"]),
            Exercise(name: "Turkish Get-Ups", type: .weightTraining, muscleGroup: .fullBody, icon: .turkishGetUp, difficulty: .advanced, equipment: [.kettlebell], description: "Complex movement pattern", formCues: ["Keep arm vertical", "Move with control"]),
            Exercise(name: "Clean and Press", type: .weightTraining, muscleGroup: .fullBody, icon: .cleanAndJerk, difficulty: .advanced, equipment: [.barbell], description: "Olympic lifting movement", formCues: ["Pull with legs", "Catch in rack position"])
        ]

        do {
            exercises = defaultExercises
            try saveData()
            updateCache()
            Logger.shared.log("Default exercises populated successfully", level: .info)
        } catch {
            Logger.shared.log("Failed to save default exercises: \(error)", level: .error)
        }
    }
}
