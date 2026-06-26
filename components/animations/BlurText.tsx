"use client"

import { useRef } from "react"
import { motion, useInView, Variants } from "framer-motion"
import { cn } from "@/lib/utils"

interface BlurTextProps {
  text: string
  className?: string
  delay?: number
  duration?: number
}

export function BlurText({ text, className, delay = 0, duration = 0.5 }: BlurTextProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-10% 0px" })
  const words = text.split(" ")

  const container: Variants = {
    hidden: { opacity: 0 },
    visible: (i: number = 1) => ({
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: delay * i },
    }),
  }

  const child: Variants = {
    visible: {
      opacity: 1,
      filter: "blur(0px)",
      y: 0,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 100,
        duration: duration,
      },
    },
    hidden: {
      opacity: 0,
      filter: "blur(10px)",
      y: 20,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 100,
      },
    },
  }

  return (
    <motion.h1
      ref={ref}
      className={cn("flex flex-wrap gap-x-2 gap-y-1", className)}
      variants={container}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
    >
      {words.map((word, index) => (
        <motion.span variants={child} key={index} className="inline-block">
          {word}
        </motion.span>
      ))}
    </motion.h1>
  )
}
