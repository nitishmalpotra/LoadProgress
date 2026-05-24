import SwiftUI

// MARK: - iOS 26 Liquid Glass Design System

/// Comprehensive design system implementing iOS 26 Liquid Glass aesthetic
/// Features translucent materials, depth, subtle specular highlights, and floating UI elements
enum AppTheme {

    // MARK: - Colors

    enum Colors {
        // Primary Colors
        static let primary = Color.accentColor
        static let secondary = Color(.systemTeal)
        static let tertiary = Color(.systemIndigo)
        static let primaryAccent = Color.accentColor
        static let secondaryAccent = Color(.systemPink)

        // Semantic Colors
        static let success = Color(.systemGreen)
        static let warning = Color(.systemOrange)
        static let error = Color(.systemRed)
        static let info = Color(.systemBlue)

        // Background Gradients
        static let backgroundGradient = LinearGradient(
            colors: [
                Color(.systemBackground).opacity(0.85),
                Color(.secondarySystemBackground).opacity(0.95)
            ],
            startPoint: .topLeading,
            endPoint: .bottomTrailing
        )

        static let cardGradient = LinearGradient(
            colors: [
                Color(.systemBackground).opacity(0.6),
                Color(.systemBackground).opacity(0.4)
            ],
            startPoint: .topLeading,
            endPoint: .bottomTrailing
        )

        // Glass Morphism Colors
        static let glassOverlay = Color.white.opacity(0.08)
        static let glassBorder = Color.white.opacity(0.18)
        static let glassHighlight = Color.white.opacity(0.25)
        static let subtleBorder = Color.white.opacity(0.12)

        // Shadows
        static let shadowLight = Color.black.opacity(0.08)
        static let shadowMedium = Color.black.opacity(0.12)
        static let shadowHeavy = Color.black.opacity(0.18)
        static let shadowColor = Color.black.opacity(0.15)
        static let shadow = Color.black.opacity(0.2)

        // Text
        static let textPrimary = Color.primary
        static let textSecondary = Color.secondary
        static let textTertiary = Color(.tertiaryLabel)
        static let textInverse = Color.white
    }

    // MARK: - Materials

    enum Materials {
        static let ultraThin: Material = .ultraThinMaterial
        static let thin: Material = .thinMaterial
        static let regular: Material = .regularMaterial
        static let thick: Material = .thickMaterial
        static let ultraThick: Material = .ultraThickMaterial

        // Context-specific materials
        static let card: Material = .ultraThinMaterial
        static let nav: Material = .thinMaterial
        static let overlay: Material = .regularMaterial
    }

    // MARK: - Typography

    enum Typography {
        static let largeTitle = Font.system(.largeTitle, design: .rounded, weight: .bold)
        static let title = Font.system(.title, design: .rounded, weight: .bold)
        static let title2 = Font.system(.title2, design: .rounded, weight: .semibold)
        static let title3 = Font.system(.title3, design: .rounded, weight: .semibold)
        static let headline = Font.system(.headline, design: .rounded, weight: .semibold)
        static let subheadline = Font.system(.subheadline, design: .rounded, weight: .medium)
        static let body = Font.system(.body, design: .rounded, weight: .regular)
        static let callout = Font.system(.callout, design: .rounded, weight: .regular)
        static let footnote = Font.system(.footnote, design: .rounded, weight: .regular)
        static let caption = Font.system(.caption, design: .rounded, weight: .regular)
        static let caption2 = Font.system(.caption2, design: .rounded, weight: .regular)
    }

    // MARK: - Legacy Font API bridge

    enum Fonts {
        static func largeTitle() -> Font { Typography.largeTitle }
        static func title() -> Font { Typography.title }
        static func title2() -> Font { Typography.title2 }
        static func title3() -> Font { Typography.title3 }
        static func headline() -> Font { Typography.headline }
        static func subheadline() -> Font { Typography.subheadline }
        static func body() -> Font { Typography.body }
        static func callout() -> Font { Typography.callout }
        static func footnote() -> Font { Typography.footnote }
        static func caption() -> Font { Typography.caption }
        static func caption2() -> Font { Typography.caption2 }
    }

