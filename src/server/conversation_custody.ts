import { mkdir, readFile, writeFile, appendFile, access } from "node:fs/promises";
import path from "node:path";
import {
  sealPrivateConversation,
  type PrivateConversationPublicPointer,
} from "../lib/private_conversation.js";
import { refreshCustodyGraph } from "./graph.js";

const DATA = path.resolve("data");
const PRIVATE_DIR = path.resolve(".planning/private");
const PUBLIC_LEDGER = path.join(DATA, "private_conversation_pointers.jsonl");
const PUBLIC_LATEST = path.join(DATA, "private_conversation_latest.json");
const VAULT_LATEST = path.join(PRIVATE_DIR, "conversation_vault_latest.json");

const DEFAULT_TRANSCRIPT = path.resolve(
  "/Users/byron/.cursor/projects/Users-byron-projects-active-braintona/agent-transcripts/6430eeef-1426-4566-a6fc-5d688723f05b/6430eeef-1426-4566-a6fc-5d688723f05b.jsonl",
);

async function ensureDirs() {
  await mkdir(DATA, { recursive: true });
  await mkdir(PRIVATE_DIR, { recursive: true });
}

export async function sealCursorConversationPrivate(opts: {
  transcript_path?: string;
  continuous_session_id?: string;
  cloud_agent_bc_id?: string;
  note?: string;
} = {}): Promise<{
  pointer: PrivateConversationPublicPointer;
  vault_path: string;
  graph_attached: boolean;
}> {
  await ensureDirs();
  const transcript_path = opts.transcript_path || process.env.CURSOR_TRANSCRIPT_PATH || DEFAULT_TRANSCRIPT;
  await access(transcript_path);
  const bytes = await readFile(transcript_path);
  const continuous_session_id =
    opts.continuous_session_id ||
    process.env.CURSOR_SESSION_ID ||
    "cursor-6430eeef-1426-4566-a6fc-5d688723f05b";

  const pointer = await sealPrivateConversation({
    continuous_session_id,
    transcript_bytes: new Uint8Array(bytes),
    transcript_path_local: transcript_path,
    cloud_agent_bc_id: opts.cloud_agent_bc_id || process.env.CURSOR_CLOUD_BC_ID || "bc-019f9510-ed75-7b1e-af39-45913bbccc88",
    host_id: process.env.HOST_ID || "magicPRObox",
    runtime: "cursor",
    note: opts.note,
  });

  // Public ledger: hashes + local path pointer only (no transcript body).
  await appendFile(PUBLIC_LEDGER, JSON.stringify(pointer) + "\n");
  await writeFile(PUBLIC_LATEST, JSON.stringify(pointer, null, 2));

  // Private vault sidecar (gitignored): still no full transcript copy — only
  // custody metadata + absolute path so operator can re-hash locally.
  const vault = {
    schema: "braintona.operator_vault.conversation.v1",
    visibility: "private",
    sealed_at_utc: pointer.created_at_utc,
    pointer,
    vault_policy: {
      do_not_commit: true,
      do_not_publish: true,
      plaintext_source: "cursor_agent_transcript_outside_repo",
    },
    llm_in_science_leaf: false,
  };
  await writeFile(VAULT_LATEST, JSON.stringify(vault, null, 2));

  // Attach into session custody graph (public nodes carry hashes only).
  await refreshCustodyGraph({ privateConversation: pointer });

  return { pointer, vault_path: VAULT_LATEST, graph_attached: true };
}

export async function loadLatestPrivateConversationPointer(): Promise<PrivateConversationPublicPointer | null> {
  try {
    return JSON.parse(await readFile(PUBLIC_LATEST, "utf8")) as PrivateConversationPublicPointer;
  } catch {
    return null;
  }
}
