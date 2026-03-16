import type { Metadata } from "next";
import { SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: "Blog",
  description: "Catatan teknis, insight, dan eksperimen pengembangan software dari Rifaldi.",
  alternates: { canonical: "/blog" },
  openGraph: {
    title: "Blog Rifaldi",
    description: "Artikel teknis tentang software engineering, web development, mobile development, dan AI.",
    url: "/blog",
    siteName: SITE_NAME,
    type: "website",
    images: [{ url: "/images/profile.jpg?v=3" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog Rifaldi",
    description: "Catatan teknis dan insight engineering dari Rifaldi.",
    images: ["/images/profile.jpg?v=3"],
  },
};

export default function BlogLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}

