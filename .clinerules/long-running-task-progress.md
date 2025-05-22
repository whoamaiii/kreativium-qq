## Brief overview
These guidelines specify the requirement for providing progress updates for long-running subtasks.

## Task Progress Indication
- **Progress Logs for Long Subtasks:** For any subtask anticipated to take longer than 10 seconds to complete, provide progress log updates in the chat. This helps maintain transparency and keeps the user informed about ongoing operations.
  - *Trigger:* When initiating a subtask that is expected to exceed 10 seconds (e.g., complex computations, large file operations, lengthy API calls).
  - *Example:* If a data processing task is running, periodically update with messages like "Processing batch 1 of 10...", "50% complete...", "Finalizing results...".
