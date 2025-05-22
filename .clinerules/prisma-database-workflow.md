## Brief overview
These guidelines specify the preferred workflow for managing database schemas and migrations using Prisma, particularly when working with SQLite.

## Prisma Workflow
- **Generate Migrations:** Always generate Prisma migrations when the `schema.prisma` file is changed. This ensures that database schema changes are tracked and applied systematically.
  - *Trigger:* Any modification to the `schema.prisma` file.
  - *Example:* After adding a new model or field to `schema.prisma`, run `npx prisma migrate dev --name your-migration-name` to generate and apply the migration.
- **Avoid Manual SQLite Edits:** Never directly edit the SQLite database file by hand. All schema changes should be managed through Prisma migrations to maintain consistency and prevent data corruption.
  - *Trigger:* When considering a change to the database structure or data that isn't managed via the application's data access layer.
