# Frontend (Angular)

This is the **Angular** app for Assignment 2. Full setup (backend + env vars + troubleshooting) is in the **[root README](../README.md)**.

## Quick commands

From this folder (`frontend/`):

| Command | Action |
|---------|--------|
| `npm install` | Install dependencies (run once, or after pulling changes) |
| `npm start` | Dev server → **http://localhost:4200** (`ng serve` with proxy to the API) |
| `npm run build` | Production build → output under `dist/` |

**Important:** Start the **backend** (`../backend`, port **4000**) before using login and employees. The dev server proxies `/graphql` to the backend (`proxy.conf.json`).

## Tech

- Angular, Angular Material, Apollo Client, GraphQL file uploads (`apollo-upload-client`)
