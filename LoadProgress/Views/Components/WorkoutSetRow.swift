import SwiftUI

struct WorkoutSetRow: View {
    let exercise: Exercise
    let set: WorkoutSet

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack(alignment: .firstTextBaseline) {
                Label(exercise.name, systemImage: exercise.type == .weightTraining ? "dumbbell.fill" : "figure.walk")
                    .font(AppTheme.Fonts.headline())
                    .foregroundStyle(.primary)
                    .labelStyle(.titleAndIcon)
                Spacer()
                Text(set.date.formatted(date: .abbreviated, time: .shortened))
                    .font(AppTheme.Fonts.footnote())
                    .foregroundStyle(.secondary)
            }

            HStack(spacing: 12) {
                if exercise.type == .weightTraining, let weight = set.weight {
                    MetricChip(
                        value: String(format: "%.1f", weight),
                        unit: SettingsManager.shared.useMetricSystem ? "kg" : "lb",
                        icon: "scalemass.fill",
                        tint: .blue
                    )
                }

                MetricChip(
                    value: String(format: "%g", set.reps),
                    unit: "reps",
                    icon: "repeat",
                    tint: .green
                )

                if let rpe = set.rpe {
                    MetricChip(
                        value: String(format: "%.0f", rpe),
                        unit: "RPE",
                        icon: "waveform.path.ecg",
                        tint: .orange
                    )
                }

                Spacer(minLength: 0)
            }
        }
        .padding(.horizontal, AppTheme.Metrics.cardPadding * 0.75)
        .padding(.vertical, AppTheme.Metrics.cardPadding * 0.6)
        .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: AppTheme.Metrics.cornerRadius, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: AppTheme.Metrics.cornerRadius, style: .continuous)
                .stroke(AppTheme.Colors.subtleBorder, lineWidth: 1)
        )
        .shadow(color: AppTheme.Colors.shadow.opacity(0.25), radius: 8, x: 0, y: 4)
        .accessibilityElement(children: .combine)
        .accessibilityLabel("\(exercise.name) workout set on \(set.date, style: .date)")
        .accessibilityValue(accessibilitySummary)
    }

    private var accessibilitySummary: String {
        var components: [String] = []
        if exercise.type == .weightTraining, let weight = set.weight {
            components.append("Weight \(String(format: "%.1f", weight))")
        }
        components.append("Reps \(String(format: "%g", set.reps))")
        if let rpe = set.rpe {
            components.append("RPE \(String(format: "%.0f", rpe))")
        }
        return components.joined(separator: ", ")
    }
}

struct MetricChip: View {
    let value: String
    let unit: String
    let icon: String
    let tint: Color

    var body: some View {
        HStack(spacing: 6) {
            Image(systemName: icon)
                .font(.footnote.weight(.semibold))
            Text(value)
                .font(.system(.headline, design: .rounded).weight(.semibold))
            Text(unit)
                .font(.caption)
                .opacity(0.8)
        }
        .padding(.horizontal, 12)
        .padding(.vertical, 8)
        .foregroundColor(tint)
        .background(tint.opacity(0.1))
        .clipShape(Capsule())
    }
}
