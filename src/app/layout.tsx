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
  applicationName: SITE_NAME,
  title: {
    default: "Rifaldi - Full Stack and Mobile Developer",
    template: "%s | Rifaldi",
  },
  description:
    "Portofolio Rifaldi, Full Stack and Mobile Developer. Spesialis Laravel, Next.js, Flutter, dan AI agents untuk membangun produk digital yang cepat dan berdampak.",
  keywords: [
    "rifaldi",
    "portfolio developer",
    "full stack developer indonesia",
    "mobile developer flutter",
    "next.js developer",
    "laravel developer",
    "ai agents",
  ],
  category: "technology",
  authors: [{ name: "Rifaldi", url: SITE_URL }],
  creator: "Rifaldi",
  publisher: SITE_NAME,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Rifaldi - Full Stack and Mobile Developer",
    description:
      "Portofolio Rifaldi: Full Stack and Mobile Developer dengan fokus Laravel, Next.js, Flutter, dan AI agents.",
    url: "/",
    siteName: SITE_NAME,
    locale: "id_ID",
    type: "website",
    images: [
      {
        url: "/images/profile.jpg?v=3",
        alt: "Rifaldi Portfolio Cover",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@rifaldi",
    creator: "@rifaldi",
    title: "Rifaldi - Full Stack and Mobile Developer",
    description:
      "Membangun produk digital yang cepat dan berdampak dengan Laravel, Next.js, Flutter, dan AI.",
    images: [
      {
        url: "/images/profile.jpg?v=3",
        alt: "Rifaldi Portfolio Cover",
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
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
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: SITE_NAME,
      url: `${SITE_URL}/`,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/images/profile.jpg?v=3`,
      },
      sameAs,
    },
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
        "@id": `${SITE_URL}/#organization`,
      },
      potentialAction: {
        "@type": "SearchAction",
        target: `${SITE_URL}/blog?q={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
      inLanguage: "id-ID",
    },
    {
      "@type": "ProfilePage",
      "@id": `${SITE_URL}/#profile-page`,
      url: `${SITE_URL}/`,
      name: "Rifaldi â€” Full Stack & Mobile Developer",
      isPartOf: {
        "@id": `${SITE_URL}/#website`,
      },
      about: {
        "@id": `${SITE_URL}/#person`,
      },
      primaryImageOfPage: {
        "@type": "ImageObject",
        url: `${SITE_URL}/images/profile.jpg?v=3`,
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

