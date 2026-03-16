import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Portfolio | Rifaldi",
  description: "Kumpulan proyek digital yang dikembangkan Rifaldi.",
  alternates: { canonical: "/portfolio" },
};

export default function PortfolioLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
