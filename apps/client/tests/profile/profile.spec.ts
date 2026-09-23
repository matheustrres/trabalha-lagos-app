import { expect, test } from '@playwright/test'

const session = (role: 'CANDIDATE' | 'EMPLOYER') => ({
  accessToken: `header.${btoa(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 3600 }))}.signature`,
  refreshToken: 'refresh-token',
  user: {
    id: 'user-1',
    name: 'Ana da Silva',
    email: 'ana@example.com',
    phone: null,
    city: 'Cabo Frio',
    role,
  },
})

const mockAccount = (role: 'CANDIDATE' | 'EMPLOYER') => ({
  id: 'user-1',
  name: 'Ana da Silva',
  email: 'ana@example.com',
  city: 'Cabo Frio',
  role,
})

test('candidato vê conta separada do perfil profissional', async ({ page }) => {
  await page.addInitScript((value) => localStorage.setItem('session', JSON.stringify(value)), session('CANDIDATE'))
  await page.route('**/api/v1/users/me', (route) => route.fulfill({ json: mockAccount('CANDIDATE') }))
  await page.route('**/api/v1/users/me/profile', (route) => route.fulfill({
    json: {
      id: 'user-1', name: 'Ana da Silva', phone: null, city: 'Cabo Frio',
      interests: [], experience: null, availability: null, acceptedContractTypes: [], neighborhood: null,
    },
  }))

  await page.goto('/perfil')

  await expect(page.getByRole('heading', { name: 'Meu perfil' })).toBeVisible()
  await expect(page.locator('#app-main')).toHaveCSS('min-height', '0px')
  await expect(page.getByRole('tab', { name: 'Conta' })).toBeVisible()
  await expect(page.getByRole('tab', { name: 'Perfil profissional' })).toBeVisible()
  await expect(page.getByLabel('E-mail de acesso')).toHaveValue('ana@example.com')
  await expect(page.getByLabel('E-mail de acesso')).toHaveAttribute('readonly', '')

  await page.getByRole('tab', { name: 'Perfil profissional' }).click()
  await expect(page.getByRole('heading', { name: 'Perfil profissional' })).toBeVisible()

  await page.goto('/')
  await expect(page.locator('#app-main')).not.toHaveCSS('min-height', '0px')
})

test('empregador tem apenas configurações de conta', async ({ page }) => {
  await page.addInitScript((value) => localStorage.setItem('session', JSON.stringify(value)), session('EMPLOYER'))
  await page.route('**/api/v1/users/me', (route) => route.fulfill({ json: mockAccount('EMPLOYER') }))

  await page.goto('/perfil')

  await expect(page.getByRole('heading', { name: 'Conta' })).toBeVisible()
  await expect(page.getByRole('tablist')).toHaveCount(0)
  await expect(page.getByRole('button', { name: 'Excluir minha conta' })).toBeVisible()
})

test('alterar e-mail exige a senha da conta e atualiza o acesso', async ({ page }) => {
  await page.addInitScript((value) => localStorage.setItem('session', JSON.stringify(value)), session('CANDIDATE'))
  await page.route('**/api/v1/users/me', (route) => route.fulfill({ json: mockAccount('CANDIDATE') }))

  let submittedPayload: unknown
  await page.route('**/api/v1/users/me/email', async (route) => {
    submittedPayload = route.request().postDataJSON()
    await route.fulfill({ json: { ...mockAccount('CANDIDATE'), email: 'ana.nova@example.com' } })
  })

  await page.goto('/perfil')
  await page.getByRole('button', { name: 'Alterar e-mail' }).click()
  await expect(page.getByRole('dialog', { name: 'Alterar e-mail de acesso' })).toBeVisible()
  const confirmEmailButton = page.getByRole('button', { name: 'Confirmar e-mail' })
  await expect(confirmEmailButton).toBeDisabled()
  await expect(page.getByRole('status')).toHaveText('Digite um e-mail diferente do atual.')
  await page.getByLabel('Novo e-mail').fill('ana@example.com')
  await page.getByLabel('Senha da conta').fill('SenhaAtual1!')
  await expect(confirmEmailButton).toBeDisabled()
  await expect(page.getByRole('status')).toHaveText('Digite um e-mail diferente do atual.')
  await page.getByLabel('Novo e-mail').fill('ana.nova@example.com')
  await expect(page.getByRole('status')).toHaveCount(0)
  await expect(confirmEmailButton).toBeEnabled()
  await confirmEmailButton.click()

  await expect.poll(() => submittedPayload).toEqual({ email: 'ana.nova@example.com', currentPassword: 'SenhaAtual1!' })
  await expect(page.getByRole('dialog', { name: 'Alterar e-mail de acesso' })).toBeHidden()
  await expect(page.getByLabel('E-mail de acesso')).toHaveValue('ana.nova@example.com')
  await expect(page.getByRole('status')).toHaveText('E-mail atualizado. Use o novo endereço nos próximos acessos.')
})

