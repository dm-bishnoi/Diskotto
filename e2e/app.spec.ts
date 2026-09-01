import { test, expect } from "@playwright/test";

/**
 * E2E smoke test for Diskotto.
 * Tests the basic application loads correctly.
 *
 * From testing.md: Critical user flows to test.
 * Phase 1 tests the app shell and empty state only.
 */

test.describe("Diskotto Application", () => {
  test("loads the home page with empty state", async ({ page }) => {
    await page.goto("/");

    // App shell should render
    await expect(page.getByRole("banner")).toBeVisible();

    // Logo should be visible
    await expect(page.getByText("Diskotto")).toBeVisible();

    // Empty state should be shown
    await expect(
      page.getByText("No folder selected yet")
    ).toBeVisible();

    // Select Folder button should be present
    await expect(
      page.getByRole("button", { name: /select folder/i })
    ).toBeVisible();

    // Status bar should show "No folder selected"
    await expect(
      page.getByRole("status")
    ).toContainText("No folder selected");
  });

  test("theme toggle cycles through themes", async ({ page }) => {
    await page.goto("/");

    // Find the theme toggle button
    const themeButton = page.getByRole("button", { name: /toggle theme/i });
    await expect(themeButton).toBeVisible();

    // Click to cycle through themes
    await themeButton.click();
    await themeButton.click();
    await themeButton.click();

    // App should still be functional
    await expect(page.getByText("Diskotto")).toBeVisible();
  });

  test("navigation header is accessible", async ({ page }) => {
    await page.goto("/");

    // Header should be landmark
    await expect(page.getByRole("banner")).toBeVisible();

    // Settings button should be accessible
    await expect(
      page.getByRole("button", { name: /settings/i })
    ).toBeVisible();

    // Keyboard accessible
    await page.keyboard.press("Tab");
    // Focus should move through interactive elements
  });

  test("status bar is accessible", async ({ page }) => {
    await page.goto("/");

    // Status bar should have status role for screen readers
    await expect(page.getByRole("status")).toBeVisible();
    await expect(
      page.getByRole("status")
    ).toHaveAttribute("aria-live", "polite");
  });

  test("empty state is screen-reader friendly", async ({ page }) => {
    await page.goto("/");

    // No-scan variant
    await expect(
      page.getByTestId("empty-state-no-scan")
    ).toBeVisible();

    // Primary action button
    const actionButton = page.getByRole("button", { name: /select folder/i });
    await expect(actionButton).toBeVisible();
  });
});
