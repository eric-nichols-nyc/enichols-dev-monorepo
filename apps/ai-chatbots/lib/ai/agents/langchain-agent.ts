import { ChatOpenAI } from "@langchain/openai";
import { createAgent } from "langchain";
import { getCityWeather } from "@/lib/ai/tools/langchain-weather-tools";

/**
 * LangChain ReAct agent for the /langchain-chat demo.
 *
 * Use an explicit ChatOpenAI instance — model strings like "openai:gpt-4o-mini"
 * rely on dynamic imports that Next.js cannot resolve at build time.
 *
 * Only `get_city_weather` is registered. That tool calls `lookup_temperature`
 * internally — nested tool use without requiring a second model step.
 */
export const langchainWeatherAgent = createAgent({
  model: new ChatOpenAI({
    model: process.env.OPENAI_CHAT_MODEL ?? "gpt-4o-mini",
    temperature: 0,
  }),
  tools: [getCityWeather],
  systemPrompt:
    "You are a helpful assistant. When the user asks about weather in a city, use the get_city_weather tool. Explain briefly that get_city_weather called lookup_temperature under the hood when you report results.",
});