    // MARK: - Metrics

    enum Metrics {
        // Corner Radii
        static let cornerRadiusXS: CGFloat = 8
        static let cornerRadiusS: CGFloat = 12
        static let cornerRadiusM: CGFloat = 16
        static let cornerRadiusL: CGFloat = 20
        static let cornerRadiusXL: CGFloat = 24
        static let cornerRadius: CGFloat = cornerRadiusM // Default

        // Padding
        static let paddingXS: CGFloat = 4
        static let paddingS: CGFloat = 8
        static let paddingM: CGFloat = 12
        static let paddingL: CGFloat = 16
        static let paddingXL: CGFloat = 20
        static let paddingXXL: CGFloat = 24

        // Spacing
        static let spacingXS: CGFloat = 4
        static let spacingS: CGFloat = 8
        static let spacingM: CGFloat = 12
        static let spacingL: CGFloat = 16
        static let spacingXL: CGFloat = 20
        static let spacingXXL: CGFloat = 24

        // Specific Use Cases
        static let cardPadding: CGFloat = paddingL
        static let horizontalPadding: CGFloat = paddingXL
        static let verticalSpacing: CGFloat = spacingL
        static let sectionSpacing: CGFloat = spacingXXL

        // Borders
        static let borderWidth: CGFloat = 1
        static let borderWidthThick: CGFloat = 2
    }

    // MARK: - Shadows

    enum Shadows {
        struct ShadowConfig {
            let color: Color
            let radius: CGFloat
            let x: CGFloat
            let y: CGFloat
        }

        static let none = ShadowConfig(color: .clear, radius: 0, x: 0, y: 0)
        static let subtle = ShadowConfig(color: Colors.shadowLight, radius: 4, x: 0, y: 2)
        static let card = ShadowConfig(color: Colors.shadowMedium, radius: 10, x: 0, y: 6)
        static let elevated = ShadowConfig(color: Colors.shadowHeavy, radius: 16, x: 0, y: 8)
        static let floating = ShadowConfig(color: Colors.shadowHeavy, radius: 20, x: 0, y: 12)
    }

    // MARK: - Animation

    enum Animation {
        static let quick = SwiftUI.Animation.easeInOut(duration: 0.2)
        static let standard = SwiftUI.Animation.easeInOut(duration: 0.3)
        static let slow = SwiftUI.Animation.easeInOut(duration: 0.4)
        static let spring = SwiftUI.Animation.spring(response: 0.3, dampingFraction: 0.75)
        static let springBouncy = SwiftUI.Animation.spring(response: 0.28, dampingFraction: 0.7)
    }

    // MARK: - Icons

    enum Icons {
        static let size: CGFloat = 20
        static let sizeSmall: CGFloat = 16
        static let sizeLarge: CGFloat = 24
        static let sizeXL: CGFloat = 32
    }
}

// MARK: - Glass Morphism Modifiers

struct GlassBackground: ViewModifier {
    var material: Material = AppTheme.Materials.card
    var cornerRadius: CGFloat = AppTheme.Metrics.cornerRadius
    var borderColor: Color = AppTheme.Colors.glassBorder
    var shadowConfig: AppTheme.Shadows.ShadowConfig = AppTheme.Shadows.card

    func body(content: Content) -> some View {
        content
            .background(material)
            .clipShape(RoundedRectangle(cornerRadius: cornerRadius, style: .continuous))
            .overlay(
                RoundedRectangle(cornerRadius: cornerRadius, style: .continuous)
                    .stroke(borderColor, lineWidth: AppTheme.Metrics.borderWidth)
                    .blendMode(.overlay)
            )
            .shadow(
                color: shadowConfig.color,
                radius: shadowConfig.radius,
                x: shadowConfig.x,
                y: shadowConfig.y
            )
    }
}

struct GlassCard: ViewModifier {
    var padding: CGFloat = AppTheme.Metrics.cardPadding
    var material: Material = AppTheme.Materials.card
    var cornerRadius: CGFloat = AppTheme.Metrics.cornerRadius

