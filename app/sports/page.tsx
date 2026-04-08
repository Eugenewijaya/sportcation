import { getContent } from "@/lib/content"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default async function SportsPage() {
  const content = await getContent()

  return (
    <div className="min-h-screen bg-gradient-to-b from-muted/30 to-background py-16">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <Badge className="mb-4 bg-accent text-accent-foreground">Banyak Pilihan Kawan</Badge>
          <h1 className="text-balance text-3xl font-bold text-foreground md:text-5xl">
            Gas Pilih Olahraga Favorit Lu
          </h1>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
            Dari yang chill sampe yang nguras napas, pilih aja cabor yang lagi pengen lu sikat hari ini.
          </p>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {content?.sports?.map((sport: any, index: number) => (
            <Card
              key={index}
              className={`group overflow-hidden border-border hover:shadow-2xl transition-all cursor-pointer transform hover:scale-105 bg-gradient-to-br ${sport.color} to-white`}
            >
              <div className="relative aspect-video overflow-hidden bg-muted">
                <img
                  src={sport.image || "/placeholder.svg"}
                  alt={sport.name}
                  className="h-full w-full object-cover transition-transform group-hover:scale-110 opacity-90 group-hover:opacity-100"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                  <div className="text-center">
                    <div className="text-5xl mb-2">{sport.emoji}</div>
                    <Button size="sm" variant="secondary">
                      Gass Book
                    </Button>
                  </div>
                </div>
                <div className="absolute bottom-4 left-4">
                  <h3 className="text-2xl font-bold text-white">{sport.name}</h3>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
