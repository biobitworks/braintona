#!/usr/bin/env bash
# Durable Braintona demo server starter.
#
# Problem: `npm run start` launched inline from an agent shell gets reaped
# when the shell session ends. This script detaches the server into its own
# session (setsid/nohup) so it survives agent-shell exit, and reparents to
# launchd (PPID=1) — safe across Studio/Pro thrash.
#
# Usage:
#   scripts/start_demo_server.sh          # start (no-op if already listening)
#   scripts/start_demo_server.sh --force  # kill existing + restart
#
set -euo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")/.."

PORT="${PORT:-8787}"
LOG_FILE="/tmp/braintona-studio.log"
PID_FILE="/tmp/braintona-studio.pid"

if [[ "${1:-}" == "--force" ]]; then
  if [[ -f "$PID_FILE" ]] && kill -0 "$(cat "$PID_FILE")" 2>/dev/null; then
    echo "Stopping existing server (PID $(cat "$PID_FILE"))..."
    kill "$(cat "$PID_FILE")" 2>/dev/null || true
    sleep 1
  fi
fi

if curl -s -o /dev/null -w '%{http_code}' --max-time 2 "http://127.0.0.1:${PORT}/api/health" 2>/dev/null | grep -q '^200$'; then
  echo "Server already listening on :${PORT} (healthy). Nothing to do."
  echo "  curl http://127.0.0.1:${PORT}/api/health"
  exit 0
fi

if [[ ! -f .env ]]; then
  echo "WARNING: .env not found in $(pwd) — server may miss sponsor keys." >&2
fi

echo "Starting Braintona server detached on :${PORT}..."

# setsid: new session, immune to parent shell/terminal hangup (SIGHUP).
# Falls back to nohup+disown if setsid is unavailable (e.g. some macOS shells).
if command -v setsid >/dev/null 2>&1; then
  setsid npm run start >"$LOG_FILE" 2>&1 < /dev/null &
else
  nohup npm run start >"$LOG_FILE" 2>&1 < /dev/null &
  disown
fi

SERVER_PID=$!
echo "$SERVER_PID" > "$PID_FILE"

# Wait for health check (up to ~10s).
for i in $(seq 1 20); do
  if curl -s -o /dev/null -w '%{http_code}' --max-time 1 "http://127.0.0.1:${PORT}/api/health" 2>/dev/null | grep -q '^200$'; then
    echo "Server up. PID ${SERVER_PID} (npm wrapper; check 'ps' for tsx child). Log: ${LOG_FILE}"
    curl -s "http://127.0.0.1:${PORT}/api/health"
    echo
    exit 0
  fi
  sleep 0.5
done

echo "Server did not become healthy within 10s. Check ${LOG_FILE}:" >&2
tail -n 40 "$LOG_FILE" >&2 || true
exit 1
