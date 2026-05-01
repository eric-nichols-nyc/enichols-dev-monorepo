import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";
import { keys } from "../keys";

const config = keys();
const resolveProvider = () => {
  if (config.AI_PROVIDER) {
    return config.AI_PROVIDER;
  }

  // Convenience fallback: infer provider when only one key is configured.
  if (config.GOOGLE_GENERATIVE_AI_API_KEY && !config.OPENAI_API_KEY) {
    return "google";
  }

  return "openai";
};

export const modelProvider = resolveProvider();

const getRequired = (value: string | undefined, keyName: string) => {
  if (!value) {
    throw new Error(`[ai] Missing required environment variable: ${keyName}`);
  }
  return value;
};

const modelsByProvider = () => {
  if (modelProvider === "google") {
    const google = createGoogleGenerativeAI({
      apiKey: getRequired(
        config.GOOGLE_GENERATIVE_AI_API_KEY,
        "GOOGLE_GENERATIVE_AI_API_KEY"
      ),
    });

    return {
      chat: google(config.GOOGLE_CHAT_MODEL ?? "gemini-2.5-flash"),
      embeddings: google(config.GOOGLE_EMBEDDING_MODEL ?? "text-embedding-004"),
    };
  }

  const openai = createOpenAI({
    apiKey: getRequired(config.OPENAI_API_KEY, "OPENAI_API_KEY"),
  });

  return {
    chat: openai(config.OPENAI_CHAT_MODEL ?? "gpt-4o-mini"),
    embeddings: openai(
      config.OPENAI_EMBEDDING_MODEL ?? "text-embedding-3-small"
    ),
  };
};

export const models: { chat: unknown; embeddings: unknown } =
  modelsByProvider();
