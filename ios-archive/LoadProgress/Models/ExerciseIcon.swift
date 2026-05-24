import Foundation

/// Exercise icon representation with support for predefined and custom icons
enum ExerciseIcon: Codable, Hashable {
    // MARK: - Equipment
    case dumbbell
    case barbell
    case bodyweight
    case machine
    case kettlebell
    case resistanceBand

    // MARK: - Chest
    case benchPress
    case pushUp
    case inclineBench
    case declineBench
    case dips
    case cableFly

    // MARK: - Back
    case pullUp
    case latPulldown
    case bentOverRow
    case deadlift
    case tBarRow
    case seatedRow

    // MARK: - Legs
    case squat
    case legPress
    case romanianDeadlift
    case calfRaise
    case legExtension
    case legCurl

    // MARK: - Shoulders
    case overheadPress
    case lateralRaise
    case frontRaise
    case facePull
    case arnoldPress
    case uprightRow

    // MARK: - Arms
    case bicepCurl
    case tricepExtension
    case hammerCurl
    case preacherCurl
    case tricepPushdown
    case concentrationCurl

    // MARK: - Core
    case plank
    case crunch
    case russianTwist
    case legRaise
    case sitUp
    case mountainClimber
    case sidePlank
    case woodChop

    // MARK: - Full Body
    case burpee
    case thruster
    case cleanAndJerk
    case snatch
    case turkishGetUp

    case custom(String)

    // MARK: - System Name

    var systemName: String {
        switch self {
        case .dumbbell: return "dumbbell"
        case .barbell: return "barbell"
        case .bodyweight: return "figure.walk"
        case .machine: return "gearshape"
        case .kettlebell: return "figure.strengthtraining.traditional"
        case .resistanceBand: return "figure.flexibility"
        case .benchPress: return "figure.strengthtraining.functional"
        case .pushUp: return "figure.core.training"
        case .inclineBench: return "figure.incline.press"
        case .declineBench: return "figure.decline.press"
        case .dips: return "figure.dips"
        case .cableFly: return "figure.cable.fly"
        case .pullUp: return "figure.pull.up"
        case .latPulldown: return "figure.lat.pull"
        case .bentOverRow: return "figure.row"
        case .deadlift: return "figure.deadlift"
        case .tBarRow: return "figure.row.bent"
        case .seatedRow: return "figure.row.seated"
        case .squat: return "figure.squat"
        case .legPress: return "figure.leg.press"
        case .romanianDeadlift: return "figure.deadlift.romanian"
        case .calfRaise: return "figure.calf.raise"
        case .legExtension: return "figure.leg.extension"
        case .legCurl: return "figure.leg.curl"
        case .overheadPress: return "figure.press.overhead"
        case .lateralRaise: return "figure.raise.lateral"
        case .frontRaise: return "figure.raise.front"
        case .facePull: return "figure.pull.face"
        case .arnoldPress: return "figure.press.arnold"
        case .uprightRow: return "figure.row.upright"
        case .bicepCurl: return "figure.curl.bicep"
        case .tricepExtension: return "figure.extension.tricep"
        case .hammerCurl: return "figure.curl.hammer"
        case .preacherCurl: return "figure.curl.preacher"
        case .tricepPushdown: return "figure.pushdown.tricep"
        case .concentrationCurl: return "figure.curl.concentration"
        case .plank: return "figure.plank"
        case .crunch: return "figure.crunch"
        case .russianTwist: return "figure.twist.russian"
        case .legRaise: return "figure.raise.leg"
        case .sitUp: return "figure.sit.up"
        case .mountainClimber: return "figure.climber.mountain"
        case .sidePlank: return "figure.plank.side"
        case .woodChop: return "figure.chop.wood"
        case .burpee: return "figure.burpee"
        case .thruster: return "figure.thruster"
        case .cleanAndJerk: return "figure.clean.jerk"
        case .snatch: return "figure.snatch"
        case .turkishGetUp: return "figure.getup.turkish"
        case .custom(let name): return name.lowercased().replacingOccurrences(of: " ", with: ".")
        }
    }

