# Project Notes

- `.opencode/rules/` is loaded automatically. Keep this file focused on repo-specific workflow notes.
- Install dependencies with `npm install`.
- Create a local `.env` from `.env.example` before starting the app, and fill in the required values.
- For branches that include Firebase native setup, make sure `google-services.json` and `GoogleService-Info.plist` are present at the project root.
- Start the local Metro server with `npm run start`.
- This project uses native Firebase modules and `expo-dev-client`; do not rely on Expo Go for device testing.
- Use the EAS `development` profile when a native rebuild is needed.
