import { expect, test } from "@playwright/test";
import projects from "../data/projects";

for (const entry of ["sidebar", "suggestion", "typed"] as const) {
  test(`${entry} shows interactive project cards`, async ({ page }) => {
    await page.goto("/");
    if (entry === "sidebar") {
      await page.locator("nav[aria-label=Navigation]:visible").getByRole("button", { name: "Projects", exact: true }).click();
    } else if (entry === "suggestion") {
      await page.getByRole("button", { name: "Show me some projects", exact: true }).click();
    } else {
      await page.getByPlaceholder(/type a message/i).fill("Show projects");
      await page.getByPlaceholder(/type a message/i).press("Enter");
    }
    const cards = page.locator("article[role=button]");
    await expect(cards).toHaveCount(projects.length);
    await expect(page.getByRole("alert").filter({ hasText: "couldn’t respond" })).toHaveCount(0);
    const card = cards.first();
    await expect(card.getByRole("link", { name: /live site/ })).toHaveAttribute("href", projects[0].url);
    if (projects[0].githubUrl) {
      await expect(card.getByRole("link", { name: /on GitHub/ })).toHaveAttribute("href", projects[0].githubUrl);
    }
    await card.click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.getByRole("dialog").getByRole("heading", { name: projects[0].title, exact: true })).toBeVisible();
    await page.getByRole("button", { name: "Close", exact: true }).click();
    await expect(page.getByRole("dialog")).toHaveCount(0);
  });
}

test("mobile Projects closes the drawer and shows the same cards", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByRole("button", { name: "Open menu" }).click();
  await page.locator("nav[aria-label=Navigation]:visible").getByRole("button", { name: "Projects", exact: true }).click();
  await expect(page.locator("article[role=button]")).toHaveCount(projects.length);
  await expect(page.getByRole("button", { name: "Open menu" })).toHaveAttribute("aria-expanded", "false");
});
