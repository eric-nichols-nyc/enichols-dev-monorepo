import { Output, streamText } from "@repo/ai";
import { models } from "@repo/ai/lib/models";
import projects from "@/data/projects";
import {
  projectsObjectEnvelopeSchema,
  projectObjectSchema,
  projectsObjectRequestSchema,
  type ProjectsObjectRequest,
} from "./schema";

export const maxDuration = 30;

function resolveRequestInput(json: unknown): ProjectsObjectRequest | null {
  const direct = projectsObjectRequestSchema.safeParse(json);
  if (direct.success) {
    return direct.data;
  }

  if (typeof json === "string") {
    return { prompt: json };
  }

  const envelope = projectsObjectEnvelopeSchema.safeParse(json);
  if (!envelope.success) {
    return null;
  }

  const input = envelope.data.input;
  if (typeof input === "string") {
    return { prompt: input };
  }

  return input ?? {};
}

function buildPrompt(input: ProjectsObjectRequest) {
  const limit = input.limit ?? 6;
  const userPrompt =
    input.prompt?.trim() ||
    "Return featured portfolio projects with concise descriptions.";

  const sourceProjects = projects
    .slice(0, limit)
    .map((project) => ({
      id: project.id,
      title: project.title,
      shortDescription: project.shortDescription,
      tags: project.tags,
      url: project.url,
      image: project.image,
    }));

  const projectCount = sourceProjects.length;

  return `You are formatting project data for a portfolio UI.

Only use projects from SOURCE_PROJECTS and do not invent or modify any values.
Return exactly ${projectCount} projects in the projects array.
Include every SOURCE_PROJECTS item once, preserving original order.
Do not omit any project, and do not add extra projects.

USER_REQUEST:
${userPrompt}

SOURCE_PROJECTS:
${JSON.stringify(sourceProjects)}`;
}

export async function POST(request: Request) {
  try {
    const json = (await request.json()) as unknown;
    const input = resolveRequestInput(json);
    if (!input) {
      return new Response(
        JSON.stringify({
          error: "Invalid request body",
          details:
            "Expected string prompt, { prompt, limit }, or { input: string | { prompt, limit } }.",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const result = streamText({
      // biome-ignore lint/suspicious/noExplicitAny: Provider model versions differ across SDK packages in this monorepo
      model: models.chat as any,
      output: Output.object({ schema: projectObjectSchema }),
      prompt: buildPrompt(input),
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error("[projects-object:api] error:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to stream project objects. Please try again.",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
