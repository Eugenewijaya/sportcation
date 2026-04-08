"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import * as Tabs from "@radix-ui/react-tabs"
import { Upload } from "lucide-react"

// Simple ImageUploader component
function ImageUploader({ field, onChange }: { field: string; onChange: (url: string) => void }) {
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const formData = new FormData()
    formData.append("file", file)
    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    })
    const data = await res.json()
    if (data.url) {
      onChange(data.url)
    } else {
      alert(data.error || "Upload failed")
    }
  }

  return (
    <div className="flex items-center gap-2">
      <input type="file" accept="image/jpeg,image/png" onChange={handleUpload} />
      <span className="text-sm text-muted-foreground">{field}</span>
    </div>
  )
}

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
        setMessage("✅ Konten berhasil diupdate.")
      } else {
        setMessage("❌ Gagal menyimpan data.")
      }
    } catch (err) {
      console.error(err)
      setMessage("❌ Terjadi kesalahan saat menyimpan.")
    }
    setIsSaving(false)
  }

  const updateSection = (section: string, data: any) => {
    setContent((prev: any) => ({ ...prev, [section]: data }))
  }

  if (isLoading) return <div className="p-10 text-center">Loading admin data...</div>

  return (
    <div className="min-h-screen bg-muted/30 p-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Admin Control Panel</h1>
            <p className="text-muted-foreground mt-1">Edit semua konten landing page.</p>
          </div>
          <Button onClick={handleSave} disabled={isSaving} className="bg-primary-red hover:bg-primary-red/90">
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>

        {message && (
          <div className="p-4 rounded-md bg-accent text-accent-foreground font-medium">{message}</div>
        )}

        <Tabs.Root defaultValue="hero" className="flex flex-col gap-4">
          <Tabs.List className="flex gap-2">
            <Tabs.Trigger value="hero" className="px-4 py-2 bg-primary-orange rounded-md data-[state=active]:bg-primary-red data-[state=active]:text-white">
              Hero
            </Tabs.Trigger>
            <Tabs.Trigger value="promo" className="px-4 py-2 bg-primary-orange rounded-md data-[state=active]:bg-primary-red data-[state=active]:text-white">
              Promo
            </Tabs.Trigger>
            <Tabs.Trigger value="features" className="px-4 py-2 bg-primary-orange rounded-md data-[state=active]:bg-primary-red data-[state=active]:text-white">
              Features
            </Tabs.Trigger>
            <Tabs.Trigger value="sports" className="px-4 py-2 bg-primary-orange rounded-md data-[state=active]:bg-primary-red data-[state=active]:text-white">
              Sports
            </Tabs.Trigger>
            <Tabs.Trigger value="about" className="px-4 py-2 bg-primary-orange rounded-md data-[state=active]:bg-primary-red data-[state=active]:text-white">
              About
            </Tabs.Trigger>
            <Tabs.Trigger value="json" className="px-4 py-2 bg-primary-orange rounded-md data-[state=active]:bg-primary-red data-[state=active]:text-white">
              JSON
            </Tabs.Trigger>
          </Tabs.List>

          {/* Hero Tab */}
          <Tabs.Content value="hero" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Hero Section</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Badge</label>
                  <input
                    className="w-full rounded-md border border-input p-2 bg-background"
                    value={content?.hero?.badge || ""}
                    onChange={(e) => updateSection("hero", { ...content.hero, badge: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Title</label>
                  <input
                    className="w-full rounded-md border border-input p-2 bg-background"
                    value={content?.hero?.title || ""}
                    onChange={(e) => updateSection("hero", { ...content.hero, title: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    className="w-full rounded-md border border-input p-2 bg-background"
                    rows={3}
                    value={content?.hero?.description || ""}
                    onChange={(e) => updateSection("hero", { ...content.hero, description: e.target.value })}
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => updateSection("hero", { ...content.hero, buttonPrimary: "Unduh Aplikasi" })}
                    className="bg-primary-red"
                  >
                    Primary Button Text
                  </Button>
                  <Button
                    onClick={() => updateSection("hero", { ...content.hero, buttonSecondary: "Lihat Demo" })}
                    variant="outline"
                    className="border-primary-orange text-primary-orange"
                  >
                    Secondary Button Text
                  </Button>
                </div>
              </CardContent>
            </Card>
          </Tabs.Content>

          {/* Promo Tab */}
          <Tabs.Content value="promo" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Promo Section</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Title</label>
                  <input
                    className="w-full rounded-md border border-input p-2 bg-background"
                    value={content?.promoSection?.title || ""}
                    onChange={(e) => updateSection("promoSection", { ...content.promoSection, title: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    className="w-full rounded-md border border-input p-2 bg-background"
                    rows={3}
                    value={content?.promoSection?.description || ""}
                    onChange={(e) => updateSection("promoSection", { ...content.promoSection, description: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Bullets (comma separated)</label>
                  <input
                    className="w-full rounded-md border border-input p-2 bg-background"
                    value={content?.promoSection?.bullets?.join(", ") || ""}
                    onChange={(e) =>
                      updateSection("promoSection", {
                        ...content.promoSection,
                        bullets: e.target.value.split(",").map((b) => b.trim()),
                      })
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </Tabs.Content>

          {/* Features Tab */}
          <Tabs.Content value="features" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Features (JSON Edit)</CardTitle>
              </CardHeader>
              <CardContent>
                <textarea
                  className="w-full rounded-md border border-input p-4 font-mono text-sm bg-black text-green-400"
                  rows={12}
                  value={JSON.stringify(content?.features, null, 2)}
                  onChange={(e) => updateSection("features", JSON.parse(e.target.value))}
                />
              </CardContent>
            </Card>
          </Tabs.Content>

          {/* Sports Tab */}
          <Tabs.Content value="sports" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Sports (Edit Images & Data)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {content?.sports?.map((sport: any, idx: number) => (
                  <div key={idx} className="flex items-center gap-4 p-2 border rounded-md">
                    <div className="flex-1">
                      <label className="block text-sm font-medium mb-1">Name</label>
                      <input
                        className="w-full rounded-md border border-input p-1 bg-background"
                        value={sport.name}
                        onChange={(e) => {
                          const newSports = [...content.sports]
                          newSports[idx].name = e.target.value
                          updateSection("sports", newSports)
                        }}
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium mb-1">Image URL</label>
                      <input
                        className="w-full rounded-md border border-input p-1 bg-background"
                        value={sport.image}
                        onChange={(e) => {
                          const newSports = [...content.sports]
                          newSports[idx].image = e.target.value
                          updateSection("sports", newSports)
                        }}
                      />
                      <ImageUploader
                        field={sport.name}
                        onChange={(url) => {
                          const newSports = [...content.sports]
                          newSports[idx].image = url
                          updateSection("sports", newSports)
                        }}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </Tabs.Content>

          {/* About Tab */}
          <Tabs.Content value="about" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>About Section</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Story</label>
                  <textarea
                    className="w-full rounded-md border border-input p-2 bg-background"
                    rows={3}
                    value={content?.about?.story || ""}
                    onChange={(e) => updateSection("about", { ...content.about, story: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Mission</label>
                  <textarea
                    className="w-full rounded-md border border-input p-2 bg-background"
                    rows={3}
                    value={content?.about?.mission || ""}
                    onChange={(e) => updateSection("about", { ...content.about, mission: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Stats (JSON)</label>
                  <textarea
                    className="w-full rounded-md border border-input p-2 bg-background font-mono text-sm"
                    rows={4}
                    value={JSON.stringify(content?.about?.stats, null, 2)}
                    onChange={(e) => updateSection("about", { ...content.about, stats: JSON.parse(e.target.value) })}
                  />
                </div>
              </CardContent>
            </Card>
          </Tabs.Content>

          {/* JSON Tab */}
          <Tabs.Content value="json" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Full JSON Edit (Power Users)</CardTitle>
              </CardHeader>
              <CardContent>
                <textarea
                  className="w-full rounded-md border border-input p-4 font-mono text-sm bg-black text-green-400"
                  rows={20}
                  defaultValue={JSON.stringify(content, null, 2)}
                  onChange={(e) => setContent(JSON.parse(e.target.value))}
                />
              </CardContent>
            </Card>
          </Tabs.Content>
        </Tabs.Root>
      </div>
    </div>
  )
}
