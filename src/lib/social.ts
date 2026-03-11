// ─── Social Media Links ───────────────────────────────────────────────────────
// Nilai diambil dari .env.local (NEXT_PUBLIC_ agar bisa diakses di client side)

export const SOCIAL = {
  github:   process.env.NEXT_PUBLIC_SOCIAL_GITHUB   ?? "https://github.com",
  linkedin: process.env.NEXT_PUBLIC_SOCIAL_LINKEDIN ?? "https://linkedin.com",
  email:    process.env.NEXT_PUBLIC_SOCIAL_EMAIL    ?? "",

  /** mailto: siap pakai */
  mailto: `mailto:${process.env.NEXT_PUBLIC_SOCIAL_EMAIL ?? ""}`,
} as const;
