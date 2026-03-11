import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/layout/Providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Rifaldi — Full Stack & Mobile Developer",
  description:
    "Portofolio pribadi Rifaldi: Full Stack Developer spesialis Laravel, Next.js, Flutter, dan AI Agents. Membangun produk digital yang berdampak.",
  keywords: ["portfolio", "rifaldi", "next.js", "laravel", "flutter", "developer"],
  openGraph: {
    title: "Rifaldi — Full Stack & Mobile Developer",
    description: "Portofolio pribadi Rifaldi.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
