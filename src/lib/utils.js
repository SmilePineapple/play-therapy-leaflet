import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// This function combines and deduplicates Tailwind CSS classes.
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
