import type { Metadata } from "next";
import { SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: "Resume",
  description: "Pengalaman kerja dan sertifikasi Rifaldi.",
  alternates: { canonical: "/resume" },
  openGraph: {
    title: "Resume Rifaldi",
    description: "Ringkasan pengalaman profesional, pendidikan, dan sertifikasi Rifaldi.",
    url: "/resume",
    siteName: SITE_NAME,
    type: "profile",
    images: [{ url: "/opengraph-image" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Resume Rifaldi",
    description: "Lihat pengalaman kerja dan rekam jejak profesional Rifaldi.",
    images: ["/twitter-image"],
  },
};

export default function ResumeLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
