import { mkdir, readFile, writeFile, appendFile } from "node:fs/promises";
import path from "node:path";
import {
  buildCustodyGraph,
  type CustodyGraph,
  type PrivateConversationGraphLink,
  type RunGraphEvent,
} from "../lib/custody_graph.js";
import type { CustodyReceipt } from "../lib/receipts.js";
import type { PrivateConversationPublicPointer } from "../lib/private_conversation.js";

const DATA = path.resolve("data");
const EVENTS = path.join(DATA, "graph_events.jsonl");
const LATEST = path.join(DATA, "custody_graph_latest.json");

async function ensureData() {
  await mkdir(DATA, { recursive: true });
}

export async function loadGraphEvents(): Promise<RunGraphEvent[]> {
  await ensureData();
  try {
    const raw = await readFile(EVENTS, "utf8");
    return raw
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean)
      .map((l) => JSON.parse(l) as RunGraphEvent);
  } catch {
    return [];
  }
}

/** Bootstrap graph events from legacy receipts.jsonl if graph ledger is empty. */
export async function bootstrapFromReceipts(): Promise<number> {
  const existing = await loadGraphEvents();
  if (existing.length) return 0;
  try {
    const raw = await readFile(path.join(DATA, "receipts.jsonl"), "utf8");
    const lines = raw.split("\n").map((l) => l.trim()).filter(Boolean);
    let n = 0;
    for (const line of lines) {
      const receipt = JSON.parse(line) as CustodyReceipt;
      const ev: RunGraphEvent = {
        receipt,
        verify_local_ok: true,
        eval_pass: receipt.operational.eval_pass ?? undefined,
        eval_f1: receipt.operational.eval_score ?? undefined,
      };
      await appendFile(EVENTS, JSON.stringify(ev) + "\n");
      n += 1;
    }
    return n;
  } catch {
    return 0;
  }
}

export async function appendGraphEvent(ev: RunGraphEvent): Promise<CustodyGraph> {
  await ensureData();
  await appendFile(EVENTS, JSON.stringify(ev) + "\n");
  return refreshCustodyGraph();
}

async function loadPrivateConversationLink(): Promise<PrivateConversationGraphLink | null> {
  try {
    const raw = await readFile(path.join(DATA, "private_conversation_latest.json"), "utf8");
    const p = JSON.parse(raw) as PrivateConversationPublicPointer;
    return {
      continuous_session_id: p.continuous_session_id,
      content_leaf: p.content_leaf,
      fco_root: p.fco_root,
      mmr_tip: p.mmr_tip,
      transcript_sha256: p.transcript_sha256,
      transcript_bytes: p.transcript_bytes,
      cloud_agent_bc_id: p.cloud_agent_bc_id,
      visibility: "private",
    };
  } catch {
    return null;
  }
}

export async function refreshCustodyGraph(opts: {
  privateConversation?: PrivateConversationPublicPointer | null;
} = {}): Promise<CustodyGraph> {
  await bootstrapFromReceipts();
  const events = await loadGraphEvents();
  const privateConversation =
    opts.privateConversation
      ? {
          continuous_session_id: opts.privateConversation.continuous_session_id,
          content_leaf: opts.privateConversation.content_leaf,
          fco_root: opts.privateConversation.fco_root,
          mmr_tip: opts.privateConversation.mmr_tip,
          transcript_sha256: opts.privateConversation.transcript_sha256,
          transcript_bytes: opts.privateConversation.transcript_bytes,
          cloud_agent_bc_id: opts.privateConversation.cloud_agent_bc_id,
          visibility: "private" as const,
        }
      : await loadPrivateConversationLink();
  const graph = await buildCustodyGraph(events, { privateConversation });
  await writeFile(LATEST, JSON.stringify(graph, null, 2));
  return graph;
}

export async function loadLatestGraph(): Promise<CustodyGraph | null> {
  try {
    const raw = await readFile(LATEST, "utf8");
    return JSON.parse(raw) as CustodyGraph;
  } catch {
    return refreshCustodyGraph();
  }
}
