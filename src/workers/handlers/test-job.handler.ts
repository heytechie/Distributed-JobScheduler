import type {JobHandler} from './job.handler.js';

export class TestJobHandler implements JobHandler{
    async execute(payload:unknown):Promise<void>{
        console.log("Executing TestJobHandler with payload:", payload);
        await new Promise((resolve)=>{
            setTimeout(resolve, 2000)
        })

        console.log("TestJobHandler execution completed.");
    }
}