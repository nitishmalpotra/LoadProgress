import SwiftUI

struct WorkoutSetRow: View {
    let exercise: Exercise
    let set: WorkoutSet
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) { 
            Text(exercise.name)
                .font(.headline)
                .foregroundColor(.primary)
            
            HStack(spacing: 16) { 
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
                    value: String(set.reps),
                    unit: "reps",
                    icon: "figure.run.circle.fill", 
                    color: .green
                )
                
                Spacer()
                
                Text(set.date.formatted(date: .abbreviated, time: .shortened))
                    .font(.footnote)
                    .foregroundColor(.secondary)
            }
        }
        .padding(.vertical, 10) 
        .padding(.horizontal, 4) 
        .background(Color(.systemBackground))
        .cornerRadius(10)
        .accessibilityElement(children: .combine)
        .accessibilityLabel("\(exercise.name) workout set on \(set.date, style: .date)") 
        .accessibilityValue("Weight: \(formattedWeight(set.weight)), Reps: \(String(set.reps))") 
    }
    
    private func formattedWeight(_ weight: Double?) -> String {
        guard let weight = weight else { return "none" }
        return String(format: "%.1f kg", weight)
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