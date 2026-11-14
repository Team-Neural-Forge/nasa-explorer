# One-command project setup
setup: setup_frontend setup_backend
    test -f .env || cp .env.example .env

setup_frontend:
    cd frontend-web && pnpm install

setup_backend:
    cd backend && uv sync

# Run dev servers
frontend:
    cd frontend-web && pnpm dev

backend:
    cd backend && uv run uvicorn app.main:app --reload

[parallel]
run: frontend backend

# Format (apply fixes)
format_frontend:
    cd frontend-web && pnpm check:fix

format_backend:
    cd backend && uv run ruff format .

[parallel]
format: format_frontend format_backend

# Lint (read-only check, matches CI)
lint_frontend:
    cd frontend-web && pnpm check

lint_backend:
    cd backend && uv run ruff check .

[parallel]
lint: lint_frontend lint_backend

# Format + lint + typecheck in one go (local fix-and-verify)
check_frontend:
    cd frontend-web && pnpm check:fix && pnpm check && pnpm typecheck

check_backend:
    cd backend && uv run ruff format . && uv run ruff check . && uv run ty check

# NASA data snapshots (offline)
data_build:
    python3 scripts/build_space_data.py

data_check:
    python3 scripts/validate_space_data.py

[parallel]
check: check_frontend check_backend data_check
