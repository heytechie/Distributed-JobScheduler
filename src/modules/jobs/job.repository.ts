import {prisma} from '../../lib/prisma.js';
import type {CreateJobDto} from './job.dto.js';

export class jobRepository {
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
}