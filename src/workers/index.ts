import { Worker } from "./worker.js";

const worker = new Worker();

const job = await worker.claimJob();

if (job) {
  console.log("Claimed job:", job);
}
console.log(`Worker started: ${worker.getId()}`);