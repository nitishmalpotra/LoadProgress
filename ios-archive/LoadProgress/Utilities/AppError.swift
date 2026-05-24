import Foundation

enum AppError: LocalizedError {
    case dataLoadFailed
    case dataSaveFailed
    case invalidInput(String)
    case exerciseNotFound
    case invalidWorkoutData
    case backupFailed
    case restoreFailed
    case networkError
    case validationError(String)
    
    var errorDescription: String? {
        switch self {
        case .dataLoadFailed:
            return "Failed to load data"
        case .dataSaveFailed:
            return "Failed to save data"
        case .invalidInput(let field):
            return "Invalid input for \(field)"
        case .exerciseNotFound:
            return "Exercise not found"
        case .invalidWorkoutData:
            return "Invalid workout data"
        case .backupFailed:
            return "Failed to create backup"
        case .restoreFailed:
            return "Failed to restore from backup"
        case .networkError:
            return "Network connection error"
        case .validationError(let message):
            return message
        }
    }
    
    var recoverySuggestion: String? {
        switch self {
        case .dataLoadFailed, .dataSaveFailed:
            return "Try restarting the app"
        case .invalidInput:
            return "Please check your input and try again"
        case .exerciseNotFound:
            return "Try refreshing the exercise list"
        case .invalidWorkoutData:
            return "Please check your workout details"
        case .backupFailed:
            return "Check available storage space"
        case .restoreFailed:
            return "Make sure you have a valid backup"
        case .networkError:
            return "Check your internet connection"
        case .validationError:
            return "Please correct the error and try again"
        }
    }
} 