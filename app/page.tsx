import Link from "next/link"
import { getContent } from "@/lib/content"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Zap, ArrowRight, Star, Clock, TrendingUp, Smartphone, CheckCircle } from "lucide-react"

export default async function LandingPage() {
  const content = await getContent()
  const hero = content?.hero

  return (
    <div className="bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto px-4 py-20 md:py-32">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="flex flex-col gap-6">
              {hero?.badge && (
                <Badge className="w-fit bg-accent text-accent-foreground border-0 text-sm px-3 py-1">
                  <Zap className="mr-1 h-4 w-4" />
                  {hero.badge}
                </Badge>
              )}
              <h1 className="text-balance text-4xl font-extrabold tracking-tight text-foreground md:text-6xl leading-[1.1]">
                {hero?.title}
              </h1>
              <p className="text-pretty text-lg text-muted-foreground leading-relaxed">
                {hero?.description}
              </p>
              <div className="flex flex-col gap-3 sm:flex-row mt-4">
                <Button size="lg" className="bg-primary hover:bg-primary/90 h-14 text-base font-bold">
                  {hero?.buttonPrimary}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Link href="/how-it-works">
                  <Button size="lg" variant="outline" className="h-14 w-full sm:w-auto text-base font-bold border-2">
                    {hero?.buttonSecondary}
                  </Button>
                </Link>
              </div>
              <div className="flex items-center gap-8 pt-6">
                {hero?.stats?.map((stat: any, i: number) => (
                  <div key={i} className="flex flex-col">
                    <div className="flex items-center gap-1 text-2xl font-black text-foreground">
                      {stat.value}
                      {stat.label.includes("Rating") && <Star className="h-5 w-5 fill-primary text-primary" />}
                    </div>
                    <div className="text-sm font-medium text-muted-foreground">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="relative mt-10 lg:mt-0">
              <div className="relative aspect-square overflow-hidden rounded-3xl bg-muted shadow-2xl border-8 border-background">
                <img src="/sports-booking-mobile-app-ui.jpg" alt="Sportcation App" className="h-full w-full object-cover" />
              </div>
              
              <Card className="absolute -left-6 top-20 w-56 p-4 shadow-xl border-0 bg-background/95 backdrop-blur slide-in-from-left animate-in duration-700">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <Clock className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-card-foreground">Sistem Satset</div>
                    <div className="text-xs font-medium text-muted-foreground">Beres under 30 detik</div>
                  </div>
                </div>
              </Card>

              <Card className="absolute -right-6 bottom-20 w-56 p-4 shadow-xl border-0 bg-background/95 backdrop-blur slide-in-from-right animate-in duration-700 delay-150">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/20">
                    <TrendingUp className="h-6 w-6 text-accent-foreground" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-card-foreground">Fitur Resell Dewa</div>
                    <div className="text-xs font-medium text-muted-foreground">Cuan walau batal main</div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Problem Statement / Hook */}
      <section className="border-b border-border bg-gradient-to-br from-primary/5 to-accent/5 py-24">
        <div className="container mx-auto px-4">
          <div className="grid items-center gap-16 lg:grid-cols-2">
            <div className="order-2 lg:order-1 relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent rounded-3xl transform -rotate-3 scale-105" />
              <img src="/auction-bidding-mobile-interface.jpg" alt="Resell Feature" className="relative rounded-3xl shadow-2xl border-4 border-background" />
            </div>
            <div className="order-1 lg:order-2">
              <Badge className="mb-6 bg-accent text-accent-foreground px-4 py-1.5 text-sm">Valid No Debat</Badge>
              <h2 className="text-balance text-4xl font-black text-foreground md:text-5xl leading-tight">
                Mager Mendadak?<br/>Jual Aja Slot Lu!
              </h2>
              <p className="mt-6 text-pretty text-xl text-muted-foreground leading-relaxed">
                Kita tau banget rasanya. Udah semanget booking, eh circle pada wacana. Santai, di Sportcation lu bisa lelang bookingan lu ke player lain. Ga ada ceritanya dompet lu kejepit.
              </p>
              <ul className="mt-8 space-y-4">
                <li className="flex items-center gap-4 bg-background p-4 rounded-xl shadow-sm border border-border/50">
                  <CheckCircle className="h-6 w-6 text-primary flex-shrink-0" />
                  <span className="text-foreground font-medium">Bebas pasang harga atau lelang bebas</span>
                </li>
                <li className="flex items-center gap-4 bg-background p-4 rounded-xl shadow-sm border border-border/50">
                  <CheckCircle className="h-6 w-6 text-primary flex-shrink-0" />
                  <span className="text-foreground font-medium">Notif instan pas ada yang mau bungkus</span>
                </li>
                <li className="flex items-center gap-4 bg-background p-4 rounded-xl shadow-sm border border-border/50">
                  <CheckCircle className="h-6 w-6 text-primary flex-shrink-0" />
                  <span className="text-foreground font-medium">Auto transfer aman & duit balik 100%</span>
                </li>
              </ul>
              <div className="mt-10">
                <Link href="/how-it-works">
                  <Button className="font-bold text-base h-12 px-8">Liat Cara Kerjanya</Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick CTA */}
      <section className="bg-foreground py-24 text-background">
        <div className="container mx-auto px-4 text-center max-w-4xl">
          <h2 className="text-balance text-4xl font-black md:text-6xl mb-6 text-white">Join Circle Kita Sekarang</h2>
          <p className="text-xl text-gray-300 leading-relaxed mb-10">
            Ribuan player lain udah gabung dan gak pernah nyesel kehilangan slot main. 
            Download app-nya sekarang juga biar dapet slot VIP gratis buat booking pertama lu!
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 h-14 px-8 w-full sm:w-auto font-bold text-lg">
              <Smartphone className="mr-2 h-6 w-6" />
              Gas iOS
            </Button>
            <Button size="lg" variant="outline" className="bg-transparent border-gray-600 text-white hover:bg-gray-800 hover:text-white h-14 px-8 w-full sm:w-auto font-bold text-lg">
              <Smartphone className="mr-2 h-6 w-6" />
              Sikat Android
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
