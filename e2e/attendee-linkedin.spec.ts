import { test, expect } from "@playwright/test";

async function signIn(page: import("@playwright/test").Page) {
  await page.getByTestId("google-demo-signin").click();
  await expect(page.getByTestId("conversational-intake")).toBeVisible();
}

async function answer(page: import("@playwright/test").Page, text: string) {
  await page.locator('[data-testid^="intake-input-"]').first().fill(text);
  await page.getByTestId("intake-send").click();
}

test.describe("Attendee LinkedIn enrichment", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/hackathon/journey");
    await page.evaluate(() => localStorage.clear());
    await page.goto("/hackathon/journey");
  });

  test("draft intake shows LinkedIn simulation then asks role", async ({ page }) => {
    await signIn(page);
    await answer(page, "Northwind Retail");
    await answer(page, "Retail · M365 + Google Cloud");
    await answer(page, "Stores lack trusted answers at the register");
    await answer(page, "Lift same-store sales 3%");
    await answer(page, "4");
    await answer(page, "Jane Doe");

    await expect(page.getByText(/Checking LinkedIn for Jane Doe/i)).toBeVisible();
    await expect(page.getByTestId("linkedin-profile-bubble")).toBeVisible({
      timeout: 5000,
    });
    await expect(
      page.getByText("Simulated LinkedIn enrichment for demo."),
    ).toBeVisible();
    await expect(page.getByText(/role in this session/i)).toBeVisible();

    await answer(page, "CXO sponsor");
    await expect(page.getByText(/attendee 2 of 4/i)).toBeVisible();
  });

  test("ghost ledger asks 2-5 headcount then LinkedIn beat", async ({ page }) => {
    await page.goto("/hackathon/ghost-ledger/journey");
    await page.evaluate(() => localStorage.clear());
    await page.goto("/hackathon/ghost-ledger/journey");
    await signIn(page);
    await answer(page, "Contoso Financial");
    await answer(page, "Financial Services · M365");

    await expect(page.getByText(/How many people.*\(2[–-]5\)/i)).toBeVisible();
    await answer(page, "2");
    await answer(page, "Alex Kim");
    await expect(page.getByTestId("linkedin-profile-bubble")).toBeVisible({
      timeout: 5000,
    });
    await answer(page, "VP Ops");
    await answer(page, "Sam Lee");
    await expect(page.getByTestId("linkedin-profile-bubble")).toHaveCount(2, {
      timeout: 5000,
    });
    await answer(page, "IT director");

    await expect(page.getByText(/spend per month/i)).toBeVisible();
  });

  test("customer draft journey runs LinkedIn attendee intake", async ({ page }) => {
    await page.goto("/customer/use-case-draft");
    await page.evaluate(() => localStorage.clear());
    await page.goto("/customer/use-case-draft");
    await signIn(page);
    await expect(page.getByText(/pull LinkedIn context/i)).toBeVisible();
    await answer(page, "Northwind Retail");
    await answer(page, "Retail · M365 + Google Cloud");
    await answer(page, "Stores lack trusted answers at the register");
    await answer(page, "Lift same-store sales 3%");
    await expect(page.getByText(/enrich from LinkedIn/i)).toBeVisible();
    await answer(page, "4");
    await answer(page, "Jane Doe");
    await expect(page.getByTestId("linkedin-profile-bubble")).toBeVisible({ timeout: 5000 });
    await answer(page, "CXO sponsor");
    await expect(page.getByText(/attendee 2 of 4/i)).toBeVisible();
  });

  test("customer ghost ledger journey runs LinkedIn attendee intake", async ({ page }) => {
    await page.goto("/customer/ghost-ledger");
    await page.evaluate(() => localStorage.clear());
    await page.goto("/customer/ghost-ledger");
    await signIn(page);
    await expect(page.getByText(/LinkedIn lookup/i)).toBeVisible();
    await answer(page, "Contoso Financial");
    await answer(page, "Financial Services · M365");
    await answer(page, "2");
    await answer(page, "Alex Kim");
    await expect(page.getByTestId("linkedin-profile-bubble")).toBeVisible({ timeout: 5000 });
    await answer(page, "VP Ops");
    await answer(page, "Sam Lee");
    await expect(page.getByTestId("linkedin-profile-bubble")).toHaveCount(2, { timeout: 5000 });
    await answer(page, "IT director");
    await expect(page.getByText(/spend per month/i)).toBeVisible();
  });
});
