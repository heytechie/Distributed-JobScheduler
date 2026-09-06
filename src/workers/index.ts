import Worker from './worker.js';

const worker = new Worker();

process.on('SIGINT',()=>{
console.log("Stopping worker...");
worker.stop();
})

process.on('SIGTERM',()=>{
console.log("Stopping worker...");
worker.stop();
})

await worker.start();