# Calm ASMR Sounds

## Firebase Config Review Guide

This repo includes a temporary verification screen at `app/(auth)/sign-in.tsx` so reviewers can verify that the native Firebase configuration is working on a real Android or iOS Expo development client.

### What this test proves

- The native Firebase app initializes successfully
- React Native Firebase Auth can connect to the configured Firebase project
- Firestore can be reached from the shared RNFB module without initialization errors
- Storage can be reached from the shared RNFB module without initialization errors
- The committed `google-services.json` and `GoogleService-Info.plist` files are usable in a native build
- The installed iOS build preserves `UIBackgroundModes: ["audio"]`

### Before testing

- Make sure local dependencies are installed with `npm install`
- Make sure `.env` exists locally and is populated from `.env.example`
- Make sure `google-services.json` and `GoogleService-Info.plist` exist at the project root
- Make sure you have access to a real iOS device and a real Android device for final sign-off
- Do not use Expo Go for this test

### Build and install the development client

Use the EAS `development` profile because this project depends on native Firebase modules and verifies a Metro-backed Expo development client workflow:

```bash
npx eas-cli build --platform all --profile development
```

Expected artifacts:

- iOS: internal development client install distributed by EAS
- Android: internal development client install distributed by EAS

Install both builds on real devices. If you need platform-specific commands instead, run `npx eas-cli build --platform ios --profile development` and `npx eas-cli build --platform android --profile development` separately.

### Start the app bundle server

Run Metro from the project root. This Phase 1 verification does not require a Metro-free standalone launch because the `development` profile is an Expo development client.

```bash
npm run start
```

If LAN networking from WSL does not work for the device, use tunnel mode instead:

```bash
npx expo start --tunnel
```

### Run the Firebase check

1. Open the installed development build on the mobile device while Metro is running.
2. Deep link to the verification screen from the project root:

```bash
npx uri-scheme open "calm-sounds://sign-in" --android
```

For iOS, use:

```bash
npx uri-scheme open "calm-sounds://sign-in" --ios
```

3. Confirm the app opens `app/(auth)/sign-in.tsx`, which is the temporary Firebase verification surface.
4. Confirm the screen reports a ready native Firebase app state and does not show a configuration error.
5. Tap `Run Firestore check` and confirm the status updates to a success state instead of reporting an initialization error.
6. Tap `Run Storage check` and confirm the status updates to a success state instead of reporting an initialization error.
7. Enter an email and password.
8. Tap `Create account` or `Sign in`.
9. Optionally tap `Sign in anonymously` to verify anonymous auth as well.
10. Confirm the on-screen session state updates with the authenticated user information.

### iOS background-audio checkpoint

On the installed iOS build, verify the app still registers background audio support from `UIBackgroundModes: ["audio"]`. Use the same device-verification checklist that gates Phase 1 and record the outcome in the final summary.

### Verify in Firebase Console

Open Firebase Console and check:

- `Authentication > Users`: the created user or anonymous user should appear

### Expected failures

If the screen reports that no default Firebase app is available, the installed development build is stale relative to the current native config. Rebuild and reinstall the dev client after changes to:

- `app.json`
- `google-services.json`
- `GoogleService-Info.plist`

If Firestore or Storage checks fail, capture the on-screen error text and stop the Phase 1 gate instead of treating the build as verified.

### Pass / fail criteria

Pass:

- Both iOS and Android `development` builds finish successfully with installable artifacts
- Both installed development clients launch on real devices without a crash or red error screen
- The verification screen reports a ready native Firebase app state
- The Firestore and Storage buttons complete without `app not initialized` errors
- Auth actions succeed and update the current session state
- The iOS verification checklist confirms background-audio registration is still present

Fail:

- Only web, Expo Go, or simulators were used
- Metro was not running and the Expo development client could not load the app
- The screen reports no default Firebase app or another config error
- Firestore or Storage checks fail with initialization errors
- The app crashes, shows a red screen, or loses the expected iOS background-audio registration

### Notes

- This test must run on a native Android and iOS Expo development client
- Web does not validate React Native Firebase native configuration
- Expo Go does not support this repo's native Firebase setup
