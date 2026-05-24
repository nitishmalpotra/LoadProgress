import Foundation

final class BackupManager {
    static let shared = BackupManager()
    private let fileManager = FileManager.default
    
    func createBackup() {
        do {
            let backupURL = try getBackupURL()
            let exercisesData = UserDefaults.standard.data(forKey: "savedExercises")
            let workoutsData = UserDefaults.standard.data(forKey: "savedWorkoutSets")
            
            try exercisesData?.write(to: backupURL.appendingPathComponent("exercises.backup"))
            try workoutsData?.write(to: backupURL.appendingPathComponent("workouts.backup"))
            
            Logger.shared.log("Backup created successfully", level: .info)
        } catch {
            Logger.shared.log("Failed to create backup: \(error)", level: .error)
        }
    }
    
    func restoreFromBackup() throws {
        do {
            let backupURL = try getBackupURL()
            let exercisesData = try Data(contentsOf: backupURL.appendingPathComponent("exercises.backup"))
            let workoutsData = try Data(contentsOf: backupURL.appendingPathComponent("workouts.backup"))
            
            UserDefaults.standard.set(exercisesData, forKey: "savedExercises")
            UserDefaults.standard.set(workoutsData, forKey: "savedWorkoutSets")
            
            Logger.shared.log("Backup restored successfully", level: .info)
        } catch {
            Logger.shared.log("Failed to restore backup: \(error)", level: .error)
            throw AppError.dataLoadFailed
        }
    }
    
    private func getBackupURL() throws -> URL {
        guard let documentsPath = fileManager.urls(for: .documentDirectory, in: .userDomainMask).first else {
            throw AppError.dataLoadFailed
        }
        let backupURL = documentsPath.appendingPathComponent("Backups")
        
        if !fileManager.fileExists(atPath: backupURL.path) {
            try fileManager.createDirectory(at: backupURL, withIntermediateDirectories: true)
        }
        
        return backupURL
    }
} 