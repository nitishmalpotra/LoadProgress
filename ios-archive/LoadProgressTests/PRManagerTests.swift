import XCTest
@testable import LoadProgress

final class PRManagerTests: XCTestCase {
    var dataManager: DataManager!
    var prManager: PRManager!
    
    override func setUp() {
        super.setUp()
        dataManager = DataManager()
        prManager = PRManager(dataManager: dataManager)
    }
    
    override func tearDown() {
        dataManager = nil
        prManager = nil
        super.tearDown()
    }
    
    // MARK: - PR Detection Tests
    
    func testOneRepMaxCalculation() {
        // Test Brzycki Formula accuracy
        let weight: Double = 100
        let reps = 5
        
        // Expected 1RM = weight * (36 / (37 - reps))
        let expectedOneRM = 100 * (36.0 / (37.0 - 5.0))
        let calculatedOneRM = prManager.calculateOneRepMax(weight: weight, reps: reps)
        
        XCTAssertEqual(calculatedOneRM, expectedOneRM, accuracy: 0.01)
    }
    
    func testWeightPRDetection() {
        let exercise = Exercise(name: "Bench Press", type: .weightTraining, muscleGroup: .chest)
        dataManager.addExercise(exercise)
        
        // Add initial set
        let set1 = try! WorkoutSet(
            weight: 100,
            reps: 5,
            date: Date(),
            exerciseId: exercise.id
        )
        prManager.checkForPRs(set: set1)
        
        // Verify PR was created
        XCTAssertEqual(prManager.personalRecords.count, 2) // Weight PR and 1RM PR
        
        // Add higher weight set
        let set2 = try! WorkoutSet(
            weight: 110,
            reps: 5,
            date: Date(),
            exerciseId: exercise.id
        )
        prManager.checkForPRs(set: set2)
        
        // Verify new PR was created
        XCTAssertEqual(prManager.personalRecords.count, 4)
        
        // Add lower weight set
        let set3 = try! WorkoutSet(
            weight: 90,
            reps: 5,
            date: Date(),
            exerciseId: exercise.id
        )
        prManager.checkForPRs(set: set3)
        
        // Verify no new PR was created
        XCTAssertEqual(prManager.personalRecords.count, 4)
    }
    
    // MARK: - Cache Tests
    
    func testCachePerformance() {
        measure {
            // Add 1000 PRs
            let exercise = Exercise(name: "Test", type: .weightTraining, muscleGroup: .chest)
            dataManager.addExercise(exercise)
            
            for i in 1...1000 {
                let set = try! WorkoutSet(
                    weight: Double(i),
                    reps: 5,
                    date: Date(),
                    exerciseId: exercise.id
                )
                prManager.checkForPRs(set: set)
            }
        }
    }
    
    func testCacheAccuracy() {
        let exercise = Exercise(name: "Test", type: .weightTraining, muscleGroup: .chest)
        dataManager.addExercise(exercise)
        
        // Add sets with different weights
        let weights = [100.0, 110.0, 90.0, 120.0, 115.0]
        for weight in weights {
            let set = try! WorkoutSet(
                weight: weight,
                reps: 5,
                date: Date(),
                exerciseId: exercise.id
            )
            prManager.checkForPRs(set: set)
        }
        
        // Verify highest weight was cached
        let highestPR = prManager.personalRecords
            .filter { $0.exerciseId == exercise.id && $0.type == .weightAtReps }
            .max { $0.value < $1.value }
        
        XCTAssertEqual(highestPR?.value, 120.0)
    }
    
    // MARK: - Data Persistence Tests
    
    func testPRPersistence() {
        let exercise = Exercise(name: "Test", type: .weightTraining, muscleGroup: .chest)
        dataManager.addExercise(exercise)
        
        // Add a PR
        let set = try! WorkoutSet(
            weight: 100,
            reps: 5,
            date: Date(),
            exerciseId: exercise.id
        )
        prManager.checkForPRs(set: set)
        
        // Create new PR manager instance
        let newPRManager = PRManager(dataManager: dataManager)
        
        // Verify PR was loaded
        XCTAssertEqual(newPRManager.personalRecords.count, prManager.personalRecords.count)
    }
    
    // MARK: - Error Handling Tests
    
    func testInvalidDataHandling() {
        // Test with invalid weight
        let exercise = Exercise(name: "Test", type: .weightTraining, muscleGroup: .chest)
        dataManager.addExercise(exercise)
        
        let set = try! WorkoutSet(
            weight: -100, // Invalid weight
            reps: 5,
            date: Date(),
            exerciseId: exercise.id
        )
        
        prManager.checkForPRs(set: set)
        XCTAssertTrue(prManager.personalRecords.isEmpty)
    }
}
