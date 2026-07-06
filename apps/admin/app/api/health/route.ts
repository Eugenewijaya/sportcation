import { sql } from "drizzle-orm"
import { NextResponse } from "next/server"
import { getDb } from "@/lib/db"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET() {
  try {
    await getDb().run(sql`select 1`)
    return NextResponse.json(
      {
        status: "ok",
        service: "sportcation-web",
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      },
    )
  } catch {
    return NextResponse.json(
      {
        status: "unavailable",
        service: "sportcation-web",
      },
      {
        status: 503,
        headers: {
          "Cache-Control": "no-store",
        },
      },
    )
  }
}
