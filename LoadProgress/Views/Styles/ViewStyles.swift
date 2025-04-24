import SwiftUI

/// Common styles used throughout the app
struct ViewStyles {
    /// Standard card style with consistent padding and appearance
    struct CardStyle: ViewModifier {
        func body(content: Content) -> some View {
            content
                .padding()
                .background(Color(.systemBackground))
                .cornerRadius(12)
                .shadow(color: .black.opacity(0.05), radius: 5)
        }
    }
    
    /// Primary button style with consistent appearance
    struct PrimaryButtonStyle: ButtonStyle {
        func makeBody(configuration: Configuration) -> some View {
            configuration.label
                .padding()
                .frame(maxWidth: .infinity)
                .background(Color.accentColor)
                .foregroundColor(.white)
                .cornerRadius(12)
                .opacity(configuration.isPressed ? 0.8 : 1.0)
        }
    }
}

// MARK: - View Extensions
extension View {
    func cardStyle() -> some View {
        modifier(ViewStyles.CardStyle())
    }
} 