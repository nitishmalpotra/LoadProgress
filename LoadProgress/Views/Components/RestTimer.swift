import SwiftUI

struct RestTimer: View {
    @StateObject private var viewModel = RestTimerViewModel()
    let suggestedRestTime: TimeInterval
    var onComplete: (TimeInterval) -> Void
    
    var body: some View {
        VStack(spacing: 16) {
            // Timer Display
            Text(viewModel.timeString)
                .font(.system(size: 48, weight: .bold, design: .rounded))
                .monospacedDigit()
                .foregroundColor(viewModel.timeColor)
                .contentTransition(.numericText())
                .animation(.bouncy, value: viewModel.timeString)
            
            // Progress Ring
            ZStack {
                Circle()
                    .stroke(Color.gray.opacity(0.2), lineWidth: 8)
                Circle()
                    .trim(from: 0, to: viewModel.progress)
                    .stroke(
                        viewModel.progress >= 1.0 ? Color.green : Color.blue,
                        style: StrokeStyle(lineWidth: 8, lineCap: .round)
                    )
                    .rotationEffect(.degrees(-90))
                    .animation(.smooth, value: viewModel.progress)
            }
            .frame(width: 200, height: 200)
            
            // Controls
            HStack(spacing: 20) {
                Button(action: viewModel.resetTimer) {
                    Label("Reset", systemImage: "arrow.counterclockwise")
                }
                .buttonStyle(.bordered)
                
                Button(action: viewModel.toggleTimer) {
                    Label(
                        viewModel.isRunning ? "Pause" : "Start",
                        systemImage: viewModel.isRunning ? "pause.fill" : "play.fill"
                    )
                }
                .buttonStyle(.borderedProminent)
                
                Button(action: {
                    viewModel.stopTimer()
                    onComplete(viewModel.elapsedTime)
                }) {
                    Label("Done", systemImage: "checkmark")
                }
                .buttonStyle(.bordered)
                .disabled(!viewModel.hasStarted)
            }
            
            // Suggested Time
            if !viewModel.hasStarted {
                Text("Suggested rest: \(Int(suggestedRestTime))s")
                    .foregroundStyle(.secondary)
            }
        }
        .padding()
        .onAppear {
            viewModel.targetTime = suggestedRestTime
        }
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
        progress = min(elapsedTime / targetTime, 1.0)
    }
}

#Preview {
    RestTimer(suggestedRestTime: 90) { _ in }
}
