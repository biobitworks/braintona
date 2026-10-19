#!/usr/bin/env bash
# Phone/laptop-safe CopilotKit license ingest — never commit the token.
#
# From phone (Termius / SSH) or laptop:
#   printf '%s' 'PASTE_TOKEN_HERE' > /Users/byron/projects/active/braintona/.planning/private/copilotkit_license.token
#   bash /Users/byron/projects/active/braintona/scripts/ingest_copilotkit_token.sh
#
# Or pipe:
#   printf '%s' "$TOKEN" | bash scripts/ingest_copilotkit_token.sh --stdin
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p .planning/private
DROP=".planning/private/copilotkit_license.token"

ingest_token() {
  python3 - "$1" <<'PY'
from pathlib import Path
import hashlib, json, time, re, sys
token = sys.argv[1].strip().replace("\r", "")
if len(token) < 8:
    raise SystemExit("Token empty/short")
env_path = Path(".env")
text = env_path.read_text() if env_path.exists() else ""
line = f"COPILOTKIT_LICENSE_TOKEN={token}"
if re.search(r"^COPILOTKIT_LICENSE_TOKEN=.*$", text, flags=re.M):
    text = re.sub(r"^COPILOTKIT_LICENSE_TOKEN=.*$", line, text, flags=re.M)
else:
    text = text.rstrip() + "\n" + line + "\n"
env_path.write_text(text if text.endswith("\n") else text + "\n")
h = hashlib.sha256(token.encode()).hexdigest()[:16]
Path(".planning/private/copilotkit_license_ingest.json").write_text(json.dumps({
    "schema": "braintona.secret_ingest_note.v1",
    "key": "COPILOTKIT_LICENSE_TOKEN",
    "token_sha256_16": h,
    "len": len(token),
    "ts": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
    "llm_in_science_leaf": False,
}, indent=2) + "\n")
print(f"OK — ingested (sha256[:16]={h}, len={len(token)})")
print("Restart server: npm run start")
PY
}

if [[ "${1:-}" == "--stdin" ]]; then
  token="$(cat)"
  ingest_token "$token"
  exit 0
fi

if [[ ! -f "$DROP" ]]; then
  echo "Missing $DROP"
  echo "On phone via SSH:"
  echo "  printf '%s' 'YOUR_TOKEN' > $PWD/$DROP"
  echo "  bash $PWD/scripts/ingest_copilotkit_token.sh"
  exit 1
fi

token="$(cat "$DROP")"
ingest_token "$token"
rm -f "$DROP"
echo "Drop file cleared."
