/**
 * Local custody knowledge graph for the Braintona demo.
 * Not Overwatch/SeedGraph writeback — session-local FCO/MMR provenance graph.
 */
import { mmr } from "./fco.js";
import type { CustodyReceipt } from "./receipts.js";

export type GraphNodeKind =
  | "session"
  | "run"
  | "ops_leaf"
  | "content_leaf"
  | "custody_root"
  | "eval"
  | "daytona"
  | "tamper"
  | "voice_origin";

export interface GraphNode {
  id: string;
  kind: GraphNodeKind;
  label: string;
  short: string;
  meta?: Record<string, unknown>;
}

export interface GraphEdge {
  id: string;
  from: string;
  to: string;
  rel: string;
}

export interface CustodyGraph {
  schema: "braintona.custody_graph.v1";
  session_id: string;
  updated_at: string;
  run_count: number;
  bagged_session_root: string;
  nodes: GraphNode[];
  edges: GraphEdge[];
  claim_ceiling: string;
  llm_in_science_leaf: false;
}

export interface RunGraphEvent {
  receipt: CustodyReceipt;
  verify_local_ok?: boolean;
  daytona_ok?: boolean | null;
  daytona_skipped?: boolean;
  tamper_rejected?: boolean | null;
  eval_pass?: boolean;
  eval_f1?: number;
}

function shortHash(h: string, n = 10): string {
  return (h || "").slice(0, n);
}

export async function buildCustodyGraph(
  events: RunGraphEvent[],
  opts: { session_id?: string } = {},
): Promise<CustodyGraph> {
  const session_id = opts.session_id || "braintona-demo";
  const nodes: GraphNode[] = [
    {
      id: `session:${session_id}`,
      kind: "session",
      label: "Braintona session",
      short: session_id,
      meta: { claim_ceiling: "provenance_not_correctness" },
    },
  ];
  const edges: GraphEdge[] = [];
  const rootLeaves: string[] = [];
  let prevRunId: string | null = null;

  events.forEach((ev, idx) => {
    const r = ev.receipt;
    const runId = `run:${idx + 1}:${shortHash(r.custody_root)}`;
    const opsId = `ops:${shortHash(r.leaves[0])}`;
    const contentId = `content:${shortHash(r.leaves[1])}`;
    const rootId = `root:${shortHash(r.custody_root)}`;
    const evalId = `eval:${idx + 1}`;

    nodes.push({
      id: runId,
      kind: "run",
      label: `Run ${idx + 1}`,
      short: r.operational.ts,
      meta: {
        model_id: r.operational.model_id,
        provider: r.operational.provider,
        task_id: r.content.task_id,
      },
    });
    nodes.push({
      id: opsId,
      kind: "ops_leaf",
      label: "Ops leaf",
      short: shortHash(r.leaves[0]),
      meta: { leaf: r.leaves[0] },
    });
    nodes.push({
      id: contentId,
      kind: "content_leaf",
      label: "Content leaf",
      short: shortHash(r.leaves[1]),
      meta: {
        leaf: r.leaves[1],
        prompt_sha256: r.content.prompt_sha256,
        output_sha256: r.content.output_sha256,
      },
    });
    nodes.push({
      id: rootId,
      kind: "custody_root",
      label: "Custody MMR root",
      short: shortHash(r.custody_root),
      meta: { custody_root: r.custody_root, verify_local_ok: ev.verify_local_ok ?? null },
    });
    nodes.push({
      id: evalId,
      kind: "eval",
      label: ev.eval_pass ? "Eval PASS" : "Eval FAIL",
      short: ev.eval_f1 != null ? `F1 ${(ev.eval_f1 * 100).toFixed(0)}%` : "eval",
      meta: { pass: ev.eval_pass, f1: ev.eval_f1 },
    });

    edges.push({ id: `e-${runId}-session`, from: `session:${session_id}`, to: runId, rel: "CONTAINS" });
    edges.push({ id: `e-${runId}-ops`, from: runId, to: opsId, rel: "HAS_OPS_LEAF" });
    edges.push({ id: `e-${runId}-content`, from: runId, to: contentId, rel: "HAS_CONTENT_LEAF" });
    edges.push({ id: `e-${opsId}-root`, from: opsId, to: rootId, rel: "SEALS" });
    edges.push({ id: `e-${contentId}-root`, from: contentId, to: rootId, rel: "SEALS" });
    edges.push({ id: `e-${runId}-eval`, from: runId, to: evalId, rel: "SCORED_BY" });

    if (prevRunId) {
      edges.push({ id: `e-${prevRunId}-${runId}`, from: prevRunId, to: runId, rel: "NEXT_RUN" });
    }
    prevRunId = runId;
    rootLeaves.push(r.custody_root);

    if (ev.daytona_ok != null || ev.daytona_skipped) {
      const dId = `daytona:${idx + 1}`;
      nodes.push({
        id: dId,
        kind: "daytona",
        label: ev.daytona_skipped ? "Daytona skipped" : ev.daytona_ok ? "Daytona match" : "Daytona mismatch",
        short: ev.daytona_skipped ? "skip" : ev.daytona_ok ? "ok" : "bad",
        meta: { ok: ev.daytona_ok, skipped: ev.daytona_skipped },
      });
      edges.push({ id: `e-${rootId}-daytona`, from: rootId, to: dId, rel: "RECOMPUTED_IN" });
    }

    if (ev.tamper_rejected != null) {
      const tId = `tamper:${idx + 1}`;
      nodes.push({
        id: tId,
        kind: "tamper",
        label: ev.tamper_rejected ? "Tamper rejected" : "Tamper unexpected pass",
        short: ev.tamper_rejected ? "reject" : "leak",
        meta: { rejected: ev.tamper_rejected },
      });
      edges.push({ id: `e-${rootId}-tamper`, from: rootId, to: tId, rel: "CONTRAST" });
    }
  });

  const bagged_session_root = await mmr(rootLeaves.length ? rootLeaves : []);

  return {
    schema: "braintona.custody_graph.v1",
    session_id,
    updated_at: new Date().toISOString(),
    run_count: events.length,
    bagged_session_root,
    nodes,
    edges,
    claim_ceiling: "custody_graph_is_local_provenance_not_science_truth",
    llm_in_science_leaf: false,
  };
}
