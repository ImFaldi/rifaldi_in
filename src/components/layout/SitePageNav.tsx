"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Menu, X } from "lucide-react";
import { LanguageToggle } from "@/components/ui/LanguageToggle";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useLanguage } from "@/contexts/LanguageContext";
import { trackEvent } from "@/lib/analytics";

export function SitePageNav() {
  const pathname = usePathname();
  const { lang, t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const NAV_LINKS = t.nav.links;

  const ui = {
    navTitle: lang === "en" ? "Navigation" : "Navigasi",
    navSubtitle: lang === "en" ? "Explore Pages" : "Jelajahi Halaman",
    openMenu: lang === "en" ? "Open menu" : "Buka menu",
    closeMenu: lang === "en" ? "Close menu" : "Tutup menu",
    closeOverlay: lang === "en" ? "Close menu overlay" : "Tutup overlay menu",
  };

  useEffect(() => {
    if (!mobileMenuOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileMenuOpen]);

  return (
    <nav className="fixed inset-x-0 top-4 z-50 px-4 sm:px-6">
      <div className="premium-nav-shell mx-auto grid w-full max-w-7xl grid-cols-[auto_1fr_auto] items-center rounded-2xl border border-border bg-bg-card/80 px-4 py-2.5 backdrop-blur-xl sm:px-5 sm:py-3">
        <Link
          href="/"
          onClick={() =>
            trackEvent("navigation_click", {
              nav_label: "brand_logo",
              nav_target: "/",
              location: "top_nav",
            })
          }
          className="font-bold text-lg tracking-tight text-text-primary"
        >
          rifaldi<span className="text-accent">.</span>
        </Link>

        <div className="mx-auto hidden items-center gap-2 md:flex">
          {NAV_LINKS.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() =>
                  trackEvent("navigation_click", {
                    nav_label: item.label,
                    nav_target: item.href,
                    location: "top_nav",
                  })
                }
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
          <button
            type="button"
            aria-label={mobileMenuOpen ? ui.closeMenu : ui.openMenu}
            aria-expanded={mobileMenuOpen}
            onClick={() => {
              const next = !mobileMenuOpen;
              setMobileMenuOpen(next);
              trackEvent("ui_interaction", {
                interaction_name: "mobile_menu_toggle",
                state: next ? "open" : "close",
              });
            }}
            className="premium-menu-trigger inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-bg-card/70 text-text-primary transition-colors hover:bg-accent-soft md:hidden"
          >
            {mobileMenuOpen ? <X size={17} /> : <Menu size={17} />}
          </button>
        </div>
      </div>

      <div
        className={`premium-mobile-overlay fixed inset-0 z-40 transition-all duration-300 md:hidden ${
          mobileMenuOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
      >
        <button
          type="button"
          aria-label={ui.closeOverlay}
          onClick={() => {
            setMobileMenuOpen(false);
            trackEvent("ui_interaction", {
              interaction_name: "mobile_menu_overlay_close",
            });
          }}
          className="absolute inset-0 h-full w-full bg-black/45"
        />

        <div
          className={`premium-mobile-menu absolute inset-x-4 top-20 overflow-hidden rounded-3xl border border-border/90 bg-bg-card/92 p-4 backdrop-blur-2xl transition-all duration-300 ${
            mobileMenuOpen ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
          }`}
        >
          <div className="relative flex items-center justify-between rounded-2xl border border-border/80 bg-bg-card/65 px-4 py-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-text-secondary">{ui.navTitle}</p>
              <p className="mt-0.5 text-sm font-bold text-text-primary">{ui.navSubtitle}</p>
            </div>
          </div>

          <div className="relative mt-3 space-y-2">
            {NAV_LINKS.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={`sheet-${item.href}`}
                  href={item.href}
                  onClick={() => {
                    setMobileMenuOpen(false);
                    trackEvent("navigation_click", {
                      nav_label: item.label,
                      nav_target: item.href,
                      location: "mobile_nav",
                    });
                  }}
                  className={`group flex items-center justify-between rounded-2xl border px-3.5 py-3 text-sm font-semibold transition-all duration-200 ${
                    active
                      ? "border-accent/30 bg-accent-soft text-text-primary"
                      : "border-border bg-bg-card/60 text-text-secondary hover:border-accent/20 hover:text-text-primary"
                  }`}
                >
                  <span>{item.label}</span>
                  <ChevronRight
                    size={15}
                    className={`transition-transform duration-200 ${
                      active ? "text-accent" : "text-text-secondary group-hover:translate-x-0.5"
                    }`}
                  />
                </Link>
              );
            })}
          </div>

        </div>
      </div>
    </nav>
  );
}
