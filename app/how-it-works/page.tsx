import { getContent } from "@/lib/content"
import { Badge } from "@/components/ui/badge"

export default async function HowItWorksPage() {
  const content = await getContent()

  return (
    <div className="min-h-screen bg-muted/30 py-20 pb-32">
      <div className="container mx-auto px-4">
        <div className="mb-16 text-center">
          <Badge className="mb-4 bg-accent text-accent-foreground">Tutorial Satset</Badge>
          <h1 className="text-balance text-3xl font-bold text-foreground md:text-5xl">
            Gimana Sih Cara Mainnya?
          </h1>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
            Gampang banget cuy, gak perlu gelar S3 buat paham cara pakenya. Ikutin 3 step dewa ini aja.
          </p>
        </div>
        
        <div className="grid gap-8 md:grid-cols-3 max-w-5xl mx-auto">
          {content?.howItWorks?.map((item: any, index: number) => (
            <div key={index} className="relative bg-background p-8 rounded-2xl shadow-sm border border-border">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground absolute -top-8 left-8 shadow-lg">
                {item.step}
              </div>
              <h3 className="mb-3 mt-4 text-xl font-bold text-foreground">{item.title}</h3>
              <p className="text-muted-foreground leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
