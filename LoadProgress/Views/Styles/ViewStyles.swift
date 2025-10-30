import SwiftUI

/// Common styles used throughout the app
struct ViewStyles {
    /// Standard glass card style with consistent padding and appearance
    struct CardStyle: ViewModifier {
        func body(content: Content) -> some View {
            content
                .modifier(GlassCard())
        }
    }

    /// Subtle section header styling aligned with Dynamic Type
    struct SectionHeader: ViewModifier {
        func body(content: Content) -> some View {
            content
                .font(AppTheme.Fonts.subheadline().weight(.semibold))
                .textCase(nil)
                .foregroundStyle(.secondary)
        }
    }
}

// MARK: - View Extensions
extension View {
    func cardStyle() -> some View {
        modifier(ViewStyles.CardStyle())
    }

    func sectionHeaderStyle() -> some View {
        modifier(ViewStyles.SectionHeader())
    }
}
