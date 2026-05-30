# Store Build Readiness (No Publish)

This project is configured for EAS cloud builds for Android and iOS.

## 1. One-time setup

1. Login to Expo account:

   npx eas login

2. Link EAS project (if not linked yet):

   npx eas init
   - This updates `expo.extra.eas.projectId` in `app.json`.

## 2. Build commands

### Android

- Development APK:

  yarn eas:build:android:dev

- Internal preview APK:

  yarn eas:build:android:preview

- Production AAB (Play Store-ready):

  yarn eas:build:android:prod

### iOS

- Development client build:

  yarn eas:build:ios:dev

- Internal preview build:

  yarn eas:build:ios:preview

- Production IPA (App Store-ready):

  yarn eas:build:ios:prod

## 3. Local Android emulator workflow

If you want to test on the Android emulator before cloud builds:

1. Start the emulator from Android Studio or with `emulator -avd Pixel_6_API_34 -no-metrics`.
2. Run:

   yarn start:emulator

3. Expo will use localhost plus adb reverse and open the app on the running emulator.

## 4. Important notes

- Nothing is auto-submitted to stores by these build commands.
- Submit commands exist but are manual and optional:
  - `yarn eas:submit:android`
  - `yarn eas:submit:ios`

- iOS requires valid Apple credentials and app registration before submission.

## 4. IDs configured in app.json

- iOS bundle ID: `com.darlingexpress.app`
- Android package: `com.darlingexpress.app`

Update them before final store release if needed.
