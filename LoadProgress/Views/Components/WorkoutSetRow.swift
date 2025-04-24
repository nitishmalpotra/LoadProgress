import SwiftUI

struct WorkoutSetRow: View {
    let exercise: Exercise
    let set: WorkoutSet
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(exercise.name)
                .font(.headline)
                .foregroundColor(.primary)
            
            HStack(spacing: 12) {
                if exercise.type == .weightTraining, let weight = set.weight {
                    MetricView(
                        value: String(format: "%.1f", weight),
                        unit: "kg",
                        icon: "scalemass.fill",
                        color: .blue
                    )
                }
                
                // Reps is non-optional
                MetricView(
                    value: String(format: "%.0f", set.reps),
                    unit: "reps",
                    icon: "repeat",
                    color: .green
                )
                
                Spacer()
                
                Text(set.date.formatted(date: .abbreviated, time: .shortened))
                    .font(.footnote)
                    .foregroundColor(.secondary)
            }
        }
        .padding(.vertical, 8)
        .padding(.horizontal, 4)
        .background(Color(.systemBackground))
        .cornerRadius(10)
        .accessibilityElement(children: .combine)
        .accessibilityLabel("\(exercise.name) workout set")
        .accessibilityValue("Weight: \(set.weight?.description ?? "none"), Reps: \(String(set.reps))")
    }
}

struct MetricView: View {
    let value: String
    let unit: String
    let icon: String
    let color: Color
    
    var body: some View {
        HStack(spacing: 4) {
            Image(systemName: icon)
                .foregroundColor(color)
            Text(value)
                .bold()
                .foregroundColor(color)
            Text(unit)
                .foregroundColor(color.opacity(0.8))
                .font(.footnote)
        }
        .padding(.horizontal, 8)
        .padding(.vertical, 4)
        .background(color.opacity(0.1))
        .cornerRadius(8)
    }
} 