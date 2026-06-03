# Sportcation Android

Native Android foundation for the Sportcation MVP.

## Stack

- Kotlin
- Jetpack Compose
- Material 3
- Navigation Compose

## Scope

This Sprint 1 project is a foundation only. It includes:

- Android Gradle project structure.
- Compose app entry point.
- Basic navigation graph.
- Theme and reusable placeholder components.
- Placeholder screens for the MVP flow.

It does not include real authentication, booking, payment, auction, resell, wallet, notification logic, backend integration, or production data storage.

## Build

Open the `android` directory in Android Studio.

Prerequisites:

- Android Studio with JDK 17.
- Android SDK Platform 35.
- Android SDK Build Tools 35.x or newer.

From a terminal, run:

```powershell
cd android
.\gradlew.bat :app:assembleDebug
```

On macOS or Linux:

```bash
cd android
./gradlew :app:assembleDebug
```

The debug APK is generated at:

```text
android/app/build/outputs/apk/debug/app-debug.apk
```
