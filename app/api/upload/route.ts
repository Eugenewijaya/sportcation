import { NextResponse } from "next/server"
import { requireApiActor } from "@/lib/auth-access"

export const runtime = "nodejs"

export async function POST(request: Request) {
  try {
    // Only allow authenticated users to upload
    const access = await requireApiActor(request, ["admin", "merchant_owner", "merchant_staff", "customer"])
    if ("response" in access) return access.response

    const formData = await request.formData()
    const file = formData.get("file") as File
    
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // For MVP, since we don't have cloud storage configured, 
    // we encode the image as a base64 data URL. This allows it to be saved
    // directly into the database's text fields (like imageUrl or image)
    // without requiring AWS S3 or Vercel Blob setup.
    const buffer = Buffer.from(await file.arrayBuffer())
    const base64 = buffer.toString("base64")
    const mimeType = file.type || "image/jpeg"
    
    const dataUrl = `data:${mimeType};base64,${base64}`

    return NextResponse.json({ url: dataUrl })
  } catch (error) {
    console.error("[upload-error]", error)
    return NextResponse.json({ error: "Failed to process file" }, { status: 500 })
  }
}
