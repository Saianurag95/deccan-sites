# Web

React frontend plus Hono API for the DC Attendance Portal.

## Local Run

```sh
npm install --workspaces=false
npm run dev -- --host 127.0.0.1 --port 4200
```

## Build

```sh
npm run build
```

## Deploy

This package is ready for Vercel. Configure the Vercel project root as `dc-attendance/packages/web` and set the required environment variables.
