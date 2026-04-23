#!/bin/bash
INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

if [[ "$FILE_PATH" == */package-lock.json ]]; then
    echo "Warning: package-lock.json should not be edited manually. Use npm install instead." >&2
    exit 1
fi

exit 0
