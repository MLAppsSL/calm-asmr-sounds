# Vertical Slice Structure

Applies when creating, moving, or organizing project files and folders.

Rule:
- Organize application code by vertical slice first. Put each file under the specific feature it belongs to, or under `shared/` only when the file is used by more than one feature.
- Inside every feature and inside `shared/`, organize code by the three layers: `data/`, `domain/`, and `ui/`.
- After choosing the feature and layer, place the file inside a type-specific subfolder before creating the file. For example, UI view components belong in `ui/views/`.
- Tests must live inside a `tests/` subfolder under the folder they validate. For example, tests for UI views belong in `ui/views/tests/`.
- Files that do not belong to any feature or to `shared/`, such as workspace-level configuration like `package.json`, should remain outside the vertical-slice structure.

Notes:
- Decide placement in this order: feature or `shared/`, then layer, then type-specific subfolder, then file.
- Keep the rule narrow: use `shared/` only for genuinely cross-feature code, not as a default location.
