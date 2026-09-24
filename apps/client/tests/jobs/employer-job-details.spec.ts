import { expect, test } from "@playwright/test";
import { createServer, type Server } from "node:http";

const session = (role: "CANDIDATE" | "EMPLOYER") => ({
  accessToken: `header.${btoa(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 3600 }))}.signature`,
  refreshToken: "refresh-token",
  user: { id: "user-1", name: "Ana Silva", email: "ana@example.com", phone: null, role },
});

const job = {
  id: "job-1", slug: "atendente-cabo-frio", title: "Atendente de loja",
  description: "Atender clientes e organizar a loja.", requirements: ["Ensino médio", "Boa comunicação"],
  companyId: "company-1",
  category: { id: 1, name: "Comércio", slug: "comercio", icon: "" },
  contractType: "CLT", city: "Cabo Frio", address: "Rua das Flores, 10",
  salaryMin: 200000, salaryMax: 250000, salaryHidden: false,
  contactMethod: "EMAIL", contactEmail: "rh@example.com", whatsappContact: null,
  distanceKm: null, featured: false, urgent: false, status: "ACTIVE",
  createdAt: "2026-09-01T12:00:00.000Z", expiresAt: "2026-10-01T12:00:00.000Z",
  interestCount: 2, viewCount: 5,
};

const publicJob = { ...job, company: { id: "company-1", name: "Loja do Centro", verified: false } };

let apiServer: Server;
test.beforeAll(async () => {
  apiServer = createServer((request, response) => {
    response.setHeader("Content-Type", "application/json");
    if (request.url === "/api/v1/jobs/atendente-cabo-frio") {
      response.end(JSON.stringify(publicJob));
      return;
    }
    response.statusCode = 404;
    response.end(JSON.stringify({ message: "Não encontrado" }));
  });
  await new Promise<void>((resolve) => apiServer.listen(3999, "127.0.0.1", resolve));
});

test.afterAll(async () => {
  await new Promise<void>((resolve, reject) => apiServer.close((error) => error ? reject(error) : resolve()));
});

test("card abre detalhes pelo endpoint do recrutador e mantém ações independentes", async ({ page }) => {
  await page.addInitScript((value) => localStorage.setItem("session", JSON.stringify(value)), session("EMPLOYER"));
  await page.route("**/api/v1/employer/jobs", (route) => route.fulfill({ json: [job] }));
  let detailRequests = 0;
  let publicRequests = 0;
  await page.route("**/api/v1/employer/jobs/job-1", (route) => {
    detailRequests += 1;
    return route.fulfill({ json: job });
  });
  await page.route("**/api/v1/jobs/atendente-cabo-frio", (route) => {
    publicRequests += 1;
    return route.fulfill({ json: publicJob });
  });
  await page.route("**/api/v1/jobs/job-1/status", (route) => route.fulfill({ json: { ...job, status: "PAUSED" } }));

  await page.goto("/painel/vagas");
  const url = page.url();
  await page.getByRole("button", { name: "Visualizar vaga: Atendente de loja" }).click();
  const dialog = page.getByRole("dialog", { name: "Detalhes da vaga" });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("heading", { name: "Atendente de loja" })).toBeVisible();
  await expect(dialog.getByText("Atender clientes e organizar a loja.")).toBeVisible();
  await expect(dialog.getByText("Boa comunicação")).toBeVisible();
  await expect(dialog.getByText("rh@example.com")).toBeVisible();
  await expect(dialog.getByText("01/09/2026")).toBeVisible();
  expect(detailRequests).toBe(1);
  expect(publicRequests).toBe(0);
  expect(page.url()).toBe(url);

  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(page.getByRole("button", { name: "Visualizar vaga: Atendente de loja" })).toBeFocused();
  await page.getByRole("button", { name: "Visualizar vaga: Atendente de loja" }).click();
  await expect(dialog).toBeVisible();
  await page.mouse.click(10, 10);
  await expect(dialog).toBeHidden();
  await expect(page).toHaveURL(url);
  await page.getByRole("button", { name: "Pausar" }).click();
  await expect(dialog).toBeHidden();
  await expect(page).toHaveURL(url);
  await expect(page.getByRole("link", { name: "Editar" })).toHaveAttribute("href", "/painel/vagas/job-1/editar");
});

