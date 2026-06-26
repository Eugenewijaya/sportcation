import crypto from "crypto"

export type BayarGgCreatePaymentInput = {
  amount: number
  description: string
  paymentMethod: string
  callbackUrl: string
  redirectUrl: string
}

export type BayarGgPaymentResponse = {
  invoice_id: string
  payment_url: string
  qris_url: string | null
  status: string
  amount: number
}

const BASE_URL = "https://www.bayar.gg"

function getApiKey() {
  const key = process.env.BAYAR_GG_API_KEY
  if (!key) throw new Error("BAYAR_GG_API_KEY is not set")
  return key
}

export async function createBayarGgPayment(input: BayarGgCreatePaymentInput): Promise<BayarGgPaymentResponse> {
  const apiKey = getApiKey()
  
  const response = await fetch(`${BASE_URL}/api/create-payment.php`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": apiKey,
    },
    body: JSON.stringify({
      amount: input.amount,
      description: input.description,
      payment_method: input.paymentMethod,
      callback_url: input.callbackUrl,
      redirect_url: input.redirectUrl,
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Bayar.gg create payment failed: ${response.status} ${errorText}`)
  }

  const data = await response.json()
  return data
}

export async function checkBayarGgPaymentStatus(invoiceId: string): Promise<BayarGgPaymentResponse> {
  const apiKey = getApiKey()
  
  const response = await fetch(`${BASE_URL}/api/check-payment.php?invoice_id=${invoiceId}`, {
    method: "GET",
    headers: {
      "X-API-Key": apiKey,
    },
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Bayar.gg check payment failed: ${response.status} ${errorText}`)
  }

  const data = await response.json()
  return data
}

export function verifyBayarGgWebhookSignature(rawBody: string, signature: string): boolean {
  const apiKey = getApiKey()
  const expectedSignature = crypto.createHmac("sha256", apiKey).update(rawBody).digest("hex")
  return signature === expectedSignature
}
