import { test, expect } from "@playwright/test";

/**
 * E2E responsive tests.
 *
 * Verifies the layout adapts at mobile / tablet / desktop breakpoints.
 */

test.describe("Responsive layout", () => {
  test("desktop: 3-pane layout is visible", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");

    // Folder tree visible at desktop
    await expect(page.getByRole("complementary", { name: /folder tree/i })).toBeVisible({ timeout: 10_000 });
  });

  test("mobile: layout collapses gracefully", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/");

    // The page should still render without overflow errors
    const body = page.locator("body");
    await expect(body).toBeVisible();

    // No horizontal overflow at mobile width
    const hasOverflow = await body.evaluate((el) => el.scrollWidth > el.clientWidth + 1);
    expect(hasOverflow).toBeFalsy();
  });

  test("tablet: layout adapts", async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto("/");

    const body = page.locator("body");
    await expect(body).toBeVisible();

    // No horizontal overflow
    const hasOverflow = await body.evaluate((el) => el.scrollWidth > el.clientWidth + 1);
    expect(hasOverflow).toBeFalsy();
  });
});
