import { NextResponse } from "next/server"
import { requireApiActor } from "@/lib/auth-access"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { existsSync } from "fs"

export const runtime = "nodejs"

export async function POST(request: Request) {
  try {
    const access = await requireApiActor(request, ["admin", "merchant_owner", "merchant_staff", "customer"])
    if ("response" in access) return access.response

    const formData = await request.formData()
    const file = formData.get("file") as File
    
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    
    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), "public", "uploads")
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true })
    }

    // Generate unique filename
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`
    const extension = file.name.split('.').pop() || 'png'
    const filename = `${uniqueSuffix}.${extension}`
    const filepath = join(uploadsDir, filename)

    // Write file
    await writeFile(filepath, buffer)

    // Return the public URL path
    const dataUrl = `/uploads/${filename}`

    return NextResponse.json({ url: dataUrl })
  } catch (error) {
    console.error("[upload-error]", error)
    return NextResponse.json({ error: "Failed to process file" }, { status: 500 })
  }
}
