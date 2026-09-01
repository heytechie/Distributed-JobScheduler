import type {Request, Response} from 'express';
import {jobService} from './jobs.service.js';
import {createJobDto} from './job.dto.js';
import { asyncHandler } from '../../utils/async-handler.js';
import { JobRepository } from './job.repository.js';

const jobServiceInstance = new jobService(new JobRepository());
export const createJob = asyncHandler(async(req: Request, res: Response) => {
    const data = createJobDto.parse(req.body);
    const job = await jobServiceInstance.createJob(data);

    res.status(201).json({
        success:true,
        data:job
    })
})

export const getJob  = asyncHandler(
    async(req:Request,res:Response)=>{
        const jobId = req.params.id as string;
        const job = await jobServiceInstance.getJobById(jobId)

        res.status(200).json({
            success:true,
            data:job
        })
    }
)