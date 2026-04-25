#!/usr/bin/env bash
set -euo pipefail

BRANCH=$(git branch --show-current)
DEFAULT_BRANCH=$(git remote show origin | grep "HEAD branch" | awk '{print $NF}')

echo "[push-this] Branch: $BRANCH"
echo "[push-this] Default: $DEFAULT_BRANCH"

# 1. Stage everything — committed or not, tracked or untracked
git add -A

# 2. Commit if there are changes, otherwise amend to keep history clean
if git diff --cached --quiet; then
  echo "[push-this] No changes to commit."
else
  git commit -m "wip: push-this $(date -u +%Y-%m-%dT%H:%M:%SZ)"
fi

# 3. Fetch remote
git fetch origin

# 4. Merge default branch IN NAME ONLY — keeps 100% of local tree
if git merge-base --is-ancestor "origin/$DEFAULT_BRANCH" HEAD 2>/dev/null; then
  echo "[push-this] Already up to date with $DEFAULT_BRANCH."
else
  git merge -s ours "origin/$DEFAULT_BRANCH" --no-edit
  echo "[push-this] Merged origin/$DEFAULT_BRANCH (ours strategy)."
fi

# 5. Force push
git push --force origin "$BRANCH"
echo "[push-this] Pushed to origin/$BRANCH"

# 6. Find open PR for this branch and merge it
PR_URL=$(gh pr view "$BRANCH" --json url --jq '.url' 2>/dev/null || true)
if [ -n "$PR_URL" ]; then
  echo "[push-this] PR found: $PR_URL"
  gh pr merge "$BRANCH" --squash --delete-branch=false
  echo "[push-this] PR merged."
else
  echo "[push-this] No open PR found for $BRANCH. Pushed only."
fi

echo "[push-this] Done."
