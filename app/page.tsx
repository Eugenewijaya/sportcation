import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import {
  Calendar,
  Clock,
  MapPin,
  TrendingUp,
  CheckCircle,
  Star,
  ArrowRight,
  Smartphone,
  Shield,
  Zap,
  Flame,
  Trophy,
  Users,
  Lightbulb,
  Mail,
  Phone,
  MapPin as LocationIcon,
  Linkedin,
  Twitter,
  Instagram,
  Heart,
} from "lucide-react"

export default function LandingPage() {
  const sports = [
    { name: "Padel", image: "/padel-court-modern.jpg", color: "from-blue-400", emoji: "🎾" },
    { name: "Golf", image: "/golf-course-green.png", color: "from-green-400", emoji: "⛳" },
    { name: "Tennis", image: "/tennis-court-blue.jpg", color: "from-yellow-400", emoji: "🎾" },
    { name: "Futsal", image: "/futsal-indoor-court.jpg", color: "from-orange-400", emoji: "⚽" },
    { name: "Badminton", image: "/badminton-court.png", color: "from-red-400", emoji: "🏸" },
    { name: "Gym", image: "/modern-gym-equipment.png", color: "from-purple-400", emoji: "💪" },
    { name: "Basketball", image: "/basketball-court.jpg", color: "from-orange-500", emoji: "🏀" },
    { name: "Squash", image: "/squash-court.jpg", color: "from-green-500", emoji: "🎾" },
  ]

  const features = [
    {
      icon: Calendar,
      title: "Easy Booking",
      description: "Reserve courts in seconds with real-time availability",
      color: "bg-blue-50",
      iconColor: "text-blue-600",
    },
    {
      icon: TrendingUp,
      title: "Resell & Auction",
      description: "Can't make it? Resell or auction your booking to other players",
      color: "bg-green-50",
      iconColor: "text-green-600",
    },
    {
      icon: MapPin,
      title: "Find Venues",
      description: "Discover and compare sports facilities near you",
      color: "bg-purple-50",
      iconColor: "text-purple-600",
    },
    {
      icon: Shield,
      title: "Secure Payments",
      description: "Safe and instant transactions for all bookings",
      color: "bg-orange-50",
      iconColor: "text-orange-600",
    },
    {
      icon: Users,
      title: "Community",
      description: "Connect with fellow sports enthusiasts and find teammates",
      color: "bg-pink-50",
      iconColor: "text-pink-600",
    },
    {
      icon: Flame,
      title: "Hot Deals",
      description: "Get notified of last-minute discounts and flash sales",
      color: "bg-red-50",
      iconColor: "text-red-600",
    },
  ]

  const testimonials = [
    {
      name: "Alex Johnson",
      role: "Padel Enthusiast",
      text: "Finally found a place where I can play whenever I want. The resell feature saved me so many times!",
      avatar: "AJ",
    },
    {
      name: "Maria Garcia",
      role: "Tennis Player",
      text: "Sportcation made booking my weekly tennis session stress-free. Love the app!",
      avatar: "MG",
    },
    {
      name: "James Chen",
      role: "Gym Regular",
      text: "Great app for finding new gyms and courts. The community is amazing.",
      avatar: "JC",
    },
  ]

  const team = [
    {
      name: "Sarah Johnson",
      role: "Founder & CEO",
      bio: "Former pro tennis player with 15 years in sports management",
      avatar: "SJ",
    },
    {
      name: "Michael Chen",
      role: "CTO & Co-founder",
      bio: "Ex-Google engineer, passionate about sports tech",
      avatar: "MC",
    },
    {
      name: "Emma Rodriguez",
      role: "Head of Partnerships",
      bio: "Sports industry veteran with 10+ years experience",
      avatar: "ER",
    },
  ]

  const contactInfo = [
    {
      icon: Mail,
      label: "Email",
      value: "hello@sportcation.com",
      color: "text-blue-600",
    },
    {
      icon: Phone,
      label: "Phone",
      value: "+1 (555) 123-4567",
      color: "text-green-600",
    },
    {
      icon: LocationIcon,
      label: "Address",
      value: "123 Sports Ave, New York, NY 10001",
      color: "text-red-600",
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <span className="text-xl font-bold">S</span>
            </div>
            <span className="text-xl font-bold text-foreground">Sportcation</span>
          </div>
          <nav className="hidden items-center gap-6 md:flex">
            <Link
              href="#features"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Features
            </Link>
            <Link
              href="#sports"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Sports
            </Link>
            <Link
              href="#how-it-works"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              How It Works
            </Link>
            <Link
              href="#testimonials"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Community
            </Link>
            <Link
              href="#about"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              About
            </Link>
            <Link
              href="#contact"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Contact
            </Link>
          </nav>
          <Button className="bg-primary hover:bg-primary/90">Get Started</Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto px-4 py-20 md:py-32">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="flex flex-col gap-6">
              <Badge className="w-fit bg-accent text-accent-foreground border-0">
                <Zap className="mr-1 h-3 w-3" />
                Now Live in Beta
              </Badge>
              <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground md:text-6xl">
                Book Your Court, Anytime, Anywhere
              </h1>
              <p className="text-pretty text-lg text-muted-foreground leading-relaxed">
                Sportcation makes it easy to find and book sports venues instantly. Can't make it? Our unique resell
                feature lets you auction your booking to other players.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button size="lg" className="bg-primary hover:bg-primary/90">
                  Download App
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button size="lg" variant="outline">
                  Watch Demo
                </Button>
              </div>
              <div className="flex items-center gap-8 pt-4">
                <div className="flex flex-col">
                  <div className="text-2xl font-bold text-foreground">10K+</div>
                  <div className="text-sm text-muted-foreground">Active Users</div>
                </div>
                <div className="flex flex-col">
                  <div className="text-2xl font-bold text-foreground">500+</div>
                  <div className="text-sm text-muted-foreground">Venues</div>
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-1 text-2xl font-bold text-foreground">
                    4.8 <Star className="h-5 w-5 fill-primary text-primary" />
                  </div>
                  <div className="text-sm text-muted-foreground">Rating</div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="relative aspect-square overflow-hidden rounded-2xl bg-muted shadow-2xl">
                <img src="/sports-booking-mobile-app-ui.jpg" alt="Sportcation App" className="h-full w-full object-cover" />
              </div>
              {/* Floating cards */}
              <Card className="absolute -left-4 top-20 w-48 p-4 shadow-lg md:w-56">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-card-foreground">Quick Booking</div>
                    <div className="text-xs text-muted-foreground">Under 30 seconds</div>
                  </div>
                </div>
              </Card>
              <Card className="absolute -right-4 bottom-20 w-48 p-4 shadow-lg md:w-56">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/50">
                    <TrendingUp className="h-5 w-5 text-accent-foreground" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-card-foreground">Resell Feature</div>
                    <div className="text-xs text-muted-foreground">Get your money back</div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="border-b border-border bg-muted/30 py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-balance text-3xl font-bold text-foreground md:text-4xl">
              Tired of Last-Minute Cancellations?
            </h2>
            <p className="mt-4 text-pretty text-lg text-muted-foreground leading-relaxed">
              We know the struggle: you book a court, something comes up, and you lose your money. Or you're looking for
              a last-minute game but everything's fully booked. Sportcation solves both problems.
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="border-b border-border py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <Badge className="mb-4 bg-accent text-accent-foreground">Features</Badge>
            <h2 className="text-balance text-3xl font-bold text-foreground md:text-4xl">
              Everything You Need in One App
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <Card
                key={index}
                className={`border-border p-6 hover:shadow-xl transition-all transform hover:scale-105 cursor-pointer group`}
              >
                <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-lg ${feature.color}`}>
                  <feature.icon className={`h-6 w-6 ${feature.iconColor}`} />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-card-foreground">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Unique Feature Highlight */}
      <section className="border-b border-border bg-gradient-to-br from-primary/5 to-accent/5 py-20">
        <div className="container mx-auto px-4">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="order-2 lg:order-1">
              <img src="/auction-bidding-mobile-interface.jpg" alt="Resell Feature" className="rounded-2xl shadow-2xl" />
            </div>
            <div className="order-1 lg:order-2">
              <Badge className="mb-4 bg-accent text-accent-foreground">Game Changer</Badge>
              <h2 className="text-balance text-3xl font-bold text-foreground md:text-4xl">
                Can't Play? Resell or Auction Your Booking
              </h2>
              <p className="mt-4 text-pretty text-lg text-muted-foreground leading-relaxed">
                Life happens. With Sportcation's unique resell and auction feature, you never lose money on cancelled
                bookings. List your slot and let other players bid for it.
              </p>
              <ul className="mt-6 space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle className="mt-0.5 h-5 w-5 text-primary" />
                  <span className="text-muted-foreground">Set your own price or let the market decide</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="mt-0.5 h-5 w-5 text-primary" />
                  <span className="text-muted-foreground">Instant notifications when someone bids</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="mt-0.5 h-5 w-5 text-primary" />
                  <span className="text-muted-foreground">Secure transfer with full refund protection</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Sports Grid */}
      <section id="sports" className="border-b border-border py-20 bg-gradient-to-b from-muted/30 to-background">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <Badge className="mb-4 bg-accent text-accent-foreground">8+ Sports</Badge>
            <h2 className="text-balance text-3xl font-bold text-foreground md:text-4xl">
              Play Virtually Any Sport
            </h2>
            <p className="mt-4 text-muted-foreground">And we're adding more every week!</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {sports.map((sport, index) => (
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
                        Book Now
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
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="border-b border-border bg-muted/30 py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="text-balance text-3xl font-bold text-foreground md:text-4xl">How Sportcation Works</h2>
            <p className="mt-4 text-muted-foreground">Get started in three simple steps</p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="relative">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
                1
              </div>
              <h3 className="mb-2 text-xl font-semibold text-foreground">Find Your Venue</h3>
              <p className="text-muted-foreground leading-relaxed">
                Browse available courts and facilities near you. Filter by sport, time, and price.
              </p>
            </div>
            <div className="relative">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
                2
              </div>
              <h3 className="mb-2 text-xl font-semibold text-foreground">Book Instantly</h3>
              <p className="text-muted-foreground leading-relaxed">
                Reserve your slot in seconds with secure payment. Get instant confirmation.
              </p>
            </div>
            <div className="relative">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
                3
              </div>
              <h3 className="mb-2 text-xl font-semibold text-foreground">Play or Resell</h3>
              <p className="text-muted-foreground leading-relaxed">
                Show up and play, or if plans change, resell your booking to other players.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-b border-border bg-gradient-to-br from-primary to-primary/80 py-20 text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-balance text-3xl font-bold md:text-5xl">Ready to Transform Your Sports Experience?</h2>
          <p className="mx-auto mt-4 max-w-2xl text-pretty text-lg text-primary-foreground/90 leading-relaxed">
            Join thousands of players who never miss a game. Download Sportcation today and get your first booking free.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" variant="secondary" className="bg-background text-foreground hover:bg-background/90">
              <Smartphone className="mr-2 h-5 w-5" />
              Download for iOS
            </Button>
            <Button size="lg" variant="secondary" className="bg-background text-foreground hover:bg-background/90">
              <Smartphone className="mr-2 h-5 w-5" />
              Download for Android
            </Button>
          </div>
          <p className="mt-6 text-sm text-primary-foreground/80">Available on iOS and Android • Free to download</p>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="border-b border-border py-20 bg-muted/40">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <Badge className="mb-4 bg-accent text-accent-foreground">Success Stories</Badge>
            <h2 className="text-balance text-3xl font-bold text-foreground md:text-4xl">
              Loved by Sports Enthusiasts
            </h2>
            <p className="mt-4 text-muted-foreground">Join thousands of happy players worldwide</p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-border p-6 hover:shadow-xl transition-all">
                <div className="mb-4 flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20 text-lg font-bold text-primary">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <h4 className="font-semibold text-card-foreground">{testimonial.name}</h4>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-muted-foreground italic leading-relaxed">"{testimonial.text}"</p>
                <div className="mt-4 flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-b border-border bg-gradient-to-r from-primary to-accent/50 py-20 text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-4 text-center">
            <div className="group hover:scale-110 transition-transform cursor-pointer">
              <div className="text-4xl font-bold md:text-5xl">10K+</div>
              <div className="mt-2 text-sm text-primary-foreground/80">Active Players</div>
            </div>
            <div className="group hover:scale-110 transition-transform cursor-pointer">
              <div className="text-4xl font-bold md:text-5xl">500+</div>
              <div className="mt-2 text-sm text-primary-foreground/80">Venues Available</div>
            </div>
            <div className="group hover:scale-110 transition-transform cursor-pointer">
              <div className="text-4xl font-bold md:text-5xl">50K+</div>
              <div className="mt-2 text-sm text-primary-foreground/80">Bookings Made</div>
            </div>
            <div className="group hover:scale-110 transition-transform cursor-pointer">
              <div className="text-4xl font-bold md:text-5xl">4.8</div>
              <div className="mt-2 text-sm text-primary-foreground/80">App Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section id="about" className="border-b border-border py-20 bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <Badge className="mb-4 bg-accent text-accent-foreground">Our Story</Badge>
            <h2 className="text-balance text-3xl font-bold text-foreground md:text-4xl">About Sportcation</h2>
          </div>
          <div className="grid gap-12 lg:grid-cols-2 items-center">
            <div className="space-y-6">
              <p className="text-lg text-muted-foreground leading-relaxed">
                Sportcation was founded in 2022 by a group of passionate sports enthusiasts who were tired of losing money on cancelled bookings. We saw a problem and decided to build the solution.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Today, we're revolutionizing how people book sports venues. Our platform connects thousands of players with hundreds of facilities worldwide, making it easier than ever to play the sports you love.
              </p>
              <div className="grid grid-cols-3 gap-4 pt-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">2022</div>
                  <div className="text-sm text-muted-foreground">Founded</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">50+</div>
                  <div className="text-sm text-muted-foreground">Team Members</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">15</div>
                  <div className="text-sm text-muted-foreground">Countries</div>
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <Button className="bg-primary hover:bg-primary/90">Learn More</Button>
                <Button variant="outline">View Blog</Button>
              </div>
            </div>
            <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl p-8 flex items-center justify-center h-96">
              <div className="text-center">
                <Heart className="h-24 w-24 text-primary/40 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-foreground mb-2">Our Mission</h3>
                <p className="text-muted-foreground">
                  Making sports accessible, affordable, and enjoyable for everyone, everywhere.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="border-b border-border py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <Badge className="mb-4 bg-accent text-accent-foreground">Leadership</Badge>
            <h2 className="text-balance text-3xl font-bold text-foreground md:text-4xl">Meet Our Team</h2>
            <p className="mt-4 text-muted-foreground">Experienced professionals dedicated to transforming sports bookings</p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {team.map((member, index) => (
              <Card key={index} className="border-border p-6 hover:shadow-xl transition-all text-center">
                <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/20 text-2xl font-bold text-primary mx-auto">
                  {member.avatar}
                </div>
                <h3 className="text-xl font-semibold text-foreground">{member.name}</h3>
                <p className="text-sm font-medium text-primary mb-3">{member.role}</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{member.bio}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Us Section */}
      <section id="contact" className="border-b border-border py-20 bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <Badge className="mb-4 bg-accent text-accent-foreground">Get in Touch</Badge>
            <h2 className="text-balance text-3xl font-bold text-foreground md:text-4xl">Contact Us</h2>
            <p className="mt-4 text-muted-foreground">Have questions? We&apos;d love to hear from you</p>
          </div>
          <div className="grid gap-12 lg:grid-cols-2">
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-foreground">Contact Information</h3>
              <div className="space-y-4">
                {contactInfo.map((info, index) => (
                  <Card key={index} className="border-border p-4 hover:shadow-lg transition-all flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
                      <info.icon className={`h-6 w-6 ${info.color}`} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">{info.label}</h4>
                      <p className="text-sm text-muted-foreground">{info.value}</p>
                    </div>
                  </Card>
                ))}
              </div>
              <div className="pt-4">
                <h4 className="font-semibold text-foreground mb-4">Follow Us</h4>
                <div className="flex gap-3">
                  <Button variant="outline" size="icon" className="hover:bg-primary hover:text-primary-foreground">
                    <Twitter className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" className="hover:bg-primary hover:text-primary-foreground">
                    <Linkedin className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" className="hover:bg-primary hover:text-primary-foreground">
                    <Instagram className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-primary/5 to-accent/5 rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-foreground mb-6">Send us a Message</h3>
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Name</label>
                  <input
                    type="text"
                    placeholder="Your name"
                    className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Email</label>
                  <input
                    type="email"
                    placeholder="your@email.com"
                    className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Message</label>
                  <textarea
                    placeholder="Tell us how we can help"
                    rows={4}
                    className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <Button className="w-full bg-primary hover:bg-primary/90">Send Message</Button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
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
              <p className="text-sm text-muted-foreground">Book, play, and resell sports venues with ease.</p>
            </div>
            <div>
              <h4 className="mb-4 font-semibold text-foreground">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    FAQ
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 font-semibold text-foreground">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    Careers
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 font-semibold text-foreground">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    Terms
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-12 border-t border-border pt-8 text-center text-sm text-muted-foreground">
            © 2025 Sportcation. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
