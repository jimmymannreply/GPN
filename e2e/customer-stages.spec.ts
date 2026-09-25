import { test, expect } from "@playwright/test";

test.describe("Customer staged session entry", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/customer");
    await page.evaluate(() => localStorage.clear());
    await page.goto("/customer");
  });

  test("campaign chooser lands on customer dashboard", async ({ page }) => {
    await page.getByTestId("build-business-case").click();
    await page.getByTestId("choose-use-case-draft").click();
    await expect(page).toHaveURL(/\/customer\/dashboard/);
    await expect(page.getByTestId("customer-dashboard")).toBeVisible();
    await expect(page.getByTestId("pcm-telemetry")).toHaveCount(0);
  });

  test("ledger chooser lands on customer dashboard", async ({ page }) => {
    await page.getByTestId("build-business-case").click();
    await page.getByTestId("choose-ghost-ledger").click();
    await expect(page).toHaveURL(/\/customer\/dashboard/);
    await expect(page.getByTestId("customer-dashboard")).toBeVisible();
    await expect(page.getByTestId("session-format")).toHaveText("Ghost ledger");
    await expect(page.getByTestId("pcm-telemetry")).toHaveCount(0);
  });

  test("CRM pick advances to scope", async ({ page }) => {
    await page.getByTestId("build-business-case").click();
    await page.getByTestId("choose-use-case-draft").click();
    await page.getByTestId("continue-session").click();
    await expect(page).toHaveURL(/\/customer\/session/);
    await expect(page.getByTestId("customer-session")).toBeVisible();
    await expect(page.getByTestId("stage-crm")).toBeVisible();
    await page.getByTestId(/^crm-pick-/).first().click();
    await page.getByTestId("crm-next").click();
    await expect(page.getByTestId("stage-scope")).toBeVisible();
  });
});
