import XCTest
@testable import LoadProgress

final class PerformanceTests: XCTestCase {
    var dataManager: DataManager!
    
    override func setUp() {
        super.setUp()
        dataManager = DataManager()
    }
    
    override func tearDown() {
        dataManager = nil
        super.tearDown()
    }
    
    func testDataManagerPerformance() {
        // Test exercise lookup performance
        measure {
            for _ in 0...1000 {
                let _ = dataManager.exercises.first { $0.type == .weightTraining }
            }
        }
        
        // Test workout sets filtering performance
        let date = Date()
        measure {
            let _ = dataManager.workoutSets.filter {
                Calendar.current.isDate($0.date, inSameDayAs: date)
            }
        }
    }
    
    func testAnalyticsManagerPerformance() {
        let analyticsManager = AnalyticsManager.shared
        
        measure {
            for _ in 0...100 {
                analyticsManager.logEvent(AnalyticsEvent(
                    name: "test_event",
                    parameters: ["test": "value"]
                ))
            }
        }
    }
    
    func testMemoryUsage() {
        let performanceMonitor = PerformanceMonitor.shared
        
        // Create a memory-intensive operation
        var largeArray: [Int] = []
        
        measure {
            performanceMonitor.trackOperation("memory_test") {
                // Fill array with 1 million integers
                for i in 0...1_000_000 {
                    largeArray.append(i)
                }
            }
        }
        
        XCTAssertNotNil(largeArray) // Prevent array from being optimized away
    }
    
    func testCacheEfficiency() {
        // Add 1000 exercises
        let startTime = CFAbsoluteTimeGetCurrent()
        
        for i in 0...1000 {
            let exercise = Exercise(
                name: "Test Exercise \(i)",
                type: .weightTraining,
                muscleGroup: .chest
            )
            dataManager.addExercise(exercise)
        }
        
        let endTime = CFAbsoluteTimeGetCurrent()
        let duration = endTime - startTime
        
        // Verify cache is working by checking lookup times
        let lookupStart = CFAbsoluteTimeGetCurrent()
        let _ = dataManager.exercises.first { $0.name == "Test Exercise 500" }
        let lookupDuration = CFAbsoluteTimeGetCurrent() - lookupStart
        
        // Lookup should be significantly faster than initial population
        XCTAssertTrue(lookupDuration < duration / 100, "Cache lookup is not performing efficiently")
    }
}
