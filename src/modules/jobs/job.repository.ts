import {prisma} from '../../lib/prisma.js';
import type {CreateJobDto} from './job.dto.js';

export class JobRepository {
    async create(data: CreateJobDto) {
        return await prisma.job.create({
            data: {
                type: data.type,
                payload: data.payload,
                maxAttempts: data.maxAttempts ?? 3,
            },
        });
    }

    async findById(id: string) {
        return await prisma.job.findUnique({
            where: {
                id,
            },
        });
    }

    async claimNextJob(workerId:string){
        return prisma.$transaction(async(tx)=>{
            const jobs = await tx.$queryRaw<Array<{id:string}>>`
                SELECT id
                FROM "Job"
                WHERE status = 'PENDING'
                    AND "availableAt" <= NOW()
                ORDER BY "createdAt" ASC
                FOR UPDATE SKIP LOCKED
                LIMIT 1
            `;

            const job = jobs[0];

            if(!job){
                return null;
            }


            return tx.job.update({
                where:{
                    id:job.id
                },
                data:{
                    status:"RUNNING",
                    attempts:{
                        increment:1
                    },
                    lockedAt:new Date(),
                    lockedBy:workerId,
                    startedAt:new Date()
                }
            })
        })
    }



    async markSucceeded(id:string){
         prisma.job.update({
            where:{
                id
            },
            data:{
                status:"SUCCEEDED",
                completedAt: new Date(),
                lockedAt:null,
                lockedBy:null
            }
        })
    }

    async markFailed(id:string){
        prisma.job.update({
            where:{
                id
            },
            data:{
                status:"FAILED",
                failedAt:new Date(),
                lockedAt:null,
                lockedBy:null
            }
        }) 
    }
}