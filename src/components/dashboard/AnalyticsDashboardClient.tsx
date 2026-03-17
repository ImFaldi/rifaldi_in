"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { BarChart3, Gauge, Tags, ArrowLeft } from "lucide-react";

type ApiResponse = {
  range: string;
  ga4: {
    propertyId: string;
    summary: {
      activeUsers: number;
      sessions: number;
      pageViews: number;
      engagementRate: number;
    };
    topPages: Array<{ path: string; views: number }>;
    topEvents: Array<{ name: string; count: number }>;
  };
  gtm: {
    enabled: boolean;
    accountId?: string;
    containerId?: string;
    workspaceId?: string;
    tags: Array<{ name: string; type: string; paused: boolean }>;
    message?: string;
  };
  runtimeConfig: {
    gtmScriptId: string | null;
    gaMeasurementId: string | null;
  };
};

function formatNumber(value: number): string {
  return new Intl.NumberFormat("id-ID").format(value);
}

export function AnalyticsDashboardClient() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ApiResponse | null>(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/analytics/overview", { cache: "no-store" });
        const body = (await response.json().catch(() => null)) as ApiResponse | { message?: string } | null;

        if (!response.ok) {
          if (!mounted) return;
          setError(body && "message" in body ? body.message || "Gagal memuat analytics." : "Gagal memuat analytics.");
          setLoading(false);
          return;
        }

        if (!mounted) return;
        setData(body as ApiResponse);
      } catch {
        if (!mounted) return;
        setError("Terjadi kesalahan jaringan saat mengambil analytics.");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    void load();
    return () => {
      mounted = false;
    };
  }, []);

  const summaryCards = useMemo(() => {
    if (!data) return [];
    return [
      { label: "Active Users", value: formatNumber(data.ga4.summary.activeUsers) },
      { label: "Sessions", value: formatNumber(data.ga4.summary.sessions) },
      { label: "Page Views", value: formatNumber(data.ga4.summary.pageViews) },
      { label: "Engagement Rate", value: `${data.ga4.summary.engagementRate}%` },
    ];
  }, [data]);

  return (
    <main className="min-h-screen bg-bg-primary px-4 py-8 text-text-primary sm:px-6">
      <div className="mx-auto w-full max-w-6xl space-y-6">
        <header className="rounded-3xl border border-border bg-bg-card p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-text-secondary">Analytics Console</p>
              <h1 className="mt-2 text-2xl font-black sm:text-3xl">Google Analytics & Tag Manager</h1>
              <p className="mt-2 text-sm text-text-secondary">
                Monitoring internal tanpa buka dashboard GA/GTM terpisah.
              </p>
            </div>

            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-bg-primary px-4 py-2 text-sm font-semibold hover:bg-accent-soft"
            >
              <ArrowLeft size={15} /> Kembali ke Dashboard
            </Link>
          </div>
        </header>

        {loading ? (
          <section className="rounded-3xl border border-border bg-bg-card p-6 text-sm text-text-secondary">
            Memuat data analytics...
          </section>
        ) : error ? (
          <section className="rounded-3xl border border-red-500/35 bg-red-500/10 p-6 text-sm text-red-400">
            {error}
          </section>
        ) : data ? (
          <>
            <section className="rounded-3xl border border-border bg-bg-card p-6">
              <div className="mb-4 flex flex-wrap items-center gap-3">
                <Gauge size={16} className="text-accent" />
                <p className="text-sm font-semibold">Ringkasan GA4 ({data.range})</p>
                <span className="rounded-full border border-border px-2.5 py-1 text-xs text-text-secondary">
                  Property: {data.ga4.propertyId}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {summaryCards.map((item) => (
                  <article key={item.label} className="rounded-2xl border border-border bg-bg-primary p-4">
                    <p className="text-xs text-text-secondary">{item.label}</p>
                    <p className="mt-1 text-xl font-extrabold text-accent">{item.value}</p>
                  </article>
                ))}
              </div>
            </section>

            <section className="grid gap-6 lg:grid-cols-2">
              <article className="rounded-3xl border border-border bg-bg-card p-6">
                <div className="mb-4 inline-flex items-center gap-2 text-sm font-semibold">
                  <BarChart3 size={16} className="text-accent" />
                  Top Pages
                </div>
                <div className="space-y-2">
                  {data.ga4.topPages.length ? (
                    data.ga4.topPages.map((item) => (
                      <div
                        key={item.path}
                        className="flex items-center justify-between rounded-xl border border-border bg-bg-primary px-3 py-2"
                      >
                        <span className="max-w-[75%] truncate text-sm">{item.path}</span>
                        <span className="text-sm font-bold text-accent">{formatNumber(item.views)}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-text-secondary">Belum ada data halaman.</p>
                  )}
                </div>
              </article>

              <article className="rounded-3xl border border-border bg-bg-card p-6">
                <div className="mb-4 inline-flex items-center gap-2 text-sm font-semibold">
                  <BarChart3 size={16} className="text-accent" />
                  Top Events
                </div>
                <div className="space-y-2">
                  {data.ga4.topEvents.length ? (
                    data.ga4.topEvents.map((item) => (
                      <div
                        key={item.name}
                        className="flex items-center justify-between rounded-xl border border-border bg-bg-primary px-3 py-2"
                      >
                        <span className="text-sm">{item.name}</span>
                        <span className="text-sm font-bold text-accent">{formatNumber(item.count)}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-text-secondary">Belum ada data event.</p>
                  )}
                </div>
              </article>
            </section>

            <section className="rounded-3xl border border-border bg-bg-card p-6">
              <div className="mb-4 inline-flex items-center gap-2 text-sm font-semibold">
                <Tags size={16} className="text-accent" />
                Google Tag Manager
              </div>

              <div className="mb-4 grid gap-2 text-sm text-text-secondary sm:grid-cols-2">
                <p>Script GTM aktif: {data.runtimeConfig.gtmScriptId || "-"}</p>
                <p>GA Measurement ID: {data.runtimeConfig.gaMeasurementId || "-"}</p>
              </div>

              {data.gtm.enabled ? (
                <>
                  <p className="mb-3 text-xs text-text-secondary">
                    Account {data.gtm.accountId} • Container {data.gtm.containerId} • Workspace {data.gtm.workspaceId}
                  </p>
                  <div className="space-y-2">
                    {data.gtm.tags.length ? (
                      data.gtm.tags.map((tag) => (
                        <div
                          key={`${tag.name}-${tag.type}`}
                          className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-bg-primary px-3 py-2"
                        >
                          <div>
                            <p className="text-sm font-semibold">{tag.name}</p>
                            <p className="text-xs text-text-secondary">Type: {tag.type}</p>
                          </div>
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                              tag.paused
                                ? "border border-amber-500/40 bg-amber-500/10 text-amber-400"
                                : "border border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                            }`}
                          >
                            {tag.paused ? "Paused" : "Active"}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-text-secondary">Tidak ada tag ditemukan.</p>
                    )}
                  </div>
                </>
              ) : (
                <p className="text-sm text-text-secondary">
                  {data.gtm.message || "GTM API belum dikonfigurasi."}
                </p>
              )}
            </section>
          </>
        ) : null}
      </div>
    </main>
  );
}
