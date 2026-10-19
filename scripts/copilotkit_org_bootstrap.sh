#!/usr/bin/env bash
# Operator: link local Braintona to your CopilotKit organization + write license.
# Interactive — opens browser for login. Run on magicPRObox (cockpit).
set -euo pipefail
cd "$(dirname "$0")/.."

echo "== CopilotKit org bootstrap (Braintona) =="
echo "Dashboard: https://dashboard.operations.copilotkit.ai"
echo

npx --yes copilotkit@latest whoami || true
echo
echo "1) Login — select your organization when prompted"
npx --yes copilotkit@latest login

echo
echo "2) Bind / create Intelligence project for this repo"
npx --yes copilotkit@latest project select

echo
echo "3) Issue license into ./.env (gitignored)"
npx --yes copilotkit@latest license create --write

echo
npx --yes copilotkit@latest whoami || true
npx --yes copilotkit@latest license list || true

if grep -q '^COPILOTKIT_LICENSE_TOKEN=.\+' .env 2>/dev/null; then
  echo
  echo "OK — COPILOTKIT_LICENSE_TOKEN present. Restart: npm run start"
  echo "Then: GET /api/copilotkit/status  and use Operator cockpit on /"
else
  echo
  echo "WARN — token still empty in .env; re-run license create --write"
  exit 1
fi
