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
    
    init() {
        let manager = DataManager()
        _dataManager = StateObject(wrappedValue: manager)
        _prManager = StateObject(wrappedValue: PRManager(dataManager: manager))
    }
    
    private func showError(_ message: String) {
        errorMessage = message
        showingError = true
        Logger.shared.log(message, level: .error)
    }
    
    var body: some View {
        TabView {
            WorkoutLogView()
                .tabItem {
                    Label("Workout", systemImage: "figure.strengthtraining.traditional")
                }
            
            PRDashboardView()
                .tabItem {
                    Label("Records", systemImage: "trophy.fill")
                }
            
            VolumeAnalyticsView()
                .tabItem {
                    Label("Analytics", systemImage: "chart.bar.fill")
                }
            
            ExercisesView()
                .tabItem {
                    Label("Exercises", systemImage: "dumbbell.fill")
                }
            
            ProgressView()
                .tabItem {
                    Label("Progress", systemImage: "chart.line.uptrend.xyaxis")
                }
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
