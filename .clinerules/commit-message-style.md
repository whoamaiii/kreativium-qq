## Brief overview
These guidelines specify the preferred style for commit messages to ensure consistency and clarity in the project's version history.

## Commit Message Format
- **Conventional Commits:** Follow the Conventional Commits specification. The commit message should be structured as follows:
  `feat(scope): summary`
  - **Type:** `feat` (for new features), `fix` (for bug fixes), `docs` (for documentation changes), `style` (for code style changes), `refactor` (for code refactoring), `test` (for adding or modifying tests), `chore` (for build process or auxiliary tools changes).
  - **Scope:** (Optional) The scope should be the name of the npm package affected (as perceived by the person reading the changelog generated from the commit messages).
  - **Summary:** A concise description of the change.
  - *Example:* `feat(api): add endpoint for user authentication`
  - *Example:* `fix(ui): correct button alignment on mobile`
