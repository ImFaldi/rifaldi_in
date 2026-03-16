import type { Metadata } from "next";
import { SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description: "Hubungi Rifaldi untuk kolaborasi freelance, full-time, atau project digital.",
  alternates: { canonical: "/contact" },
  openGraph: {
    title: "Contact Rifaldi",
    description: "Kontak dan kolaborasi proyek digital bersama Rifaldi.",
    url: "/contact",
    siteName: SITE_NAME,
    type: "website",
    images: [{ url: "/images/profile.jpg?v=3" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact Rifaldi",
    description: "Hubungi Rifaldi untuk kerja sama proyek dan pengembangan produk digital.",
    images: ["/images/profile.jpg?v=3"],
  },
};

export default function ContactLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}

