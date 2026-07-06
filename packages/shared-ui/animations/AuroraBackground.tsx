"use client"

import { cn } from "@/lib/utils"
import React, { ReactNode } from "react"
import { motion } from "framer-motion"

interface AuroraBackgroundProps extends React.HTMLProps<HTMLDivElement> {
  children: ReactNode
  showRadialGradient?: boolean
}

export const AuroraBackground = ({
  className,
  children,
  showRadialGradient = true,
  ...props
}: AuroraBackgroundProps) => {
  return (
    <main
      className={cn(
        "relative flex flex-col h-[100vh] items-center justify-center bg-zinc-50 dark:bg-zinc-900 text-slate-950 transition-bg",
        className
      )}
      {...props}
    >
      <div className="absolute inset-0 overflow-hidden">
        <div
          className={cn(
            "filter blur-[60px] opacity-50 absolute inset-0 will-change-transform",
            "bg-[linear-gradient(120deg,#10b981_0%,#3b82f6_50%,#8b5cf6_100%)]",
            "[--aurora:repeating-linear-gradient(100deg,var(--blue-500)_10%,var(--indigo-300)_15%,var(--blue-300)_20%,var(--violet-200)_25%,var(--blue-400)_30%)]",
            "[background-image:var(--aurora)]",
            "dark:[background-image:var(--aurora)]",
            "[background-size:300%,_200%]",
            "[background-position:50%_50%,50%_50%]",
            "after:content-[''] after:absolute after:inset-0 after:[background-image:var(--aurora)]",
            "after:[background-size:200%,_100%] after:animate-aurora after:[background-attachment:fixed]",
            "after:mix-blend-difference"
          )}
        ></div>
      </div>
      {showRadialGradient && (
        <div className="absolute inset-0 bg-white dark:bg-zinc-900 [mask-image:radial-gradient(ellipse_at_100%_0%,transparent_10%,black_70%)]" />
      )}
      <motion.div
        initial={{ opacity: 0.0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{
          delay: 0.3,
          duration: 0.8,
          ease: "easeInOut",
        }}
        className="relative flex flex-col gap-4 items-center justify-center z-10"
      >
        {children}
      </motion.div>
    </main>
  )
}