    func body(content: Content) -> some View {
        content
            .padding(padding)
            .modifier(GlassBackground(material: material, cornerRadius: cornerRadius))
    }
}

struct FloatingCard: ViewModifier {
    var padding: CGFloat = AppTheme.Metrics.cardPadding

    func body(content: Content) -> some View {
        content
            .padding(padding)
            .modifier(GlassBackground(
                material: AppTheme.Materials.card,
                cornerRadius: AppTheme.Metrics.cornerRadiusL,
                shadowConfig: AppTheme.Shadows.floating
            ))
    }
}

struct GlassSection: ViewModifier {
    func body(content: Content) -> some View {
        content
            .padding(AppTheme.Metrics.paddingL)
            .modifier(GlassBackground(
                material: AppTheme.Materials.ultraThin,
                cornerRadius: AppTheme.Metrics.cornerRadiusM
            ))
    }
}

// MARK: - Button Styles

struct PrimaryButtonStyle: ButtonStyle {
    var isDestructive: Bool = false

    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(AppTheme.Typography.headline)
            .foregroundColor(AppTheme.Colors.textInverse)
            .padding(.horizontal, AppTheme.Metrics.paddingXL)
            .padding(.vertical, AppTheme.Metrics.paddingM)
            .background(
                RoundedRectangle(cornerRadius: AppTheme.Metrics.cornerRadius, style: .continuous)
                    .fill(isDestructive ? AppTheme.Colors.error : AppTheme.Colors.primary)
                    .opacity(configuration.isPressed ? 0.85 : 1)
            )
            .shadow(
                color: AppTheme.Colors.shadowMedium.opacity(configuration.isPressed ? 0.2 : 0.35),
                radius: configuration.isPressed ? 4 : 12,
                x: 0,
                y: configuration.isPressed ? 2 : 8
            )
            .scaleEffect(configuration.isPressed ? 0.97 : 1)
            .animation(AppTheme.Animation.spring, value: configuration.isPressed)
    }
}

struct SecondaryButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(AppTheme.Typography.headline)
            .foregroundColor(AppTheme.Colors.textPrimary)
            .padding(.horizontal, AppTheme.Metrics.paddingXL)
            .padding(.vertical, AppTheme.Metrics.paddingM)
            .background(
                RoundedRectangle(cornerRadius: AppTheme.Metrics.cornerRadius, style: .continuous)
                    .fill(AppTheme.Materials.thin)
                    .overlay(
                        RoundedRectangle(cornerRadius: AppTheme.Metrics.cornerRadius, style: .continuous)
                            .stroke(AppTheme.Colors.glassBorder, lineWidth: AppTheme.Metrics.borderWidth)
                    )
            )
            .shadow(
                color: AppTheme.Colors.shadowLight.opacity(configuration.isPressed ? 0.1 : 0.2),
                radius: configuration.isPressed ? 2 : 6,
                x: 0,
                y: configuration.isPressed ? 1 : 4
            )
            .scaleEffect(configuration.isPressed ? 0.98 : 1)
            .animation(AppTheme.Animation.quick, value: configuration.isPressed)
    }
}

struct GlassButtonStyle: ButtonStyle {
    var color: Color = AppTheme.Colors.primary

    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(AppTheme.Typography.subheadline)
            .foregroundColor(color)
            .padding(.horizontal, AppTheme.Metrics.paddingL)
            .padding(.vertical, AppTheme.Metrics.paddingS)
            .modifier(GlassBackground(
                material: AppTheme.Materials.ultraThin,
                cornerRadius: AppTheme.Metrics.cornerRadiusS,
                shadowConfig: AppTheme.Shadows.subtle
            ))
            .scaleEffect(configuration.isPressed ? 0.95 : 1)
            .animation(AppTheme.Animation.quick, value: configuration.isPressed)
    }
}

