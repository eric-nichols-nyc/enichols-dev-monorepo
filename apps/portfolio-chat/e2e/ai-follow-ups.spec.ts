import { createServer, type ServerResponse } from "node:http";
import { expect, test } from "@playwright/test";
import experience from "../data/experience";
import tech from "../data/tech.json";

function event(part: object): string { return `data: ${JSON.stringify(part)}\n\n`; }
function finish(response: ServerResponse) {
  response.end(`${event({ type: "finish" })}data: [DONE]\n\n`);
}
function text(response: ServerResponse, copy: string) {
  response.write(event({ type: "text-start", id: "answer" }));
  response.write(event({ type: "text-delta", id: "answer", delta: copy }));
  response.write(event({ type: "text-end", id: "answer" }));
}
function questions(response: ServerResponse, suggestions: string[]) {
  response.write(event({ type: "data-related", id: "follow-ups", data: { suggestions } }));
}

/** A streaming transport fixture tests delayed parts and genuine fetch cancellation. */
async function streamServer(reply: (response: ServerResponse, question: string) => void) {
  const requests: string[] = [];
  const server = createServer((request, response) => {
    response.setHeader("Access-Control-Allow-Origin", "http://localhost:3018");
    response.setHeader("Access-Control-Allow-Headers", "Content-Type");
    response.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    if (request.method === "OPTIONS") { response.end(); return; }
    let body = "";
    request.on("data", (chunk) => { body += chunk; });
    request.on("end", () => {
      const messages = JSON.parse(body).messages as { role: string; parts: { type: string; text?: string }[] }[];
      const question = messages.filter((message) => message.role === "user").at(-1)?.parts
        .filter((part) => part.type === "text").map((part) => part.text).join(" ") ?? "";
      requests.push(question);
      response.setHeader("Content-Type", "text/event-stream");
      response.setHeader("x-vercel-ai-ui-message-stream", "v1");
      response.write(event({ type: "start", messageId: `reply-${requests.length}` }));
      reply(response, question);
    });
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("Missing fixture server address");
  return {
    url: `http://127.0.0.1:${address.port}/api/chat`, requests,
    close: async () => {
      server.closeAllConnections();
      await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
    },
  };
}

for (const scenario of [
  { topic: "About", question: "How do you collaborate with product and design?", answer: "I partner with product and design to ship intuitive interfaces." },
  { topic: "Experience", question: "What did you build at IBM?", answer: "At IBM, I built React interfaces for content marketers." },
  { topic: "Tech", question: "How have you used React?", answer: "React powers my production interfaces." },
]) {
  test(`${scenario.topic} shows one contextual question set and clicking submits the exact question`, async ({ page }) => {
    const fixture = await streamServer((response, question) => {
      if (question === scenario.question) text(response, scenario.answer);
      else if (scenario.topic === "About") text(response, "I build accessible React interfaces and collaborate with product and design.");
      else {
        const toolName = scenario.topic === "Experience" ? "show_experience" : "show_tech_stack";
        response.write(event({ type: "tool-input-available", toolCallId: "cards", toolName, input: {} }));
        response.write(event({ type: "tool-output-available", toolCallId: "cards", output:
          scenario.topic === "Experience" ? { experience } : { tech },
        }));
      }
      if (question !== scenario.question) questions(response, [scenario.question]);
      finish(response);
    });
    try {
      await page.route("**/api/chat", (route) => route.continue({ url: fixture.url }));
      await page.goto("/");
      await page.locator("nav[aria-label=Navigation]:visible").getByRole("button", { name: scenario.topic, exact: true }).click();
      await expect(page.getByRole("heading", { name: "Related Questions", exact: true })).toHaveCount(1);
      await page.getByRole("button", { name: scenario.question, exact: true }).click();
      await expect(page.getByText(scenario.answer, { exact: true })).toBeVisible();
      expect(fixture.requests.at(-1)).toBe(scenario.question);
    } finally { await fixture.close(); }
  });
}

test("content appears before delayed follow-ups and clearing chat cancels pending output", async ({ page }) => {
  let disconnected = false;
  const fixture = await streamServer((response) => {
    text(response, "The main answer is already available.");
    const timer = setTimeout(() => {
      questions(response, ["How have you used React?"]);
      finish(response);
    }, 2_000);
    response.on("close", () => { disconnected = true; clearTimeout(timer); });
  });
  try {
    await page.route("**/api/chat", (route) => route.continue({ url: fixture.url }));
    await page.goto("/");
    const input = page.getByPlaceholder(/type a message/i);
    await input.fill("Tell me about yourself");
    await input.press("Enter");
    await expect(page.getByText("The main answer is already available.", { exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Related Questions" })).toHaveCount(0);
    await page.getByRole("button", { name: "Clear chat and start fresh" }).click();
    await expect(page.getByTestId("chat-welcome-message")).toBeInViewport();
    await expect(page.getByTestId("chat-turn")).toHaveCount(0);
    await expect.poll(() => disconnected).toBe(true);
    await expect(page.getByRole("button", { name: "How have you used React?", exact: true })).toHaveCount(0);
  } finally { await fixture.close(); }
});

test("starting a new turn cancels pending questions from the previous turn", async ({ page }) => {
  let firstDisconnected = false;
  const fixture = await streamServer((response, question) => {
    if (question === "New topic") { text(response, "The new response is ready."); finish(response); return; }
    text(response, "The first response is ready.");
    const timer = setTimeout(() => { questions(response, ["Stale question?"]); finish(response); }, 2_000);
    response.on("close", () => { firstDisconnected = true; clearTimeout(timer); });
  });
  try {
    await page.route("**/api/chat", (route) => route.continue({ url: fixture.url }));
    await page.goto("/");
    const input = page.getByPlaceholder(/type a message/i);
    await input.fill("Tell me about yourself"); await input.press("Enter");
    await expect(page.getByText("The first response is ready.", { exact: true })).toBeVisible();
    await input.fill("New topic"); await input.press("Enter");
    await expect(page.getByText("The new response is ready.", { exact: true })).toBeVisible();
    await expect.poll(() => firstDisconnected).toBe(true);
    await expect(page.getByRole("button", { name: "Stale question?", exact: true })).toHaveCount(0);
  } finally { await fixture.close(); }
});
