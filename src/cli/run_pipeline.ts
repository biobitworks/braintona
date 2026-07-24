import { runPipeline } from "../server/pipeline.js";

const skipDaytona = process.argv.includes("--skip-daytona");
const result = await runPipeline({ skipDaytona, plantTamper: true });
console.log(JSON.stringify(result, null, 2));
process.exit(result.verify_local.ok ? 0 : 1);
