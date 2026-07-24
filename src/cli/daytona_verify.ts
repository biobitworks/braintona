import { loadLatestReceipt } from "../server/pipeline.js";
import { daytonaRecompute } from "../server/daytona.js";
import { runPipeline } from "../server/pipeline.js";

let receipt = await loadLatestReceipt();
if (!receipt) {
  const r = await runPipeline({ skipDaytona: true, plantTamper: false });
  receipt = r.receipt;
}
const result = await daytonaRecompute(receipt);
console.log(JSON.stringify(result, null, 2));
process.exit(result.ok ? 0 : 2);
