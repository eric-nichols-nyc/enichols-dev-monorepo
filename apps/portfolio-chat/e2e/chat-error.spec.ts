import { expect, test } from "@playwright/test";

for (const failure of ["http", "stream"] as const) {
  test(`shows a visible, safe alert after a ${failure} failure and clears it on the next send`, async ({ page }) => {
    let requests = 0;
    await page.route("**/api/chat", async (route) => {
      requests += 1;
      if (requests > 1) {
        await route.fulfill({
          contentType: "text/event-stream",
          headers: { "x-vercel-ai-ui-message-stream": "v1" },
          body: 'data: {"type":"start","messageId":"recovered"}\n\ndata: {"type":"finish"}\n\ndata: [DONE]\n\n',
        });
        return;
      }
      await route.fulfill(failure === "http" ? {
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ error: "private provider details" }),
      } : {
        contentType: "text/event-stream",
        headers: { "x-vercel-ai-ui-message-stream": "v1" },
        body: 'data: {"type":"error","errorText":"private provider details"}\n\ndata: [DONE]\n\n',
      });
    });
    await page.goto("/");
    const input = page.getByPlaceholder(/type a message/i);
    await input.fill("Show me your projects");
    await input.press("Enter");
    const alert = page.getByRole("alert").filter({ hasText: "The chat assistant couldn’t respond." });
    await expect(alert).toBeInViewport();
    await expect(page.getByText("private provider details")).toHaveCount(0);
    await input.fill("Try again");
    await input.press("Enter");
    await expect(alert).toHaveCount(0);
  });
}
