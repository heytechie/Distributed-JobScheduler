import crypto from 'crypto';
import { logger } from '../config/logger.js';
import  {JobRepository}  from '../modules/jobs/job.repository.js';
import type { JobHandler } from './handlers/job.handler.js';
import { jobHandlerRegistry } from './handlers/job-handler-registry.js';
const jobRepository = new JobRepository();
export class Worker{
    private readonly workerId:string;
    constructor(){
        this.workerId = crypto.randomUUID();
        
        logger.info({
            workerId:this.workerId
        },"Worker Created")
    }

    getId():string{
        return this.workerId;
    }

    private getHandler(type:string):JobHandler{
        const handler = jobHandlerRegistry[type as keyof typeof jobHandlerRegistry];
        if(!handler){
            throw new Error(`No handler found for job type: ${type}`);
        }
        return handler;
    }

    async claimJob(){
        const job = await jobRepository.claimNextJob(this.workerId);

        if(!job){
            logger.info({
                workerId:this.workerId
            },"No job available")
            return null;
        }

        logger.info({
            workerId:this.workerId,
            jobId :job.id,
            jobType : job.type,
            attempt:job.attempts
        },"Job claimed")

        const handler = this.getHandler(job.type);

       try{
         await handler.execute(job.payload);
         await jobRepository.markSucceeded(job.id);
         logger.info({
            workerId:this.workerId,
            jobId :job.id,
            jobType: job.type,
            attempt:job.attempts
         },"Job executed successfully")
       }catch(err){
        await jobRepository.markFailed(job.id);
        logger.error({
            workerId:this.workerId,
            jobId :job.id,
            jobType: job.type,
            attempt:job.attempts,
            error:err
         },"Job execution failed")

         throw err;
       }
    }
    
}