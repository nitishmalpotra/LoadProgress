import Foundation
import QuartzCore

final class PerformanceMonitor {
    // MARK: - Properties
    private var metrics: [String: [TimeInterval]] = [:]
    private var memoryMetrics: [String: [Double]] = [:]
    private var networkMetrics: [String: [Double]] = [:]
    private let metricsLimit = 100
    private let queue = DispatchQueue(label: "com.loadprogress.performance", qos: .utility)
    
    // Memory usage threshold (in bytes)
    private let memoryWarningThreshold: Double = 500_000_000 // 500MB
    static let shared = PerformanceMonitor()
    
    // MARK: - Public Methods
    
    func trackOperation(_ name: String, _ operation: () -> Void) {
        let startTime = CFAbsoluteTimeGetCurrent()
        operation()
        let endTime = CFAbsoluteTimeGetCurrent()
        
        recordMetric(name: name, duration: endTime - startTime)
    }
    
    func trackAsyncOperation(_ name: String, _ operation: (@escaping () -> Void) -> Void) {
        let startTime = CFAbsoluteTimeGetCurrent()
        operation { [weak self] in
            let endTime = CFAbsoluteTimeGetCurrent()
            self?.recordMetric(name: name, duration: endTime - startTime)
        }
    }
    
    func trackMemoryUsage(_ name: String) {
        var info = mach_task_basic_info()
        var count = mach_msg_type_number_t(MemoryLayout<mach_task_basic_info>.size)/4
        
        let kerr: kern_return_t = withUnsafeMutablePointer(to: &info) {
            $0.withMemoryRebound(to: integer_t.self, capacity: 1) {
                task_info(mach_task_self_,
                          task_flavor_t(MACH_TASK_BASIC_INFO),
                          $0,
                          &count)
            }
        }
        
        if kerr == KERN_SUCCESS {
            let usedBytes = Double(info.resident_size)
            recordMemoryMetric(name: name, bytes: usedBytes)
            
            if usedBytes > memoryWarningThreshold {
                Logger.shared.log("Memory warning: \(name) is using \(usedBytes/1_000_000)MB", level: .warning)
            }
        }
    }
    
    func trackNetworkCall(_ name: String, bytes: Double) {
        recordNetworkMetric(name: name, bytes: bytes)
    }
    
    func getAverageMetrics() -> [(String, TimeInterval)] {
        queue.sync {
            metrics.map { (name, durations) in
                let average = durations.reduce(0, +) / Double(durations.count)
                return (name, average)
            }.sorted { $0.1 > $1.1 }
        }
    }
    
    // MARK: - Private Methods
    
    private func recordMetric(name: String, duration: TimeInterval) {
        queue.async { [weak self] in
            guard let self = self else { return }
            
            if self.metrics[name] == nil {
                self.metrics[name] = []
            }
            
            self.metrics[name]?.append(duration)
            
            // Keep only the last N metrics
            if let count = self.metrics[name]?.count, count > self.metricsLimit {
                self.metrics[name]?.removeFirst(count - self.metricsLimit)
            }
        }
    }
    
    private func recordMemoryMetric(name: String, bytes: Double) {
        queue.async { [weak self] in
            guard let self = self else { return }
            
            if self.memoryMetrics[name] == nil {
                self.memoryMetrics[name] = []
            }
            
            self.memoryMetrics[name]?.append(bytes)
            
            if let count = self.memoryMetrics[name]?.count, count > self.metricsLimit {
                self.memoryMetrics[name]?.removeFirst(count - self.metricsLimit)
            }
        }
    }
    
    private func recordNetworkMetric(name: String, bytes: Double) {
        queue.async { [weak self] in
            guard let self = self else { return }
            
            if self.networkMetrics[name] == nil {
                self.networkMetrics[name] = []
            }
            
            self.networkMetrics[name]?.append(bytes)
            
            if let count = self.networkMetrics[name]?.count, count > self.metricsLimit {
                self.networkMetrics[name]?.removeFirst(count - self.metricsLimit)
            }
        }
    }
    private var measurements: [String: CFTimeInterval] = [:]
    private let performanceThreshold: CFTimeInterval = 0.100 // 100ms
    
    private init() {}
    
    func startMeasuring(_ identifier: String) {
        measurements[identifier] = CACurrentMediaTime()
    }
    
    func stopMeasuring(_ identifier: String) {
        guard let startTime = measurements[identifier] else {
            Logger.shared.log("No start time found for \(identifier)", level: .warning)
            return
        }
        
        let duration = CACurrentMediaTime() - startTime
        if duration > performanceThreshold {
            Logger.shared.log("Performance warning: \(identifier) took \(String(format: "%.3f", duration))s", level: .warning)
        } else {
            Logger.shared.log("Performance: \(identifier) took \(String(format: "%.3f", duration))s", level: .debug)
        }
        measurements.removeValue(forKey: identifier)
    }
} 