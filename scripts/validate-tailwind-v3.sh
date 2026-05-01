#!/usr/bin/env sh
# Validate that src/components/ui does not contain Tailwind v4-only class patterns.
# Project uses Tailwind v3.4.19 — v4 syntax is silently stripped and breaks components.

PATTERNS='--spacing\(|has-data-\[|has-focus:|\*\*:|in-data-\[|\[_&\]|group-has-data-\[|nth-last-2:|field-sizing-content|origin-top-center|outline-hidden|w-\(--|h-\(--|max-h-\(--|min-h-\(--|origin-\(--'

FILES=$(grep -rlnE "$PATTERNS" src/components/ui/ 2>/dev/null || true)

if [ -n "$FILES" ]; then
  echo "❌ Invalid Tailwind v4 patterns found in src/components/ui:"
  echo "$FILES" | while read -r file; do
    echo "  $file"
    grep -nE "$PATTERNS" "$file" | sed 's/^/    /'
  done
  echo ""
  echo "Fix these before committing. See issue #305 for context."
  exit 1
fi

echo "✅ Tailwind v3 class validation passed."
