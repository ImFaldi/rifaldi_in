import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Resume | Rifaldi",
  description: "Pengalaman kerja dan sertifikasi Rifaldi.",
  alternates: { canonical: "/resume" },
};

export default function ResumeLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
