import "dotenv/config";
import { runTwoAvatarCallDemo } from "../src/server/two_avatar_call.js";

const demo = await runTwoAvatarCallDemo();
console.log(
  JSON.stringify(
    {
      ok: demo.elevenlabs.customer_ok && demo.elevenlabs.agent_ok,
      interaction_id: demo.interaction_id,
      tree_a_tip: demo.tree_a_tip,
      tree_b_tip: demo.tree_b_tip,
      interaction_mmr_root: demo.interaction_mmr_root,
      customer_vault_root: demo.customer_vault_root,
      turns: demo.turns.map((t) => ({
        role: t.role,
        avatar_name: t.avatar_name,
        voice_id: t.voice_id,
        audio_path: t.audio_path,
        audio_bytes: t.audio_bytes,
        leaf_hash: t.receipt.leaf_hash,
      })),
      reasons: demo.elevenlabs.reasons,
      note: demo.note,
    },
    null,
    2,
  ),
);
