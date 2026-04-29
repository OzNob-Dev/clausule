import { apiJson, jsonRequest } from '@shared/utils/api'

type SendCodeEmailResponse = { nextStep?: 'signup'; mfaRequired?: boolean }

export async function sendCodeEmail(email: string): Promise<SendCodeEmailResponse> {
  return apiJson('/api/auth/send-code', jsonRequest({ email }, { method: 'POST' }), { retryOnUnauthorized: false })
}
