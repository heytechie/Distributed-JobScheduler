import crypto from 'crypto';
import {JobRepository} from '../modules/jobs/job.repository.js';
import { sleep } from '../utils/sleep.js';
import { logger } from '../config/logger.js';

const jobRepository = new JobRepository();

export class Reaper{
    private readonly reaperId:string;
    private shouldStop:boolean = false
    constructor(){
        this.reaperId = crypto.randomUUID();
    }

    public async start():Promise<void>{
        console.log(`Reaper started with reaperId: ${this.reaperId}`);
        while(!this.shouldStop){
            const batch = 30;
            while(true){
                const staleBefore = new Date(Date.now() - 2*60*1000);
                try {
                    const recoveryResult = await jobRepository.recoverStaleJobs(staleBefore, batch);
                    if(recoveryResult.recovered < batch){
                        break;
                    }
                } catch (error) {
                    console.error(`Error occurred while recovering stale jobs: ${error}`);
                    logger.error({
                        error: error,
                        reaperId: this.reaperId
                    }, "Error occurred while recovering stale jobs");
                    sleep(5000);
                }
            }
            await sleep(30000);
        }
    }

    public stop():void{
        this.shouldStop = true;
        console.log(`Reaper with reaperId: ${this.reaperId} is stopping...`);
    }
}