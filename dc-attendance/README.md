# DC Attendance Portal

Company attendance and evaluation portal built as a monorepo with:

- Web: React, Vite, Hono API routes, Better Auth, Drizzle ORM
- Database: Supabase Postgres
- Mobile: Expo / React Native
- Desktop: Electron shell

## Project Structure

```text
.env                         Local secrets, gitignored
.env.template                Required environment variable names
packages/
  web/                       Web app and API
    api/[...route].ts        Vercel serverless API adapter
    src/api/                 Hono API, auth, database schema, routes
    src/web/                 React app
    vite.config.ts           Local dev config
    vercel.json              Vercel deployment config
  mobile/                    Expo app
  desktop/                   Electron shell
```

## Environment Variables

Create `.env` from `.env.template` and fill:

```text
SUPABASE_DATABASE_URL=
BETTER_AUTH_SECRET=
ADMIN_PASSWORD=
WEBSITE_URL=
```

Keep `.env` private. Do not commit real database URLs, passwords, or API keys.

## Local Development

```sh
cd packages/web
npm install --workspaces=false
npm run dev -- --host 127.0.0.1 --port 4200
```

Open:

```text
http://127.0.0.1:4200/login
```

## Database

```sh
cd packages/web
npm run db:push
npm run db:generate
npm run db:migrate
npm run db:studio
```

## Deployment

Deploy `packages/web` on Vercel. Set the same environment variables in Vercel project settings before deploying.
