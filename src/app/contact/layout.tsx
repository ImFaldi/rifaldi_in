import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact | Rifaldi",
  description: "Hubungi Rifaldi untuk kolaborasi freelance, full-time, atau project digital.",
  alternates: { canonical: "/contact" },
};

export default function ContactLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
