import {z} from 'zod'

export const createJobDto = z.object({
    type: z.string().min(1, { message: "Type is required" }),
    payload:z.record(z.string(),z.any()),
    maxAttempts: z.number().int().positive().optional(),
})


export type CreateJobDto = z.infer<typeof createJobDto>
