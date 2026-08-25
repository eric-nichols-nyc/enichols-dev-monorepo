import { openai } from "@ai-sdk/openai";
import { type InferAgentUIMessage, ToolLoopAgent } from "ai";
import { weatherTool } from "@/lib/ai/tools/weather-tool";

export const weatherAgent = new ToolLoopAgent({
  model: openai("gpt-4o"),
  instructions: "You are a helpful assistant.",
  tools: {
    weather: weatherTool,
  },
});

export type WeatherAgentUIMessage = InferAgentUIMessage<typeof weatherAgent>;
