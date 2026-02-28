import { runCollect } from "./collector/runCollect.js";

const query = process.argv[2] || "machine learning";
const limit = Number(process.argv[3] || 50);

const result = await runCollect({ query, limit });
console.log("Collect done:", result);
process.exit(0);