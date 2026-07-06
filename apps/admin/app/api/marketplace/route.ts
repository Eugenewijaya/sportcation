import { NextResponse } from "next/server"
import { getDb } from "@/lib/db"
import { getPublicResells, getPublicAuctions } from "@/lib/services/marketplace-service"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const db = getDb()
    const [resells, auctions] = await Promise.all([
      getPublicResells(db),
      getPublicAuctions(db)
    ])
    
    return NextResponse.json({
      resells,
      auctions
    })
  } catch (error) {
    console.error("[marketplace] GET error:", error)
    return NextResponse.json({ error: "Failed to fetch marketplace data" }, { status: 500 })
  }
}
