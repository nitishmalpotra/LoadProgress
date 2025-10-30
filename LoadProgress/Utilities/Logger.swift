import Foundation
import os.log

/// Log severity levels with emoji indicators
enum LogLevel: String {
    case debug = "💬"
    case info = "ℹ️"
    case warning = "⚠️"
    case error = "🚨"
}

/// Centralized logging utility with file and console output
final class Logger {
    // MARK: - Singleton

    static let shared = Logger()

    // MARK: - Properties

    private let logger = OSLog(subsystem: Bundle.main.bundleIdentifier ?? "LoadProgress", category: "App")
    private let fileManager = FileManager.default
    private let queue = DispatchQueue(label: "com.loadprogress.logger", qos: .utility)

    // MARK: - Date Formatter

    private let dateFormatter: DateFormatter = {
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd HH:mm:ss"
        return formatter
    }()

    // MARK: - Log File URL

    private var logFileURL: URL? {
        guard let documentsPath = fileManager.urls(for: .documentDirectory, in: .userDomainMask).first else {
            return nil
        }
        return documentsPath.appendingPathComponent("app.log")
    }

    // MARK: - Initialization

    private init() {
        // Initialize log file if needed
        queue.async { [weak self] in
            self?.initializeLogFile()
        }
    }

    // MARK: - Public Methods

    /// Logs a message with specified level
    /// - Parameters:
    ///   - message: The message to log
    ///   - level: Log severity level
    ///   - file: Source file (automatically captured)
    ///   - function: Source function (automatically captured)
    ///   - line: Source line (automatically captured)
    func log(
        _ message: String,
        level: LogLevel = .info,
        file: String = #file,
        function: String = #function,
        line: Int = #line
    ) {
        let timestamp = dateFormatter.string(from: Date())
        let fileName = (file as NSString).lastPathComponent
        let logMessage = "\(timestamp) \(level.rawValue) [\(fileName):\(line)] \(function): \(message)"

        // Log to console synchronously for immediate feedback
        os_log("%{public}@", log: logger, type: logTypeForLevel(level), logMessage)

        // Log to file asynchronously
        queue.async { [weak self] in
            self?.writeToFile(logMessage)
        }
    }

    // MARK: - Private Methods

    /// Initializes the log file if it doesn't exist
    private func initializeLogFile() {
        guard let logFileURL = logFileURL else {
            os_log("Failed to get log file URL", log: logger, type: .error)
            return
        }

        if !fileManager.fileExists(atPath: logFileURL.path) {
            do {
                try "".write(to: logFileURL, atomically: true, encoding: .utf8)
            } catch {
                os_log(
                    "Failed to initialize log file: %{public}@",
                    log: logger,
                    type: .error,
                    error.localizedDescription
                )
            }
        }
    }

    /// Writes a log message to file asynchronously
    /// - Parameter message: The formatted log message
    private func writeToFile(_ message: String) {
        guard let logFileURL = logFileURL else { return }

        do {
            // Use FileHandle for efficient append operations
            if #available(iOS 13.0, *) {
                // Use modern FileHandle API
                let handle = try FileHandle(forWritingTo: logFileURL)
                defer { try? handle.close() }

                try handle.seekToEnd()
                if let data = "\(message)\n".data(using: .utf8) {
                    try handle.write(contentsOf: data)
                }
            } else {
                // Fallback for older iOS versions
                let handle = try FileHandle(forWritingTo: logFileURL)
                defer { handle.closeFile() }

                handle.seekToEndOfFile()
                if let data = "\(message)\n".data(using: .utf8) {
                    handle.write(data)
                }
            }
        } catch {
            // Only log to console if file write fails to avoid infinite recursion
            os_log(
                "Failed to write to log file: %{public}@",
                log: logger,
                type: .error,
                error.localizedDescription
            )
        }
    }

    /// Converts LogLevel to OSLogType
    /// - Parameter level: The log level
    /// - Returns: Corresponding OSLogType
    private func logTypeForLevel(_ level: LogLevel) -> OSLogType {
        switch level {
        case .debug: return .debug
        case .info: return .info
        case .warning: return .default
        case .error: return .error
        }
    }

    // MARK: - File Management

    /// Returns the current log file size in bytes
    /// - Returns: File size or nil if unavailable
    func getLogFileSize() -> Int64? {
        guard let logFileURL = logFileURL else { return nil }

        do {
            let attributes = try fileManager.attributesOfItem(atPath: logFileURL.path)
            return attributes[.size] as? Int64
        } catch {
            return nil
        }
    }

    /// Clears the log file
    func clearLogFile() {
        queue.async { [weak self] in
            guard let self = self, let logFileURL = self.logFileURL else { return }

            do {
                try "".write(to: logFileURL, atomically: true, encoding: .utf8)
                os_log("Log file cleared", log: self.logger, type: .info)
            } catch {
                os_log(
                    "Failed to clear log file: %{public}@",
                    log: self.logger,
                    type: .error,
                    error.localizedDescription
                )
            }
        }
    }
}
