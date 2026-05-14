# Calm ASMR Sounds

## Firebase Config Review Guide

This repo includes a temporary auth test screen at `app/index.tsx` so reviewers can verify that the native Firebase configuration is working on a real Android or iOS development build.

### What this test proves

- The native Firebase app initializes successfully
- React Native Firebase Auth can connect to the configured Firebase project
- The committed `google-services.json` and `GoogleService-Info.plist` files are usable in a native build

### Before testing

- Make sure local dependencies are installed with `npm install`
- Make sure `.env` exists locally and is populated from `.env.example`
- Make sure `google-services.json` and `GoogleService-Info.plist` exist at the project root
- Do not use Expo Go for this test

### Build and install the development client

Use the EAS `development` profile because this project depends on native Firebase modules:

```bash
npx eas-cli build --platform android --profile development
```

Install the generated build on the test device.

### Start the app bundle server

Run Metro from the project root:

```bash
npm run start
```

If LAN networking from WSL does not work for the device, use tunnel mode instead:

```bash
npx expo start --tunnel
```

### Run the Firebase check

1. Open the installed development build on the mobile device.
2. Open the root screen, which is the temporary Firebase auth test surface.
3. Enter an email and password.
4. Tap `Create account` or `Sign in`.
5. Optionally tap `Sign in anonymously` to verify anonymous auth as well.
6. Confirm the on-screen session state updates with the authenticated user information.

### Verify in Firebase Console

Open Firebase Console and check:

- `Authentication > Users`: the created user or anonymous user should appear

It is normal for this test not to create anything in Firestore or Storage, because the screen only exercises Firebase Auth.

### Expected failures

If the screen reports that no default Firebase app is available, the installed development build is stale relative to the current native config. Rebuild and reinstall the dev client after changes to:

- `app.json`
- `google-services.json`
- `GoogleService-Info.plist`

### Notes

- This test must run on a native Android or iOS development build
- Web does not validate React Native Firebase native configuration
- Expo Go does not support this repo's native Firebase setup
