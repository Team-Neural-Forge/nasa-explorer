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
