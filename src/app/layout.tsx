import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import { Providers } from "@/components/layout/Providers";
import { SOCIAL } from "@/lib/social";
import { translations } from "@/lib/i18n";
import { SITE_NAME, SITE_URL } from "@/lib/site";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Rifaldi — Full Stack & Mobile Developer",
  description:
    "Portofolio pribadi Rifaldi: Full Stack Developer spesialis Laravel, Next.js, Flutter, dan AI Agents. Membangun produk digital yang berdampak.",
  keywords: ["portfolio", "rifaldi", "next.js", "laravel", "flutter", "developer"],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Rifaldi — Full Stack & Mobile Developer",
    description:
      "Portofolio pribadi Rifaldi: Full Stack Developer spesialis Laravel, Next.js, Flutter, dan AI Agents.",
    url: "/",
    siteName: SITE_NAME,
    locale: "id_ID",
    type: "website",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Rifaldi Portfolio Cover",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Rifaldi — Full Stack & Mobile Developer",
    description:
      "Membangun produk digital yang cepat, indah, dan berdampak dengan Laravel, Next.js, Flutter, dan AI.",
    images: ["/twitter-image"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

const sameAs = [SOCIAL.github, SOCIAL.linkedin].filter(
  (url) =>
    typeof url === "string" &&
    url.length > 0 &&
    url !== "https://github.com" &&
    url !== "https://linkedin.com"
);

const softwareSchemas = translations.id.projects.list.map((project, index) => ({
  "@type": "SoftwareSourceCode",
  "@id": `${SITE_URL}/#project-${index + 1}`,
  name: project.title,
  description: project.description,
  codeRepository: SOCIAL.github,
  programmingLanguage: ["TypeScript", "JavaScript", "Dart", "PHP"],
  creator: {
    "@id": `${SITE_URL}/#person`,
  },
  inLanguage: "id-ID",
}));

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      "@id": `${SITE_URL}/#person`,
      name: "Rifaldi",
      url: `${SITE_URL}/`,
      image: `${SITE_URL}/images/profile.jpg`,
      jobTitle: "Full Stack & Mobile Developer",
      knowsAbout: ["Laravel", "Next.js", "Flutter", "TypeScript", "AI Agents"],
      sameAs,
      ...(SOCIAL.email
        ? {
            contactPoint: {
              "@type": "ContactPoint",
              email: SOCIAL.email,
              contactType: "professional",
            },
          }
        : {}),
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: `${SITE_URL}/`,
      name: "Rifaldi Portfolio",
      publisher: {
        "@id": `${SITE_URL}/#person`,
      },
      inLanguage: "id-ID",
    },
    {
      "@type": "ProfilePage",
      "@id": `${SITE_URL}/#profile-page`,
      url: `${SITE_URL}/`,
      name: "Rifaldi — Full Stack & Mobile Developer",
      isPartOf: {
        "@id": `${SITE_URL}/#website`,
      },
      about: {
        "@id": `${SITE_URL}/#person`,
      },
      primaryImageOfPage: {
        "@type": "ImageObject",
        url: `${SITE_URL}/opengraph-image`,
      },
      hasPart: softwareSchemas.map((item) => ({ "@id": item["@id"] })),
      inLanguage: "id-ID",
    },
    ...softwareSchemas,
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        <Providers>{children}</Providers>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
