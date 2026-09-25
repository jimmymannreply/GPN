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

  test("Escape closes the business case modal", async ({ page }) => {
    await page.getByTestId("build-business-case").click();
    await expect(page.getByRole("dialog")).toBeVisible();

    await page.keyboard.press("Escape");

    await expect(page.getByRole("dialog")).toBeHidden();
  });

  // Modal now lands on /customer/dashboard (Task 5). Deep produce-artifacts e2e is Task 7.
  test("modal routes draft chooser to customer dashboard", async ({ page }) => {
    await page.getByTestId("build-business-case").click();
    await page.getByTestId("choose-use-case-draft").click();
    await expect(page).toHaveURL(/\/customer\/dashboard/);
    await expect(page.getByTestId("customer-dashboard")).toBeVisible();
    await expect(page.getByTestId("pcm-telemetry")).toHaveCount(0);
  });

  test("modal routes ledger chooser to customer dashboard", async ({ page }) => {
    await page.getByTestId("build-business-case").click();
    await page.getByTestId("choose-ghost-ledger").click();
    await expect(page).toHaveURL(/\/customer\/dashboard/);
    await expect(page.getByTestId("customer-dashboard")).toBeVisible();
    await expect(page.getByTestId("pcm-telemetry")).toHaveCount(0);
  });

  test("customer draft starts fresh without overwriting partner storage", async ({ page }) => {
    await page.goto("/hackathon/journey");
    await page.getByTestId("google-demo-signin").click();
    await expect
      .poll(() => page.evaluate(() => localStorage.getItem("hackathon-use-case-draft-v2")))
      .not.toBeNull();
    const partnerDraft = await page.evaluate(() =>
      localStorage.getItem("hackathon-use-case-draft-v2"),
    );

    await page.goto("/customer/use-case-draft");

    await expect(page.getByRole("heading", { name: "Sign in to build your business case" })).toBeVisible();
    await page.getByTestId("google-demo-signin").click();
    await expect(page.getByTestId("conversational-intake")).toBeVisible();
    await expect
      .poll(() => page.evaluate(() => localStorage.getItem("hackathon-use-case-draft-customer-v1")))
      .not.toBeNull();
    expect(await page.evaluate(() => localStorage.getItem("hackathon-use-case-draft-v2"))).toBe(
      partnerDraft,
    );
  });

  test("customer ledger starts fresh without overwriting partner storage", async ({ page }) => {
    await page.goto("/hackathon/ghost-ledger/journey");
    await page.getByTestId("google-demo-signin").click();
    await expect
      .poll(() => page.evaluate(() => localStorage.getItem("ghost-ledger-hackathon-v1")))
      .not.toBeNull();
    const partnerLedger = await page.evaluate(() =>
      localStorage.getItem("ghost-ledger-hackathon-v1"),
    );

    await page.goto("/customer/ghost-ledger");

    await expect(page.getByRole("heading", { name: "Sign in to calculate the cost of waiting" })).toBeVisible();
    await page.getByTestId("google-demo-signin").click();
    await expect(page.getByTestId("conversational-intake")).toBeVisible();
    await expect
      .poll(() => page.evaluate(() => localStorage.getItem("ghost-ledger-customer-v1")))
      .not.toBeNull();
    expect(await page.evaluate(() => localStorage.getItem("ghost-ledger-hackathon-v1"))).toBe(
      partnerLedger,
    );
  });
});
