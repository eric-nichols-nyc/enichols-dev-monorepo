import { expect, test, type Page } from "@playwright/test";
import projects from "../data/projects";

async function showProjects(page: Page) {
  await page.goto("/");
  await page.getByRole("button", { name: "Explore my work", exact: true }).click();
  await expect(page.locator("article[role=button]")).toHaveCount(projects.length);
}

async function mockProjectAnswers(page: Page) {
  const requests: { projectId: string; messages: { role: string }[] }[] = [];
  await page.route("**/api/chat", async (route) => {
    const body = route.request().postDataJSON();
    if (!body.projectId) return route.continue();
    requests.push(body);
    const parts = [
      { type: "start", messageId: `project-answer-${requests.length}` },
      { type: "text-start", id: "answer" },
      { type: "text-delta", id: "answer", delta: "This answer belongs to the selected project." },
      { type: "text-end", id: "answer" },
      { type: "data-related", data: { suggestions: ["Tell me more about its features."] } },
      { type: "finish" },
    ];
    await route.fulfill({
      contentType: "text/event-stream", headers: { "x-vercel-ai-ui-message-stream": "v1" },
      body: parts.map((part) => `data: ${JSON.stringify(part)}\n\n`).join("") + "data: [DONE]\n\n",
    });
  });
  return requests;
}

test("project details preserve the main conversation and draft, with an isolated collapsible Q&A", async ({ page }) => {
  const requests = await mockProjectAnswers(page);
  await showProjects(page);
  const mainInput = page.getByPlaceholder(/type a message/i);
  await mainInput.fill("Unsent main chat draft");
  const card = page.locator("article[role=button]").first();
  await card.scrollIntoViewIfNeeded();
  const mainViewport = page.locator("[data-testid=chat-messages-container] [role=log]");
  const scrollBefore = await mainViewport.evaluate((node) => node.scrollTop);
  const turnsBefore = await page.getByTestId("chat-turn").count();
  await card.click();
  const dialog = page.getByRole("dialog");
  await expect(dialog.getByRole("heading", { name: projects[0]!.title, exact: true })).toBeVisible();
  await expect(dialog.getByPlaceholder(/type a message/i)).toHaveCount(0);
  const trigger = dialog.getByRole("button", { name: `Ask about ${projects[0]!.title}`, exact: true });
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
  expect(requests).toHaveLength(0);
  await trigger.click();
  await dialog.getByRole("button", { name: `How was ${projects[0]!.title} built?`, exact: true }).click();
  await expect(dialog.getByText("This answer belongs to the selected project.", { exact: true })).toBeVisible();
  expect(requests[0]!.projectId).toBe(projects[0]!.id);
  expect(requests[0]!.messages.map((message) => message.role)).toEqual(["user"]);
  await expect(dialog.getByRole("button", { name: "Tell me more about its features.", exact: true })).toBeVisible();
  await trigger.click();
  await trigger.click();
  await expect(dialog.getByText("This answer belongs to the selected project.", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Back to chat", exact: true }).click();
  await expect(dialog).toHaveCount(0);
  await expect(mainInput).toHaveValue("Unsent main chat draft");
  await expect(page.getByTestId("chat-turn")).toHaveCount(turnsBefore);
  expect(await mainViewport.evaluate((node) => node.scrollTop)).toBe(scrollBefore);
  await expect(card).toBeFocused();
  await card.click();
  await page.getByRole("button", { name: `Ask about ${projects[0]!.title}`, exact: true }).click();
  await expect(page.getByRole("dialog").getByText("This answer belongs to the selected project.", { exact: true })).toHaveCount(0);
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
});

test("phone project view fills the viewport and accepts a typed contextual question", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const requests = await mockProjectAnswers(page);
  await showProjects(page);
  await page.locator("article[role=button]").last().click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  const box = await dialog.boundingBox();
  expect(box!.width).toBe(390);
  expect(box!.height).toBe(844);
  await dialog.getByRole("button", { name: `Ask about ${projects[1]!.title}`, exact: true }).click();
  await dialog.getByRole("textbox", { name: `Ask about ${projects[1]!.title}`, exact: true }).fill("What problem does it solve?");
  await dialog.getByRole("button", { name: "Send project question", exact: true }).click();
  await expect(dialog.getByText("This answer belongs to the selected project.", { exact: true })).toBeVisible();
  expect(requests[0]!.projectId).toBe(projects[1]!.id);
  await dialog.getByRole("button", { name: "Clear questions", exact: true }).click();
  await expect(dialog.getByRole("log")).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
  await page.getByRole("button", { name: "Close", exact: true }).click();
  await expect(dialog).toHaveCount(0);
});

test("closing the detail view aborts an outstanding project request", async ({ page }) => {
  let release: (() => void) | undefined;
  let started = false;
  let aborted = false;
  page.on("requestfailed", (request) => {
    if (request.url().endsWith("/api/chat") && request.postDataJSON()?.projectId) aborted = true;
  });
  await page.route("**/api/chat", async (route) => {
    if (!route.request().postDataJSON().projectId) return route.continue();
    started = true;
    await new Promise<void>((resolve) => { release = resolve; });
    await route.abort().catch(() => {});
  });
  try {
    await showProjects(page);
    await page.locator("article[role=button]").first().click();
    await page.getByRole("button", { name: `Ask about ${projects[0]!.title}`, exact: true }).click();
    await page.getByRole("button", { name: `How was ${projects[0]!.title} built?`, exact: true }).click();
    await expect.poll(() => started).toBe(true);
    await page.getByRole("button", { name: "Back to chat", exact: true }).click();
    await expect.poll(() => aborted).toBe(true);
  } finally { release?.(); }
});

test("project request failures show generic copy and allow another question", async ({ page }) => {
  await mockProjectAnswers(page);
  let failNext = true;
  await page.route("**/api/chat", async (route) => {
    if (route.request().postDataJSON().projectId && failNext) {
      failNext = false;
      return route.fulfill({ status: 500, contentType: "application/json", body: JSON.stringify({ error: "provider-internal-detail" }) });
    }
    return route.fallback();
  });
  await showProjects(page);
  await page.locator("article[role=button]").first().click();
  const dialog = page.getByRole("dialog");
  await dialog.getByRole("button", { name: `Ask about ${projects[0]!.title}`, exact: true }).click();
  await dialog.getByRole("button", { name: `How was ${projects[0]!.title} built?`, exact: true }).click();
  await expect(dialog.getByRole("alert")).toHaveText("The project assistant couldn’t respond. Please try again.");
  await expect(dialog.getByText("provider-internal-detail", { exact: true })).toHaveCount(0);
  await dialog.getByRole("textbox", { name: `Ask about ${projects[0]!.title}`, exact: true }).fill("What are its key features?");
  await dialog.getByRole("button", { name: "Send project question", exact: true }).click();
  await expect(dialog.getByText("This answer belongs to the selected project.", { exact: true })).toBeVisible();
});
