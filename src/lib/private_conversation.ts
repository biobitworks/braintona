/**
 * Private conversation / Cursor-session custody.
 * Plaintext stays out of the public graph and git; only hashes + pointers seal.
 */
import { computeFcoRoot, mmr, sha256Hex, canonicalJson } from "./fco.js";

export interface PrivateConversationPublicPointer {
  schema: "braintona.private_conversation_custody.v1";
  visibility: "private";
  release_class: "operator_vault";
  continuous_session_id: string;
  cloud_agent_bc_id?: string;
  host_id: string;
  runtime: string;
  transcript_path_local: string;
  transcript_sha256: string;
  transcript_bytes: number;
  content_leaf: string;
  fco_root: string;
  mmr_tip: string;
  note: string;
  claim_ceiling: "conversation_is_custody_object_plaintext_stays_in_vault";
  llm_in_science_leaf: false;
  plaintext_in_repo: false;
  plaintext_in_public_graph: false;
  created_at_utc: string;
}

export interface PrivateConversationSealInput {
  continuous_session_id: string;
  transcript_bytes: Uint8Array;
  transcript_path_local: string;
  cloud_agent_bc_id?: string;
  host_id?: string;
  runtime?: string;
  note?: string;
  parent_mmr_tip?: string;
}

export async function sealPrivateConversation(
  input: PrivateConversationSealInput,
): Promise<PrivateConversationPublicPointer> {
  const transcript_sha256 = await sha256Hex(input.transcript_bytes);
  const created_at_utc = new Date().toISOString();

  // Envelope intentionally excludes plaintext / raw transcript.
  const envelope = {
    schema: "braintona.private_conversation_envelope.v1",
    continuous_session_id: input.continuous_session_id,
    cloud_agent_bc_id: input.cloud_agent_bc_id || null,
    host_id: input.host_id || "magicPRObox",
    runtime: input.runtime || "cursor",
    transcript_path_local: input.transcript_path_local,
    transcript_sha256,
    transcript_bytes: input.transcript_bytes.byteLength,
    visibility: "private",
    release_class: "operator_vault",
    created_at_utc,
    llm_in_science_leaf: false as const,
  };

  const content_leaf = await sha256Hex(new TextEncoder().encode(canonicalJson(envelope)));
  const fco_root = await computeFcoRoot(content_leaf);
  const parent = (input.parent_mmr_tip || "").replace(/^sha256:/, "") || "0".repeat(64);
  const mmr_tip = await mmr([parent, content_leaf]);

  return {
    schema: "braintona.private_conversation_custody.v1",
    visibility: "private",
    release_class: "operator_vault",
    continuous_session_id: input.continuous_session_id,
    cloud_agent_bc_id: input.cloud_agent_bc_id,
    host_id: envelope.host_id,
    runtime: envelope.runtime,
    transcript_path_local: input.transcript_path_local,
    transcript_sha256,
    transcript_bytes: input.transcript_bytes.byteLength,
    content_leaf,
    fco_root,
    mmr_tip,
    note:
      input.note ||
      "Cursor conversation sealed as private custody object; plaintext not in public graph",
    claim_ceiling: "conversation_is_custody_object_plaintext_stays_in_vault",
    llm_in_science_leaf: false,
    plaintext_in_repo: false,
    plaintext_in_public_graph: false,
    created_at_utc,
  };
}
