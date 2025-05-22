## Brief overview
These guidelines specify how to handle ESLint errors encountered during development.

## ESLint Error Handling
- **Address or Document:** When an ESLint error is encountered, either fix the underlying code to comply with the rule or add a comment explaining why the rule is being ignored in that specific instance.
  - *Trigger:* An ESLint error is reported by the linter.
  - *Example (Fixing):* If ESLint flags `var` for `no-var`, change it to `let` or `const`.
  - *Example (Ignoring with comment):*
    ```javascript
    // eslint-disable-next-line no-console -- Logging is intentional here for debugging
    console.log('Debug information');
