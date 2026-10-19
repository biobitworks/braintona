import { sealCursorConversationPrivate } from "../src/server/conversation_custody.js";

const result = await sealCursorConversationPrivate({
  note: "Cursor conversation + cloud agent run sealed as private custody object",
});
console.log(
  JSON.stringify(
    {
      ok: true,
      continuous_session_id: result.pointer.continuous_session_id,
      cloud_agent_bc_id: result.pointer.cloud_agent_bc_id,
      transcript_sha256: result.pointer.transcript_sha256,
      transcript_bytes: result.pointer.transcript_bytes,
      content_leaf: result.pointer.content_leaf,
      fco_root: result.pointer.fco_root,
      mmr_tip: result.pointer.mmr_tip,
      vault_path: result.vault_path,
      graph_attached: result.graph_attached,
      plaintext_in_repo: false,
    },
    null,
    2,
  ),
);
