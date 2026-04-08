import Link from "next/link"

export function Footer() {
  return (
    <footer className="bg-muted py-12">
      <div className="container mx-auto px-4">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <span className="text-lg font-bold">S</span>
              </div>
              <span className="text-lg font-bold text-foreground">Sportcation</span>
            </div>
            <p className="text-sm text-muted-foreground">Booking, main, dan cuan dari resell lapang lu dengan gampang.</p>
          </div>
          <div>
            <h4 className="mb-4 font-semibold text-foreground">Produk</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/features" className="hover:text-foreground transition-colors">
                  Fitur Kece
                </Link>
              </li>
              <li>
                <Link href="/sports" className="hover:text-foreground transition-colors">
                  Cabor (Olahraga)
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="hover:text-foreground transition-colors">
                  Cara Main
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="mb-4 font-semibold text-foreground">Perusahaan</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/about" className="hover:text-foreground transition-colors">
                  Tentang Kita
                </Link>
              </li>
              <li>
                <Link href="/community" className="hover:text-foreground transition-colors">
                  Komunitas
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-foreground transition-colors">
                  Karir
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="mb-4 font-semibold text-foreground">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="#" className="hover:text-foreground transition-colors">
                  Privasi & Data
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-foreground transition-colors">
                  S&K
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-foreground transition-colors">
                  Kontak
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-12 border-t border-border pt-8 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Sportcation. All rights reserved kawan.
        </div>
      </div>
    </footer>
  )
}
