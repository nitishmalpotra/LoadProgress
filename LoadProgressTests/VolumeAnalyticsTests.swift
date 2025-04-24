import XCTest
@testable import LoadProgress

final class VolumeAnalyticsTests: XCTestCase {
    var dataManager: DataManager!
    var testExercise: Exercise!
    var testDate: Date!
    
    override func setUp() {
        super.setUp()
        dataManager = DataManager()
        testExercise = Exercise(name: "Test Exercise", type: .weightTraining, muscleGroup: .chest)
        dataManager.addExercise(testExercise)
        testDate = Date()
    }
    
    override func tearDown() {
        dataManager = nil
        testExercise = nil
        testDate = nil
        super.tearDown()
    }
    
    // MARK: - Volume Calculation Tests
    
    func testVolumeCalculation() {
        // Create test sets
        let sets = [
            try! WorkoutSet(weight: 100, reps: 10, date: testDate, exerciseId: testExercise.id),
            try! WorkoutSet(weight: 90, reps: 12, date: testDate, exerciseId: testExercise.id),
            try! WorkoutSet(weight: 80, reps: 15, date: testDate, exerciseId: testExercise.id)
        ]
        
        // Expected volume = Σ(weight × reps)
        let expectedVolume = (100.0 * 10) + (90.0 * 12) + (80.0 * 15)
        
        let metrics = VolumeMetrics(sets: sets)
        XCTAssertEqual(metrics.totalVolume, expectedVolume, accuracy: 0.01)
    }
    
    func testAverageWeightCalculation() {
        let sets = [
            try! WorkoutSet(weight: 100, reps: 10, date: testDate, exerciseId: testExercise.id),
            try! WorkoutSet(weight: 90, reps: 10, date: testDate, exerciseId: testExercise.id),
            try! WorkoutSet(weight: 80, reps: 10, date: testDate, exerciseId: testExercise.id)
        ]
        
        let metrics = VolumeMetrics(sets: sets)
        XCTAssertEqual(metrics.averageWeight, 90.0, accuracy: 0.01)
    }
    
    // MARK: - Time Range Tests
    
    func testTimeRangeFiltering() {
        let calendar = Calendar.current
        let today = Date()
        let yesterday = calendar.date(byAdding: .day, value: -1, to: today)!
        let lastWeek = calendar.date(byAdding: .day, value: -7, to: today)!
        
        // Add sets across different dates
        let sets = [
            try! WorkoutSet(weight: 100, reps: 10, date: today, exerciseId: testExercise.id),
            try! WorkoutSet(weight: 90, reps: 10, date: yesterday, exerciseId: testExercise.id),
            try! WorkoutSet(weight: 80, reps: 10, date: lastWeek, exerciseId: testExercise.id)
        ]
        
        // Test week range
        let weekSets = sets.filter { set in
            let daysDiff = calendar.dateComponents([.day], from: set.date, to: today).day ?? 0
            return daysDiff <= 7
        }
        
        let weekMetrics = VolumeMetrics(sets: weekSets)
        XCTAssertEqual(weekMetrics.totalSets, 3)
        
        // Test day range
        let daySets = sets.filter { calendar.isDate($0.date, inSameDayAs: today) }
        let dayMetrics = VolumeMetrics(sets: daySets)
        XCTAssertEqual(dayMetrics.totalSets, 1)
    }
    
    // MARK: - Performance Tests
    
    func testVolumeCalculationPerformance() {
        measure {
            var sets: [WorkoutSet] = []
            
            // Create 1000 sets
            for _ in 0..<1000 {
                let set = try! WorkoutSet(
                    weight: Double.random(in: 50...200),
                    reps: Int.random(in: 1...20),
                    date: testDate,
                    exerciseId: testExercise.id
                )
                sets.append(set)
            }
            
            _ = VolumeMetrics(sets: sets)
        }
    }
    
    // MARK: - Edge Case Tests
    
    func testEmptySetHandling() {
        let metrics = VolumeMetrics(sets: [])
        XCTAssertEqual(metrics.totalVolume, 0)
        XCTAssertEqual(metrics.averageWeight, 0)
        XCTAssertEqual(metrics.totalSets, 0)
        XCTAssertEqual(metrics.totalReps, 0)
    }
    
    func testZeroWeightHandling() {
        let sets = [
            try! WorkoutSet(weight: 0, reps: 10, date: testDate, exerciseId: testExercise.id)
        ]
        
        let metrics = VolumeMetrics(sets: sets)
        XCTAssertEqual(metrics.totalVolume, 0)
        XCTAssertEqual(metrics.averageWeight, 0)
        XCTAssertEqual(metrics.totalSets, 1)
        XCTAssertEqual(metrics.totalReps, 10)
    }
    
    func testNegativeWeightHandling() {
        XCTAssertThrowsError(try WorkoutSet(
            weight: -100,
            reps: 10,
            date: testDate,
            exerciseId: testExercise.id
        ))
    }
    
    // MARK: - Muscle Group Tests
    
    func testMuscleGroupVolume() {
        // Create exercises for different muscle groups
        let chestExercise = Exercise(name: "Bench Press", type: .weightTraining, muscleGroup: .chest)
        let backExercise = Exercise(name: "Row", type: .weightTraining, muscleGroup: .back)
        dataManager.addExercise(chestExercise)
        dataManager.addExercise(backExercise)
        
        // Add sets for each exercise
        let chestSets = [
            try! WorkoutSet(weight: 100, reps: 10, date: testDate, exerciseId: chestExercise.id),
            try! WorkoutSet(weight: 90, reps: 10, date: testDate, exerciseId: chestExercise.id)
        ]
        
        let backSets = [
            try! WorkoutSet(weight: 80, reps: 10, date: testDate, exerciseId: backExercise.id),
            try! WorkoutSet(weight: 70, reps: 10, date: testDate, exerciseId: backExercise.id)
        ]
        
        let chestMetrics = VolumeMetrics(sets: chestSets)
        let backMetrics = VolumeMetrics(sets: backSets)
        
        XCTAssertGreaterThan(chestMetrics.totalVolume, backMetrics.totalVolume)
    }
}
