#!/usr/bin/env bash
set -euo pipefail
REPO_DIR="/opt/Portfolio"
REMOTE="${1:-origin}"
BRANCH="${2:-main}"
LOGFILE="$REPO_DIR/deploy.log"
exec &> >(tee -a "$LOGFILE")
echo "---- Deploy started: $(date -u +'"'%Y-%m-%dT%H:%M:%SZ'"') ----"
cd "$REPO_DIR"
# Ensure working tree is clean-ish
if [ -d .git ]; then
  git fetch "$REMOTE"
  # Use reset to ensure workspace matches remote (safe if repo used only for deployment)
  git reset --hard "$REMOTE/$BRANCH"
else
  echo "No .git directory in $REPO_DIR"
  exit 1
fi
# Build and start (run as user in docker group; no sudo to preserve SSH identity)
docker compose build --parallel
docker compose up -d --remove-orphans
docker image prune -f || true
echo "---- Deploy finished: $(date -u +'"'%Y-%m-%dT%H:%M:%SZ'"') ----"
