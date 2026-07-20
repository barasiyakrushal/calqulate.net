import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function parseNumber(value: string | number): number {
  if (typeof value === "number") return value
  const normalized = value.replace(/,/g, ".").replace(/\s/g, "")
  return parseFloat(normalized)
}
