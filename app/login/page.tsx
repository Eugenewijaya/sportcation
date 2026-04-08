"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

export default function LoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      })

      if (res.ok) {
        // Redirect to admin panel on success
        router.push("/admin")
      } else {
        const data = await res.json()
        setError(data.error || "Login gagal cuy. Username atau password salah.")
      }
    } catch (err) {
      setError("Duh, server lagi error, coba lagi nanti.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-muted/20 p-4">
      <Card className="w-full max-w-md shadow-xl border-border">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">Admin Login</CardTitle>
          <CardDescription>
            Masukkan kredensial rahasia lu buat akses panel geng.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded-md">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <label className="text-sm font-semibold">Username</label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-border rounded-lg bg-background"
                placeholder="Username admin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold">Password</label>
              <input
                type="password"
                className="w-full px-4 py-2 border border-border rounded-lg bg-background"
                placeholder="Password rahasia"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full font-bold bg-primary hover:bg-primary/90"
              disabled={isLoading}
            >
              {isLoading ? "Otw Masuk..." : "Gas Login"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
