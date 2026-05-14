# Project Notes

- `vertical-slice-structure`: see `.opencode/rules/vertical-slice-structure.md`.
  Use this when creating or reorganizing files so code is placed by feature first, then by `data`, `domain`, or `ui`, with tests nested under the folder they cover.
- `openspec-decision-clarification`: see `.opencode/rules/openspec-decision-clarification.md`.
  Use this when creating or updating OpenSpec plans or change artifacts so unresolved decisions are clarified immediately instead of assumed, and clearly bad options are called out before proceeding.
- `git-commit-grouping-and-order`: see `.opencode/rules/git-commit-grouping-and-order.md`.
  Use this whenever creating git commits so unrelated work is split appropriately, and commits are ordered chronologically with dependencies committed first.
- `.opencode/rules/` is loaded automatically. Keep this file focused on repo-specific workflow notes.
- Install dependencies with `npm install`.
- Create a local `.env` from `.env.example` before starting the app, and fill in the required values.
- For branches that include Firebase native setup, make sure `google-services.json` and `GoogleService-Info.plist` are present at the project root.
- Start the local Metro server with `npm run start`.
- This project uses native Firebase modules and `expo-dev-client`; do not rely on Expo Go for device testing.
- Use the EAS `development` profile when a native rebuild is needed.
