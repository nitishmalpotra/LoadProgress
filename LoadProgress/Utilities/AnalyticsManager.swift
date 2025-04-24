import Foundation

struct AnalyticsEvent {
    let name: String
    let parameters: [String: String]
    let timestamp: Date
    
    init(name: String, parameters: [String: String] = [:], timestamp: Date = Date()) {
        self.name = name
        self.parameters = parameters
        self.timestamp = timestamp
    }
}

final class AnalyticsManager {
    // MARK: - Properties
    private var eventQueue: [AnalyticsEvent] = []
    private let batchSize = 50
    private let maxQueueSize = 1000
    private let processingInterval: TimeInterval = 300 // 5 minutes
    private var lastProcessingTime: Date = Date()
    
    private let queue = DispatchQueue(label: "com.loadprogress.analytics", qos: .utility)
    static let shared = AnalyticsManager()
    
    init() {
        // Start periodic processing
        startPeriodicProcessing()
    }
    
    private func startPeriodicProcessing() {
        queue.async { [weak self] in
            guard let self = self else { return }
            
            while true {
                Thread.sleep(forTimeInterval: self.processingInterval)
                self.processQueuedEvents()
            }
        }
    }
    
    private func processQueuedEvents() {
        guard !eventQueue.isEmpty else { return }
        
        let batchEvents = Array(eventQueue.prefix(batchSize))
        eventQueue.removeFirst(min(batchSize, eventQueue.count))
        
        // Process events in batch
        sendEvents(batchEvents)
    }
    
    private func sendEvents(_ events: [AnalyticsEvent]) {
        // Here you would implement the actual sending of events to your analytics service
        // For now, we'll just log them
        Logger.shared.log("Sending batch of \(events.count) analytics events", level: .debug)
    }
    
    func logEvent(_ event: AnalyticsEvent) {
        queue.async { [weak self] in
            guard let self = self else { return }
            
            // Add event to queue
            self.eventQueue.append(event)
            
            // If queue is too large, process immediately
            if self.eventQueue.count >= self.maxQueueSize {
                self.processQueuedEvents()
            }
        }
    }
}