## 1. Human Checkpoint

- [ ] 1.1 Create or open the Firebase project in Firebase Console, enable Google Analytics, and register the iOS app with bundle ID `com.calmsounds.app` and the Android app with package `com.calmsounds.app`
- [ ] 1.2 Download `GoogleService-Info.plist` and `google-services.json`, then place both files at the project root beside `app.json`
- [ ] 1.3 Enable Firebase Authentication providers `Email/Password` and `Anonymous`, then create Firestore and Storage in test mode using the same region
- [ ] 1.4 Copy the seven `EXPO_PUBLIC_FIREBASE_*` values from Firebase Console into local `.env` using `.env.example` as the template
- [ ] 1.5 Verify the checkpoint locally with the plan commands, and if either native file is missing, malformed, or `.env` lacks the seven Firebase values, STOP and notify the user instead of continuing apply

## 2. Repository Implementation

- [ ] 2.1 Re-check that `google-services.json`, `GoogleService-Info.plist`, and local `.env` are present before editing code, and STOP and notify the user if the checkpoint is incomplete
- [ ] 2.2 Create `src/lib/firebase.ts` as the minimal RNFB re-export module for `auth`, `firestore`, `storage`, and `analytics`
- [ ] 2.3 Confirm `src/lib/firebase.ts` does not call `initializeApp()` or introduce any Firebase JS SDK initialization logic

## 3. Verification

- [ ] 3.1 Run `npx tsc --noEmit` and fix any TypeScript issues preventing `src/lib/firebase.ts` from compiling cleanly
- [ ] 3.2 Verify `src/lib/firebase.ts` exports `auth`, `firestore`, `storage`, and `analytics` exactly as the shared import surface for later phases
- [ ] 3.3 Re-run the native file and local `.env` checks after implementation, and if any checkpoint item no longer passes, STOP and notify the user rather than claiming the change is complete
