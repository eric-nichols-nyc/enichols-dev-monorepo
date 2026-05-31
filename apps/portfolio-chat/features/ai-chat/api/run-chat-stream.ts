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
import {
  getTechStackPostToolText,
  shouldStreamProjectsFollowUp,
} from "@/features/ai-chat/utils/post-tool-follow-up";
import {
  getLegacyPortfolioAssistantSystemPrompt,
  getPortfolioAssistantSystemPrompt,
} from "@/lib/ai/prompts/portfolio-assistant";
import { generateSuggestions } from "@/features/ai-chat/utils/generate-suggestions";
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
    output?: unknown;
  }) => void;
};

type RunChatStreamParams = {
  writer: StreamWriter;
  modelMessages: SimpleModelMessage[];
  routing: RoutingResult;
  knowledgeContext: LoadedKnowledgeContext;
  useLegacyAboutStream: boolean;
  dynamicSuggestionsEnabled?: boolean;
};

function stripStaticRelated(output: unknown): unknown {
  if (!output || typeof output !== "object") {
    return output;
  }

  const { related: _related, ...rest } = output as { related?: unknown };
  return rest;
}

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

  if (forcedTool) {
    return {
      tools: portfolioChatTools as any,
      model: models.chat as any,
      stopWhen: stepCountIs(1),
      system: getPortfolioAssistantSystemPrompt(),
      messages: modelMessages,
      toolChoice: { type: "tool", toolName: forcedTool } as const,
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
  };
}

export async function runChatStream(params: RunChatStreamParams): Promise<void> {
  const {
    writer,
    routing,
    knowledgeContext,
    useLegacyAboutStream,
    dynamicSuggestionsEnabled = false,
  } = params;
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
  const aboutStreamModeState = createAboutStreamModeState();
  let assistantText = routing.clarificationNeeded ? CLARIFICATION_COPY : "";
  let lastToolName: string | undefined;

  for await (const chunk of uiStream) {
    const c = chunk as {
      type?: string;
      toolName?: string;
      toolCallId?: string;
      output?: unknown;
      delta?: string;
      text?: string;
    };

    if (typeof c.text === "string") {
      assistantText += c.text;
    } else if (typeof c.delta === "string") {
      assistantText += c.delta;
    }

    const aboutDecision = getAboutStreamModeDecision({
      aboutRenderMode: "text",
      chunk: c,
      state: aboutStreamModeState,
    });

    if (aboutDecision.shouldStreamAboutText) {
      lastToolName = c.toolName ?? "show_about";
      await streamCopy(writeChunk, textIdAbout, aboutCopy);
      assistantText += aboutCopy;

      if (!dynamicSuggestionsEnabled) {
        writeChunk.write({
          type: "data-related",
          id: "about-related",
          data: { suggestions: [...aboutRelated] },
        });
      }
    }

    if (aboutDecision.suppressChunk) {
      continue;
    }

    if (
      dynamicSuggestionsEnabled &&
      c.type === "tool-output-available" &&
      c.output &&
      typeof c.output === "object"
    ) {
      lastToolName = c.toolName;
      writeChunk.write({
        ...(chunk as Record<string, unknown>),
        type: c.type ?? "tool-output-available",
        output: stripStaticRelated(c.output),
      });
    } else {
      writer.write(chunk);

      if (c.type === "tool-output-available") {
        lastToolName = c.toolName;
      }
    }

    if (
      !dynamicSuggestionsEnabled &&
      c.type === "tool-output-available" &&
      c.output &&
      typeof c.output === "object"
    ) {
      if (
        "projects" in c.output &&
        shouldStreamProjectsFollowUp(routing, useLegacyAboutStream)
      ) {
        const sampleTitles = projects
          .slice(0, 3)
          .map((project) => project.title)
          .join(", ");
        const projectsFollowUp = `From ${sampleTitles}—here are some of my projects spanning AI and full-stack work. Each has a live demo you can explore. Pick one and I'll dive in, or ask me about the stack, challenges, or anything else.`;
        await streamCopy(writeChunk, textIdProjects, projectsFollowUp);
        assistantText += projectsFollowUp;
      } else if ("technologies" in c.output) {
        const techFollowUp = getTechStackPostToolText(
          routing,
          knowledgeContext,
          useLegacyAboutStream
        );
        if (techFollowUp) {
          await streamCopy(writeChunk, textIdTechStack, techFollowUp);
          assistantText += techFollowUp;
        }
      }
    }
  }

  if (dynamicSuggestionsEnabled) {
    const suggestions = generateSuggestions({
      routingResult: routing,
      loadedContext: knowledgeContext,
      assistantText: assistantText.trim() || undefined,
      toolName: lastToolName,
    });

    if (suggestions.length > 0) {
      writeChunk.write({
        type: "data-related",
        id: "dynamic-suggestions",
        data: { suggestions },
      });
    }
  }
}
