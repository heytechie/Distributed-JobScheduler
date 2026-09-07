import {Reaper} from './reaper.js'
import { prisma } from '../lib/prisma.js';
const reaper = new Reaper();

process.on('SIGINT',()=>{
    console.log("Stopping reaper...");
    reaper.stop();
})

process.on('SIGTERM',()=>{
    console.log("Stopping reaper...");
    reaper.stop();
})

try{
    await reaper.start();
} finally{
    prisma.$disconnect().then(()=>{
    console.log("Disconnected from database");
}).catch((error: Error)=>{
    console.error("Error disconnecting from database:", error);
})
}
    
