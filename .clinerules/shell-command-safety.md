## Brief overview
These guidelines specify the preferred approach for executing potentially destructive shell commands, ensuring user control and preventing accidental data loss or system changes.

## Shell Command Execution
- **Explicit Approval for Destructive Commands:** Always ask for explicit user approval before running any shell command that could be destructive or have significant side effects. This includes, but is not limited to, commands like `rm` (delete files/directories), `git reset --hard` (discard uncommitted changes and reset branch), `prisma migrate reset` (reset database and migrations), or any other command that modifies or deletes data, or alters system configurations.
  - *Trigger:* When a task requires executing a command that falls into the destructive or impactful category.
  - *Example:* Before running `rm -rf ./old-build`, ask the user: "Are you sure you want to delete the './old-build' directory? This action cannot be undone."
