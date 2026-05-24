import Foundation

struct VolumeMetrics: Codable, Identifiable {
    let id: UUID
    let exerciseId: UUID
    let date: Date
    let totalVolume: Double // weight × reps × sets
    let totalReps: Int
    let averageWeight: Double
    let sets: Int
    let rpe: Double? // Rate of Perceived Exertion
    let restTime: TimeInterval?
    
    init(exerciseId: UUID, sets: [WorkoutSet]) {
        self.id = UUID()
        self.exerciseId = exerciseId
        self.date = Date()
        
        var totalVolume = 0.0
        var totalReps = 0
        var totalWeight = 0.0
        var validSets = 0
        
        for set in sets {
            if let weight = set.weight {
                totalVolume += weight * Double(set.reps)
                totalWeight += weight
                validSets += 1
            }
            totalReps += Int(set.reps)
        }
        
        self.totalVolume = totalVolume
        self.totalReps = totalReps
        self.averageWeight = validSets > 0 ? totalWeight / Double(validSets) : 0
        self.sets = sets.count
        self.rpe = sets.last?.rpe
        self.restTime = sets.last?.restTime
    }
}
