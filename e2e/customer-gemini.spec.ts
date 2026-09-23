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

  test("modal routes to use-case draft at intake", async ({ page }) => {
    await page.getByTestId("build-business-case").click();
    await page.getByTestId("choose-use-case-draft").click();
    await expect(page).toHaveURL(/\/customer\/use-case-draft/);
    await expect(page.getByRole("heading", { name: "Sign in to build your business case" })).toBeVisible();
    await expect(page.getByText("partner workspace")).toHaveCount(0);
    await page.getByTestId("google-demo-signin").click();
    await expect(page.getByTestId("conversational-intake")).toBeVisible();
    await expect(page.getByText(/pull LinkedIn context/i)).toBeVisible();
    await expect(page.getByText(/Plan generation/i)).toHaveCount(0);
    await expect
      .poll(() =>
        page.evaluate(() => {
          const raw = localStorage.getItem("hackathon-use-case-draft-customer-v1");
          return raw ? JSON.parse(raw).phase : null;
        }),
      )
      .toBe("intake");
  });

  test("modal routes to ghost ledger at intake", async ({ page }) => {
    await page.getByTestId("build-business-case").click();
    await page.getByTestId("choose-ghost-ledger").click();
    await expect(page).toHaveURL(/\/customer\/ghost-ledger/);
    await expect(page.getByRole("heading", { name: "Sign in to calculate the cost of waiting" })).toBeVisible();
    await expect(page.getByText("partner workspace")).toHaveCount(0);
    await page.getByTestId("google-demo-signin").click();
    await expect(page.getByTestId("conversational-intake")).toBeVisible();
    await expect(page.getByText(/LinkedIn lookup/i)).toBeVisible();
    await expect(page.getByText(/Plan — cost of inaction/i)).toHaveCount(0);
    await expect
      .poll(() =>
        page.evaluate(() => {
          const raw = localStorage.getItem("ghost-ledger-customer-v1");
          return raw ? JSON.parse(raw).phase : null;
        }),
      )
      .toBe("intake");
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
