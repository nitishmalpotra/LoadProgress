import SwiftUI

struct RestTimer: View {
    @StateObject private var viewModel = RestTimerViewModel()
    let suggestedRestTime: TimeInterval
    var onComplete: (TimeInterval) -> Void

    var body: some View {
        VStack(spacing: 20) {
            Text(viewModel.timeString)
                .font(.system(size: 48, weight: .bold, design: .rounded))
                .monospacedDigit()
                .foregroundColor(viewModel.timeColor)
                .contentTransition(.numericText())
                .animation(.bouncy, value: viewModel.timeString)

            ZStack {
                Circle()
                    .strokeBorder(Color.white.opacity(0.12), lineWidth: 10)
                Circle()
                    .trim(from: 0, to: viewModel.progress)
                    .stroke(
                        AngularGradient(
                            gradient: Gradient(colors: [AppTheme.Colors.primaryAccent, .green]),
                            center: .center,
                            angle: .degrees(360)
                        ),
                        style: StrokeStyle(lineWidth: 10, lineCap: .round)
                    )
                    .rotationEffect(.degrees(-90))
                    .animation(.smooth(duration: 0.3), value: viewModel.progress)
                Circle()
                    .fill(.ultraThinMaterial)
                    .frame(width: 180, height: 180)
                    .shadow(color: AppTheme.Colors.shadow.opacity(0.4), radius: 12, x: 0, y: 10)
                Text(viewModel.displayedTarget)
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
            .frame(width: 220, height: 220)

            HStack(spacing: 16) {
                Button(action: viewModel.resetTimer) {
                    Label("Reset", systemImage: "arrow.counterclockwise")
                }
                .buttonStyle(SecondaryButtonStyle())

                Button(action: viewModel.toggleTimer) {
                    Label(
                        viewModel.isRunning ? "Pause" : "Start",
                        systemImage: viewModel.isRunning ? "pause.fill" : "play.fill"
                    )
                }
                .buttonStyle(PrimaryButtonStyle())

                Button(action: {
                    viewModel.stopTimer()
                    onComplete(viewModel.elapsedTime)
                }) {
                    Label("Done", systemImage: "checkmark")
                }
                .buttonStyle(SecondaryButtonStyle())
                .disabled(!viewModel.hasStarted)
                .opacity(viewModel.hasStarted ? 1 : 0.6)
            }

            if !viewModel.hasStarted {
                Text("Suggested rest: \(Int(suggestedRestTime))s")
                    .font(AppTheme.Fonts.subheadline())
                    .foregroundStyle(.secondary)
            }
        }
        .padding(AppTheme.Metrics.horizontalPadding)
        .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: AppTheme.Metrics.cornerRadius, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: AppTheme.Metrics.cornerRadius, style: .continuous)
                .stroke(AppTheme.Colors.subtleBorder, lineWidth: 1)
        )
        .shadow(color: AppTheme.Colors.shadow, radius: 12, x: 0, y: 6)
        .onAppear {
            viewModel.targetTime = suggestedRestTime
        }
        .accessibilityElement(children: .combine)
        .accessibilityLabel("Rest timer")
        .accessibilityValue(viewModel.timeString)
    }
}

class RestTimerViewModel: ObservableObject {
    @Published private(set) var timeString: String = "00:00"
    @Published private(set) var progress: Double = 0.0
    @Published private(set) var isRunning = false
    @Published private(set) var hasStarted = false

    var targetTime: TimeInterval = 60
    private var timer: Timer?
    private(set) var elapsedTime: TimeInterval = 0

    var timeColor: Color {
        if progress >= 1.0 { return .green }
        if progress >= 0.8 { return .orange }
        return .primary
    }

    var displayedTarget: String {
        guard targetTime > 0 else { return "" }
        return "Target: \(Int(targetTime))s"
    }

    func toggleTimer() {
        if isRunning {
            pauseTimer()
        } else {
            startTimer()
        }
    }

    func startTimer() {
        hasStarted = true
        isRunning = true
        timer = Timer.scheduledTimer(withTimeInterval: 0.1, repeats: true) { [weak self] _ in
            self?.updateTimer()
        }
    }

    func pauseTimer() {
        isRunning = false
        timer?.invalidate()
        timer = nil
    }

    func stopTimer() {
        pauseTimer()
        HapticManager.shared.playSuccess()
    }

    func resetTimer() {
        pauseTimer()
        elapsedTime = 0
        hasStarted = false
        updateDisplay()
    }

    private func updateTimer() {
        elapsedTime += 0.1
        updateDisplay()

        if elapsedTime >= targetTime {
            HapticManager.shared.playNotification()
        }
    }

    private func updateDisplay() {
        let minutes = Int(elapsedTime) / 60
        let seconds = Int(elapsedTime) % 60
        timeString = String(format: "%02d:%02d", minutes, seconds)
        progress = targetTime > 0 ? min(elapsedTime / targetTime, 1.0) : 0
    }
}

#Preview {
    RestTimer(suggestedRestTime: 90) { _ in }
}
