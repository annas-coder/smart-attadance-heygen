import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(3001),
  MONGODB_URI: z.string().default("mongodb://localhost:27017/futurefin"),
  JWT_SECRET: z.string().min(8),
  JWT_EXPIRES_IN: z.string().default("7d"),
  GROQ_API_KEY: z.string().min(1),
});

export const env = envSchema.parse(process.env);
