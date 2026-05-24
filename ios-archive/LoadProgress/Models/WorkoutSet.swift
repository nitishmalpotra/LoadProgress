import Foundation

/// Represents a single set performed during a workout
struct WorkoutSet: Codable, Identifiable {
    // MARK: - Properties

    let id: UUID
    let exerciseId: UUID
    let weight: Double?
    let reps: Double
    let date: Date
    let rpe: Double? // Rate of Perceived Exertion (1-10)
    let restTime: TimeInterval? // Rest time before this set
    let notes: String? // Form notes or other observations
    let isFailureSet: Bool // Whether this set reached technical failure

    // MARK: - Initialization

    /// Creates a new workout set with validation
    /// - Parameters:
    ///   - weight: Optional weight in kg (must be > 0 if provided)
    ///   - reps: Number of repetitions performed (must be > 0)
    ///   - date: Date when the set was performed
    ///   - exerciseId: ID of the associated exercise
    ///   - rpe: Optional Rate of Perceived Exertion (1-10)
    ///   - restTime: Optional rest duration before this set
    ///   - notes: Optional notes about form or observations
    ///   - isFailureSet: Whether the set reached technical failure
    /// - Throws: `AppError.invalidInput` if validation fails
    init(
        weight: Double? = nil,
        reps: Double? = nil,
        date: Date,
        exerciseId: UUID,
        rpe: Double? = nil,
        restTime: TimeInterval? = nil,
        notes: String? = nil,
        isFailureSet: Bool = false
    ) throws {
        // Validate weight
        if let weight = weight {
            guard weight > 0 else {
                Logger.shared.log("Invalid weight value: \(weight)", level: .error)
                throw AppError.invalidInput("Weight must be greater than 0")
            }
            self.weight = weight
        } else {
            self.weight = nil
        }

        // Validate reps
        guard let reps = reps, reps > 0 else {
            let repsValue = reps ?? 0
            Logger.shared.log("Invalid reps value: \(repsValue)", level: .error)
            throw AppError.invalidInput("Reps must be greater than 0")
        }
        self.reps = reps

        // Validate RPE if provided
        if let rpe = rpe {
            guard (1...10).contains(rpe) else {
                Logger.shared.log("Invalid RPE value: \(rpe)", level: .warning)
                throw AppError.invalidInput("RPE must be between 1 and 10")
            }
            self.rpe = rpe
        } else {
            self.rpe = nil
        }

        // Validate rest time if provided
        if let restTime = restTime {
            guard restTime >= 0 else {
                Logger.shared.log("Invalid rest time: \(restTime)", level: .warning)
                throw AppError.invalidInput("Rest time must be non-negative")
            }
            self.restTime = restTime
        } else {
            self.restTime = nil
        }

        // Assign remaining properties
        self.id = UUID()
        self.date = date
        self.exerciseId = exerciseId
        self.notes = notes
        self.isFailureSet = isFailureSet
    }

    // MARK: - Codable

    private enum CodingKeys: String, CodingKey {
        case id, exerciseId, weight, reps, date, rpe, restTime, notes, isFailureSet
    }
}
