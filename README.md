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

## Deploy backend to Render

The FastAPI backend is deployed as a Render Web Service using the Python native runtime. Render reads `backend/.python-version` (3.13) and installs `uv` automatically because `backend/uv.lock` is present.

### One-time service setup (Render dashboard)

1. Create a **New > Web Service** and connect `Team-Neural-Forge/space-explorer-cheat`.
2. Set **Language** to `Python 3` and **Root Directory** to `backend`.
3. Set **Build Command** to `uv sync --frozen --no-dev`.
4. Set **Start Command** to `uv run --frozen --no-dev uvicorn app.main:app --host 0.0.0.0 --port $PORT`.
5. Set **Health Check Path** to `/health`.
6. Set the `CORS_ORIGINS` environment variable to your frontend origin(s), e.g. `https://<your-frontend>.vercel.app`.
7. Create the service — the first deploy becomes live.

### CORS

The backend reads allowed origins from the `CORS_ORIGINS` environment variable (comma-separated, defaults to `*`).


