/**
 * CopilotKit-facing interaction turns → FCO leaves → MMR tip.
 * Each operator/AI message seals as a turn leaf under one interaction root.
 * llm_in_science_leaf always false.
 */
import { writeFile, readFile, mkdir, appendFile } from "node:fs/promises";
import path from "node:path";
import { canonicalJson, mmr, sha256Hex } from "./fco.js";

export type TurnActor = "human" | "ai" | "tool" | "operator";

export interface InteractionTurn {
  turn_id: string;
  actor: TurnActor;
  content_class: "human" | "ai" | "other";
  text_sha256: string;
  /** Never put model prose into science leaves — store hash only publicly. */
  leaf_hash: string;
  via: "copilotkit_cockpit" | "api";
  ts_utc: string;
  llm_in_science_leaf: false;
}

export interface InteractionThread {
  schema: "braintona.interaction_thread.v1";
  interaction_id: string;
  sponsor_ui: "CopilotKit";
  license_present: boolean;
  turns: InteractionTurn[];
  interaction_mmr_root: string;
  claim_ceiling: "provenance_of_recorded_turns_not_correctness";
  llm_in_science_leaf: false;
  updated_at_utc: string;
}

const DATA = path.resolve("data");
const LATEST = path.join(DATA, "copilotkit_interaction_latest.json");
const LEDGER = path.join(DATA, "copilotkit_interaction_ledger.jsonl");

async function leafHash(payload: unknown): Promise<string> {
  const canon = canonicalJson(payload);
  const bytes = new TextEncoder().encode(canon);
  const prefixed = new Uint8Array(1 + bytes.length);
  prefixed[0] = 0x00;
  prefixed.set(bytes, 1);
  return sha256Hex(prefixed);
}

function contentClass(actor: TurnActor): InteractionTurn["content_class"] {
  if (actor === "human" || actor === "operator") return "human";
  if (actor === "ai" || actor === "tool") return "ai";
  return "other";
}

export async function loadLatestInteraction(): Promise<InteractionThread | null> {
  try {
    return JSON.parse(await readFile(LATEST, "utf8")) as InteractionThread;
  } catch {
    return null;
  }
}

export async function sealInteractionTurn(input: {
  text: string;
  actor: TurnActor;
  license_present: boolean;
  interaction_id?: string;
}): Promise<InteractionThread> {
  await mkdir(DATA, { recursive: true });
  const prior = await loadLatestInteraction();
  const interaction_id =
    input.interaction_id ||
    prior?.interaction_id ||
    `ck-${(await sha256Hex(String(Date.now()))).slice(0, 12)}`;

  const text = input.text.trim();
  if (!text) throw new Error("turn text required");

  const text_sha256 = await sha256Hex(text);
  const ts_utc = new Date().toISOString();
  const actor = input.actor;
  const content_class = contentClass(actor);
  const turn_id = `turn-${(await sha256Hex(`${interaction_id}|${ts_utc}|${text_sha256}`)).slice(0, 16)}`;

  const leaf_payload = {
    schema: "braintona.interaction_turn.v1",
    turn_id,
    interaction_id,
    actor,
    content_class,
    text_sha256,
    via: "copilotkit_cockpit" as const,
    ts_utc,
    llm_in_science_leaf: false as const,
  };
  const leaf_hash = await leafHash(leaf_payload);

  const turn: InteractionTurn = {
    turn_id,
    actor,
    content_class,
    text_sha256,
    leaf_hash,
    via: "copilotkit_cockpit",
    ts_utc,
    llm_in_science_leaf: false,
  };

  const turns = [...(prior?.interaction_id === interaction_id ? prior.turns : []), turn];
  const interaction_mmr_root = await mmr(turns.map((t) => t.leaf_hash));

  const thread: InteractionThread = {
    schema: "braintona.interaction_thread.v1",
    interaction_id,
    sponsor_ui: "CopilotKit",
    license_present: input.license_present,
    turns,
    interaction_mmr_root,
    claim_ceiling: "provenance_of_recorded_turns_not_correctness",
    llm_in_science_leaf: false,
    updated_at_utc: ts_utc,
  };

  await writeFile(LATEST, JSON.stringify(thread, null, 2));
  await appendFile(
    LEDGER,
    JSON.stringify({
      interaction_id,
      turn_id,
      leaf_hash,
      interaction_mmr_root,
      actor,
      license_present: input.license_present,
      ts_utc,
    }) + "\n",
  );
  return thread;
}
