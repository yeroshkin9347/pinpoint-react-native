# ppeReactNative

## Overview

`ppeReactNative` is a React Native application developed for the PinPointEye project for both Android & iOS. This document provides instructions on setting up the development environment, cloning the repository, and running the project.

## Prerequisites

Before you begin, ensure you have the following installed on your system:

- **Git**: For cloning the repository.
- **Node.js and npm**: For managing the project's dependencies.
- **Android Studio**: For Android development, including an emulator or a physical device.
- **PHP**: Some dependencies may require PHP. Make sure you have PHP 7.4 or newer installed.
- **CMake and Ninja**: Required for building native code. These can be installed via the Android SDK Manager in Android Studio.

## Environment Setup

1. **Install Android Studio**: Download and install Android Studio from [the official website](https://developer.android.com/studio). During installation, make sure to install the Android SDK and Android SDK Platform-tools.

2. **Install CMake and Ninja through Android SDK**:
   - Open Android Studio.
   - Go to `Tools` > `SDK Manager`.
   - Under `SDK Tools`, find and install `CMake` and `Ninja`.

3. **Install Node.js and npm**:
   - Download and install Node.js from [the official website](https://nodejs.org/). npm is included with Node.js.

4. **Install PHP** (if not already installed):
   - Installation instructions vary based on your operating system. Visit [the official PHP website](https://www.php.net/manual/en/install.php) for detailed instructions.

## Cloning the Repository

Clone the repository to your local machine by running the following command in your terminal:

```bash
git clone https://willmason9213@bitbucket.org/pinpointeye/ppe-reactnative.git
```

Navigate into the cloned repository's directory:

```bash
cd ppe-reactnative
```

## Installing Dependencies

Install the project dependencies by running:

```bash
npm install
```

## Running the Project

To start the project on an Android device or emulator, run:

```bash
npm run android
```

For iOS:

```bash
npm run ios
```

Note: For iOS development, you'll need a macOS with Xcode installed.

## Building the Project for Release

To build the release version of the project for Android:

1. Navigate to the android folder within the project directory:

   ```bash
   cd android
   ```

2. Run the following command to clean and assemble the release build:

   ```bash
   ./gradlew clean assembleRelease
   ```

The release APK file will be located in `./android/app/build/outputs/apk/release/`.

## Additional Notes

- Make sure you have all necessary SDKs and tools specified in the `android/build.gradle` and `android/app/build.gradle` files.
- For detailed information about React Native development, visit the [official React Native documentation](https://reactnative.dev/docs/environment-setup).

## Troubleshooting

If you encounter any issues with npm packages or native dependencies, make sure all prerequisites are correctly installed and configured. For specific package-related issues, refer to the package's official documentation or repository for guidance.

## Errors encountered while running `./gradlew assembleRelease`

**w: Detected multiple Kotlin daemon sessions at build\kotlin\sessions**

`./gradlew -stop`
 
**:app:createBundleReleaseJsAndAssets**
* What went wrong:
Execution failed for task ':app:createBundleReleaseJsAndAssets'.
> Process 'command 'cmd'' finished with non-zero exit value 1

This error is caused by the project running on an earlier version on `react-native-reanimated`.

'npm i react-native-reanimated@latest'

# React Native iOS Development Setup Guide
This README.md template provides a comprehensive guide for developers to set up their environment, clone the repository, install dependencies, and run the project. Adjustments may be needed based on your specific project requirements or if any additional setup steps are necessary for your development environment.

This guide provides step-by-step instructions for setting up React Native for iOS development on macOS.

## Prerequisites

Before you begin, make sure you have the following installed on your system:

- [Node.js and npm](https://nodejs.org/en/download/)
- [Watchman](https://facebook.github.io/watchman/docs/install#buildinstall)
- [Xcode](https://apps.apple.com/us/app/xcode/id497799835)
- [CocoaPods](https://guides.cocoapods.org/using/getting-started.html#installation)
- [React Native CLI](https://reactnative.dev/docs/environment-setup)

## Installation Steps

1. **Install Node.js v18.19.0 (Latest v18 stable release) and npm:**

   ```
   # Install Node.js and npm
   brew install node
   ```

### Node Version Compatibility

The project requires Node.js version 18.19.0. If a different version is installed, follow these steps to switch versions:

1. Uninstall the current Node.js version.
https://stackoverflow.com/questions/11177954/how-do-i-completely-uninstall-node-js-and-reinstall-from-beginning-mac-os-x

2. Install Node.js version 18 using Homebrew:

```bash
brew install node@18
```
https://formulae.brew.sh/formula/node@18

3. Relink Node.js to ensure the correct version is used:

```bash
brew link node@18 --force --overwrite
```
https://stackoverflow.com/questions/30467281/mac-bash-node-command-not-found

For more detailed instructions, refer to the provided Stack Overflow and Homebrew links.

2. **Install Watchman:**

   ```
   # Install Watchman
   brew install watchman
   ```

3. **Install Xcode:**

   Install Xcode from the Mac App Store.

4. **Install CocoaPods:**

   ```
   # Install CocoaPods
   sudo gem install cocoapods
   ```

5. **Install React Native CLI:**

   ```
   # Install React Native CLI
   npm install -g react-native-cli
   ```

7. **Run Your React Native App:**

   ```
   # Navigate to your project directory
   cd ppe-reactnative/ppeReactNative

   # Start Metro Bundler and run your app on the iOS Simulator
   npx react-native run-ios
   ```

---

# iOS Build Instructions for PinPointEye Project

This document outlines the necessary steps to prepare and build the iOS version of the PinPointEye project. Follow these instructions to set up your environment and resolve common issues encountered during the build process.

## Environment Setup

Before starting, ensure your terminal is running under Rosetta to avoid compatibility issues with certain dependencies. To enable Rosetta:

1. Right-click on Terminal in the Applications folder.
2. Select "Get Info."
3. Tick the box "Open using Rosetta."

## Dependencies Installation

Certain Ruby gems and CocoaPods are required. If you encounter the "pod not found" error, follow these steps:

```bash
sudo gem install drb -v 2.0.6
sudo gem install cocoapods
sudo gem install activesupport -v 6.1.9.7
```

## CocoaPods Setup

CocoaPods manage library dependencies for Xcode projects. Navigate to the iOS project directory and run:

```bash
cd ios
pod install
pod update
pod cache clean --all
```

If issues persist, clean the pod cache, deintegrate, and reinstall the pods:

```bash
pod cache clean --all
pod deintegrate
pod install
```

## Podfile Updates

At times, the Podfile may require updates for compatibility or performance improvements. Replace the existing Podfile with the new version provided by Bilal in the WhatsApp group.

## Addressing Sandbox Restrictions

If you encounter an error regarding Sandbox restrictions when attempting to open `launchPacker.command`, you may need to adjust permissions or settings related to your project's workspace. For detailed steps, refer to your system's documentation on managing Sandbox settings.

## Running the iOS Build

To initiate the build process, use the React Native command:

```bash
npx react-native run-ios
```

## Troubleshooting Common Errors

### Error: "ppeReactNative has not been registered"

This error typically indicates a problem with the Metro server. Ensure it's running in the correct project directory, or restart it if necessary.

## Reinstalling the App on the Emulator

If you encounter issues related to missing build input files, try updating CocoaPods, deintegrating, and cleaning the build in Xcode:

```bash
cd ios
pod update
pod deintegrate
```

In Xcode, use the "Clean Build Folder" option under the Product menu to clear any existing build issues.

## Xcode Build Settings

Ensure Xcode is also running under Rosetta for compatibility.

## Testing Your App

Once the build process completes, your React Native app will run in the iOS Simulator. You can interact with the app just like you would on a physical iOS device.

That's it! You've successfully installed React Native for iOS development on your macOS system and can now build the iOS app.



---