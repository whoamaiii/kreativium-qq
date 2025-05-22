## Brief overview
These guidelines specify the preferred testing strategy for React components.

## Testing Requirements
- **Mandatory Tests for New Components:** Every new React component must be accompanied by tests written using Vitest and React Testing Library.
  - *Trigger:* Whenever a new React component is created or significantly modified.
  - *Example:* For a new `Button` component, create a `Button.test.tsx` file with tests covering its rendering, interactions (e.g., click events), and accessibility.
