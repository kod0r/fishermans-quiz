#!/usr/bin/env bash
set -euo pipefail

DEFAULT_BRANCH=$(git remote show origin | grep "HEAD branch" | awk '{print $NF}')

echo "[push-this] Target: $DEFAULT_BRANCH"

# 1. Stage everything — committed or not, tracked or untracked
git add -A

# 2. Commit if there are changes
if git diff --cached --quiet; then
  echo "[push-this] No changes to commit."
else
  git commit -m "wip: push-this $(date -u +%Y-%m-%dT%H:%M:%SZ)"
fi

# 3. Fetch remote
git fetch origin

# 4. Merge default-dev IN NAME ONLY — keeps 100% of local tree
git merge -s ours "origin/$DEFAULT_BRANCH" --no-edit

# 5. Push directly to default branch
git push origin "HEAD:$DEFAULT_BRANCH"

echo "[push-this] Done. Your local state is now on $DEFAULT_BRANCH."
