import { getContent } from "@/lib/content"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Mail, Phone, MapPin as LocationIcon, Twitter, Linkedin, Instagram } from "lucide-react"

export default async function ContactPage() {
  const content = await getContent()

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-20 pb-32">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="mb-16 text-center">
          <Badge className="mb-4 bg-accent text-accent-foreground">Sokin Sini</Badge>
          <h1 className="text-balance text-3xl font-bold text-foreground md:text-5xl">
            Sapa Kita Dong
          </h1>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
            Ada uneg-uneg, mau komplain, atau ngajak collabs? Langsung gas chat nomer atau email di bawah!
          </p>
        </div>
        
        <div className="grid gap-12 lg:grid-cols-2">
          <div className="space-y-8">
            <h3 className="text-2xl font-bold text-foreground">Detail Kontak</h3>
            <div className="space-y-4">
              <Card className="border-border p-5 hover:shadow-lg transition-all flex items-center gap-5">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
                  <Mail className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-bold text-foreground">Email Kita</h4>
                  <p className="text-muted-foreground">{content?.contact?.email}</p>
                </div>
              </Card>
              
              <Card className="border-border p-5 hover:shadow-lg transition-all flex items-center gap-5">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50">
                  <Phone className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h4 className="font-bold text-foreground">Telepon/WA</h4>
                  <p className="text-muted-foreground">{content?.contact?.phone}</p>
                </div>
              </Card>

              <Card className="border-border p-5 hover:shadow-lg transition-all flex items-center gap-5">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50">
                  <LocationIcon className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h4 className="font-bold text-foreground">Markas Besar</h4>
                  <p className="text-muted-foreground">{content?.contact?.address}</p>
                </div>
              </Card>
            </div>
            
            <div className="pt-6">
              <h4 className="font-semibold text-foreground mb-4">Pantengin Medsos Kita</h4>
              <div className="flex gap-4">
                <Button size="icon" className="h-12 w-12 rounded-full hover:bg-primary hover:text-primary-foreground bg-muted text-foreground">
                  <Twitter className="h-5 w-5" />
                </Button>
                <Button size="icon" className="h-12 w-12 rounded-full hover:bg-primary hover:text-primary-foreground bg-muted text-foreground">
                  <Linkedin className="h-5 w-5" />
                </Button>
                <Button size="icon" className="h-12 w-12 rounded-full hover:bg-primary hover:text-primary-foreground bg-muted text-foreground">
                  <Instagram className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-primary/5 to-accent/5 rounded-3xl p-8 border border-border/50">
            <h3 className="text-2xl font-bold text-foreground mb-6">Kasih Surat Cinta</h3>
            <form className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-foreground mb-2">Nama Panggilan</label>
                <input
                  type="text"
                  placeholder="Siapa namalu?"
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-foreground mb-2">Email</label>
                <input
                  type="email"
                  placeholder="email.lu@mana.com"
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-foreground mb-2">Mau Ngomong Apa?</label>
                <textarea
                  placeholder="Jangan curhat panjang-panjang yak..."
                  rows={5}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                />
              </div>
              <Button className="w-full h-12 text-lg font-bold bg-primary hover:bg-primary/90 mt-4 rounded-xl">Kirim Sekarang</Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
