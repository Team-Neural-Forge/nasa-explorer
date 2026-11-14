# NASA Explorer Cheat

Space Explorer project with a React (Rsbuild) frontend and a FastAPI backend.

## Project layout

- `frontend-web/` — React 19 + TypeScript, built with Rsbuild
- `backend/` — FastAPI app managed with uv
- `docker-compose.yml` — production-style stack (frontend on `:3000`, backend on `:8000`)
- `justfile` — common dev commands (`just setup`, `just run`, `just check`)

## Deploy to Vercel

The frontend is deployed as a static site on Vercel using the GitHub integration.

### One-time project setup (Vercel dashboard)

1. Create a **New Project** and import `Team-Neural-Forge/space-explorer-cheat`.
2. Set **Root Directory** to `frontend-web` (the repo root has no `package.json`).
3. Set **Framework Preset** to **Other** (there is no Rsbuild preset).
4. Set **Node.js Version** to **22.x**.
5. Deploy — the first deployment becomes Production.

Build settings come from `frontend-web/vercel.json` (`pnpm build` → `dist`, SPA fallback rewrite).

### Deployments

- Merging to `main` triggers a Production deployment.
- Each pull request gets its own Preview URL.

## Deploy backend to Vercel

The FastAPI backend is deployed as a second Vercel project from the same repo. Vercel auto-detects FastAPI and uses `uv` with `backend/uv.lock`; no Dockerfile is involved on Vercel.

### One-time project setup (Vercel dashboard)

1. Create a **New Project** and import `Team-Neural-Forge/space-explorer-cheat`.
2. Set **Root Directory** to `backend`.
3. Leave the framework preset on **Auto** (it detects FastAPI), and leave install/build/output settings at their defaults.
4. Deploy — the first deployment becomes Production.

The function duration and region are set in `backend/vercel.json` (60s max, `iad1` / US East).

### CORS

The backend reads allowed origins from the `CORS_ORIGINS` environment variable (comma-separated, defaults to `*`). Set it in the Vercel project's environment variables when the frontend starts calling the API.

