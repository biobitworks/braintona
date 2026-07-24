import { mkdir, readFile, writeFile, appendFile } from "node:fs/promises";
import path from "node:path";
import {
  buildCustodyGraph,
  type CustodyGraph,
  type RunGraphEvent,
} from "../lib/custody_graph.js";
import type { CustodyReceipt } from "../lib/receipts.js";

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

export async function refreshCustodyGraph(): Promise<CustodyGraph> {
  await bootstrapFromReceipts();
  const events = await loadGraphEvents();
  const graph = await buildCustodyGraph(events);
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
