import type { CustodyReceipt } from "../lib/receipts.js";

export interface DaytonaVerifyResult {
  ok: boolean;
  skipped: boolean;
  reason?: string;
  sandbox_id?: string;
  recomputed_root?: string;
  recorded_root?: string;
  stdout?: string;
  stderr?: string;
}

function buildRecomputeCode(receipt: CustodyReceipt): string {
  // Embed receipt as JSON literal inside Python for deterministic sandbox attest.
  const payload = JSON.stringify(receipt);
  return `
import hashlib, json
receipt = json.loads(${JSON.stringify(payload)})

def sha256(b: bytes) -> str:
    return hashlib.sha256(b).hexdigest()

def canon(v):
    if v is None or isinstance(v, (str, int, float, bool)):
        return json.dumps(v, separators=(',', ':'), ensure_ascii=False)
    if isinstance(v, list):
        return '[' + ','.join(canon(x) for x in v) + ']'
    keys = sorted(v.keys())
    return '{' + ','.join(json.dumps(k) + ':' + canon(v[k]) for k in keys) + '}'

def leaf(obj):
    body = canon(obj).encode()
    return sha256(b'\\x00' + body)

def node(l, r):
    return sha256(b'\\x01' + (l + r).encode())

def mmr(leaves):
    if not leaves:
        return '0'*64
    if len(leaves) == 1:
        return leaves[0]
    peaks = []
    for lf in leaves:
        h, ht = lf, 0
        while peaks and peaks[-1][0] == ht:
            left = peaks.pop()[1]
            h = node(left, h)
            ht += 1
        peaks.append((ht, h))
    bag = peaks[-1][1]
    for i in range(len(peaks) - 2, -1, -1):
        bag = node(peaks[i][1], bag)
    return bag

op = leaf(receipt['operational'])
content = leaf(receipt['content'])
root = mmr([op, content])
ok = root == receipt['custody_root'] and op == receipt['leaves'][0] and content == receipt['leaves'][1]
print(json.dumps({'ok': ok, 'recomputed_root': root, 'recorded_root': receipt['custody_root'], 'op': op, 'content': content}))
`;
}

export async function daytonaRecompute(receipt: CustodyReceipt): Promise<DaytonaVerifyResult> {
  const apiKey = process.env.DAYTONA_API_KEY;
  if (!apiKey) {
    return { ok: false, skipped: true, reason: "DAYTONA_API_KEY missing" };
  }

  try {
    const { Daytona } = await import("@daytona/sdk");
    const daytona = new Daytona({
      apiKey,
      apiUrl: process.env.DAYTONA_API_URL || undefined,
    });

    const sandbox = await daytona.create({
      language: "python",
      envVars: { BRAINTONA: "1" },
      autoStopInterval: 5,
      ephemeral: true,
      labels: { project: "braintona", purpose: "custody-recompute" },
    });

    try {
      const result = await sandbox.process.codeRun(buildRecomputeCode(receipt));
      const stdout = String(result.result ?? result.artifacts?.stdout ?? "").trim();
      let parsed: { ok?: boolean; recomputed_root?: string; recorded_root?: string } = {};
      try {
        parsed = JSON.parse(stdout.split("\n").filter(Boolean).pop() || "{}");
      } catch {
        return {
          ok: false,
          skipped: false,
          sandbox_id: sandbox.id,
          reason: "failed to parse sandbox stdout",
          stdout,
        };
      }
      return {
        ok: Boolean(parsed.ok) && result.exitCode === 0,
        skipped: false,
        sandbox_id: sandbox.id,
        recomputed_root: parsed.recomputed_root,
        recorded_root: parsed.recorded_root,
        stdout,
      };
    } finally {
      try {
        await sandbox.delete();
      } catch {
        /* keep demo moving */
      }
    }
  } catch (err) {
    return {
      ok: false,
      skipped: false,
      reason: err instanceof Error ? err.message : String(err),
    };
  }
}
