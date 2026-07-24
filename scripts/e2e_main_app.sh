#!/usr/bin/env bash
# End-to-end: health → graph → pipeline ×2 → graph growth → voice-origin → latest
set -euo pipefail
BASE="${BASE_URL:-http://127.0.0.1:8787}"
TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT
PASS=0
FAIL=0

check() {
  local name="$1"
  shift
  if "$@"; then
    echo "PASS  $name"
    PASS=$((PASS + 1))
  else
    echo "FAIL  $name"
    FAIL=$((FAIL + 1))
  fi
}

echo "== Braintona E2E @ $BASE =="

curl -fsS "$BASE/api/health" >"$TMP/health.json"
check "health.ok" python3 -c "import json; d=json.load(open('$TMP/health.json')); raise SystemExit(0 if d.get('ok') else 1)"

curl -fsS "$BASE/api/graph" >"$TMP/g0.json"
runs0=$(python3 -c "import json; print(json.load(open('$TMP/g0.json')).get('run_count',0))")
echo "graph runs before: $runs0"

curl -fsS -X POST "$BASE/api/run" -H 'content-type: application/json' \
  -d '{"source":"FCO custody proves provenance of recorded bytes, not scientific correctness. Glasswork selected the cheapest open model that cleared a gold claim-extraction bar."}' \
  >"$TMP/r1.json"

check "run1.eval_receipt_graph" python3 -c "import json; d=json.load(open('$TMP/r1.json')); raise SystemExit(0 if 'eval' in d and 'receipt' in d and 'graph' in d else 1)"
check "run1.local_verify" python3 -c "import json; d=json.load(open('$TMP/r1.json')); raise SystemExit(0 if d.get('verify_local',{}).get('ok') else 1)"
check "run1.tamper_rejected" python3 -c "import json; d=json.load(open('$TMP/r1.json')); tv=d.get('tamper_verify') or {}; raise SystemExit(0 if tv and not tv.get('ok') else 1)"
check "run1.graph_grew" python3 -c "import json; d=json.load(open('$TMP/r1.json')); raise SystemExit(0 if (d.get('graph') or {}).get('run_count',0) > int('$runs0') else 1)"

runs1=$(python3 -c "import json; print(json.load(open('$TMP/r1.json'))['graph']['run_count'])")
root1=$(python3 -c "import json; print(json.load(open('$TMP/r1.json'))['graph']['bagged_session_root'])")

curl -fsS -X POST "$BASE/api/run" -H 'content-type: application/json' \
  -d '{"source":"Second run: MMR bagged session root must advance as custody leaves accumulate across pipeline executions."}' \
  >"$TMP/r2.json"

runs2=$(python3 -c "import json; print(json.load(open('$TMP/r2.json'))['graph']['run_count'])")
root2=$(python3 -c "import json; print(json.load(open('$TMP/r2.json'))['graph']['bagged_session_root'])")
check "run2.graph_count_gt_run1" test "$runs2" -gt "$runs1"
check "run2.session_root_changed" test "$root1" != "$root2"

curl -fsS "$BASE/api/graph" >"$TMP/g_live.json"
check "graph.endpoint_matches" python3 -c "import json; d=json.load(open('$TMP/g_live.json')); raise SystemExit(0 if d.get('run_count')==int('$runs2') and d.get('nodes') and d.get('edges') else 1)"

curl -fsS -X POST "$BASE/api/voice-origin" -H 'content-type: application/json' \
  -d '{"text":"Braintona E2E voice-origin seal."}' >"$TMP/vo.json"
check "voice_origin.mmr" python3 -c "import json; d=json.load(open('$TMP/vo.json')); raise SystemExit(0 if (d.get('graph') or {}).get('mmr_root') else 1)"

curl -fsS "$BASE/api/latest" >"$TMP/latest.json"
check "latest.verify" python3 -c "import json; d=json.load(open('$TMP/latest.json')); raise SystemExit(0 if d.get('verify',{}).get('ok') else 1)"

echo "-- summary: $PASS passed, $FAIL failed (runs $runs0 → $runs2) --"
echo "session_root: ${root2:0:24}…"
test "$FAIL" -eq 0
