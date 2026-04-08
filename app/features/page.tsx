import { getContent } from "@/lib/content"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import * as LucideIcons from "lucide-react"
import { Shield, MapPin, Users, Calendar, TrendingUp, Flame } from "lucide-react"

export default async function FeaturesPage() {
  const content = await getContent()
  
  // Mapping the string icon from JSON to actual Lucide component
  // We can manually map them for safety based on our current JSON
  const iconMap: Record<string, any> = {
    Calendar,
    TrendingUp,
    MapPin,
    Shield,
    Users,
    Flame
  }

  return (
    <div className="min-h-screen bg-background pt-8 pb-20">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <Badge className="mb-4 bg-accent text-accent-foreground">Fitur Kece</Badge>
          <h1 className="text-balance text-3xl font-bold text-foreground md:text-5xl">
            Semua Yang Lu Butuhin Ada Di Sini
          </h1>
          <p className="mt-4 text-muted-foreground text-lg max-w-2xl mx-auto">
            Gak bertele-tele, ini deretan fitur yang bikin hidup lu sebagai penikmat keringet lebih gampang.
          </p>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-12">
          {content?.features?.map((feature: any, index: number) => {
            const IconComponent = iconMap[feature.icon] || LucideIcons.HelpCircle
            
            return (
              <Card
                key={index}
                className="border-border p-6 hover:shadow-xl transition-all transform hover:scale-105 cursor-pointer group"
              >
                <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-lg ${feature.color}`}>
                  <IconComponent className={`h-6 w-6 ${feature.iconColor}`} />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-card-foreground">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
