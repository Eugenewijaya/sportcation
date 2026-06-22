import * as crypto from "crypto"

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

const BAYAR_GG_BASE_URL = "https://www.bayar.gg/api"

export async function createBayarGgPayment(input: BayarGgCreatePaymentInput): Promise<BayarGgPaymentResponse> {
  const apiKey = process.env.BAYAR_GG_API_KEY
  if (!apiKey) {
    throw new Error("BAYAR_GG_API_KEY is not set")
  }

  const response = await fetch(`${BAYAR_GG_BASE_URL}/create-payment.php`, {
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
    const text = await response.text()
    throw new Error(`bayar.gg create payment failed: ${response.status} ${text}`)
  }

  const result = await response.json()
  if (result.error) {
    throw new Error(`bayar.gg API error: ${result.error}`)
  }

  return result as BayarGgPaymentResponse
}

export async function checkBayarGgPaymentStatus(invoiceId: string): Promise<BayarGgPaymentResponse> {
  const apiKey = process.env.BAYAR_GG_API_KEY
  if (!apiKey) {
    throw new Error("BAYAR_GG_API_KEY is not set")
  }

  const response = await fetch(`${BAYAR_GG_BASE_URL}/check-payment.php?invoice_id=${invoiceId}`, {
    method: "GET",
    headers: {
      "X-API-Key": apiKey,
    },
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`bayar.gg check payment failed: ${response.status} ${text}`)
  }

  const result = await response.json()
  if (result.error) {
    throw new Error(`bayar.gg API error: ${result.error}`)
  }

  return result as BayarGgPaymentResponse
}

export function verifyBayarGgWebhookSignature(rawBody: string, signature: string): boolean {
  const apiKey = process.env.BAYAR_GG_API_KEY
  if (!apiKey) {
    return false
  }

  try {
    const expectedSignature = crypto.createHmac("sha256", apiKey).update(rawBody).digest("hex")
    // Use timing-safe equal to prevent timing attacks
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))
  } catch (err) {
    console.error("Signature verification error:", err)
    return false
  }
}