    // MARK: - Identifiable String

    /// Returns a unique string identifier for this icon
    private var identifier: String {
        switch self {
        case .custom(let name): return "custom:\(name)"
        default: return String(describing: self)
        }
    }

    // MARK: - Hashable Conformance

    func hash(into hasher: inout Hasher) {
        hasher.combine(identifier)
    }

    static func == (lhs: ExerciseIcon, rhs: ExerciseIcon) -> Bool {
        lhs.identifier == rhs.identifier
    }

    // MARK: - Codable Conformance

    private enum CodingKeys: String, CodingKey {
        case type
        case customName
    }

    private enum IconType: String, Codable {
        case standard
        case custom
    }

    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        let type = try container.decode(IconType.self, forKey: .type)
        let rawValue = try container.decode(String.self, forKey: .customName)

        switch type {
        case .standard:
            guard let icon = Self.standardIcon(from: rawValue) else {
                throw DecodingError.dataCorruptedError(
                    forKey: .customName,
                    in: container,
                    debugDescription: "Invalid icon type: \(rawValue)"
                )
            }
            self = icon
        case .custom:
            self = .custom(rawValue)
        }
    }

    func encode(to encoder: Encoder) throws {
        var container = encoder.container(keyedBy: CodingKeys.self)

        switch self {
        case .custom(let name):
            try container.encode(IconType.custom, forKey: .type)
            try container.encode(name, forKey: .customName)
        default:
            try container.encode(IconType.standard, forKey: .type)
            try container.encode(String(describing: self), forKey: .customName)
        }
    }

    // MARK: - Helper Methods

    /// Creates a standard icon from its string representation
    private static func standardIcon(from string: String) -> ExerciseIcon? {
        switch string {
        case "dumbbell": return .dumbbell
        case "barbell": return .barbell
        case "bodyweight": return .bodyweight
        case "machine": return .machine
        case "kettlebell": return .kettlebell
        case "resistanceBand": return .resistanceBand
        case "benchPress": return .benchPress
        case "pushUp": return .pushUp
        case "inclineBench": return .inclineBench
        case "declineBench": return .declineBench
        case "dips": return .dips
        case "cableFly": return .cableFly
        case "pullUp": return .pullUp
        case "latPulldown": return .latPulldown
        case "bentOverRow": return .bentOverRow
        case "deadlift": return .deadlift
        case "tBarRow": return .tBarRow
        case "seatedRow": return .seatedRow
        case "squat": return .squat
        case "legPress": return .legPress
        case "romanianDeadlift": return .romanianDeadlift
        case "calfRaise": return .calfRaise
        case "legExtension": return .legExtension
        case "legCurl": return .legCurl
        case "overheadPress": return .overheadPress
        case "lateralRaise": return .lateralRaise
        case "frontRaise": return .frontRaise
        case "facePull": return .facePull
        case "arnoldPress": return .arnoldPress
        case "uprightRow": return .uprightRow
        case "bicepCurl": return .bicepCurl
        case "tricepExtension": return .tricepExtension
        case "hammerCurl": return .hammerCurl
        case "preacherCurl": return .preacherCurl
        case "tricepPushdown": return .tricepPushdown
        case "concentrationCurl": return .concentrationCurl
        case "plank": return .plank
        case "crunch": return .crunch
        case "russianTwist": return .russianTwist
        case "legRaise": return .legRaise
        case "sitUp": return .sitUp
        case "mountainClimber": return .mountainClimber
        case "sidePlank": return .sidePlank
        case "woodChop": return .woodChop
        case "burpee": return .burpee
        case "thruster": return .thruster
        case "cleanAndJerk": return .cleanAndJerk
        case "snatch": return .snatch
        case "turkishGetUp": return .turkishGetUp
        default: return nil
        }
    }
}
