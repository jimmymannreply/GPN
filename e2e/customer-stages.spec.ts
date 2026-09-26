import { test, expect } from "@playwright/test";

test.describe("Customer staged session entry", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/customer");
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
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
    await expect(page.getByTestId("crm-customer-lookup-hint")).toBeVisible();
    await page.getByTestId("crm-search").fill("Heartland");
    await page.getByTestId("crm-pick-crm-heartland-mutual").click();
    await page.getByTestId("crm-next").click();
    await expect(page.getByTestId("stage-scope")).toBeVisible();
    await expect(page.getByTestId("scope-pain")).toHaveValue(/Claims intake/i);
    await expect(page.getByTestId("scope-outcome")).toHaveValue(/cycle time/i);
    await page.getByTestId("scope-pain").fill("Claims intake sits days — plus seasonal surge.");
    await expect(page.getByTestId("scope-pain")).toHaveValue(/seasonal surge/);
  });

  test("Google CRM audience lists all partners", async ({ page }) => {
    await page.getByTestId("build-business-case").click();
    await page.getByTestId("choose-use-case-draft").click();
    await page.getByTestId("continue-session").click();
    await page.getByTestId("crm-audience-google").click();
    await expect(page.getByTestId("crm-account-list")).toBeVisible();
    await expect(page.getByTestId("crm-pick-crm-heartland-mutual")).toBeVisible();
    await expect(page.getByTestId("crm-pick-crm-northwind-health")).toBeVisible();
    await expect(page.getByTestId("crm-pick-crm-contoso-retail")).toBeVisible();
  });

  test("Partner CRM audience filters to one partner", async ({ page }) => {
    await page.getByTestId("build-business-case").click();
    await page.getByTestId("choose-use-case-draft").click();
    await page.getByTestId("continue-session").click();
    await page.getByTestId("crm-audience-partner").click();
    await page.getByTestId("crm-partner-select").selectOption("Softchoice");
    await expect(page.getByTestId("crm-pick-crm-northwind-health")).toBeVisible();
    await expect(page.getByTestId("crm-pick-crm-heartland-mutual")).toHaveCount(0);
  });

  test("produce artifacts opens draft plan board", async ({ page }) => {
    await page.goto("/customer");
    await page.evaluate(() => {
      localStorage.setItem(
        "customer-staged-session-v1",
        JSON.stringify({
          format: "draft",
          stage: "artifacts",
          crmAccount: {
            id: "crm-heartland-mutual",
            company: "Heartland Mutual Insurance",
            partnerOfRecord: "CDW",
            industry: "Insurance",
            segment: "Enterprise",
          },
          attendees: [
            {
              name: "Alex Chen",
              role: "VP Ops",
              linkedIn: {
                headline: "VP",
                title: "VP Ops",
                company: "Heartland",
                tenure: "3+",
                focusAreas: ["AI"],
                simulated: true,
              },
            },
          ],
          scope: {
            painPoint: "Manual claims",
            cxoOutcome: "Faster cycle",
            constraints: "Q2",
          },
          fundingStatus: "Draft",
          fundingValueLabel: "$7,750,000 / year",
        }),
      );
    });
    await page.goto("/customer/session");
    await expect(page.getByTestId("stage-artifacts")).toBeVisible();
    await expect(page.getByRole("heading", { name: "What should we do next?" })).toBeVisible();
    await page.getByTestId("produce-artifacts").click();
    await expect(page).toHaveURL(/\/customer\/use-case-draft/);
    await page.getByTestId("google-demo-signin").click();
    await expect(page.getByText(/Plan generation/i)).toBeVisible();
    await expect(page.getByTestId("conversational-intake")).toHaveCount(0);
  });
});
