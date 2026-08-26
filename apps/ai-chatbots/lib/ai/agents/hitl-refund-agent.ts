/**
 * LangGraph human-in-the-loop refund agent.
 *
 * Graph shape:
 *   START → request_refund → await_approval (interrupt) → issue_refund → END
 *
 * Key ideas:
 * - `MemorySaver` checkpoints state by `thread_id` so we can pause and resume.
 * - `interrupt()` in `approvalNode` stops the graph and returns `__interrupt__`
 *   to the client. The UI shows a Continue button.
 * - `Command({ resume: true })` resumes the same thread and runs `issue_refund`.
 *
 * Used by: `app/api/chat/human-in-the-loop/route.ts`
 */
import {
  Annotation,
  Command,
  END,
  INTERRUPT,
  MemorySaver,
  START,
  StateGraph,
  interrupt,
  isInterrupted,
} from "@langchain/langgraph";
import { issueRefund, requestRefund } from "@/lib/ai/tools/refund-tools";

// ─── Graph state ─────────────────────────────────────────────────────────────

const RefundState = Annotation.Root({
  /** Latest user text (e.g. "I want a refund") */
  userMessage: Annotation<string>,
  /** Reason carried through the graph into issue_refund */
  reason: Annotation<string>,
  /**
   * Chat transcript for the UI.
   * Reducer appends — each node adds its own messages without wiping prior ones.
   */
  messages: Annotation<
    Array<{
      id: string;
      role: "user" | "assistant";
      content: string;
      toolName?: string;
    }>
  >({
    reducer: (left, right) => left.concat(right),
    default: () => [],
  }),
  /** Final assistant line after the refund is issued */
  finalMessage: Annotation<string>({
    reducer: (_left, right) => right,
    default: () => "",
  }),
});

export type RefundGraphState = typeof RefundState.State;

function newId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

// ─── Nodes ───────────────────────────────────────────────────────────────────

/** Node 1: call request_refund tool, then prompt the user to Continue. */
async function requestNode(state: RefundGraphState) {
  const reason = state.userMessage.trim() || "Customer requested a refund";
  const result = await requestRefund.invoke({ reason });

  return {
    reason,
    messages: [
      {
        id: newId("tool"),
        role: "assistant" as const,
        content: result.message,
        toolName: "request_refund",
      },
      {
        id: newId("assistant"),
        role: "assistant" as const,
        content:
          "Your refund request is ready. Click Continue to approve and issue it.",
      },
    ],
  };
}

/**
 * Node 2: human-in-the-loop pause.
 * `interrupt()` throws a special signal — LangGraph checkpoints here and
 * returns control to the API. Execution resumes only after Command({ resume }).
 */
function approvalNode(_state: RefundGraphState) {
  interrupt({
    action: "approve_refund",
    message: "Approve issuing this refund?",
  });

  // Runs only after resume — interrupt() never "returns" on the first pass.
  return {};
}

/** Node 3: call issue_refund tool and append the success message. */
async function issueNode(state: RefundGraphState) {
  const result = await issueRefund.invoke({ reason: state.reason });

  return {
    finalMessage: result.message,
    messages: [
      {
        id: newId("tool"),
        role: "assistant" as const,
        content: result.message,
        toolName: "issue_refund",
      },
    ],
  };
}

// ─── Compile graph ───────────────────────────────────────────────────────────

/** In-memory checkpointer — thread state lives in process memory (local demo). */
const checkpointer = new MemorySaver();

const workflow = new StateGraph(RefundState)
  .addNode("request_refund", requestNode)
  .addNode("await_approval", approvalNode)
  .addNode("issue_refund", issueNode)
  .addEdge(START, "request_refund")
  .addEdge("request_refund", "await_approval")
  .addEdge("await_approval", "issue_refund")
  .addEdge("issue_refund", END);

export const hitlRefundGraph = workflow.compile({ checkpointer });

// ─── Public API for the route ────────────────────────────────────────────────

export type HitlChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  /** When set, the UI renders a tool card instead of plain text */
  toolName?: string;
};

export type HitlInvokeResult =
  | {
      /** Graph paused at interrupt — UI should show Continue */
      status: "interrupted";
      threadId: string;
      messages: HitlChatMessage[];
      interrupt: unknown;
    }
  | {
      /** Graph finished — refund issued */
      status: "complete";
      threadId: string;
      messages: HitlChatMessage[];
      finalMessage: string;
    };

function extractMessages(state: RefundGraphState): HitlChatMessage[] {
  return state.messages ?? [];
}

/**
 * Start a new refund thread.
 * Runs until `await_approval` interrupts, then returns status: "interrupted".
 */
export async function startRefundFlow(
  userMessage: string,
  threadId: string
): Promise<HitlInvokeResult> {
  // Same thread_id must be used on continue so MemorySaver finds the checkpoint
  const config = { configurable: { thread_id: threadId } };

  const result = await hitlRefundGraph.invoke(
    {
      userMessage,
      reason: "",
      messages: [
        {
          id: newId("user"),
          role: "user" as const,
          content: userMessage,
        },
      ],
    },
    config
  );

  if (isInterrupted(result)) {
    return {
      status: "interrupted",
      threadId,
      messages: extractMessages(result as RefundGraphState),
      interrupt: result[INTERRUPT],
    };
  }

  const complete = result as RefundGraphState;
  return {
    status: "complete",
    threadId,
    messages: extractMessages(complete),
    finalMessage: complete.finalMessage,
  };
}

/**
 * Resume a paused thread after the user clicks Continue.
 * Passes `Command({ resume: true })` back into the interrupt() call site.
 */
export async function continueRefundFlow(
  threadId: string
): Promise<HitlInvokeResult> {
  const config = { configurable: { thread_id: threadId } };

  const result = await hitlRefundGraph.invoke(
    new Command({ resume: true }),
    config
  );

  if (isInterrupted(result)) {
    return {
      status: "interrupted",
      threadId,
      messages: extractMessages(result as RefundGraphState),
      interrupt: result[INTERRUPT],
    };
  }

  const complete = result as RefundGraphState;
  return {
    status: "complete",
    threadId,
    messages: extractMessages(complete),
    finalMessage: complete.finalMessage || "Your refund has been issued",
  };
}
