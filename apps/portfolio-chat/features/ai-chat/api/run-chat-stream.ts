import type { UIMessage } from "@repo/ai";
import { stepCountIs, streamText } from "@repo/ai";
import { models } from "@repo/ai/lib/models";
import projects from "@/data/projects";
import {
  createAboutStreamModeState,
  getAboutStreamModeDecision,
} from "@/features/ai-chat/lib/about-stream-mode";
import { streamCopy } from "@/features/ai-chat/lib/stream-copy";
import type { SimpleModelMessage } from "@/features/ai-chat/lib/to-simple-model-messages";
import type { LoadedKnowledgeContext } from "@/features/ai-chat/types/loaded-knowledge-context";
import type {
  PortfolioToolName,
  RoutingResult,
} from "@/features/ai-chat/types/routing-result";
import { buildGroundedSystemPrompt } from "@/features/ai-chat/utils/build-grounded-prompt";
import { getHybridNarration } from "@/features/ai-chat/utils/get-hybrid-narration";
import {
  getLegacyPortfolioAssistantSystemPrompt,
  getPortfolioAssistantSystemPrompt,
} from "@/lib/ai/prompts/portfolio-assistant";
import { aboutCopy, aboutRelated } from "@/lib/ai/tools/about";
import { portfolioChatTools } from "@/lib/ai/tools/portfolio-tools";

const CLARIFICATION_COPY =
  "I don't see that project in my portfolio. Here are my published projects—you can pick one to explore.";

type StreamWriter = {
  write: (part: {
    type: string;
    id?: string;
    delta?: string;
    data?: unknown;
  }) => void;
};

type RunChatStreamParams = {
  writer: StreamWriter;
  modelMessages: SimpleModelMessage[];
  routing: RoutingResult;
  knowledgeContext: LoadedKnowledgeContext;
  useLegacyAboutStream: boolean;
};

function getProjectsFollowUp(): string {
  const sampleTitles = projects
    .slice(0, 3)
    .map((project) => project.title)
    .join(", ");

  return `From ${sampleTitles}—here are some of my projects spanning AI and full-stack work. Each has a live demo you can explore. Pick one and I'll dive in, or ask me about the stack, challenges, or anything else.`;
}

const TECH_STACK_FOLLOW_UP =
  "Here's the tech stack. Want to hear about a specific technology? Or how I've used it in a project?";

function buildStreamTextOptions(
  params: RunChatStreamParams & { forcedTool?: PortfolioToolName }
) {
  const { modelMessages, routing, knowledgeContext, useLegacyAboutStream, forcedTool } =
    params;

  if (useLegacyAboutStream) {
    return {
      // biome-ignore lint/suspicious/noExplicitAny: ToolSet/Zod mismatch between app deps and @repo/ai
      tools: portfolioChatTools as any,
      // biome-ignore lint/suspicious/noExplicitAny: Provider model versions differ across SDK packages in this monorepo
      model: models.chat as any,
      stopWhen: stepCountIs(1),
      system: getLegacyPortfolioAssistantSystemPrompt(),
      messages: modelMessages,
    };
  }

  if (routing.responseType === "context_aware_ai") {
    return {
      model: models.chat as any,
      stopWhen: stepCountIs(1),
      system: buildGroundedSystemPrompt(knowledgeContext),
      messages: modelMessages,
    };
  }

  return {
    tools: portfolioChatTools as any,
    model: models.chat as any,
    stopWhen: stepCountIs(1),
    system: getPortfolioAssistantSystemPrompt(),
    messages: modelMessages,
    toolChoice: forcedTool
      ? ({ type: "tool", toolName: forcedTool } as const)
      : undefined,
  };
}

export async function runChatStream(params: RunChatStreamParams): Promise<void> {
  const { writer, routing, knowledgeContext, useLegacyAboutStream } = params;
  const writeChunk = params.writer;

  if (routing.clarificationNeeded) {
    await streamCopy(writeChunk, "routing-clarify", CLARIFICATION_COPY);
  }

  const forcedTool =
    routing.responseType === "static_display" || routing.responseType === "hybrid"
      ? routing.tool
      : routing.clarificationNeeded
        ? ("show_projects" as const)
        : undefined;

  const result = streamText(
    buildStreamTextOptions({ ...params, forcedTool })
  );

  const uiStream = result.toUIMessageStream();
  const textIdAbout = "about-follow-up";
  const textIdProjects = "projects-follow-up";
  const textIdTechStack = "tech-stack-follow-up";
  const textIdHybrid = "hybrid-narration";
  const aboutStreamModeState = createAboutStreamModeState();
  const projectsFollowUp = getProjectsFollowUp();
  let hybridNarrationSent = false;

  for await (const chunk of uiStream) {
    const c = chunk as {
      type?: string;
      toolName?: string;
      toolCallId?: string;
      output?: unknown;
    };

    const aboutDecision = getAboutStreamModeDecision({
      aboutRenderMode: "text",
      chunk: c,
      state: aboutStreamModeState,
    });

    if (aboutDecision.shouldStreamAboutText) {
      await streamCopy(writeChunk, textIdAbout, aboutCopy);
      writeChunk.write({
        type: "data-related",
        id: "about-related",
        data: { suggestions: [...aboutRelated] },
      });
    }

    if (aboutDecision.suppressChunk) {
      continue;
    }

    writer.write(chunk);

    if (
      c.type === "tool-output-available" &&
      c.output &&
      typeof c.output === "object"
    ) {
      if ("projects" in c.output) {
        await streamCopy(writeChunk, textIdProjects, projectsFollowUp);
      } else if ("technologies" in c.output) {
        await streamCopy(writeChunk, textIdTechStack, TECH_STACK_FOLLOW_UP);

        if (
          routing.responseType === "hybrid" &&
          !hybridNarrationSent &&
          !useLegacyAboutStream
        ) {
          const narration = getHybridNarration(knowledgeContext);
          if (narration) {
            await streamCopy(writeChunk, textIdHybrid, narration);
            hybridNarrationSent = true;
          }
        }
      }
    }
  }
}
