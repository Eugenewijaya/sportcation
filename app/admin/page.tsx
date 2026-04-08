"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function AdminPanel() {
  const [content, setContent] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState("")

  useEffect(() => {
    fetch("/api/content")
      .then((res) => res.json())
      .then((data) => {
        setContent(data)
        setIsLoading(false)
      })
      .catch((err) => {
        console.error(err)
        setIsLoading(false)
      })
  }, [])

  const handleSave = async () => {
    setIsSaving(true)
    setMessage("")
    try {
      const res = await fetch("/api/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(content),
      })
      if (res.ok) {
        setMessage("✅ Mantap! Konten berhasil diupdate.")
      } else {
        setMessage("❌ Gagal nyimpen data cuy.")
      }
    } catch (err) {
      console.error(err)
      setMessage("❌ Terjadi kesalahan saat nge-save.")
    }
    setIsSaving(false)
  }

  const handleHeroChange = (field: string, value: string) => {
    setContent((prev: any) => ({
      ...prev,
      hero: { ...prev.hero, [field]: value },
    }))
  }

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    try {
      const parsed = JSON.parse(e.target.value)
      setContent(parsed)
    } catch (err) {
      // Don't update state if JSON is invalid while typing
    }
  }

  if (isLoading) return <div className="p-10 text-center">Loading data admin...</div>

  return (
    <div className="min-h-screen bg-muted/30 p-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Admin Control Panel</h1>
            <p className="text-muted-foreground mt-1">Ubah konten landing page sesuka lu di sini.</p>
          </div>
          <Button onClick={handleSave} disabled={isSaving} className="bg-primary">
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>

        {message && (
          <div className="p-4 rounded-md bg-accent text-accent-foreground font-medium">
            {message}
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Hero Section (Basic Edit)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Badge</label>
              <input
                className="w-full rounded-md border border-input p-2 bg-background"
                value={content?.hero?.badge || ""}
                onChange={(e) => handleHeroChange("badge", e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <input
                className="w-full rounded-md border border-input p-2 bg-background"
                value={content?.hero?.title || ""}
                onChange={(e) => handleHeroChange("title", e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                className="w-full rounded-md border border-input p-2 bg-background"
                rows={3}
                value={content?.hero?.description || ""}
                onChange={(e) => handleHeroChange("description", e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Advanced Edit (Full JSON Content)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Edit semua data lengkap, pastikan format JSON tetep bener biar gak error yak!
            </p>
            <textarea
              className="w-full rounded-md border border-input p-4 font-mono text-sm bg-black text-green-400"
              rows={20}
              defaultValue={JSON.stringify(content, null, 2)}
              onChange={handleTextareaChange}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
