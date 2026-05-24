import Foundation

final class SettingsManager: ObservableObject {
    static let shared = SettingsManager()
    
    @Published private(set) var useMetricSystem: Bool {
        didSet {
            UserDefaults.standard.set(useMetricSystem, forKey: Keys.useMetricSystem)
            Logger.shared.log("Unit system changed to \(useMetricSystem ? "metric" : "imperial")", level: .info)
        }
    }
    
    @Published private(set) var autoBackupEnabled: Bool {
        didSet {
            UserDefaults.standard.set(autoBackupEnabled, forKey: Keys.autoBackupEnabled)
            Logger.shared.log("Auto backup \(autoBackupEnabled ? "enabled" : "disabled")", level: .info)
        }
    }
    
    private enum Keys {
        static let useMetricSystem = "useMetricSystem"
        static let autoBackupEnabled = "autoBackupEnabled"
    }
    
    private init() {
        self.useMetricSystem = UserDefaults.standard.bool(forKey: Keys.useMetricSystem)
        self.autoBackupEnabled = UserDefaults.standard.bool(forKey: Keys.autoBackupEnabled)
    }
    
    func toggleUnitSystem() {
        useMetricSystem.toggle()
    }
    
    func toggleAutoBackup() {
        autoBackupEnabled.toggle()
    }
    
    func convertWeight(_ weight: Double, toMetric: Bool) -> Double {
        if toMetric {
            return weight * 0.453592 // lbs to kg
        } else {
            return weight * 2.20462 // kg to lbs
        }
    }
} 