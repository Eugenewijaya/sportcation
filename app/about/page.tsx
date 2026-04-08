import { getContent } from "@/lib/content"
import { Badge } from "@/components/ui/badge"
import { Heart } from "lucide-react"

export default async function AboutPage() {
  const content = await getContent()

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-20 pb-32">
      <div className="container mx-auto px-4">
        <div className="mb-16 text-center">
          <Badge className="mb-4 bg-accent text-accent-foreground">Story Kita</Badge>
          <h1 className="text-balance text-3xl font-bold text-foreground md:text-5xl">
            Tentang Sportcation
          </h1>
        </div>
        
        <div className="grid gap-12 lg:grid-cols-2 items-center max-w-6xl mx-auto">
          <div className="space-y-6">
            <p className="text-lg text-muted-foreground leading-relaxed">
              {content?.about?.story}
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed">
              {content?.about?.mission}
            </p>
            <div className="grid grid-cols-3 gap-4 pt-8">
              <div className="text-center bg-muted/50 rounded-xl p-4">
                <div className="text-3xl font-bold text-primary">2022</div>
                <div className="text-sm text-foreground mt-1">Dicetusin</div>
              </div>
              <div className="text-center bg-muted/50 rounded-xl p-4">
                <div className="text-3xl font-bold text-primary">50+</div>
                <div className="text-sm text-foreground mt-1">Crew Asik</div>
              </div>
              <div className="text-center bg-muted/50 rounded-xl p-4">
                <div className="text-3xl font-bold text-primary">15</div>
                <div className="text-sm text-foreground mt-1">Kota Gede</div>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-3xl p-10 flex items-center justify-center h-[500px] shadow-inner">
            <div className="text-center">
              <div className="bg-background p-6 rounded-full inline-block mb-8 shadow-sm">
                <Heart className="h-16 w-16 text-primary" />
              </div>
              <h3 className="text-3xl font-bold text-foreground mb-4">Visi Misi Utama</h3>
              <p className="text-lg text-muted-foreground max-w-sm mx-auto">
                Bikin dunia perolahragaan jadi gampang diakses & super fun. Udah, itu aja kuncinya!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
