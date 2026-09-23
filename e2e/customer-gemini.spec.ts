import { test, expect } from "@playwright/test";

test.describe("Customer Gemini Enterprise entry", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/customer");
    await page.evaluate(() => localStorage.clear());
    await page.goto("/customer");
  });

  test("landing shows Build my business case CTA", async ({ page }) => {
    await expect(page.getByTestId("customer-gemini-landing")).toBeVisible();
    await expect(page.getByTestId("build-business-case")).toBeVisible();
  });

  test("modal routes to use-case draft customer journey", async ({ page }) => {
    await page.getByTestId("build-business-case").click();
    await page.getByTestId("choose-use-case-draft").click();
    await expect(page).toHaveURL(/\/customer\/use-case-draft/);
    await page.getByTestId("google-demo-signin").click();
    await expect(page.getByTestId("conversational-intake")).toBeVisible();
  });

  test("modal routes to ghost ledger customer journey", async ({ page }) => {
    await page.getByTestId("build-business-case").click();
    await page.getByTestId("choose-ghost-ledger").click();
    await expect(page).toHaveURL(/\/customer\/ghost-ledger/);
    await page.getByTestId("google-demo-signin").click();
    await expect(page.getByTestId("conversational-intake")).toBeVisible();
  });
});