test("modal mostra carregamento, erro e nova tentativa", async ({ page }) => {
  await page.addInitScript((value) => localStorage.setItem("session", JSON.stringify(value)), session("EMPLOYER"));
  await page.route("**/api/v1/employer/jobs", (route) => route.fulfill({ json: [job] }));
  let attempts = 0;
  await page.route("**/api/v1/employer/jobs/job-1", async (route) => {
    attempts += 1;
    if (attempts === 1) {
      await new Promise((resolve) => setTimeout(resolve, 150));
      return route.fulfill({ status: 500, json: { message: "Erro" } });
    }
    return route.fulfill({ json: job });
  });
  await page.goto("/painel/vagas");
  await page.getByRole("button", { name: "Visualizar vaga: Atendente de loja" }).click();
  const dialog = page.getByRole("dialog", { name: "Detalhes da vaga" });
  await expect(dialog.getByRole("status", { name: "Carregando detalhes da vaga" })).toBeVisible();
  await expect(dialog.getByRole("alert")).toContainText("Não foi possível carregar");
  await dialog.getByRole("button", { name: "Tentar novamente" }).click();
  await expect(dialog.getByRole("heading", { name: "Atendente de loja" })).toBeVisible();
  await dialog.getByRole("button", { name: "Fechar", exact: true }).click();
  await expect(dialog).toBeHidden();
});

test("navegação respeita o papel da sessão", async ({ page }) => {
  await page.addInitScript((value) => localStorage.setItem("session", JSON.stringify(value)), session("EMPLOYER"));
  await page.route("**/api/v1/users/me", (route) => route.fulfill({ json: { id: "user-1", name: "Ana Silva", email: "ana@example.com", city: "Cabo Frio", role: "EMPLOYER" } }));
  await page.goto("/perfil?aba=conta");
  await expect(page.getByRole("link", { name: "Voltar ao painel" })).toHaveAttribute("href", "/painel");
  await expect(page.getByRole("navigation", { name: "Navegação principal" })).toHaveCount(0);
  await expect(page.getByRole("link", { name: /TrabalhaLagos/ }).first()).toHaveAttribute("href", "/painel");
  await page.route("**/api/v1/jobs/atendente-cabo-frio", (route) => route.fulfill({ json: publicJob }));
  await page.goto("/vaga/atendente-cabo-frio");
  await expect(page.getByRole("link", { name: "Voltar ao painel" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Tenho interesse" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Enviar email" })).toHaveCount(0);
});

test("candidato vai para vagas ao abrir painel", async ({ page }) => {
  await page.addInitScript((value) => localStorage.setItem("session", JSON.stringify(value)), session("CANDIDATE"));
  await page.goto("/painel");
  await expect(page).toHaveURL(/\/vagas$/);
});

test("visitante vai para login ao abrir painel", async ({ page }) => {
  await page.goto("/painel");
  await expect(page).toHaveURL(/\/login$/);
});

test("Esc retorna da edição sem interromper o seletor", async ({ page }) => {
  await page.addInitScript((value) => localStorage.setItem("session", JSON.stringify(value)), session("EMPLOYER"));
  await page.route("**/api/v1/employer/jobs/job-1", (route) => route.fulfill({ json: job }));
  await page.goto("/painel/vagas/job-1/editar");
  await expect(page.getByRole("heading", { name: "Editar vaga" })).toBeVisible();

  await page.getByRole("combobox", { name: "Categoria *" }).focus();
  await page.keyboard.press("Escape");
  await expect(page).toHaveURL(/\/painel\/vagas\/job-1\/editar$/);

  await page.getByRole("textbox", { name: "Título da vaga *" }).focus();
  await page.keyboard.press("Escape");
  await expect(page).toHaveURL(/\/painel\/vagas$/);
});

test("candidato e visitante mantêm as ações da vaga pública", async ({ page }) => {
  await page.goto("/vaga/atendente-cabo-frio");
  await expect(page.getByRole("button", { name: "Tenho interesse" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Voltar ao painel" })).toHaveCount(0);

  await page.addInitScript((value) => localStorage.setItem("session", JSON.stringify(value)), session("CANDIDATE"));
  await page.reload();
  await expect(page.getByRole("button", { name: "Tenho interesse" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Voltar ao painel" })).toHaveCount(0);
});
