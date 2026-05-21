import { test, expect } from "@playwright/test";

test("la page d'accueil MediBook s'affiche", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByText("Réservez vos rendez-vous médicaux")).toBeVisible();
  await expect(page.getByRole("link", { name: "Voir les médecins" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Créer un compte" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Se connecter" })).toBeVisible();
});
