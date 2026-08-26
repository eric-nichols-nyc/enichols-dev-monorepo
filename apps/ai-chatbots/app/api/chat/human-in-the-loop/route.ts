/**
 * POST /api/chat/human-in-the-loop
 *
 * Thin JSON API over the LangGraph refund agent.
 *
 * Body:
 *   { action: "start", message: "I want a refund" }
 *     → runs graph until interrupt → { status: "interrupted", threadId, messages }
 *
 *   { action: "continue", threadId }
 *     → resumes same thread → { status: "complete", messages, finalMessage }
 *
 * Client: `components/human-in-the-loop-chat.tsx`
 */
import {
  continueRefundFlow,
  startRefundFlow,
} from "@/lib/ai/agents/hitl-refund-agent";

export const maxDuration = 30;

type Body = {
  /** User chat text — required for action "start" */
  message?: string;
  /** Checkpoint key — required for action "continue", optional on start */
  threadId?: string;
  /** "start" (default) begins a new graph; "continue" resumes after interrupt */
  action?: "start" | "continue";
};

function newThreadId() {
  return `hitl-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Body;
    const action = body.action ?? "start";

    // ── Resume after human Continue ────────────────────────────────────────
    if (action === "continue") {
      if (!body.threadId) {
        return Response.json(
          { error: "threadId is required to continue" },
          { status: 400 }
        );
      }

      const result = await continueRefundFlow(body.threadId);
      return Response.json(result);
    }

    // ── Start new refund flow (runs until interrupt) ───────────────────────
    const message = body.message?.trim();
    if (!message) {
      return Response.json({ error: "message is required" }, { status: 400 });
    }

    const threadId = body.threadId?.trim() || newThreadId();
    const result = await startRefundFlow(message, threadId);
    return Response.json(result);
  } catch (error) {
    console.error("[api/chat/human-in-the-loop]:", error);
    return Response.json(
      { error: "Failed to process human-in-the-loop request" },
      { status: 500 }
    );
  }
}
