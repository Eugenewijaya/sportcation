"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

export default function PromoSlider() {
  const [banners, setBanners] = useState<any[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    fetch("/api/admin/banners")
      .then(res => res.json())
      .then(data => {
        if (data.banners) {
          setBanners(data.banners.filter((b: any) => b.isActive))
        }
      })
  }, [])

  useEffect(() => {
    if (banners.length <= 1) return
    const timer = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % banners.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [banners.length])

  if (banners.length === 0) return null

  return (
    <div className="w-full max-w-6xl mx-auto px-6 mt-8 mb-12 relative z-20">
      <div className="relative rounded-2xl overflow-hidden shadow-2xl aspect-[21/9] md:aspect-[3/1] bg-gray-900 group">
        {banners.map((banner, idx) => (
          <a
            key={banner.id}
            href={banner.linkUrl || "#"}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              idx === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
            }`}
          >
            <img 
              src={banner.imageUrl} 
              alt={banner.title} 
              className="w-full h-full object-cover"
            />
            {/* Optional Gradient Overlay for text if needed */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
            <div className="absolute bottom-0 left-0 p-6 w-full text-white">
              <h3 className="text-xl md:text-3xl font-bold">{banner.title}</h3>
              {banner.termsAndConditions && (
                <p className="text-sm md:text-base text-gray-200 mt-1 line-clamp-1">{banner.termsAndConditions}</p>
              )}
            </div>
          </a>
        ))}

        {banners.length > 1 && (
          <>
            <button 
              onClick={() => setCurrentIndex((currentIndex - 1 + banners.length) % banners.length)}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/30 text-white hover:bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button 
              onClick={() => setCurrentIndex((currentIndex + 1) % banners.length)}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/30 text-white hover:bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
            <div className="absolute bottom-4 right-6 z-20 flex gap-2">
              {banners.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`w-2 h-2 rounded-full transition-all ${idx === currentIndex ? "bg-white w-4" : "bg-white/50"}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
