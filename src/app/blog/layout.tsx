import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog | Rifaldi",
  description: "Catatan teknis, insight, dan eksperimen pengembangan software dari Rifaldi.",
  alternates: { canonical: "/blog" },
};

export default function BlogLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
