import { test, expect } from "@playwright/test";

test("la page d'accueil se charge avec le bon titre", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/ImmoExpert/);
});
