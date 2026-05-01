import { expect, test } from "@playwright/test";

const TYPE_MESSAGE_REGEX = /type a message/i;
const ABOUT_COPY_REGEX = /I'm Eric Nichols/i;

test("streams about copy without duplicate about card", async ({ page }) => {
  await page.goto("/");

  const input = page.getByPlaceholder(TYPE_MESSAGE_REGEX);
  await input.fill("Tell me about yourself");
  await input.press("Enter");

  await expect(page.getByText(ABOUT_COPY_REGEX).first()).toBeVisible({
    timeout: 20_000,
  });

  await expect(page.getByText("About")).toHaveCount(0);
});
