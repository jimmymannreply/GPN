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

  test("CRM demo pick shows company industry contact; full CRM skips chat", async ({ page }) => {
    await page.getByTestId("build-business-case").click();
    await page.getByTestId("choose-use-case-draft").click();
    await page.getByTestId("continue-session").click();
    await expect(page).toHaveURL(/\/customer\/session/);
    await expect(page.getByTestId("stage-crm")).toBeVisible();
    await expect(page.getByTestId("crm-demo-picks")).toBeVisible();
    await expect(page.getByTestId("crm-audience-google")).toHaveCount(0);

    await page.getByTestId("crm-demo-crm-heartland-mutual").click();
    await expect(page.getByTestId("crm-selected")).toContainText("Heartland");
    await expect(page.getByTestId("crm-selected")).toContainText(/Michelle Dorsey/i);
    await expect(page.getByTestId("crm-selected")).toContainText(/Insurance/i);

    await page.getByTestId("crm-next").click();
    await expect(page.getByTestId("stage-intake")).toBeVisible();
    // Heartland is fully enriched in mock CRM — intake has nothing to ask
    await expect(page.getByTestId("intake-crm-covered")).toBeVisible();
    await expect(page.getByTestId("conversational-intake")).toHaveCount(0);
    await page.getByTestId("intake-continue-crm").click();

    await expect(page.getByTestId("stage-scope")).toBeVisible();
    await expect(page.getByTestId("scope-identity")).toContainText(/Michelle Dorsey/i);
    await expect(page.getByTestId("scope-tech-stack")).toContainText(/Guidewire/i);
    await expect(page.getByTestId("scope-pain")).toHaveValue(/Claims intake/i);
    await page.getByTestId("scope-pain").fill("Claims intake sits days — plus seasonal surge.");
    await expect(page.getByTestId("scope-pain")).toHaveValue(/seasonal surge/);

    await page.getByTestId("scope-next").click();
    await expect(page.getByTestId("stage-plan")).toBeVisible();
    await expect(page.getByTestId("plan-attendees")).toBeVisible();
    await expect(page.getByTestId("plan-agenda")).toBeVisible();
    await expect(page.getByTestId("plan-account")).toContainText(/Michelle Dorsey/i);
    await expect(page.getByText(/Michelle Dorsey/i).first()).toBeVisible();
  });

  test("sparse CRM account asks missing fields in intake chat", async ({ page }) => {
    await page.getByTestId("build-business-case").click();
    await page.getByTestId("choose-use-case-draft").click();
    await page.getByTestId("continue-session").click();
    await page.getByTestId("crm-demo-crm-contoso-retail").click();
    await page.getByTestId("crm-next").click();
    await expect(page.getByTestId("stage-intake")).toBeVisible();
    await expect(page.getByTestId("conversational-intake")).toBeVisible();
    await expect(page.getByText(/pain/i).first()).toBeVisible();
    await page.getByTestId("intake-skip-crm-defaults").click();
    await expect(page.getByTestId("stage-scope")).toBeVisible();
  });

  test("CRM search lookup finds account by contact", async ({ page }) => {
    await page.getByTestId("build-business-case").click();
    await page.getByTestId("choose-use-case-draft").click();
    await page.getByTestId("continue-session").click();
    await page.getByTestId("crm-search").fill("Sam Ortiz");
    await page.getByTestId("crm-pick-crm-contoso-retail").click();
    await expect(page.getByTestId("crm-selected")).toContainText("Contoso");
    await expect(page.getByTestId("crm-selected")).toContainText(/Sam Ortiz/i);
  });

  test("add account via chat when not in CRM", async ({ page }) => {
    await page.getByTestId("build-business-case").click();
    await page.getByTestId("choose-use-case-draft").click();
    await page.getByTestId("continue-session").click();
    await page.getByTestId("crm-add-via-chat").click();
    await expect(page.getByTestId("stage-intake")).toBeVisible();
    await expect(page.getByText(/Add your account via intake/i)).toBeVisible();
    await expect(page.getByTestId("conversational-intake")).toBeVisible();
    await expect(page.getByTestId("intake-skip-crm-defaults")).toHaveCount(0);
    await expect(page.getByText(/organization/i).first()).toBeVisible();
  });

  test("Run stage ranks top 3 then starts hackathon draft or next steps", async ({ page }) => {
    await page.goto("/customer");
    await page.evaluate(() => {
      localStorage.setItem(
        "customer-staged-session-v1",
        JSON.stringify({
          format: "draft",
          stage: "plan",
          crmAccount: {
            id: "crm-heartland-mutual",
            company: "Heartland Mutual Insurance",
            partnerOfRecord: "CDW",
            industry: "Insurance",
            contact: { name: "Michelle Dorsey", role: "VP Claims Operations" },
            segment: "Enterprise",
          },
          techStack: "M365 · Guidewire · Azure",
          attendees: [
            {
              name: "Michelle Dorsey",
              role: "VP Claims Operations",
              linkedIn: {
                headline: "VP",
                title: "VP Claims Operations",
                company: "Heartland",
                tenure: "3+",
                focusAreas: ["AI"],
                simulated: true,
              },
            },
          ],
          scope: {
            painPoint: "Claims intake sits days in queues",
            cxoOutcome: "Cut cycle time",
            constraints: "Q2",
          },
          ledger: {
            monthlyToolSpend: null,
            ticketsPerMonth: null,
            minutesPerTicket: null,
            hoursLostPerWeek: null,
            hourlyLoadedCost: null,
            monthlyChurnRevenue: null,
          },
          candidatePool: [],
          rankedTop3: [],
          fundingStatus: "Draft",
          fundingValueLabel: "$7,750,000 / year",
        }),
      );
    });
    await page.goto("/customer/session");
    await page.getByTestId("plan-confirm").click();
    await expect(page.getByTestId("stage-run")).toBeVisible();
    await expect(page.getByTestId("run-candidate-grid")).toBeVisible();
    const addButtons = page.locator('[data-testid^="run-add-"]');
    await expect(addButtons).toHaveCount(8);
    await expect(page.getByTestId("run-start-hackathon-draft")).toBeDisabled();
    await addButtons.nth(0).click();
    await addButtons.nth(1).click();
    await addButtons.nth(2).click();
    await expect(page.getByTestId("run-rank-1")).toBeVisible();
    await expect(page.getByTestId("run-rank-3")).toBeVisible();
    await expect(page.getByTestId("run-start-hackathon-draft")).toBeEnabled();

    await page.getByTestId("run-save-continue").click();
    await expect(page.getByTestId("stage-artifacts")).toBeVisible();
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
            contact: { name: "Michelle Dorsey", role: "VP Claims Operations" },
            segment: "Enterprise",
          },
          techStack: "M365 · Guidewire · Azure",
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
          ledger: {
            monthlyToolSpend: null,
            ticketsPerMonth: null,
            minutesPerTicket: null,
            hoursLostPerWeek: null,
            hourlyLoadedCost: null,
            monthlyChurnRevenue: null,
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
