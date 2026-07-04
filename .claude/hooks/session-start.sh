#!/bin/bash
set -euo pipefail

if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "$CLAUDE_PROJECT_DIR"

pnpm install

pnpm --filter @immoexpert/db exec prisma generate

pip3 install -r apps/api/requirements.txt
