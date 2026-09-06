import crypto from 'crypto';
import { logger } from '../config/logger.js';
import  {JobRepository}  from '../modules/jobs/job.repository.js';
import type { JobHandler } from './handlers/job.handler.js';
import { jobHandlerRegistry } from './handlers/job-handler-registry.js';
import { sleep } from '../utils/sleep.js';
const jobRepository = new JobRepository();

export default class Worker{
    private readonly workerId:string;
    private shouldStop:boolean = false;
    private concurrency = 3;
    constructor(){
        this.workerId = crypto.randomUUID();
        
        logger.info({
            workerId:this.workerId
        },"Worker Created")
    }

   
    private async runLoop(index:number):Promise<void>{
        console.log(`Worker loop ${index} started for workerId: ${this.workerId}`);
        while(!this.shouldStop){
            try{
            const job = await jobRepository.claimNextJob(this.workerId);
            if(!job){
                console.log(`Loop ${index}: No jobs available, waiting for 5 seconds...`);
                await sleep(5000);
                continue;
            }
            try{
                const handler = this.getHandler(job.type);
                await handler.execute(job.payload);
                await jobRepository.markSucceeded(job.id);
                logger.info({
                    workerId:this.workerId,
                    jobId:job.id
                },"Job processed successfully");
            }catch(error){
                logger.error({
                    workerId:this.workerId,
                    jobId:job.id
                },`Error occurred while processing job: ${error}`);
                if(job.attempts < job.maxAttempts){
                    const retryDelay = Math.pow(2, job.attempts) * 1000;
                    const availableAt = new Date(Date.now() + retryDelay);
                    await jobRepository.scheduleRetry(job.id, availableAt);
                    logger.info({
                        workerId:this.workerId,
                        jobId:job.id,
                        availableAt:availableAt
                    },"Job scheduled for retry");

                }else{
                    await jobRepository.markDead(job.id);
                    logger.info({
                        workerId:this.workerId,
                        jobId:job.id
                    },"Job marked as dead");
                }
            }
            }catch(error){
                logger.error({
                    workerId:this.workerId
                },`Error occurred while processing job: ${error}`);
                
                await sleep(1000);
            }

        }
    }
    private getHandler(type:string):JobHandler{
        const handler = jobHandlerRegistry[type as keyof typeof jobHandlerRegistry];
        if(!handler){
            throw new Error(`No handler found for job type: ${type}`);
        }
        return handler;
    }


    async start():Promise<void>{

        const loops = Array.from({length:this.concurrency},(_,i)=>{
            return this.runLoop(i);
        })
        await Promise.all(loops);
        
    }

    stop():void{
        this.shouldStop = true;
    }
}