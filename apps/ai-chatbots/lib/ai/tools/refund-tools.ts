/**
 * Refund tools for the LangGraph human-in-the-loop demo.
 *
 * Flow:
 *   1. `requestRefund` — runs BEFORE the graph pauses (records the request)
 *   2. Human clicks Continue in the UI
 *   3. `issueRefund` — runs AFTER resume (issues the refund)
 *
 * These are plain LangChain tools invoked by graph nodes in
 * `lib/ai/agents/hitl-refund-agent.ts` — not by an LLM in this demo.
 */
import { tool } from "langchain";
import { z } from "zod";

/** Step 1 — record the refund request. Called by the `request_refund` graph node. */
export const requestRefund = tool(
  async ({ reason }: { reason: string }) => {
    return {
      status: "pending_approval" as const,
      reason,
      message: "Refund request received and waiting for approval.",
    };
  },
  {
    name: "request_refund",
    description:
      "Record a customer refund request. Call this when the user asks for a refund.",
    schema: z.object({
      reason: z.string().describe("Why the customer wants a refund"),
    }),
  }
);

/** Step 3 — issue the refund. Called by the `issue_refund` graph node after Continue. */
export const issueRefund = tool(
  async ({ reason }: { reason: string }) => {
    return {
      status: "issued" as const,
      reason,
      message: "Your refund has been issued",
    };
  },
  {
    name: "issue_refund",
    description:
      "Issue a refund after a human has approved the request. Only call after approval.",
    schema: z.object({
      reason: z.string().describe("Why the refund was requested"),
    }),
  }
);
