import { test, expect } from "@playwright/test";

test.describe("Customer Gemini Enterprise entry", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/customer");
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
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

  test("format choice shows next actions", async ({ page }) => {
    await page.getByTestId("build-business-case").click();
    await page.getByTestId("choose-use-case-draft").click();
    await expect(page.getByTestId("next-schedule-hackathon")).toBeVisible();
    await expect(page.getByTestId("next-apply-daf")).toBeVisible();
    await expect(page.getByTestId("next-partner-session")).toBeVisible();
    await expect(page).not.toHaveURL(/\/customer\/dashboard/);
  });

  test("partner session next action lands on dashboard", async ({ page }) => {
    await page.getByTestId("build-business-case").click();
    await page.getByTestId("choose-use-case-draft").click();
    await page.getByTestId("next-partner-session").click();
    await expect(page).toHaveURL(/\/customer\/dashboard/);
    await expect(page.getByTestId("customer-dashboard")).toBeVisible();
    await expect(page.getByTestId("pcm-telemetry")).toHaveCount(0);
  });

  test("ledger partner session lands on dashboard", async ({ page }) => {
    await page.getByTestId("build-business-case").click();
    await page.getByTestId("choose-ghost-ledger").click();
    await page.getByTestId("next-partner-session").click();
    await expect(page).toHaveURL(/\/customer\/dashboard/);
    await expect(page.getByTestId("session-format")).toHaveText("Ghost ledger");
  });

  test("DAF next action opens funding", async ({ page }) => {
    await page.getByTestId("build-business-case").click();
    await page.getByTestId("choose-use-case-draft").click();
    await page.getByTestId("next-apply-daf").click();
    await expect(page).toHaveURL(/\/funding/);
    await expect(page.getByTestId("funding-page")).toBeVisible();
  });

  test("schedule opens scheduler with calendar links", async ({ page }) => {
    await page.getByTestId("build-business-case").click();
    await page.getByTestId("choose-use-case-draft").click();
    await page.getByTestId("next-schedule-hackathon").click();
    await expect(page.getByTestId("hackathon-scheduler")).toBeVisible();
    await expect(page.getByTestId("scheduler-google")).toHaveAttribute(
      "href",
      /calendar\.google\.com/,
    );
    await expect(page.getByTestId("scheduler-outlook")).toHaveAttribute(
      "href",
      /outlook\.live\.com/,
    );
  });

  test("demo preseed partner path shows Heartland", async ({ page }) => {
    await page.getByTestId("build-business-case").click();
    await page.getByTestId("choose-use-case-draft").click();
    await page.getByTestId("demo-preseed").check();
    await page.getByTestId("next-partner-session").click();
    await expect(page).toHaveURL(/\/customer\/dashboard/);
    await expect(page.getByText(/Heartland Mutual/i)).toBeVisible();
    await expect(page.getByTestId("session-stage")).toHaveText(/Plan/i);
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
