#!/bin/bash
INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

if [[ "$FILE_PATH" == */public/data/* ]] || [[ "$FILE_PATH" == */public/images/* ]]; then
    echo "Blocked: public/data/ and public/images/ contain readonly quiz data. Do not modify." >&2
    exit 2
fi

exit 0
