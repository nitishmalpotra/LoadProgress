import Foundation

enum PerformanceMetric {
    // View Rendering Metrics
    static let prDashboardRender = "pr_dashboard_render"
    static let volumeAnalyticsRender = "volume_analytics_render"
    static let restTimerRender = "rest_timer_render"
    
    // Data Operations
    static let prCalculation = "pr_calculation"
    static let volumeCalculation = "volume_calculation"
    static let dataFiltering = "data_filtering"
    
    // Cache Operations
    static let cacheUpdate = "cache_update"
    static let cacheRetrieval = "cache_retrieval"
    
    // Chart Rendering
    static let chartDataPreparation = "chart_data_preparation"
    static let chartRendering = "chart_rendering"
}

enum PerformanceThreshold {
    static let viewRenderWarning: TimeInterval = 0.1 // 100ms
    static let dataOperationWarning: TimeInterval = 0.05 // 50ms
    static let cacheOperationWarning: TimeInterval = 0.01 // 10ms
    static let chartRenderingWarning: TimeInterval = 0.2 // 200ms
}
