import { stepCountIs, streamText } from "@repo/ai";
import { models } from "@repo/ai/lib/models";
import projects, { type Project } from "@/data/projects";
import { getProjectQuestions } from "@/features/project-details/lib/project-questions";
import { getProjectsDisplayOutput } from "@/features/ai-chat/utils/get-projects-display-output";
import {
  createAboutStreamModeState,
  getAboutStreamModeDecision,
} from "@/features/ai-chat/lib/about-stream-mode";
import { streamCopy } from "@/features/ai-chat/lib/stream-copy";
import { generateAiFollowUps } from "@/features/ai-chat/lib/generate-ai-follow-ups";
import type { FollowUpMessage, FollowUpToolResult } from "@/features/ai-chat/types/follow-up-context";
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
import { buildFollowUpContext } from "@/features/ai-chat/utils/build-follow-up-context";
import { selectAboutIntro } from "@/features/ai-chat/utils/select-about-intro";
import { aboutRelated } from "@/lib/ai/tools/about";
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
    input?: unknown;
    toolCallId?: string;
    toolName?: string;
  }) => void;
};

type RunChatStreamParams = {
  writer: StreamWriter;
  modelMessages: SimpleModelMessage[];
  routing: RoutingResult;
  knowledgeContext: LoadedKnowledgeContext;
  userText: string;
  useLegacyAboutStream: boolean;
  dynamicSuggestionsEnabled?: boolean;
  aiFollowUpsEnabled?: boolean;
  messages?: readonly FollowUpMessage[];
  abortSignal?: AbortSignal;
  project?: Project;
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
      system: buildGroundedSystemPrompt(knowledgeContext, routing.intent)
        + (params.project ? `\n\n## Current project view\nThe visitor is reading ${JSON.stringify(params.project.title)}. References to this project, it, or its stack mean this selected project. Answer only from its supplied knowledge and published facts. Keep answers concise and conversational. If a requested detail is missing, say so. For other projects or broader career questions, suggest returning to the main chat. Do not switch projects or display portfolio tools here.` : ""),
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
    userText,
    useLegacyAboutStream,
    dynamicSuggestionsEnabled = false,
    aiFollowUpsEnabled = false,
  } = params;
  if (params.abortSignal?.aborted) return;
  if (routing.intent === "show_projects") {
    const toolCallId = crypto.randomUUID();
    const output = getProjectsDisplayOutput();
    writer.write({ type: "start" });
    writer.write({
      type: "tool-input-available",
      toolCallId,
      toolName: "show_projects",
      input: {},
    });
    writer.write({
      type: "tool-output-available",
      toolCallId,
      output: stripStaticRelated(output),
    });
    writer.write({
      type: "data-related",
      id: "projects-related",
      data: {
        suggestions: dynamicSuggestionsEnabled
          ? generateSuggestions({
              routingResult: routing,
              loadedContext: knowledgeContext,
              toolName: "show_projects",
            })
          : output.related,
      },
    });
    writer.write({ type: "finish" });
    return;
  }

  const aboutIntro = useLegacyAboutStream
    ? selectAboutIntro(userText || routing.originalMessage)
    : null;
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
    { ...buildStreamTextOptions({ ...params, forcedTool }), abortSignal: params.abortSignal }
  );

  const uiStream = result.toUIMessageStream({
    onError: () => "The chat assistant is temporarily unavailable. Please try again later.",
  });
  const textIdAbout = "about-follow-up";
  const textIdProjects = "projects-follow-up";
  const textIdTechStack = "tech-stack-follow-up";
  const aboutStreamModeState = createAboutStreamModeState();
  let assistantText = routing.clarificationNeeded ? CLARIFICATION_COPY : "";
  let lastToolName: string | undefined;
  const toolNames = new Map<string, string>();
  const toolResults: FollowUpToolResult[] = [];
  let finishChunk: Parameters<StreamWriter["write"]>[0] | undefined;
  let mainResponseFailed = false;

  for await (const chunk of uiStream) {
    const c = chunk as {
      type?: string;
      toolName?: string;
      toolCallId?: string;
      output?: unknown;
      delta?: string;
      text?: string;
      finishReason?: string;
    };

    if (params.abortSignal?.aborted || c.type === "abort") return;
    if (c.type === "finish") {
      mainResponseFailed ||= c.finishReason === "error";
      finishChunk = chunk;
      continue;
    }
    if (c.type === "tool-output-error") mainResponseFailed = true;
    if (c.toolCallId && c.toolName) toolNames.set(c.toolCallId, c.toolName);
    if (c.type === "tool-output-available") {
      const toolName = c.toolName ?? toolNames.get(c.toolCallId ?? "") ?? routing.tool;
      lastToolName = toolName;
      if (toolName === "show_about" || toolName === "show_experience" || toolName === "show_tech_stack") {
        toolResults.push({ toolName, output: c.output });
      }
    }

    if (c.type === "error") {
      writer.write(chunk);
      return;
    }

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

    if (aboutDecision.shouldStreamAboutText && aboutIntro) {
      lastToolName = c.toolName ?? "show_about";
      await streamCopy(writeChunk, textIdAbout, aboutIntro.copy, params.abortSignal);
      assistantText += aboutIntro.copy;

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
      writeChunk.write({
        ...(chunk as Record<string, unknown>),
        type: c.type ?? "tool-output-available",
        output: stripStaticRelated(c.output),
      });
    } else {
      writer.write(chunk);

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
        await streamCopy(writeChunk, textIdProjects, projectsFollowUp, params.abortSignal);
        assistantText += projectsFollowUp;
      } else if ("technologies" in c.output) {
        const techFollowUp = getTechStackPostToolText(
          routing,
          knowledgeContext,
          useLegacyAboutStream
        );
        if (techFollowUp) {
          await streamCopy(writeChunk, textIdTechStack, techFollowUp, params.abortSignal);
          assistantText += techFollowUp;
        }
      }
    }
  }

  if (dynamicSuggestionsEnabled && !mainResponseFailed) {
    let suggestions = params.project ? getProjectQuestions(params.project, params.messages) : generateSuggestions({
      routingResult: routing,
      loadedContext: knowledgeContext,
      assistantText: assistantText.trim() || undefined,
      toolName: lastToolName,
    });

    if (aiFollowUpsEnabled && !routing.clarificationNeeded) {
      const followUpStartedAt = Date.now();
      const context = buildFollowUpContext({
        routingResult: routing,
        loadedContext: knowledgeContext,
        assistantText,
        messages: params.messages,
        toolResults,
      });
      const generated = await generateAiFollowUps({
        context, fallbackSuggestions: suggestions, abortSignal: params.abortSignal,
      });
      console.info("[chat:follow-ups]", {
        intent: routing.intent,
        outcome: generated.outcome,
        reason: generated.reason,
        durationMs: Date.now() - followUpStartedAt,
        suggestionCount: generated.suggestions.length,
        ...(generated.rejections ? { rejections: generated.rejections } : {}),
      });
      if (generated.outcome === "cancelled") return;
      suggestions = generated.suggestions;
    }

    if (suggestions.length > 0 && !params.abortSignal?.aborted) {
      writeChunk.write({
        type: "data-related",
        id: "dynamic-suggestions",
        data: { suggestions },
      });
    }
  }
  if (finishChunk && !params.abortSignal?.aborted) writer.write(finishChunk);
}
