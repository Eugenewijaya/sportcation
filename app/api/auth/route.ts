import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json()

    // Cek Kredensial (Hardcoded sesuai pesanan user)
    if (username === "kw2project" && password === "3oranggantengSOTN") {
      // Set Session Cookie for Admin
      const cookieStore = await cookies()
      cookieStore.set("admin_session", "authenticated_kw2", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: 60 * 60 * 24 // 1 hari alias 24 jam
      })

      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: "Username atau Password salah bro!" }, { status: 401 })
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
