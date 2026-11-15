# NASA Explorer

**NASAExplorer** — an interactive, physics-based space exploration game for the [NASA Space Apps Challenge 2026](https://www.spaceappschallenge.org/2026/) "Space Mission Design Game" challenge.

## Summary

NASA Explorer is an interactive, physics-based space exploration game built for the NASA Space Apps Challenge 2026 "Space Mission Design Game" challenge. The game opens on a live menu — the world behind it is already the game — then the player assembles a rocket on Earth, balancing mass, thrust, and budget before launch. Flight is fully simulated: the astronaut controls rotation, power, and staging, can leave and re-enter the rocket in space, and travels real distances that take real time, accelerated up to ×100,000,000. Arrival is dangerous — land within safe speed and angle limits or crash and learn why. On every body the player can switch between a character-level view and a whole-planet view that reveals what humanity has discovered on the far side, while cited NASA science and optional quizzes reinforce the journey. With melodic music and physics-driven environments, NASA Explorer makes mission design feel like an adventure.

## Links

| Item | Link |
|---|---|
| Play the game (Vercel) | https://nasa-explorer-8s6l.vercel.app |
| Demo video (< 30 sec) | _TODO: add video URL_ |
| Slides (≤ 7 slides) | _TODO: add slides URL_ |
| Backend API (Render) | https://nasa-explorer-cpd9.onrender.com/health |
| Source code | https://github.com/Team-Neural-Forge/nasa-explorer |

> _TODO: add a gameplay screenshot to `docs/assets/` and embed it here._

## Features

- **Live menu** — menu options sit over the running game world; starting the game retires the menu instead of loading a new scene.
- **One persistent sandbox** — after Start Game the world never swaps; the astronaut enters the same rocket on the pad and launches it. Phase changes are smooth transitions in the same canvas. Restart on Earth explicitly starts a fresh mission.
- **Play as a NASA astronaut** on a journey from Earth to the outer solar system.
- **Earth-only rocket assembly** — choose a launch vehicle, stages, and instruments, balancing mass, thrust, Δv, and budget. The design locks at launch.
- **Full physics simulation** — launch, orbit, interplanetary cruise, EVA, rovers, and landing are numerically integrated, not scripted.
- **Realistic travel time with time warp** — accelerate from real time up to ×100,000,000 while the real coordinates keep simulating.
- **Exit and re-enter the rocket** — including during spaceflight.
- **Careful landings** — arrive within safe speed and angle limits or crash; the game explains why.
- **Two planet views** — character-level and whole-planet, revealing humanity's discoveries on the far side.
- **Cited NASA science** — mission-control coaching, science cards, and optional per-body quizzes, all sourced.
- **Controls revealed gradually** — jetpack flight, swimming, and more are introduced from journey to journey.
- **Responsive UI** across desktop and mobile, with status clearly marked: multiplayer and login are stubs in this build.

## The journey

Live menu → Rocket assembly (Earth) → Launch → Low Earth orbit → Moon → Mars → { Living on Mars · Europa · Enceladus }

See [`docs/journey_map.md`](docs/journey_map.md) for the full stage breakdown and diagram.

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + TypeScript |
| Bundler | Rsbuild (Rspack) |
| Animation & interactivity | React hooks, GSAP, p5.js, matter.js, keydrown |
| Backend | FastAPI (Python 3.13) |
| Language tooling | pnpm (JS), uv (Python) |
| Quality | Biome, Ruff, ty, GitHub Actions CI |
| Hosting | Vercel (frontend), Render (backend) |
| Visual artwork | Nano Banana 2.1, Krita, Figma / Lovable |
| Music & sound | Suno |
| AI assistants | OpenCode, Kilocode, Claude Code |
| Presentation | Pixaverse, LibreOffice + Nelson MCP |

## Project structure

```text
.
├── frontend-web/          # React + TypeScript + Rsbuild game client
├── backend/               # FastAPI API (health check, future game services)
├── docs/                  # Design, submission, and reference documentation
├── docker-compose.yml     # Production-style stack (frontend :3000, backend :8000)
├── justfile               # Common dev commands
└── .github/workflows/     # CI (lint, format, typecheck, security)
```

## Documentation

| Document | Description |
|---|---|
| [Project overview](docs/project_overview.md) | Submission summary, benefits, impact, and creativity |
| [Game design](docs/game_design.md) | Concept, live menu, assembly, controls, time and scale, art, audio |
| [Journey map](docs/journey_map.md) | Stage-by-stage flow and diagram |
| [Flight model](docs/flight_model.md) | Simulation, integrator, time warp, landing and failure spec |
| [Learning design](docs/learning_design.md) | Teaching approach, mission-control coaching, science cards, quizzes |
| [Challenge alignment](docs/challenge_alignment.md) | How the game maps to the mission-design dimensions |
| [Technical architecture](docs/technical_architecture.md) | Stack, engine architecture, diagrams, tooling, and deployment |
| [NASA data sources](docs/nasa_data_sources.md) | NASA and partner data used (compulsory) |
| [AI usage disclosure](docs/ai_usage_disclosure.md) | Image, audio, code, and data AI usage |
| [Submission checklist](docs/submission_checklist.md) | Deliverables required by the challenge |
| [Timeline](docs/timeline.md) | Build schedule and future roadmap |

## Getting started

### Prerequisites

- Node.js 22 and pnpm 12
- Python 3.13 and [uv](https://docs.astral.sh/uv/)
- [just](https://github.com/casey/just) (optional, for the recipes below)

### Setup and run

```sh
just setup   # install frontend + backend dependencies, create .env
just run     # start frontend (http://localhost:3000) and backend (http://localhost:8000)
```

Without `just`:

```sh
cd frontend-web && pnpm install && pnpm dev
cd backend && uv sync && uv run uvicorn app.main:app --reload
```

### Checks

```sh
just check   # format + lint + typecheck for both apps
just lint    # read-only lint (matches CI)
```

## Deployment

### Frontend — Vercel

The frontend is deployed as a static site on Vercel.

1. Create a **New Project** and import `Team-Neural-Forge/nasa-explorer`.
2. Set **Root Directory** to `frontend-web` (the repo root has no `package.json`).
3. Set **Framework Preset** to **Other** (there is no Rsbuild preset).
4. Set **Node.js Version** to **22.x**.
5. Deploy — the first deployment becomes Production.

Build settings come from `frontend-web/vercel.json` (`pnpm build` → `dist`, SPA fallback rewrite). Production deployments are run by the `Deploy Frontend` GitHub Actions workflow after CI passes on `main`.

### Automatic deploy (GitHub Actions)

The `Deploy Frontend` workflow (`.github/workflows/deploy-frontend.yml`) deploys production after the CI workflow succeeds on `main`. It can also be started manually from the Actions tab.

Required repository configuration:

- Secret `VERCEL_TOKEN` — a Vercel account token with access to the project.
- Variables `VERCEL_ORG_ID` and `VERCEL_PROJECT_ID` — taken from the Vercel project link (`.vercel/project.json`).

The workflow runs `vercel deploy --prod` from the repository root because the Vercel project's Root Directory is `frontend-web`; deploying from inside `frontend-web` fails with "Root Directory does not exist".

### Backend — Render

The FastAPI backend is deployed as a Render Web Service using the Python native runtime. Render reads `backend/.python-version` (3.13) and installs `uv` automatically because `backend/uv.lock` is present.

1. Create a **New > Web Service** and connect `Team-Neural-Forge/nasa-explorer`.
2. Set **Language** to `Python 3` and **Root Directory** to `backend`.
3. Set **Build Command** to `uv sync --frozen --no-dev`.
4. Set **Start Command** to `uv run --frozen --no-dev uvicorn app.main:app --host 0.0.0.0 --port $PORT`.
5. Set **Health Check Path** to `/health`.
6. Set the `CORS_ORIGINS` environment variable to your frontend origin(s), e.g. `https://<your-frontend>.vercel.app`.
7. Create the service.

The backend reads allowed origins from `CORS_ORIGINS` (comma-separated, defaults to `*`).

## AI and MCP tooling

This project is built with AI assistance (OpenCode, Kilocode, Claude Code) and MCP integrations for document and design tooling. See [`docs/ai_usage_disclosure.md`](docs/ai_usage_disclosure.md) for the full disclosure.

## Team

| Name | NASA Space Apps | Country | Role |
|---|---|---|---|
| Mohammad Hisan | mohammadabkarinh | United States | Team Owner |
| Soo Zhan Thong | szt_00 | Malaysia | Member |
| Bulbul Hassan | supernova77 | India | Member |
| Harshit Bansal | survivoro | India | Member |

## License

MIT — see [LICENSE](LICENSE).
