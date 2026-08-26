import { tool } from "langchain";
import { z } from "zod";

/**
 * Low-level tool — returns a fake temperature for a city.
 * Called by `getCityWeather`, not registered on the agent by itself
 * (so the model only sees the outer tool).
 */
export const lookupTemperature = tool(
  async ({ city }: { city: string }) => {
    // Deterministic mock so demos are predictable
    const seed = [...city.toLowerCase()].reduce(
      (sum, char) => sum + char.charCodeAt(0),
      0
    );
    const temperature = 55 + (seed % 30);

    return {
      city,
      temperature,
      unit: "F" as const,
      source: "lookup_temperature",
    };
  },
  {
    name: "lookup_temperature",
    description:
      "Look up the current temperature for a city. Returns °F. Internal helper — prefer get_city_weather.",
    schema: z.object({
      city: z.string().describe("City name"),
    }),
  }
);

/**
 * Outer tool the model calls. Demonstrates a LangChain tool invoking another tool.
 */
export const getCityWeather = tool(
  async ({ city }: { city: string }) => {
    // Nested tool call — this is the teaching point
    const tempResult = await lookupTemperature.invoke({ city });

    const conditions = ["sunny", "cloudy", "rainy", "windy"] as const;
    const condition =
      conditions[
        [...city.toLowerCase()].reduce(
          (sum, char) => sum + char.charCodeAt(0),
          0
        ) % conditions.length
      ];

    return {
      city,
      temperature: tempResult.temperature,
      unit: tempResult.unit,
      condition,
      calledVia: "get_city_weather → lookup_temperature",
    };
  },
  {
    name: "get_city_weather",
    description:
      "Get a weather summary for a city. Internally calls lookup_temperature, then adds conditions.",
    schema: z.object({
      city: z.string().describe("City name to get weather for"),
    }),
  }
);
