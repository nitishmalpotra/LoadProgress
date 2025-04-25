//
//  LoadProgressApp.swift
//  LoadProgress
//
//  Created by Nitish Malpotra on 11/01/2025.
//

import SwiftUI

@main
struct LoadProgressApp: App {
    @StateObject private var dataManager = DataManager()
    @State private var isActive: Bool = false

    var body: some Scene {
        WindowGroup {
            if isActive {
                ContentView()
                    .environmentObject(dataManager)
            } else {
                SplashScreenView()
                    .onAppear {
                        // Simulate loading time
                        DispatchQueue.main.asyncAfter(deadline: .now() + 2.0) {
                            withAnimation {
                                self.isActive = true
                            }
                        }
                    }
            }
        }
    }
}
