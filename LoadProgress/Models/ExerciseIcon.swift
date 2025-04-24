import Foundation

// Add Hashable conformance
enum ExerciseIcon: Codable, Hashable {
    case dumbbell
    case barbell
    case bodyweight
    case machine
    case kettlebell
    case resistanceBand
    
    // Predefined icons
    // Chest
    case benchPress
    case pushUp
    case inclineBench
    case declineBench
    case dips
    case cableFly
    
    // Back
    case pullUp
    case latPulldown
    case bentOverRow
    case deadlift
    case tBarRow
    case seatedRow
    
    // Legs
    case squat
    case legPress
    case romanianDeadlift
    case calfRaise
    case legExtension
    case legCurl
    
    // Shoulders
    case overheadPress
    case lateralRaise
    case frontRaise
    case facePull
    case arnoldPress
    case uprightRow
    
    // Arms
    case bicepCurl
    case tricepExtension
    case hammerCurl
    case preacherCurl
    case tricepPushdown
    case concentrationCurl
    
    // Core
    case plank
    case crunch
    case russianTwist
    case legRaise
    case sitUp
    case mountainClimber
    case sidePlank
    case woodChop
    
    // Full Body
    case burpee
    case thruster
    case cleanAndJerk
    case snatch
    case turkishGetUp
    case custom(String)
    
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
    
    // MARK: - Hashable Conformance
    func hash(into hasher: inout Hasher) {
        switch self {
        case .custom(let name):
            hasher.combine("custom")
            hasher.combine(name)
        default:
            // Hash based on the case name for standard icons
            hasher.combine(String(describing: self))
        }
    }
    
    static func == (lhs: ExerciseIcon, rhs: ExerciseIcon) -> Bool {
        switch (lhs, rhs) {
        case (.custom(let lhsName), .custom(let rhsName)):
            return lhsName == rhsName
        // Compare standard icons by their case
        case (.dumbbell, .dumbbell), (.barbell, .barbell), (.bodyweight, .bodyweight), 
             (.machine, .machine), (.kettlebell, .kettlebell), (.resistanceBand, .resistanceBand),
             (.benchPress, .benchPress), (.pushUp, .pushUp), (.inclineBench, .inclineBench),
             (.declineBench, .declineBench), (.dips, .dips), (.cableFly, .cableFly),
             (.pullUp, .pullUp), (.latPulldown, .latPulldown), (.bentOverRow, .bentOverRow),
             (.deadlift, .deadlift), (.tBarRow, .tBarRow), (.seatedRow, .seatedRow),
             (.squat, .squat), (.legPress, .legPress), (.romanianDeadlift, .romanianDeadlift),
             (.calfRaise, .calfRaise), (.legExtension, .legExtension), (.legCurl, .legCurl),
             (.overheadPress, .overheadPress), (.lateralRaise, .lateralRaise), (.frontRaise, .frontRaise),
             (.facePull, .facePull), (.arnoldPress, .arnoldPress), (.uprightRow, .uprightRow),
             (.bicepCurl, .bicepCurl), (.tricepExtension, .tricepExtension), (.hammerCurl, .hammerCurl),
             (.preacherCurl, .preacherCurl), (.tricepPushdown, .tricepPushdown), (.concentrationCurl, .concentrationCurl),
             (.plank, .plank), (.crunch, .crunch), (.russianTwist, .russianTwist),
             (.legRaise, .legRaise), (.sitUp, .sitUp), (.mountainClimber, .mountainClimber),
             (.sidePlank, .sidePlank), (.woodChop, .woodChop),
             (.burpee, .burpee), (.thruster, .thruster), (.cleanAndJerk, .cleanAndJerk),
             (.snatch, .snatch), (.turkishGetUp, .turkishGetUp):
            return true // Standard icons are equal if they are the same case
        default:
            return false // Different cases or one custom and one standard
        }
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
        
        switch type {
        case .standard:
            let rawValue = try container.decode(String.self, forKey: .customName)
            switch rawValue {
            case "dumbbell": self = .dumbbell
            case "barbell": self = .barbell
            case "bodyweight": self = .bodyweight
            case "machine": self = .machine
            case "kettlebell": self = .kettlebell
            case "resistanceBand": self = .resistanceBand
            case "benchPress": self = .benchPress
            case "pushUp": self = .pushUp
            case "inclineBench": self = .inclineBench
            case "declineBench": self = .declineBench
            case "dips": self = .dips
            case "cableFly": self = .cableFly
            case "pullUp": self = .pullUp
            case "latPulldown": self = .latPulldown
            case "bentOverRow": self = .bentOverRow
            case "deadlift": self = .deadlift
            case "tBarRow": self = .tBarRow
            case "seatedRow": self = .seatedRow
            case "squat": self = .squat
            case "legPress": self = .legPress
            case "romanianDeadlift": self = .romanianDeadlift
            case "calfRaise": self = .calfRaise
            case "legExtension": self = .legExtension
            case "legCurl": self = .legCurl
            case "overheadPress": self = .overheadPress
            case "lateralRaise": self = .lateralRaise
            case "frontRaise": self = .frontRaise
            case "facePull": self = .facePull
            case "arnoldPress": self = .arnoldPress
            case "uprightRow": self = .uprightRow
            case "bicepCurl": self = .bicepCurl
            case "tricepExtension": self = .tricepExtension
            case "hammerCurl": self = .hammerCurl
            case "preacherCurl": self = .preacherCurl
            case "tricepPushdown": self = .tricepPushdown
            case "concentrationCurl": self = .concentrationCurl
            case "plank": self = .plank
            case "crunch": self = .crunch
            case "russianTwist": self = .russianTwist
            case "legRaise": self = .legRaise
            case "sitUp": self = .sitUp
            case "mountainClimber": self = .mountainClimber
            case "sidePlank": self = .sidePlank
            case "woodChop": self = .woodChop
            case "burpee": self = .burpee
            case "thruster": self = .thruster
            case "cleanAndJerk": self = .cleanAndJerk
            case "snatch": self = .snatch
            case "turkishGetUp": self = .turkishGetUp
            default: throw DecodingError.dataCorruptedError(forKey: .customName, in: container, debugDescription: "Invalid icon type")
            }
        case .custom:
            let name = try container.decode(String.self, forKey: .customName)
            self = .custom(name)
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
}
