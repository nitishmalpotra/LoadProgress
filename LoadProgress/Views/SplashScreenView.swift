import SwiftUI

struct SplashScreenView: View {
    var body: some View {
        ZStack {
            LinearGradient(
                colors: [AppTheme.Colors.primaryAccent.opacity(0.6), Color(.systemBackground)],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            .ignoresSafeArea()

            VStack(spacing: 20) {
                Image(systemName: "figure.strengthtraining.traditional")
                    .resizable()
                    .scaledToFit()
                    .frame(width: 120, height: 120)
                    .foregroundColor(.white)
                    .symbolRenderingMode(.palette)
                    .shadow(color: AppTheme.Colors.shadow, radius: 14, x: 0, y: 6)

                Text("LoadProgress")
                    .font(.system(.largeTitle, design: .rounded).weight(.bold))
                    .foregroundColor(.white)

                Text("Track. Progress. Evolve.")
                    .font(AppTheme.Fonts.subheadline())
                    .foregroundStyle(.white.opacity(0.9))
            }
            .padding()
            .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 28, style: .continuous))
            .shadow(color: AppTheme.Colors.shadow, radius: 20, x: 0, y: 10)
        }
        .accessibilityElement(children: .combine)
        .accessibilityLabel("LoadProgress starting")
    }
}

struct SplashScreenView_Previews: PreviewProvider {
    static var previews: some View {
        SplashScreenView()
    }
}
