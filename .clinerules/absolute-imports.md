## Brief overview
These guidelines specify the preferred method for handling module imports within the project, promoting consistency and maintainability.

## Import Style
- **Absolute Imports:** Always use absolute imports for modules within the project, starting with `@/`. These paths should be configured and resolved via the `tsconfig.json` file.
  - *Trigger:* When importing any local modules, components, utilities, or other project files.
  - *Example:* Instead of `import MyComponent from '../../components/MyComponent';`, use `import MyComponent from '@/components/MyComponent';`.
  - *Configuration:* Ensure that `tsconfig.json` includes the necessary `paths` and `baseUrl` configuration to support `@/*` imports. For example:
    ```json
    {
      "compilerOptions": {
        "baseUrl": ".",
        "paths": {
          "@/*": ["src/*"]
        }
      }
    }
