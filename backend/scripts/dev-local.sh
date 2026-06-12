#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
MONOREPO_ROOT="$(cd "$ROOT_DIR/.." && pwd)"

if [[ -f "$ROOT_DIR/.env" ]]; then
  set -a
  # shellcheck disable=SC1091
  source "$ROOT_DIR/.env"
  set +a
fi

FRONTEND_DIR="${FRONTEND_DIR:-"$MONOREPO_ROOT/frontend"}"
BACKEND_PORT="${PORT:-3000}"
FRONTEND_PORT="${FRONTEND_PORT:-5173}"
COMPOSE_SERVICES="${COMPOSE_SERVICES:-mysql redis}"
SKIP_DOCKER="${SKIP_DOCKER:-0}"
SKIP_MIGRATE="${SKIP_MIGRATE:-0}"

children=()

cleanup() {
  for pid in "${children[@]:-}"; do
    if kill -0 "$pid" >/dev/null 2>&1; then
      kill "$pid" >/dev/null 2>&1 || true
    fi
  done
}

on_exit() {
  cleanup
  wait >/dev/null 2>&1 || true
}

trap on_exit EXIT
trap 'exit 130' INT TERM

require_dir() {
  local path="$1"
  local label="$2"
  if [[ ! -d "$path" ]]; then
    echo "$label directory not found: $path" >&2
    exit 1
  fi
}

require_dir "$ROOT_DIR" "Backend"
require_dir "$FRONTEND_DIR" "Frontend"

if ! command -v docker >/dev/null 2>&1; then
  echo "docker is required for local MySQL/Redis (or set SKIP_DOCKER=1)" >&2
  exit 1
fi

if [[ "$SKIP_DOCKER" != "1" ]]; then
  echo "Starting Docker services: $COMPOSE_SERVICES"
  (
    cd "$MONOREPO_ROOT"
    docker compose up -d --wait $COMPOSE_SERVICES
  )
else
  echo "SKIP_DOCKER=1 — assuming MySQL/Redis are already available"
fi

if docker compose -f "$MONOREPO_ROOT/docker-compose.yml" ps --status running --services 2>/dev/null | grep -qx 'backend'; then
  echo "Stopping docker backend container to free port $BACKEND_PORT for local NestJS..."
  (
    cd "$MONOREPO_ROOT"
    docker compose stop backend
  ) || true
fi

if [[ "$SKIP_MIGRATE" != "1" ]]; then
  echo "Applying SQL migrations..."
  (
    cd "$ROOT_DIR"
    pnpm run migrate
  )
fi

echo "Starting backend on http://localhost:$BACKEND_PORT"
(
  cd "$ROOT_DIR"
  pnpm run start:dev
) &
children+=("$!")

echo "Starting frontend on http://localhost:$FRONTEND_PORT"
(
  cd "$FRONTEND_DIR"
  pnpm run dev -- --host 0.0.0.0 --port "$FRONTEND_PORT"
) &
children+=("$!")

echo
echo "Local dev is starting:"
echo "  Frontend: http://localhost:$FRONTEND_PORT"
echo "  Backend:  http://localhost:$BACKEND_PORT"
echo "  GraphQL:  http://localhost:$BACKEND_PORT/graphql"
echo "  Health:   http://localhost:$BACKEND_PORT/health"
echo
echo "Press Ctrl+C to stop frontend and backend."

wait
