import SwiftUI

struct SplashScreenView: View {
    var body: some View {
        ZStack {
            // You can customize the background color or add an image here
            Color.blue.ignoresSafeArea() // Example background
            
            VStack {
                Image(systemName: "figure.strengthtraining.traditional") // Example icon
                    .resizable()
                    .scaledToFit()
                    .frame(width: 100, height: 100)
                    .foregroundColor(.white)
                
                Text("LoadProgress")
                    .font(.largeTitle)
                    .fontWeight(.bold)
                    .foregroundColor(.white)
                    .padding(.top)
            }
        }
    }
}

struct SplashScreenView_Previews: PreviewProvider {
    static var previews: some View {
        SplashScreenView()
    }
}
