# Pagamentos — TrabalhaLagos

## Gateway: Asaas

Pix, boleto e cartão de crédito. API brasileira.

## Fluxo de upgrade

1. Empregador seleciona plano → `POST /payments/checkout` com `{ plan, paymentMethod }`
2. Backend cria cobrança no Asaas → retorna URL de pagamento ou QR Code Pix
3. Asaas confirma via webhook → `POST /webhooks/asaas`
4. Backend atualiza `company.plan` e `company.planExpiresAt`
5. Features premium liberadas imediatamente

## Webhook

```typescript
@Post('webhooks/asaas')
async handleWebhook(@Body() payload: AsaasWebhookPayload) {
  // Validar token do webhook (ASAAS_WEBHOOK_TOKEN)
  switch (payload.event) {
    case 'PAYMENT_CONFIRMED': // Ativar plano
    case 'PAYMENT_OVERDUE':   // Notificar, manter plano por grace period
    case 'PAYMENT_REFUNDED':  // Reverter para FREE
  }
}
```

## Planos

- `FREE` → default ao criar empresa
- `PRO` → R$29/mês
- `SEASON` → R$49/mês

## Variáveis de ambiente

```
ASAAS_API_KEY=
ASAAS_WEBHOOK_TOKEN=
ASAAS_SANDBOX=true          # true em dev/staging, false em prod
```

Referir a `src/modules/payments/` para implementação.