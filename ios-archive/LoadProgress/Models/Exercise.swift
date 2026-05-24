import Foundation

/// A model representing an exercise with its properties and classifications
struct Exercise: Codable, Identifiable, Hashable {
    // MARK: - Properties

    /// Unique identifier for the exercise
    let id: UUID
    /// Name of the exercise
    let name: String
    /// Type of exercise (weight training or bodyweight)
    let type: ExerciseType
    /// Primary muscle group targeted by the exercise
    let muscleGroup: MuscleGroup
    /// Secondary muscle groups targeted by the exercise
    let secondaryMuscleGroups: [MuscleGroup]
    /// Icon for the exercise
    let icon: ExerciseIcon
    /// Difficulty level of the exercise
    let difficulty: Difficulty
    /// Equipment required for the exercise
    let equipment: [Equipment]
    /// Brief description of the exercise
    let description: String
    /// Form cues for proper execution
    let formCues: [String]

    // MARK: - Initialization

    init(
        id: UUID = UUID(),
        name: String,
        type: ExerciseType,
        muscleGroup: MuscleGroup,
        secondaryMuscleGroups: [MuscleGroup] = [],
        icon: ExerciseIcon,
        difficulty: Difficulty,
        equipment: [Equipment],
        description: String,
        formCues: [String]
    ) {
        self.id = id
        self.name = name
        self.type = type
        self.muscleGroup = muscleGroup
        self.secondaryMuscleGroups = secondaryMuscleGroups
        self.icon = icon
        self.difficulty = difficulty
        self.equipment = equipment
        self.description = description
        self.formCues = formCues
    }

    // MARK: - Hashable Conformance

    func hash(into hasher: inout Hasher) {
        hasher.combine(id)
    }

    static func == (lhs: Exercise, rhs: Exercise) -> Bool {
        lhs.id == rhs.id
    }

    // MARK: - Factory Method with Validation

    /// Creates a validated exercise instance
    /// - Returns: A new Exercise instance if validation passes
    /// - Throws: Validation errors from the Validator
    static func createValidated(
        name: String,
        type: ExerciseType,
        muscleGroup: MuscleGroup,
        secondaryMuscleGroups: [MuscleGroup] = [],
        icon: ExerciseIcon = .dumbbell,
        difficulty: Difficulty = .beginner,
        equipment: [Equipment] = [],
        description: String = "",
        formCues: [String] = []
    ) throws -> Exercise {
        switch Validator.validateExerciseName(name) {
        case .success(let validatedName):
            return Exercise(
                name: validatedName,
                type: type,
                muscleGroup: muscleGroup,
                secondaryMuscleGroups: secondaryMuscleGroups,
                icon: icon,
                difficulty: difficulty,
                equipment: equipment,
                description: description,
                formCues: formCues
            )
        case .failure(let error):
            throw error
        }
    }

    // MARK: - Exercise Classifications

    /// Types of exercises available in the app
    enum ExerciseType: String, Codable, CaseIterable {
        /// Traditional weight training exercises
        case weightTraining = "Weight Training"
        /// Exercises using body weight as resistance
        case bodyweight = "Bodyweight"
    }

    /// Major muscle groups that exercises can target
    enum MuscleGroup: String, Codable, CaseIterable {
        /// Chest muscles (Pectoralis)
        case chest = "Chest"
        /// Back muscles (Latissimus, Trapezius, Rhomboids)
        case back = "Back"
        /// Leg muscles (Quadriceps, Hamstrings, Calves)
        case legs = "Legs"
        /// Shoulder muscles (Deltoids)
        case shoulders = "Shoulders"
        /// Arm muscles (Biceps, Triceps)
        case arms = "Arms"
        /// Core muscles (Abdominals, Obliques)
        case core = "Core"
        /// Full body involvement
        case fullBody = "Full Body"
        /// Forearm muscles
        case forearms = "Forearms"
        /// Hip and glute muscles
        case glutes = "Glutes"
        /// Upper back and neck muscles
        case upperBack = "Upper Back"
        /// Lower back muscles
        case lowerBack = "Lower Back"
    }

    /// Difficulty levels for exercises
    enum Difficulty: String, Codable, CaseIterable {
        case beginner = "Beginner"
        case intermediate = "Intermediate"
        case advanced = "Advanced"
        case expert = "Expert"
    }

    /// Equipment types used in exercises
    enum Equipment: String, Codable, CaseIterable {
        case barbell = "Barbell"
        case dumbbell = "Dumbbell"
        case kettlebell = "Kettlebell"
        case resistanceBand = "Resistance Band"
        case cable = "Cable Machine"
        case smithMachine = "Smith Machine"
        case bodyweight = "Bodyweight"
        case machine = "Machine"
        case plate = "Weight Plate"
        case bench = "Bench"
        case pullupBar = "Pull-up Bar"
        case foam = "Foam Roller"
    }
}
