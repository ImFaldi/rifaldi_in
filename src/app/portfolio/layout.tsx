import type { Metadata } from "next";
import { SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: "Portfolio",
  description: "Kumpulan proyek web, mobile, dan eksperimen AI yang dikembangkan oleh Rifaldi.",
  alternates: { canonical: "/portfolio" },
  openGraph: {
    title: "Portfolio Rifaldi",
    description: "Studi kasus proyek digital, teknologi yang digunakan, dan impact yang dihasilkan.",
    url: "/portfolio",
    siteName: SITE_NAME,
    type: "website",
    images: [{ url: "/opengraph-image" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Portfolio Rifaldi",
    description: "Kumpulan proyek digital Rifaldi: web, mobile, dan AI.",
    images: ["/twitter-image"],
  },
};

export default function PortfolioLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
