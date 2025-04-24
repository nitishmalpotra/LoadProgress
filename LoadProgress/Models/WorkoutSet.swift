import Foundation

struct WorkoutSet: Codable, Identifiable {
    let id: UUID
    let exerciseId: UUID
    let weight: Double?
    let reps: Double
    let date: Date
    let rpe: Double? // Rate of Perceived Exertion (1-10)
    let restTime: TimeInterval? // Rest time before this set
    let notes: String? // Form notes or other observations
    let isFailureSet: Bool = false // Whether this set reached technical failure

    init(weight: Double? = nil, reps: Double? = nil, date: Date, exerciseId: UUID, rpe: Double? = nil, restTime: TimeInterval? = nil, notes: String? = nil, isFailureSet: Bool = false) throws {
        self.id = UUID()
        
        // Validate reps
        if let reps = reps {
            guard reps > 0 else {
                Logger.shared.log("Invalid reps value: \(reps)", level: .error)
                throw AppError.invalidInput("Reps must be greater than 0")
            }
        }
        
        // Validate weight
        if let weight = weight {
            guard weight > 0 else {
                Logger.shared.log("Invalid weight value: \(weight)", level: .error)
                throw AppError.invalidInput("Weight must be greater than 0")
            }
        }
        
        self.weight = weight
        self.reps = reps ?? 0
        self.date = date
        self.exerciseId = exerciseId
        self.rpe = rpe
        self.restTime = restTime
        self.notes = notes
    }
    
    private enum CodingKeys: String, CodingKey {
        case id, exerciseId, weight, reps, date, rpe, restTime, notes, isFailureSet
    }
} 