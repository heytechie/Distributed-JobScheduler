import crypto from 'crypto';
import { logger } from '../config/logger.js';
import  {JobRepository}  from '../modules/jobs/job.repository.js';
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

        return job;
    }
    
}