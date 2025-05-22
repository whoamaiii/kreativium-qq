## Brief overview
These guidelines specify the preferred organization and naming convention for React hooks within the project.

## Hook Organization and Naming
- **Directory Structure:** Custom React hooks should be grouped under the `src/hooks` directory.
  - *Trigger:* When creating any new custom React hook.
  - *Example:* A hook for managing user authentication might be located at `src/hooks/useAuth.ts`.
- **Naming Convention:** All custom React hook names must be prefixed with `use`.
  - *Trigger:* When naming any new custom React hook.
  - *Example:* `useFormValidation`, `useFetchData`, `useLocalStorage`.
