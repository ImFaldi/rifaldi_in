import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About | Rifaldi",
  description: "Profil Rifaldi, Full Stack & Mobile Developer dari Jakarta.",
  alternates: { canonical: "/about" },
};

export default function AboutLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