struct PillButtonStyle: ButtonStyle {
    var fill: Color
    var foreground: Color = AppTheme.Colors.textInverse

    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(AppTheme.Typography.headline)
            .foregroundColor(foreground)
            .padding(.horizontal, AppTheme.Metrics.paddingXL)
            .padding(.vertical, AppTheme.Metrics.paddingM)
            .background(
                Capsule()
                    .fill(fill.opacity(configuration.isPressed ? 0.82 : 1))
            )
            .scaleEffect(configuration.isPressed ? 0.96 : 1)
            .animation(AppTheme.Animation.springBouncy, value: configuration.isPressed)
            .shadow(
                color: AppTheme.Colors.shadowMedium.opacity(0.3),
                radius: configuration.isPressed ? 4 : 8,
                x: 0,
                y: configuration.isPressed ? 2 : 6
            )
    }
}

// MARK: - View Extensions

extension View {
    // Glass Morphism
    func glassBackground(
        material: Material = AppTheme.Materials.card,
        cornerRadius: CGFloat = AppTheme.Metrics.cornerRadius
    ) -> some View {
        modifier(GlassBackground(material: material, cornerRadius: cornerRadius))
    }

    func glassCard(padding: CGFloat = AppTheme.Metrics.cardPadding) -> some View {
        modifier(GlassCard(padding: padding))
    }

    func floatingCard(padding: CGFloat = AppTheme.Metrics.cardPadding) -> some View {
        modifier(FloatingCard(padding: padding))
    }

    func glassSection() -> some View {
        modifier(GlassSection())
    }

    // Button Styles
    func primaryButton(isDestructive: Bool = false) -> some View {
        buttonStyle(PrimaryButtonStyle(isDestructive: isDestructive))
    }

    func secondaryButton() -> some View {
        buttonStyle(SecondaryButtonStyle())
    }

    func glassButton(color: Color = AppTheme.Colors.primary) -> some View {
        buttonStyle(GlassButtonStyle(color: color))
    }

    func pillButton(fill: Color, foreground: Color = AppTheme.Colors.textInverse) -> some View {
        buttonStyle(PillButtonStyle(fill: fill, foreground: foreground))
    }

    // Convenience
    func primaryPillButton() -> some View {
        pillButton(fill: AppTheme.Colors.primary)
    }

    func secondaryPillButton() -> some View {
        pillButton(fill: Color(.systemGray5), foreground: AppTheme.Colors.textPrimary)
    }

    // Accessibility
    func reduceMotionSafe<T: View>(
        _ modifier: (Self) -> T,
        fallback: (Self) -> T
    ) -> some View {
        if UIAccessibility.isReduceMotionEnabled {
            return AnyView(fallback(self))
        } else {
            return AnyView(modifier(self))
        }
    }
}

// MARK: - Component Styles

struct SectionHeaderStyle: ViewModifier {
    func body(content: Content) -> some View {
        content
            .font(AppTheme.Typography.title3)
            .foregroundColor(AppTheme.Colors.textPrimary)
            .padding(.bottom, AppTheme.Metrics.spacingS)
    }
}

struct InputFieldStyle: ViewModifier {
    func body(content: Content) -> some View {
        content
            .font(AppTheme.Typography.body)
            .padding(AppTheme.Metrics.paddingM)
            .background(AppTheme.Materials.thin)
            .clipShape(RoundedRectangle(cornerRadius: AppTheme.Metrics.cornerRadiusS, style: .continuous))
            .overlay(
                RoundedRectangle(cornerRadius: AppTheme.Metrics.cornerRadiusS, style: .continuous)
                    .stroke(AppTheme.Colors.glassBorder, lineWidth: AppTheme.Metrics.borderWidth)
            )
    }
}

extension View {
    func sectionHeader() -> some View {
        modifier(SectionHeaderStyle())
    }

    func inputField() -> some View {
        modifier(InputFieldStyle())
    }
}

// MARK: - Helpers

extension Color {
    /// Provides a simple directional gradient derived from the base color.
    var gradient: LinearGradient {
        LinearGradient(
            colors: [
                self,
                self.opacity(0.75)
            ],
            startPoint: .topLeading,
            endPoint: .bottomTrailing
        )
    }
}
