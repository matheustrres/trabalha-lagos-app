import { expect, test } from "@playwright/test";

test("keeps the invalid credentials message without reloading", async ({ page }) => {
  await page.route("**/api/v1/auth/login", async (route) => {
    await route.fulfill({
      status: 401,
      contentType: "application/json",
      body: JSON.stringify({ message: "Unauthorized" }),
    });
  });

  await page.goto("/login");
  await page.getByLabel("E-mail").fill("user@example.com");
  await page.getByLabel("Senha").fill("wrong-password");

  let navigations = 0;
  page.on("framenavigated", (frame) => {
    if (frame === page.mainFrame()) navigations += 1;
  });

  await page.getByRole("button", { name: "Entrar" }).click();
  const errorMessage = page.getByText("E-mail ou senha incorretos.");
  await expect(errorMessage).toBeVisible();
  await page.waitForTimeout(300);
  await expect(errorMessage).toBeVisible();
  expect(navigations).toBe(0);
});
