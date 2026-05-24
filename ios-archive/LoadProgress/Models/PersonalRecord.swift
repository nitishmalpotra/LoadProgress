import Foundation

enum PRType: String, Codable, CaseIterable {
    case oneRepMax = "1RM"
    case volume = "Volume"
    case weightAtReps = "Weight at Reps"
    case totalReps = "Total Reps"
}

struct PersonalRecord: Identifiable, Codable {
    let id: UUID
    let exerciseId: UUID
    let type: PRType
    let value: Double
    let date: Date
    let reps: Int
    
    init(exerciseId: UUID, type: PRType, value: Double, reps: Int = 1) {
        self.id = UUID()
        self.exerciseId = exerciseId
        self.type = type
        self.value = value
        self.date = Date()
        self.reps = reps
    }
    
    init(id: UUID = UUID(), exerciseId: UUID, type: PRType, value: Double, reps: Int = 1, date: Date = Date()) {
        self.id = id
        self.exerciseId = exerciseId
        self.type = type
        self.value = value
        self.reps = reps
        self.date = date
    }
}
