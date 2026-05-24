import Foundation

/// Represents an analytics event with metadata
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

/// Manages analytics event collection and batch processing
final class AnalyticsManager {
    // MARK: - Properties

    private var eventQueue: [AnalyticsEvent] = []
    private let batchSize = 50
    private let maxQueueSize = 1000
    private let processingInterval: TimeInterval = 300 // 5 minutes

    // MARK: - Queue

    private let queue = DispatchQueue(label: "com.loadprogress.analytics", qos: .utility)

    // MARK: - Timer

    private var processingTimer: Timer?

    // MARK: - Singleton

    static let shared = AnalyticsManager()

    // MARK: - Initialization

    private init() {
        startPeriodicProcessing()
    }

    deinit {
        stopPeriodicProcessing()
    }

    // MARK: - Public Methods

    /// Logs an analytics event
    /// - Parameter event: The event to log
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

    // MARK: - Private Methods

    /// Starts periodic event processing using a Timer
    private func startPeriodicProcessing() {
        // Create timer on main thread, but execution happens on background queue
        DispatchQueue.main.async { [weak self] in
            guard let self = self else { return }

            self.processingTimer = Timer.scheduledTimer(
                withTimeInterval: self.processingInterval,
                repeats: true
            ) { [weak self] _ in
                self?.queue.async { [weak self] in
                    self?.processQueuedEvents()
                }
            }

            // Ensure timer runs even when UI is not updating
            if let timer = self.processingTimer {
                RunLoop.main.add(timer, forMode: .common)
            }
        }
    }

    /// Stops periodic event processing
    private func stopPeriodicProcessing() {
        DispatchQueue.main.async { [weak self] in
            self?.processingTimer?.invalidate()
            self?.processingTimer = nil
        }
    }

    /// Processes queued events in batches
    private func processQueuedEvents() {
        guard !eventQueue.isEmpty else { return }

        let batchEvents = Array(eventQueue.prefix(batchSize))
        eventQueue.removeFirst(min(batchSize, eventQueue.count))

        // Process events in batch
        sendEvents(batchEvents)
    }

    /// Sends events to analytics backend
    /// - Parameter events: Events to send
    private func sendEvents(_ events: [AnalyticsEvent]) {
        // Here you would implement the actual sending of events to your analytics service
        // For now, we'll just log them
        Logger.shared.log("Sending batch of \(events.count) analytics events", level: .debug)
    }
}
