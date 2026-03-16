import type { Metadata } from "next";
import { SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description: "Profil Rifaldi, Full Stack and Mobile Developer dari Jakarta, Indonesia.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "About Rifaldi",
    description: "Profil, spesialisasi teknologi, dan pendekatan kerja Rifaldi.",
    url: "/about",
    siteName: SITE_NAME,
    type: "profile",
    images: [{ url: "/images/profile.jpg?v=3" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "About Rifaldi",
    description: "Profil Rifaldi sebagai Full Stack and Mobile Developer.",
    images: ["/images/profile.jpg?v=3"],
  },
};

export default function AboutLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}

