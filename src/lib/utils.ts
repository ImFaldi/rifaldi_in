import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/** Gabungkan Tailwind class dengan aman (conditional + merge) */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
