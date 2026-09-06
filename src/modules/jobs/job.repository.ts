import { logger } from '../../config/logger.js';
import { prisma } from '../../lib/prisma.js';
import type { CreateJobDto } from './job.dto.js';

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

    async claimNextJob(workerId: string) {
        return prisma.$transaction(async (tx) => {
            const jobs = await tx.$queryRaw<Array<{ id: string }>>`
                SELECT id
                FROM "Job"
                WHERE status = 'PENDING'
                    AND "availableAt" <= NOW()
                ORDER BY "createdAt" ASC
                FOR UPDATE SKIP LOCKED
                LIMIT 1
            `;

            const job = jobs[0];

            if (!job) {
                return null;
            }


            return tx.job.update({
                where: {
                    id: job.id
                },
                data: {
                    status: "RUNNING",
                    attempts: {
                        increment: 1
                    },
                    lockedAt: new Date(),
                    lockedBy: workerId,
                    startedAt: new Date()
                }
            })
        })
    }



    async markSucceeded(id: string) {
        return prisma.job.update({
            where: {
                id
            },
            data: {
                status: "SUCCEEDED",
                completedAt: new Date(),
                lockedAt: null,
                lockedBy: null
            }
        })
    }

    async markDead(id: string) {
        return prisma.job.update({
            where: {
                id
            },
            data: {
                status: "FAILED",
                failedAt: new Date(),
                lockedAt: null,
                lockedBy: null
            }
        })
    }

    async scheduleRetry(id: string, availableAt: Date) {
        return prisma.job.update({
            where: {
                id
            },
            data: {
                status: "PENDING",
                availableAt,
                lockedAt: null,
                lockedBy: null
            }
        })
    }



    async recoverStaleJobs(staleBefore: Date, limit: number) {
        if (!Number.isInteger(limit) || limit <= 0) {
            throw new Error("Recovery batch limit must be a positive integer");
        }

        return prisma.$transaction(async (tx) => {
            const jobs = await tx.$queryRaw<
                Array<{
                    id: string;
                    attempts: number;
                    maxAttempts: number;
                }>
            >`
                SELECT
                 id,
                  attempts,
                    "maxAttempts"
                 FROM "Job"
                  WHERE status = 'RUNNING'
                  AND "lockedAt" IS NOT NULL
                  AND "lockedAt" < ${staleBefore}
                 ORDER BY "lockedAt" ASC
                 FOR UPDATE SKIP LOCKED
                LIMIT ${limit}
            `;

            let retried = 0;
            let failed = 0;

            for (const job of jobs) {
                if (job.attempts < job.maxAttempts) {
                    const retryDelay = Math.pow(2, job.attempts) * 1000;
                    const availableAt = new Date(Date.now() + retryDelay);

                    await tx.job.update({
                        where: {
                            id: job.id,
                        },
                        data: {
                            status: "PENDING",
                            availableAt,
                            lockedAt: null,
                            lockedBy: null,
                            startedAt: null,
                        },
                    });
                    logger.info({
                        jobId: job.id,
                        message: `Recovered stale job and scheduled for retry at ${availableAt.toISOString()}`,
                    })
                    retried++;
                } else {
                    await tx.job.update({
                        where: {
                            id: job.id,
                        },
                        data: {
                            status: "FAILED",
                            failedAt: new Date(),
                            lockedAt: null,
                            lockedBy: null,
                        },
                    });
                    logger.error({
                        jobId: job.id,
                        message: "job has reached its max attempts, marked as failed",
                    }, "Job has reached its max attempts, marked as failed");
                    failed++;
                }
            }

            return {
                recovered: jobs.length,
                retried,
                failed,
            };
        });
    }
}