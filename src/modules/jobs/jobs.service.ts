import type { CreateJobDto } from "./job.dto.js";
import { JobRepository } from "./job.repository.js";

export class jobService {
    constructor(private readonly jobRepository: JobRepository) {}

    async createJob(data: CreateJobDto) {
        return await this.jobRepository.create(data);
    }

    async getJobById(id: string) {
        return await this.jobRepository.findById(id);
    }
}