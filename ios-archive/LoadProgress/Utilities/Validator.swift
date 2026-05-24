import Foundation

enum Validator {
    static func validateExerciseName(_ name: String) -> Result<String, AppError> {
        let trimmed = name.trimmingCharacters(in: .whitespacesAndNewlines)
        
        guard !trimmed.isEmpty else {
            return .failure(.validationError("Exercise name cannot be empty"))
        }
        
        guard trimmed.count >= 2 else {
            return .failure(.validationError("Exercise name must be at least 2 characters"))
        }
        
        guard trimmed.count <= 50 else {
            return .failure(.validationError("Exercise name must be less than 50 characters"))
        }
        
        return .success(trimmed)
    }
    
    static func validateWeight(_ weightString: String) -> Result<Double, AppError> {
        guard let weight = Double(weightString) else {
            return .failure(.validationError("Invalid weight format"))
        }
        
        guard weight > 0 else {
            return .failure(.validationError("Weight must be greater than 0"))
        }
        
        guard weight <= 1000 else {
            return .failure(.validationError("Weight cannot exceed 1000"))
        }
        
        return .success(weight)
    }
    
    static func validateReps(_ repsString: String) -> Result<Double, AppError> {
        guard let reps = Double(repsString) else {
            return .failure(.validationError("Invalid reps format"))
        }
        
        guard reps > 0 else {
            return .failure(.validationError("Reps must be greater than 0"))
        }
        
        guard reps <= 100 else {
            return .failure(.validationError("Reps cannot exceed 100"))
        }
        
        return .success(reps)
    }
    
    static func validateWorkoutSet(_ set: WorkoutSet) -> Result<Void, AppError> {
        if let weight = set.weight {
            guard weight > 0 && weight <= 1000 else {
                return .failure(.validationError("Weight must be between 0 and 1000"))
            }
        }
        
        // Remove optional binding since reps is not optional
        guard set.reps > 0 && set.reps <= 100 else {
            return .failure(.validationError("Reps must be between 1 and 100"))
        }
        
        guard set.date <= Date() else {
            return .failure(.validationError("Workout date cannot be in the future"))
        }
        
        return .success(())
    }
} 