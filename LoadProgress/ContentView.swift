//
//  ContentView.swift
//  LoadProgress
//
//  Created by Nitish Malpotra on 11/01/2025.
//

import SwiftUI

struct ContentView: View {
    @StateObject private var dataManager = DataManager()
    @StateObject private var prManager: PRManager
    @State private var showingError = false
    @State private var errorMessage = ""
    @State private var selection: Int = 0

    init() {
        let sharedManager = DataManager()
        _dataManager = StateObject(wrappedValue: sharedManager)
        _prManager = StateObject(wrappedValue: PRManager(dataManager: sharedManager))
        UITabBar.appearance().scrollEdgeAppearance = UITabBarAppearance()
    }

    private func showError(_ message: String) {
        errorMessage = message
        showingError = true
        Logger.shared.log(message, level: .error)
    }

    var body: some View {
        ZStack {
            AppTheme.Colors.backgroundGradient
                .ignoresSafeArea()

            TabView(selection: $selection) {
                WorkoutLogView()
                    .tabItem { Label("Workout", systemImage: "figure.strengthtraining.traditional") }
                    .tag(0)

                PRDashboardView()
                    .tabItem { Label("Records", systemImage: "trophy.fill") }
                    .tag(1)

                VolumeAnalyticsView()
                    .tabItem { Label("Analytics", systemImage: "chart.bar.fill") }
                    .tag(2)

                ExercisesView()
                    .tabItem { Label("Exercises", systemImage: "dumbbell.fill") }
                    .tag(3)

                ProgressView()
                    .tabItem { Label("Progress", systemImage: "chart.line.uptrend.xyaxis") }
                    .tag(4)
            }
            .accentColor(AppTheme.Colors.primaryAccent)
        }
        .environmentObject(dataManager)
        .environmentObject(prManager)
        .onAppear {
            Logger.shared.log("App launched", level: .info)
        }
        .alert("Error", isPresented: $showingError) {
            Button("OK", role: .cancel) { }
        } message: {
            Text(errorMessage)
        }
    }
}

#Preview {
    ContentView()
}
