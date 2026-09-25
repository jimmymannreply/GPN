import { test, expect } from "@playwright/test";

test("partner home shows tiles and opens telemetry", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByTestId("partner-home")).toBeVisible();
  await page.getByTestId("tile-telemetry").click();
  await expect(page).toHaveURL(/\/telemetry/);
  await expect(page.getByTestId("pcm-telemetry")).toBeVisible();
});
