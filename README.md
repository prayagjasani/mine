# Mine Game Mobile App

A mobile version of the Mine Game, built with React and Capacitor.

## Development Setup

### Prerequisites

- Node.js and npm
- Android Studio (for Android development)
- Xcode (for iOS development, Mac only)

### Install Dependencies

```bash
npm install
```

### Run Web Version

```bash
npm run dev
```

### Build for Web

```bash
npm run build
```

### Sync with Mobile Projects

After making changes to the web code, run:

```bash
npm run build && npx cap sync
```

## Android Development

### Open in Android Studio

```bash
npx cap open android
```

### Build a Debug APK

In Android Studio:
1. Click on Build > Build Bundle(s) / APK(s) > Build APK(s)
2. The APK will be available in `android/app/build/outputs/apk/debug/app-debug.apk`

### Build a Release APK/AAB

1. Generate a signing key:
```bash
keytool -genkey -v -keystore minegame-key.keystore -alias minegame -keyalg RSA -keysize 2048 -validity 10000
```

2. Place the keystore file in `android/app/`

3. Update `android/app/build.gradle` to include signing config:
```gradle
android {
    ...
    signingConfigs {
        release {
            storeFile file('minegame-key.keystore')
            storePassword 'your-store-password'
            keyAlias 'minegame'
            keyPassword 'your-key-password'
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            ...
        }
    }
}
```

4. In Android Studio, click Build > Generate Signed Bundle/APK and follow the prompts.

## iOS Development (Mac Only)

### Open in Xcode

```bash
npx cap open ios
```

### Build for iOS

1. In Xcode, select your target device
2. Click on Product > Build
3. To run on a simulator or device, click Product > Run

### Creating an Archive for App Store

1. Select a real device as the build target (not a simulator)
2. Select Product > Archive
3. Once complete, the Organizer window will open where you can validate and distribute your app

## Updating Your Mobile App

When you make changes to your web application:

1. Make your changes in the web app
2. Run: `npm run build`
3. Run: `npx cap sync`
4. Open in Android Studio/Xcode: `npx cap open android` or `npx cap open ios`
5. Build and test your app

## Adding Splash Screens and Icons

For a complete mobile app experience, you should replace the default Capacitor splash screens and icons with your own.

### Android

Replace the files in `android/app/src/main/res/` directories (various mipmap and drawable folders).

### iOS

Replace the files in `ios/App/App/Assets.xcassets/`
