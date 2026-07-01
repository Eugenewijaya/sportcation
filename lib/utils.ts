import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateId(prefix: string = ""): string {
  // ponytail: native random generator, 1 line
  const randomPart = crypto.randomUUID().replace(/-/g, "").slice(0, 16)
  return prefix ? `${prefix}-${randomPart}` : randomPart
}
