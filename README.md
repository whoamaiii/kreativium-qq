# Kreativium QQ

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Prerequisites

This project uses **pnpm** as the package manager. Please ensure you have it installed:

```bash
npm install -g pnpm
```

## Getting Started

1. Clone the repository
2. Copy the environment variables:
   ```bash
   cp .env.example .env.local
   ```
3. Fill in the required environment variables in `.env.local`
4. Install dependencies:
   ```bash
   pnpm install
   ```
5. Run the development server:
   ```bash
   pnpm dev
   ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Available Scripts

- `pnpm dev` - Start the development server
- `pnpm build` - Build for production
- `pnpm start` - Start the production server
- `pnpm test` - Run tests
- `pnpm test:ui` - Run tests with UI
- `pnpm e2e` - Run end-to-end tests
- `pnpm lint` - Run linting
- `pnpm prisma:seed` - Seed the database
- `pnpm db:reset` - Reset and reseed the database

## Project Structure

This project uses:
- **Next.js 15** with App Router
- **TypeScript** for type safety
- **Prisma** as the ORM
- **PostgreSQL** as the database
- **Tailwind CSS** for styling
- **Vitest** for unit testing
- **Playwright** for E2E testing

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
