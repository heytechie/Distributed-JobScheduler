import {Reaper} from './reaper.js'

const reaper = new Reaper();

process.on('SIGINT',()=>{
    console.log("Stopping reaper...");
    reaper.stop();
})

process.on('SIGTERM',()=>{
    console.log("Stopping reaper...");
    reaper.stop();
})

await reaper.start();