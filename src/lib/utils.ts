import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Human-readable byte size, e.g. "1.4 MB". */
export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const DATE_STYLES = {
  /** "Aug 17" */
  short: { month: "short", day: "numeric" },
  /** "Aug 17, 2026" */
  medium: { month: "short", day: "numeric", year: "numeric" },
  /** "August 17, 2026" */
  long: { month: "long", day: "numeric", year: "numeric" },
} satisfies Record<string, Intl.DateTimeFormatOptions>

export type DateStyle = keyof typeof DATE_STYLES

/** Formats in UTC so a stored timestamp shows the same day in every timezone. */
export function formatDate(date: Date | string, style: DateStyle = "short") {
  const value = typeof date === "string" ? new Date(date) : date
  return value.toLocaleDateString("en-US", {
    ...DATE_STYLES[style],
    timeZone: "UTC",
  })
}
