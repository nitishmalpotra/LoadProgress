import Foundation

struct DefaultExercises {
    static let exercises: [Exercise] = [
        // MARK: - Chest Exercises
        Exercise(
            name: "Barbell Bench Press",
            type: .weightTraining,
            muscleGroup: .chest,
            secondaryMuscleGroups: [.shoulders, .arms],
            icon: .benchPress,
            difficulty: .intermediate,
            equipment: [.barbell, .bench],
            description: "A compound exercise that primarily targets the chest muscles while also engaging the shoulders and triceps.",
            formCues: [
                "Keep your feet flat on the ground",
                "Maintain a slight arch in your back",
                "Lower the bar to your mid-chest",
                "Keep your elbows at about 45 degrees"
            ]
        ),
        
        Exercise(
            name: "Push-Up",
            type: .bodyweight,
            muscleGroup: .chest,
            secondaryMuscleGroups: [.shoulders, .arms, .core],
            icon: .pushUp,
            difficulty: .beginner,
            equipment: [.bodyweight],
            description: "A fundamental bodyweight exercise that builds chest, shoulder, and core strength.",
            formCues: [
                "Keep your body in a straight line",
                "Position hands slightly wider than shoulders",
                "Lower chest to ground",
                "Keep core tight throughout movement"
            ]
        ),
        
        // MARK: - Back Exercises
        Exercise(
            name: "Pull-Up",
            type: .bodyweight,
            muscleGroup: .back,
            secondaryMuscleGroups: [.arms, .shoulders],
            icon: .pullUp,
            difficulty: .intermediate,
            equipment: [.pullupBar],
            description: "A challenging bodyweight exercise that builds back and arm strength.",
            formCues: [
                "Grip bar slightly wider than shoulders",
                "Pull chest to bar",
                "Keep core engaged",
                "Control the descent"
            ]
        ),
        
        Exercise(
            name: "Barbell Deadlift",
            type: .weightTraining,
            muscleGroup: .back,
            secondaryMuscleGroups: [.legs, .glutes, .core, .forearms],
            icon: .deadlift,
            difficulty: .advanced,
            equipment: [.barbell],
            description: "A fundamental compound exercise that builds overall strength and muscle.",
            formCues: [
                "Keep the bar close to your body",
                "Hinge at the hips",
                "Maintain a neutral spine",
                "Drive through your heels"
            ]
        ),
        
        // MARK: - Leg Exercises
        Exercise(
            name: "Barbell Back Squat",
            type: .weightTraining,
            muscleGroup: .legs,
            secondaryMuscleGroups: [.glutes, .core],
            icon: .squat,
            difficulty: .intermediate,
            equipment: [.barbell],
            description: "A fundamental lower body exercise that builds leg and core strength.",
            formCues: [
                "Keep chest up",
                "Break at hips and knees simultaneously",
                "Keep knees in line with toes",
                "Drive through heels"
            ]
        ),
        
        Exercise(
            name: "Romanian Deadlift",
            type: .weightTraining,
            muscleGroup: .legs,
            secondaryMuscleGroups: [.lowerBack, .glutes],
            icon: .romanianDeadlift,
            difficulty: .intermediate,
            equipment: [.barbell],
            description: "An exercise that targets the posterior chain, particularly the hamstrings.",
            formCues: [
                "Keep slight bend in knees",
                "Hinge at hips",
                "Keep bar close to legs",
                "Feel stretch in hamstrings"
            ]
        ),
        
        // MARK: - Shoulder Exercises
        Exercise(
            name: "Overhead Press",
            type: .weightTraining,
            muscleGroup: .shoulders,
            secondaryMuscleGroups: [.arms, .core],
            icon: .overheadPress,
            difficulty: .intermediate,
            equipment: [.barbell],
            description: "A compound exercise that builds shoulder strength and stability.",
            formCues: [
                "Keep core tight",
                "Press bar in line with ears",
                "Full lockout at top",
                "Control the descent"
            ]
        ),
        
        Exercise(
            name: "Lateral Raise",
            type: .weightTraining,
            muscleGroup: .shoulders,
            secondaryMuscleGroups: [],
            icon: .lateralRaise,
            difficulty: .beginner,
            equipment: [.dumbbell],
            description: "An isolation exercise that targets the lateral deltoids.",
            formCues: [
                "Slight bend in elbows",
                "Lead with elbows",
                "Control the movement",
                "Keep shoulders down"
            ]
        ),
        
        // MARK: - Arm Exercises
        Exercise(
            name: "Barbell Curl",
            type: .weightTraining,
            muscleGroup: .arms,
            secondaryMuscleGroups: [.forearms],
            icon: .bicepCurl,
            difficulty: .beginner,
            equipment: [.barbell],
            description: "A classic exercise for building bicep strength and size.",
            formCues: [
                "Keep elbows at sides",
                "Full range of motion",
                "Control the descent",
                "Keep core engaged"
            ]
        ),
        
        Exercise(
            name: "Tricep Pushdown",
            type: .weightTraining,
            muscleGroup: .arms,
            secondaryMuscleGroups: [],
            icon: .tricepPushdown,
            difficulty: .beginner,
            equipment: [.cable],
            description: "An isolation exercise that targets the triceps.",
            formCues: [
                "Keep elbows at sides",
                "Full extension at bottom",
                "Control the return",
                "Keep shoulders down"
            ]
        ),
        
        // MARK: - Core Exercises
        Exercise(
            name: "Plank",
            type: .bodyweight,
            muscleGroup: .core,
            secondaryMuscleGroups: [.shoulders],
            icon: .plank,
            difficulty: .beginner,
            equipment: [.bodyweight],
            description: "A fundamental exercise for building core stability and endurance.",
            formCues: [
                "Keep body in straight line",
                "Engage core muscles",
                "Keep neck neutral",
                "Breathe steadily"
            ]
        ),
        
        Exercise(
            name: "Russian Twist",
            type: .bodyweight,
            muscleGroup: .core,
            secondaryMuscleGroups: [],
            icon: .russianTwist,
            difficulty: .intermediate,
            equipment: [.plate],
            description: "A dynamic exercise that targets the obliques and rotational strength.",
            formCues: [
                "Keep chest up",
                "Rotate from core",
                "Control the movement",
                "Keep feet elevated"
            ]
        ),
        
        // MARK: - Olympic Lifts
        Exercise(
            name: "Clean and Jerk",
            type: .weightTraining,
            muscleGroup: .fullBody,
            secondaryMuscleGroups: [.legs, .back, .shoulders],
            icon: .cleanAndJerk,
            difficulty: .expert,
            equipment: [.barbell],
            description: "An Olympic weightlifting movement that develops power and coordination.",
            formCues: [
                "Start with bar over mid-foot",
                "Explosive hip extension",
                "Quick elbow turnover",
                "Split jerk with confidence"
            ]
        ),
        
        Exercise(
            name: "Snatch",
            type: .weightTraining,
            muscleGroup: .fullBody,
            secondaryMuscleGroups: [.legs, .back, .shoulders],
            icon: .snatch,
            difficulty: .expert,
            equipment: [.barbell],
            description: "A complex Olympic lift that requires strength, speed, and technique.",
            formCues: [
                "Start with wide grip",
                "Keep bar close",
                "Aggressive pull under",
                "Lock out overhead"
            ]
        )
    ]
}
