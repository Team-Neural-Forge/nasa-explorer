# NASA Explorer

**NASAExplorer** — an interactive, physics-based space exploration game for the [NASA Space Apps Challenge 2026](https://www.spaceappschallenge.org/2026/) "Space Mission Design Game" challenge.

## Summary

NASA Explorer is an interactive, physics-based space exploration game built for the NASA Space Apps Challenge 2026 "Space Mission Design Game" challenge. Players step into the role of a NASA astronaut and journey from an Earth launch pad through low Earth orbit, the Moon, and Mars, branching onward to Europa, Enceladus, and a colony on Mars. Along the way the game quietly introduces new movement abilities — jetpack flight, swimming, and more — while environmental interactions surface real NASA science. A mission-store menu lets players spend a slowly growing budget on scientific instruments, spacecraft upgrades, and launch vehicles, so every purchase reflects the trade-offs between power, mass, orbit, and budget that real mission designers face. With melodic music, physics-driven environments, and a light quiz between journeys, NASA Explorer makes mission design feel like an adventure.

## Links

| Item | Link |
|---|---|
| Play the game (Vercel) | _TODO: add deployment URL_ |
| Demo video (< 30 sec) | _TODO: add video URL_ |
| Slides (≤ 7 slides) | _TODO: add slides URL_ |
| Backend API (Render) | _TODO: add API URL_ |
| Source code | https://github.com/Team-Neural-Forge/nasa-explorer |

> _TODO: add a gameplay screenshot to `docs/assets/` and embed it here._

## Features

- **Play as a NASA astronaut** on a journey from Earth to the outer solar system.
- **Controls revealed gradually** — jetpack flight, swimming, and more are introduced from journey to journey.
- **Physics-based movement and environments** powered by `matter.js`.
- **Mission-design store** with scientific instruments, spacecraft upgrades, and launch vehicles.
- **Budget economy** that grows over time, encouraging exploration between purchases.
- **Launch control** — players tune launch power and direction, and choose their launch vehicle.
- **Environmental storytelling** — moving through the world triggers NASA facts and mission information.
- **Quiz between journeys** to reinforce what players have learned.
- **Melodic soundtrack** and a simple yet polished environment-art style.
- **Responsive UI** across desktop and mobile.

## The journey

Rocket launch → Low Earth orbit → Moon → Mars → { Living on Mars · Europa · Enceladus }

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
| [Game design](docs/game_design.md) | Concept, controls, physics, art, audio, and core loop |
| [Journey map](docs/journey_map.md) | Stage-by-stage flow and diagram |
| [Challenge alignment](docs/challenge_alignment.md) | How the game maps to the mission-design dimensions |
| [Technical architecture](docs/technical_architecture.md) | Stack, diagrams, tooling, and deployment |
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

The frontend is deployed as a static site on Vercel using the GitHub integration.

1. Create a **New Project** and import `Team-Neural-Forge/nasa-explorer`.
2. Set **Root Directory** to `frontend-web` (the repo root has no `package.json`).
3. Set **Framework Preset** to **Other** (there is no Rsbuild preset).
4. Set **Node.js Version** to **22.x**.
5. Deploy — the first deployment becomes Production.

Build settings come from `frontend-web/vercel.json` (`pnpm build` → `dist`, SPA fallback rewrite). Merging to `main` triggers a Production deployment; each pull request gets its own Preview URL.

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

_TODO: add team name and members._

## License

_TODO: add license._
