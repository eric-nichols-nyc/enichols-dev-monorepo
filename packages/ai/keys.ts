import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const keys = () =>
  createEnv({
    server: {
      AI_PROVIDER: z.enum(["openai", "google"]).optional(),
      OPENAI_API_KEY: z.string().startsWith("sk-").optional(),
      OPENAI_CHAT_MODEL: z.string().optional(),
      OPENAI_EMBEDDING_MODEL: z.string().optional(),
      GOOGLE_GENERATIVE_AI_API_KEY: z.string().min(1).optional(),
      GOOGLE_CHAT_MODEL: z.string().optional(),
      GOOGLE_EMBEDDING_MODEL: z.string().optional(),
    },
    runtimeEnv: {
      AI_PROVIDER: process.env.AI_PROVIDER,
      OPENAI_API_KEY: process.env.OPENAI_API_KEY,
      OPENAI_CHAT_MODEL: process.env.OPENAI_CHAT_MODEL,
      OPENAI_EMBEDDING_MODEL: process.env.OPENAI_EMBEDDING_MODEL,
      GOOGLE_GENERATIVE_AI_API_KEY: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
      GOOGLE_CHAT_MODEL: process.env.GOOGLE_CHAT_MODEL,
      GOOGLE_EMBEDDING_MODEL: process.env.GOOGLE_EMBEDDING_MODEL,
    },
  });