test('mensagem de sucesso expira e a troca de senha exige campos válidos', async ({ page }) => {
  await page.addInitScript((value) => localStorage.setItem('session', JSON.stringify(value)), session('CANDIDATE'))

  let passwordRequests = 0
  await page.route('**/api/v1/users/me', (route) => {
    if (route.request().method() === 'PATCH') {
      return route.fulfill({ json: { ...mockAccount('CANDIDATE'), name: 'Ana atualizada' } })
    }
    return route.fulfill({ json: mockAccount('CANDIDATE') })
  })
  await page.route('**/api/v1/users/me/profile', (route) => route.fulfill({
    json: {
      id: 'user-1', name: 'Ana da Silva', phone: null, city: 'Cabo Frio',
      interests: [], experience: null, availability: null, acceptedContractTypes: [], neighborhood: null,
    },
  }))
  await page.route('**/api/v1/auth/password', (route) => {
    passwordRequests += 1
    return route.fulfill({ json: session('CANDIDATE') })
  })

  await page.goto('/perfil')

  const currentPasswordToggle = page.getByRole('button', { name: 'Mostrar senha atual' })
  const newPasswordToggle = page.getByRole('button', { name: 'Mostrar nova senha' })
  const confirmPasswordToggle = page.getByRole('button', { name: 'Mostrar confirmação da senha' })
  const changePasswordButton = page.getByRole('button', { name: 'Alterar senha' })
  await expect(currentPasswordToggle).toBeDisabled()
  await expect(newPasswordToggle).toBeDisabled()
  await expect(confirmPasswordToggle).toBeDisabled()
  await expect(changePasswordButton).toBeDisabled()

  await page.getByLabel('Nome', { exact: true }).fill('Ana atualizada')
  await page.getByRole('button', { name: 'Salvar dados' }).click()
  await expect(page.getByRole('status')).toHaveText('Dados da conta atualizados.')
  await expect(page.getByRole('status')).toBeHidden({ timeout: 6000 })

  await page.getByLabel('Senha atual').fill('senha atual')
  await expect(currentPasswordToggle).toBeEnabled()
  await expect(newPasswordToggle).toBeDisabled()
  await expect(confirmPasswordToggle).toBeDisabled()
  await currentPasswordToggle.click()
  await expect(page.getByLabel('Senha atual')).toHaveAttribute('type', 'text')
  await expect(page.getByLabel('Nova senha')).toHaveAttribute('type', 'password')
  await page.getByRole('button', { name: 'Ocultar senha atual' }).click()
  await expect(page.getByLabel('Senha atual')).toHaveAttribute('type', 'password')

  await page.getByLabel('Nova senha').fill('senha')
  await page.getByLabel('Confirme a nova senha').fill('senha')
  await expect(page.getByText('Mínimo de 8 caracteres')).toBeVisible()
  await expect(newPasswordToggle).toBeEnabled()
  await expect(confirmPasswordToggle).toBeEnabled()
  await expect(changePasswordButton).toBeDisabled()
  expect(passwordRequests).toBe(0)

  await page.getByLabel('Nova senha').fill('SenhaSegura1!')
  await page.getByLabel('Confirme a nova senha').fill('SenhaSegura1!')
  await expect(changePasswordButton).toBeEnabled()
  await changePasswordButton.click()
  await expect.poll(() => passwordRequests).toBe(1)
  await expect(page.getByRole('status')).toHaveText('Senha alterada. Este dispositivo continua conectado.')
  await expect(page.getByRole('status')).toBeHidden({ timeout: 6000 })
})
