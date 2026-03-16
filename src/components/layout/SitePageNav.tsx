"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LanguageToggle } from "@/components/ui/LanguageToggle";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Resume", href: "/resume" },
  { label: "Portfolio", href: "/portfolio" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" },
];

export function SitePageNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 top-4 z-50 px-4 sm:px-6">
      <div className="premium-nav-shell mx-auto grid w-full max-w-7xl grid-cols-[auto_1fr_auto] items-center rounded-2xl border border-border bg-bg-card/80 px-4 py-2.5 backdrop-blur-xl sm:px-5 sm:py-3">
        <Link href="/" className="font-bold text-lg tracking-tight text-text-primary">
          rifaldi<span className="text-accent">.</span>
        </Link>

        <div className="mx-auto hidden items-center gap-2 md:flex">
          {NAV_LINKS.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors ${
                  active ? "bg-accent-soft text-text-primary" : "text-text-secondary hover:text-text-primary"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-2 justify-self-end">
          <LanguageToggle compact />
          <ThemeToggle compact />
        </div>
      </div>

      <div className="mx-auto mt-2 max-w-7xl overflow-x-auto md:hidden">
        <div className="flex min-w-max items-center gap-1.5 rounded-xl border border-border bg-bg-card/70 p-1 backdrop-blur-xl">
          {NAV_LINKS.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={`mobile-${item.href}`}
                href={item.href}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                  active ? "bg-accent-soft text-text-primary" : "text-text-secondary hover:text-text-primary"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
