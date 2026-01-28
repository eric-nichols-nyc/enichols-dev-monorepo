import { createOpenAI } from "@ai-sdk/openai";
import { keys } from "../keys";

const openai = createOpenAI({
  apiKey: keys().OPENAI_API_KEY,
});

// Type annotation omitted to avoid pulling in @ai-sdk/provider; inferred type is correct.
export const models = {
  chat: openai("gpt-4o-mini"),
  embeddings: openai("text-embedding-3-small"),
} as { chat: ReturnType<typeof openai>; embeddings: ReturnType<typeof openai> };
