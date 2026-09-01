import type { CreateJobDto } from "./job.dto.js";
import { jobRepository } from "./job.repository.js";

export class jobService {
    constructor(private readonly jobRepository: jobRepository) {}

    async createJob(data: CreateJobDto) {
        return await this.jobRepository.create(data);
    }

    async getJobById(id: string) {
        return await this.jobRepository.findById(id);
    }
}