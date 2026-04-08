import { getContent } from "@/lib/content"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Star } from "lucide-react"

export default async function CommunityPage() {
  const content = await getContent()

  return (
    <div className="min-h-screen bg-background py-20">
      <div className="container mx-auto px-4">
        <div className="mb-16 text-center">
          <Badge className="mb-4 bg-accent text-accent-foreground">Kata Anak-Anak</Badge>
          <h1 className="text-balance text-3xl font-bold text-foreground md:text-5xl">
            Suhu-Suhu Udah Pada Join
          </h1>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
            Ini bukan sekedar testi fiktif, tapi real pengakuan sakti dari temen-temen lu yang udah ikutan.
          </p>
        </div>
        
        <div className="grid gap-8 md:grid-cols-3 max-w-6xl mx-auto">
          {content?.testimonials?.map((testimonial: any, index: number) => (
             <Card key={index} className="border-border p-8 hover:shadow-xl transition-all">
               <div className="mb-6 flex items-center gap-4">
                 <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/20 text-xl font-bold text-primary">
                   {testimonial.avatar}
                 </div>
                 <div>
                   <h4 className="font-bold text-card-foreground text-lg">{testimonial.name}</h4>
                   <p className="text-sm text-primary font-medium">{testimonial.role}</p>
                 </div>
               </div>
               <p className="text-muted-foreground italic leading-relaxed text-lg">"{testimonial.text}"</p>
               <div className="mt-6 flex gap-1">
                 {[...Array(5)].map((_, i) => (
                   <Star key={i} className="h-5 w-5 fill-primary text-primary" />
                 ))}
               </div>
             </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
