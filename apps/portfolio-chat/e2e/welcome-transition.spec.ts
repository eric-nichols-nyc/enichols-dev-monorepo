import { expect, test, type Page } from "@playwright/test";
import type { UIMessage } from "ai";

async function mockChat(page: Page) {
  const requests: UIMessage[][] = [];
  await page.route("**/api/chat", async (route) => {
    const body = route.request().postDataJSON() as { messages: UIMessage[] };
    requests.push(body.messages);
    const count = requests.length;
    const parts = [
      { type: "start", messageId: `answer-${count}` },
      { type: "text-start", id: "answer" },
      { type: "text-delta", id: "answer", delta: `Response ${count}.` },
      { type: "text-end", id: "answer" },
      { type: "finish" },
    ];
    await route.fulfill({
      contentType: "text/event-stream",
      headers: { "x-vercel-ai-ui-message-stream": "v1" },
      body: parts.map((part) => `data: ${JSON.stringify(part)}\n\n`).join("") + "data: [DONE]\n\n",
    });
  });
  return requests;
}

async function expectLatestTurnAtTop(page: Page) {
  await expect.poll(() => page.getByTestId("chat-turn").last().evaluate((turn) => {
    const viewport = turn.closest('[role="log"]')!;
    return Math.round(turn.getBoundingClientRect().top - viewport.getBoundingClientRect().top);
  })).toBe(16);
}

test("welcome stays stable above later turns and never enters AI history", async ({ page }) => {
  const requests = await mockChat(page);
  await page.goto("/");
  const welcome = page.getByTestId("chat-welcome-message");
  await page.getByRole("button", { name: "Explore my work", exact: true }).click();
  await expect(page.getByText("Response 1.", { exact: true })).toBeVisible();
  await expectLatestTurnAtTop(page);
  await expect(welcome).toHaveCount(1);
  await expect(welcome).not.toBeInViewport();
  const greeting = await welcome.getByRole("heading", { level: 1 }).innerText();
  await expect(page.getByPlaceholder(/type a message/i)).toBeFocused();
  expect(requests[0]!.map((message) => message.role)).toEqual(["user"]);

  // Clicking a card again scrolls back to it, just as revisiting the welcome does.
  await page.getByRole("button", { name: "Meet the person", exact: true }).click();
  await expect(page.getByText("Response 2.", { exact: true })).toBeVisible();
  await expect(page.getByTestId("chat-turn")).toHaveCount(2);
  await expectLatestTurnAtTop(page);
  await expect.poll(() => welcome.getByRole("heading", { level: 1 }).innerText()).toBe(greeting);
  expect(requests[1]!.map((message) => message.role)).toEqual(["user", "assistant", "user"]);
});

for (const mode of ["keyboard", "reduced-motion"] as const) {
  test(`${mode} places a new turn without a lingering transform`, async ({ page }) => {
    await mockChat(page);
    if (mode === "reduced-motion") await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    const suggestion = page.getByRole("button", { name: "Explore my work", exact: true });
    if (mode === "keyboard") await suggestion.press("Enter");
    else await suggestion.click();
    await expect(page.getByText("Response 1.", { exact: true })).toBeVisible();
    await expectLatestTurnAtTop(page);
    expect(await page.getByRole("log").evaluate((viewport) =>
      getComputedStyle(viewport.firstElementChild!).transform
    )).toBe("none");
  });
}

test("phone reset returns to the welcome and clears the draft after multiple turns", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await mockChat(page);
  await page.goto("/");
  const input = page.getByPlaceholder(/type a message/i);
  for (const [index, question] of ["First question", "Another question"].entries()) {
    await input.fill(question);
    await input.press("Enter");
    await expect(page.getByText(`Response ${index + 1}.`, { exact: true })).toBeVisible();
    await expectLatestTurnAtTop(page);
  }
  await input.fill("Unsent draft");
  await page.getByRole("button", { name: "Reset chat", exact: true }).click();
  await expect(page.getByTestId("chat-turn")).toHaveCount(0);
  await expect(page.getByTestId("chat-welcome-message")).toBeInViewport();
  await expect(input).toHaveValue("");
  expect(await page.getByRole("log").evaluate((viewport) => viewport.scrollTop)).toBe(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
});
