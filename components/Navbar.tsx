import Link from "next/link"
import { Button } from "@/components/ui/button"

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <span className="text-xl font-bold">S</span>
          </div>
          <span className="text-xl font-bold text-foreground">Sportcation</span>
        </Link>
        <nav className="hidden items-center gap-6 md:flex">
          <Link
            href="/features"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Fitur
          </Link>
          <Link
            href="/sports"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Olahraga
          </Link>
          <Link
            href="/how-it-works"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Cara Kerja
          </Link>
          <Link
            href="/community"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Testimoni & Komunitas
          </Link>
          <Link
            href="/about"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Tentang Kita
          </Link>
          <Link
            href="/contact"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Kontak
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          <Button className="bg-primary hover:bg-primary/90">Gas Daftar</Button>
        </div>
      </div>
    </header>
  )
}
