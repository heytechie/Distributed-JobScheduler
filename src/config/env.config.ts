import {z} from "zod";
import dotenv from "dotenv";

dotenv.config({
    path: ".env"
})

const envSchema = z.object({
    PORT: z.coerce.number().default(3000),
    DATABASE_URL: z.string(),
    LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
})

const parsedEnv = envSchema.safeParse(process.env);

export default parsedEnv;
if (!parsedEnv.success) {
  console.error("Invalid env vars");
  console.error(z.treeifyError(parsedEnv.error));
  throw new Error("Invalid environment variables");
}

export const env = parsedEnv.data;