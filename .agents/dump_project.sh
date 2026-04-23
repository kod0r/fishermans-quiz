#!/bin/bash
# Generates project_dump.txt for context sharing between AI agents
# Usage: ./.agents/dump_project.sh

PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUTPUT="$PROJECT_ROOT/project_dump.txt"

echo "# Project Dump — $(date -Iseconds)" > "$OUTPUT"
echo "" >> "$OUTPUT"
echo "## MASTER.md" >> "$OUTPUT"
cat "$PROJECT_ROOT/.agents/MASTER.md" >> "$OUTPUT"
echo "" >> "$OUTPUT"
echo "---" >> "$OUTPUT"
echo "" >> "$OUTPUT"
echo "## Source Files" >> "$OUTPUT"

find "$PROJECT_ROOT/src" -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.css" \) | sort | while read -r file; do
    rel_path="${file#$PROJECT_ROOT/}"
    echo "" >> "$OUTPUT"
    echo "### $rel_path" >> "$OUTPUT"
    echo '```' >> "$OUTPUT"
    cat "$file" >> "$OUTPUT"
    echo '```' >> "$OUTPUT"
done

echo "" >> "$OUTPUT"
echo "---" >> "$OUTPUT"
echo "" >> "$OUTPUT"
echo "## Config Files" >> "$OUTPUT"

for file in package.json vite.config.ts vitest.config.ts tsconfig.json tailwind.config.js eslint.config.js; do
    if [ -f "$PROJECT_ROOT/$file" ]; then
        echo "" >> "$OUTPUT"
        echo "### $file" >> "$OUTPUT"
        echo '```' >> "$OUTPUT"
        cat "$PROJECT_ROOT/$file" >> "$OUTPUT"
        echo '```' >> "$OUTPUT"
    fi
done

echo "Dump written to: $OUTPUT"
