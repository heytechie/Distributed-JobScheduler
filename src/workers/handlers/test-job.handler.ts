import type {JobHandler} from './job.handler.js';
import {setTimeout as sleep} from 'node:timers/promises';
export class TestJobHandler implements JobHandler{
    async execute(payload:unknown,signal:AbortSignal):Promise<void>{
        console.log("Executing TestJobHandler with payload:", payload);

        await sleep(10_000, undefined, {signal});
        console.log("TestJobHandler execution completed.");
    }
}
