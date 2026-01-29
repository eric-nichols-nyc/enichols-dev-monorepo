import type { UIMessage } from "@repo/ai";
import { convertToModelMessages, streamText, tool } from "@repo/ai";
import { models } from "@repo/ai/lib/models";
import { z } from "zod";
import projects from "@/data/projects";

const tools = {
  show_projects: tool({
    description: "Display portfolio projects",
    // biome-ignore lint/suspicious/noExplicitAny: Zod version mismatch with @repo/ai
    inputSchema: z.object({}) as any,
    execute: () => {
      const data = {
        projectCount: projects.length,
        projects,
      };
      console.log("[chat:tool] show_projects called, returning:", {
        projectCount: data.projectCount,
        projectTitles: data.projects.map((p) => p.title),
      });
      return Promise.resolve(data);
    },
  }),
};

export async function POST(request: Request) {
  try {
    console.log("[chat:api] POST /api/chat received");
    const body = (await request.json()) as { messages?: UIMessage[] };
    const { messages } = body;

    if (!messages?.length) {
      console.log("[chat:api] rejected: no messages");
      return new Response(JSON.stringify({ error: "Messages are required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const lastUser = messages.filter((m) => m.role === "user").at(-1);
    const lastText =
      lastUser?.parts
        ?.filter((p): p is { type: "text"; text: string } => p.type === "text")
        .map((p) => p.text)
        .join(" ") ?? "(none)";
    console.log(
      "[chat:api] messages count:",
      messages.length,
      "| last user:",
      lastText
    );

    const modelMessages = convertToModelMessages(messages);
    console.log(
      "[chat:api] converted to model messages, count:",
      modelMessages.length
    );

    const result = streamText({
      // biome-ignore lint/suspicious/noExplicitAny: ToolSet/Zod mismatch between app deps and @repo/ai
      tools: tools as any,
      model: models.chat,
      system: `You are Eric Nichols portfolio assistant.
When the user asks to see projects, use the show_projects tool.
Answer other questions about his work conversationally.`,
      messages: modelMessages,
    });

    console.log("[chat:api] streamText started, returning UI stream response");
    return result.toUIMessageStreamResponse({ originalMessages: messages });
  } catch (error) {
    console.error("[chat:api] error:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to process chat request. Please try again.",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
