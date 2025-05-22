## Brief overview
These guidelines specify how to handle environment secrets and API keys to ensure security.

## Security Best Practices
- **Environment Variables:** Always store sensitive information, such as API keys, database credentials, or other secrets, in environment variables (e.g., `process.env.API_KEY`).
- **No Hard-coding:** Never hard-code secrets directly into the source code. This prevents accidental exposure of sensitive data in version control or client-side bundles.
  - *Trigger:* When working with API keys, database connection strings, or any other confidential credentials.
  - *Example:* Instead of `const apiKey = "your_secret_key";`, use `const apiKey = process.env.YOUR_API_KEY;`.
