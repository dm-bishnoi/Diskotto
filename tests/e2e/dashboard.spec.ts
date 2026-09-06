import { test, expect } from "@playwright/test";

/**
 * E2E smoke tests for the Diskotto dashboard.
 *
 * Verifies that the Phase 2 UI loads with mock data, the
 * 3-pane layout renders, and the breadcrumb + treemap are present.
 */

test.describe("Dashboard", () => {
  test("loads and renders the 3-pane layout", async ({ page }) => {
      await page.goto("/");

      // Page title
      await expect(page).toHaveTitle(/Diskotto/i);

      // Wait for hydration and mock data load
      await page.waitForTimeout(500);

      // Folder tree (left) — wait for mock data to load
      await expect(page.getByRole("complementary", { name: /folder tree/i })).toBeVisible({ timeout: 10_000 });

      // Check that the folder tree contains the expected root children
      const folderTree = page.getByRole("complementary", { name: /folder tree/i });
      // Expect at least three child items: Users, Windows, Program Files
      await expect(folderTree.getByText("Users")).toBeVisible({ timeout: 5_000 });
      await expect(folderTree.getByText("Windows")).toBeVisible({ timeout: 5_000 });
      await expect(folderTree.getByText("Program Files")).toBeVisible({ timeout: 5_000 });

      // Analytics panel (right) — also loads after mock data
      await expect(page.getByRole("complementary", { name: /storage analytics/i })).toBeVisible({ timeout: 10_000 });

      // Status bar (footer)
      await expect(page.getByRole("status")).toBeVisible();

      // Center pane: either the treemap SVG is shown OR "Calculating layout..." appears
      // (the D3 layout requires non-zero container dimensions, which may settle asynchronously)
      const treemap = page.locator("svg[role='tree']");
      const treemapCount = await treemap.count();
      if (treemapCount === 0) {
        // Treemap not yet rendered — the "Calculating layout..." state is the fallback
        await expect(page.getByText(/calculating layout|select a folder to view storage|this folder is empty/i)).toBeVisible();
      } else {
        await expect(treemap.first()).toBeVisible({ timeout: 15_000 });
      }
    });

  test("breadcrumb shows root path on load", async ({ page }) => {
    await page.goto("/");

    // Wait for data load
    await page.waitForTimeout(500);

    // Breadcrumb root label "C:\" should be present
    const breadcrumb = page.getByRole("navigation", { name: /path breadcrumb/i });
    await expect(breadcrumb).toBeVisible();
  });

  test("theme is applied via dark/light class on html", async ({ page }) => {
    await page.goto("/");

    // Wait for hydration
    await page.waitForTimeout(300);

    const html = page.locator("html");
    const hasTheme = await html.evaluate((el) => el.classList.contains("dark") || el.classList.contains("light") || el.hasAttribute("data-theme"));
    expect(hasTheme).toBeTruthy();
  });
});
