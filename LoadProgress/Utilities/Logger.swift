import Foundation
import os.log

enum LogLevel: String {
    case debug = "💬"
    case info = "ℹ️"
    case warning = "⚠️"
    case error = "🚨"
}

final class Logger {
    static let shared = Logger()
    private let logger = OSLog(subsystem: Bundle.main.bundleIdentifier ?? "LoadProgress", category: "App")
    private let fileManager = FileManager.default
    private let dateFormatter: DateFormatter = {
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd HH:mm:ss"
        return formatter
    }()
    
    private var logFileURL: URL? {
        guard let documentsPath = fileManager.urls(for: .documentDirectory, in: .userDomainMask).first else {
            return nil
        }
        return documentsPath.appendingPathComponent("app.log")
    }
    
    private let queue = DispatchQueue(label: "com.loadprogress.logger")
    
    func log(_ message: String, level: LogLevel = .info, file: String = #file, function: String = #function, line: Int = #line) {
        queue.async {
            let timestamp = self.dateFormatter.string(from: Date())
            let fileName = (file as NSString).lastPathComponent
            let logMessage = "\(timestamp) \(level.rawValue) [\(fileName):\(line)] \(function): \(message)"
            
            // Log to console
            os_log("%{public}@", log: self.logger, type: .default, logMessage)
            
            // Log to file
            guard let logFileURL = self.logFileURL else {
                os_log("Failed to get log file URL", log: self.logger, type: .error)
                return
            }
            
            do {
                if !self.fileManager.fileExists(atPath: logFileURL.path) {
                    try "".write(to: logFileURL, atomically: true, encoding: .utf8)
                }
                
                let handle = try FileHandle(forWritingTo: logFileURL)
                handle.seekToEndOfFile()
                handle.write("\(logMessage)\n".data(using: .utf8) ?? Data())
                handle.closeFile()
            } catch {
                os_log("Failed to write to log file: %{public}@", log: self.logger, type: .error, error.localizedDescription)
            }
        }
    }
} 