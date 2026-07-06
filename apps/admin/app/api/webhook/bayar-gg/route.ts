import { NextResponse } from "next/server"
import { getDb } from "@/lib/db"
import { verifyBayarGgWebhookSignature } from "@/lib/payment-gateway/bayar-gg"
import { confirmPaymentFromWebhook } from "@/lib/services/booking-service"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  try {
    const rawBody = await request.text()
    const signature = request.headers.get("x-webhook-signature") || ""

    if (!verifyBayarGgWebhookSignature(rawBody, signature)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
    }

    const payload = JSON.parse(rawBody)
    const { invoice_id, status } = payload

    if (!invoice_id || !status) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 })
    }

    await confirmPaymentFromWebhook(getDb(), invoice_id, status)

    return NextResponse.json({ received: true }, { status: 200 })
  } catch (error) {
    console.error("[bayar-gg-webhook]", error)
    return NextResponse.json({ error: "Processing error" }, { status: 500 })
  }
}
