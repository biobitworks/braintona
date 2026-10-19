#!/usr/bin/env bash
# Poll for phone-dropped CopilotKit token and ingest + restart server.
set -euo pipefail
cd "$(dirname "$0")/.."
DROP=".planning/private/copilotkit_license.token"
echo "Watching $DROP (Ctrl+C to stop)…"
while true; do
  if [[ -f "$DROP" ]] && [[ -s "$DROP" ]]; then
    echo "Drop detected — ingesting…"
    bash scripts/ingest_copilotkit_token.sh || true
    # restart server on 8787 if running
    pid="$(lsof -tiTCP:8787 -sTCP:LISTEN 2>/dev/null || true)"
    if [[ -n "${pid:-}" ]]; then
      kill "$pid" 2>/dev/null || true
      sleep 1
    fi
    set -a
    # shellcheck disable=SC1091
    source .env
    set +a
    nohup npm run start > /tmp/braintona-server.log 2>&1 &
    sleep 2
    curl -sS http://127.0.0.1:8787/api/health | python3 -c 'import sys,json; d=json.load(sys.stdin); print("health.copilotkit", d.get("keys",{}).get("copilotkit"))'
    # seal a demo operator+ai turn with license_present
    curl -sS -X POST http://127.0.0.1:8787/api/copilotkit/seal-turn -H 'content-type: application/json' \
      -d '{"text":"Operator: CopilotKit license live — seal custody cockpit turn","actor":"operator"}' | python3 -c 'import sys,json; d=json.load(sys.stdin); print("seal", d.get("ok"), "license", (d.get("thread") or {}).get("license_present"))'
    exit 0
  fi
  sleep 3
done
