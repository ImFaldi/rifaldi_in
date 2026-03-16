"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, ArrowUpRight, CheckCircle2, Github, Linkedin, Mail, MapPin, MessageCircle, Sparkles } from "lucide-react";
import { SOCIAL } from "@/lib/social";
import { SitePageNav } from "@/components/layout/SitePageNav";
import { useLanguage } from "@/contexts/LanguageContext";

export default function ContactPage() {
  const { lang } = useLanguage();
  const isEn = lang === "en";
  const [form, setForm] = useState({
    name: "",
    email: "",
    company: "",
    subject: "",
    message: "",
    website: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const contactAddress = process.env.NEXT_PUBLIC_CONTACT_ADDRESS ?? "Jakarta, Indonesia";
  const mapEmbedUrl =
    process.env.NEXT_PUBLIC_CONTACT_MAP_EMBED_URL ?? "https://www.google.com/maps?q=Jakarta+Indonesia&output=embed";
  const mapLink = process.env.NEXT_PUBLIC_CONTACT_MAP_LINK ?? "https://maps.google.com/?q=Jakarta+Indonesia";
  const whatsappNumber = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "").replace(/[^\d]/g, "");

  const canSubmit = useMemo(() => {
    return Boolean(form.name.trim() && form.email.trim() && form.message.trim());
  }, [form.email, form.message, form.name]);

  const ui = {
    label: isEn ? "Contact" : "Kontak",
    title: isEn ? "Build Something That Actually Moves People" : "Bangun Sesuatu yang Benar-Benar Menggerakkan Pengguna",
    subtitle: isEn
      ? "Open for freelance, full-time, and strategic product collaborations. If you care about quality and speed, we will get along."
      : "Terbuka untuk freelance, full-time, dan kolaborasi produk strategis. Kalau kamu peduli kualitas dan kecepatan, kita cocok.",
    quickStats1: isEn ? "Response Time" : "Waktu Respons",
    quickStats1Value: isEn ? "< 24 Hours" : "< 24 Jam",
    quickStats2: isEn ? "Collaboration Mode" : "Mode Kolaborasi",
    quickStats2Value: isEn ? "Remote / Hybrid" : "Remote / Hybrid",
    quickStats3: isEn ? "Primary Focus" : "Fokus Utama",
    quickStats3Value: isEn ? "Web, Mobile, AI" : "Web, Mobile, AI",
    email: isEn ? "Email" : "Email",
    linkedin: "LinkedIn",
    github: "GitHub",
    discuss: isEn ? "Discuss Your Project" : "Diskusi Proyek Kamu",
    backHome: isEn ? "Back Home" : "Kembali ke Home",
    profileTitle: isEn ? "Collaboration Snapshot" : "Snapshot Kolaborasi",
    profileDesc: isEn
      ? "I enjoy projects with clear goals, tight iterations, and measurable impact."
      : "Saya suka project dengan tujuan yang jelas, iterasi cepat, dan impact yang terukur.",
    profileBullet1: isEn ? "Product-minded engineering" : "Engineering berorientasi produk",
    profileBullet2: isEn ? "Clean communication cadence" : "Ritme komunikasi yang rapi",
    profileBullet3: isEn ? "Execution-first mindset" : "Mindset execution-first",
    formTitle: isEn ? "Send Me a Message" : "Kirim Pesan",
    formDesc: isEn
      ? "Tell me your goals, timeline, and expected outcomes. I will reply with the most efficient next step."
      : "Ceritakan tujuan, timeline, dan hasil yang kamu harapkan. Saya akan balas dengan langkah paling efisien.",
    inputName: isEn ? "Full Name" : "Nama Lengkap",
    inputEmail: "Email",
    inputCompany: isEn ? "Company (Optional)" : "Perusahaan (Opsional)",
    inputSubject: isEn ? "Subject (Optional)" : "Subjek (Opsional)",
    inputMessage: isEn ? "Project Brief" : "Brief Proyek",
    inputMessagePlaceholder: isEn
      ? "Example: Landing page redesign + CMS integration in 2 weeks."
      : "Contoh: Redesign landing page + integrasi CMS dalam 2 minggu.",
    submitIdle: isEn ? "Send Message" : "Kirim Pesan",
    submitLoading: isEn ? "Sending..." : "Mengirim...",
    successMessage: isEn ? "Message sent. I will get back to you soon." : "Pesan terkirim. Saya akan segera membalas.",
    errorMessage: isEn ? "Failed to send message. Please try again." : "Gagal mengirim pesan. Coba lagi sebentar.",
    locationTitle: isEn ? "Office & Location" : "Alamat & Lokasi",
    locationDesc: isEn
      ? "Available for local meetings by appointment and remote collaboration worldwide."
      : "Tersedia untuk meeting lokal berdasarkan janji dan kolaborasi remote dari mana saja.",
    openMaps: isEn ? "Open in Google Maps" : "Buka di Google Maps",
    addressLabel: isEn ? "Address" : "Alamat",
    toastSuccessTitle: isEn ? "Message Delivered" : "Pesan Terkirim",
    toastErrorTitle: isEn ? "Delivery Failed" : "Pengiriman Gagal",
    whatsappFallback: isEn ? "Use WhatsApp fallback" : "Gunakan fallback WhatsApp",
    whatsappOpen: isEn ? "Open WhatsApp" : "Buka WhatsApp",
  };

  useEffect(() => {
    if (!submitStatus) return;

    const timer = window.setTimeout(() => {
      setSubmitStatus(null);
    }, 5000);

    return () => window.clearTimeout(timer);
  }, [submitStatus]);

  const whatsappUrl = useMemo(() => {
    if (!whatsappNumber) return null;

    const lines = [
      isEn ? "Hello, I want to discuss a project." : "Halo, saya ingin diskusi project.",
      `${isEn ? "Name" : "Nama"}: ${form.name || "-"}`,
      `${isEn ? "Email" : "Email"}: ${form.email || "-"}`,
      `${isEn ? "Company" : "Perusahaan"}: ${form.company || "-"}`,
      `${isEn ? "Subject" : "Subjek"}: ${form.subject || "-"}`,
      "",
      `${isEn ? "Message" : "Pesan"}:`,
      form.message || "-",
    ];

    return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(lines.join("\n"))}`;
  }, [form.company, form.email, form.message, form.name, form.subject, isEn, whatsappNumber]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitStatus(null);

    if (!canSubmit || isSubmitting) return;

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = (await response.json()) as { message?: string };

      if (!response.ok) {
        setSubmitStatus({ type: "error", message: data.message || ui.errorMessage });
        return;
      }

      setForm({ name: "", email: "", company: "", subject: "", message: "", website: "" });
      setSubmitStatus({ type: "success", message: ui.successMessage });
    } catch {
      setSubmitStatus({ type: "error", message: ui.errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="ambient-grid relative min-h-screen overflow-hidden bg-bg-primary px-4 pb-20 pt-32 text-text-primary sm:px-6">
      <div className="pointer-events-none absolute -left-32 top-24 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 top-60 h-80 w-80 rounded-full bg-cyan-500/10 blur-3xl" />
      <div className="noise-overlay pointer-events-none absolute inset-0" />
      <AnimatePresence>
        {submitStatus && (
          <motion.div
            initial={{ opacity: 0, y: -16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="fixed right-4 top-24 z-[60] w-[min(92vw,420px)]"
          >
            <div
              className={
                submitStatus.type === "success"
                  ? "rounded-2xl border border-emerald-400/35 bg-emerald-500/15 p-4 shadow-[0_16px_40px_-24px_rgba(16,185,129,0.85)] backdrop-blur-xl"
                  : "rounded-2xl border border-rose-400/35 bg-rose-500/15 p-4 shadow-[0_16px_40px_-24px_rgba(244,63,94,0.85)] backdrop-blur-xl"
              }
            >
              <div className="flex items-start gap-3">
                <span
                  className={
                    submitStatus.type === "success"
                      ? "mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-400/20 text-emerald-300"
                      : "mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-rose-400/20 text-rose-300"
                  }
                >
                  {submitStatus.type === "success" ? <CheckCircle2 size={17} /> : <AlertCircle size={17} />}
                </span>

                <div className="flex-1">
                  <p className="text-sm font-bold text-text-primary">
                    {submitStatus.type === "success" ? ui.toastSuccessTitle : ui.toastErrorTitle}
                  </p>
                  <p className="mt-0.5 text-sm text-text-secondary">{submitStatus.message}</p>

                  {submitStatus.type === "error" && whatsappUrl && (
                    <div className="mt-2.5 flex items-center gap-2">
                      <span className="text-xs font-medium text-text-secondary">{ui.whatsappFallback}</span>
                      <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 rounded-lg border border-border/70 bg-bg-card/65 px-2.5 py-1.5 text-xs font-semibold text-text-primary transition-colors hover:bg-accent-soft"
                      >
                        <MessageCircle size={13} /> {ui.whatsappOpen}
                      </a>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setSubmitStatus(null)}
                  className="rounded-md px-1.5 py-1 text-xs text-text-secondary transition-colors hover:bg-bg-card/70 hover:text-text-primary"
                  aria-label="Close notification"
                >
                  x
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <SitePageNav />
      <div className="relative z-10 mx-auto max-w-7xl">
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="rounded-3xl border border-border/80 bg-bg-card/60 p-6 shadow-[0_20px_60px_-36px_rgba(0,0,0,0.65)] backdrop-blur-xl sm:p-8"
        >
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)] lg:gap-8">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-accent/35 bg-accent/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">
                <Sparkles size={12} /> {ui.label}
              </p>
              <h1 className="mt-4 max-w-3xl text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">{ui.title}</h1>
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-text-secondary sm:text-lg">{ui.subtitle}</p>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-border/70 bg-bg-card/55 p-3.5">
                  <p className="text-[11px] uppercase tracking-[0.14em] text-text-secondary">{ui.quickStats1}</p>
                  <p className="mt-1 text-sm font-bold text-text-primary">{ui.quickStats1Value}</p>
                </div>
                <div className="rounded-xl border border-border/70 bg-bg-card/55 p-3.5">
                  <p className="text-[11px] uppercase tracking-[0.14em] text-text-secondary">{ui.quickStats2}</p>
                  <p className="mt-1 text-sm font-bold text-text-primary">{ui.quickStats2Value}</p>
                </div>
                <div className="rounded-xl border border-border/70 bg-bg-card/55 p-3.5">
                  <p className="text-[11px] uppercase tracking-[0.14em] text-text-secondary">{ui.quickStats3}</p>
                  <p className="mt-1 text-sm font-bold text-text-primary">{ui.quickStats3Value}</p>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-2.5">
                <a
                  href={SOCIAL.mailto}
                  className="inline-flex items-center gap-2 rounded-xl border border-border bg-bg-card/60 px-4 py-2.5 text-sm font-semibold text-text-primary transition-colors hover:border-accent/30 hover:bg-accent-soft"
                >
                  <Mail size={15} /> {ui.email}: {SOCIAL.email || "hello@domain.com"}
                </a>
                <a
                  href={SOCIAL.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border border-border bg-bg-card/60 px-4 py-2.5 text-sm font-semibold text-text-primary transition-colors hover:border-accent/30 hover:bg-accent-soft"
                >
                  <Linkedin size={15} /> {ui.linkedin}
                </a>
                <a
                  href={SOCIAL.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border border-border bg-bg-card/60 px-4 py-2.5 text-sm font-semibold text-text-primary transition-colors hover:border-accent/30 hover:bg-accent-soft"
                >
                  <Github size={15} /> {ui.github}
                </a>
              </div>

              <div className="mt-7 flex flex-wrap items-center gap-3">
                <a
                  href={SOCIAL.mailto}
                  className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-white shadow-[0_10px_30px_-14px_var(--accent)] transition-transform duration-300 hover:-translate-y-0.5"
                >
                  <MessageCircle size={15} /> {ui.discuss}
                </a>
                <Link
                  href="/"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-bg-card/55 px-4 py-2.5 text-sm font-semibold text-text-primary transition-colors hover:bg-accent-soft"
                >
                  {ui.backHome} <ArrowUpRight size={14} />
                </Link>
              </div>
            </div>

            <aside className="glass-card relative overflow-hidden rounded-2xl border border-border/90 p-5 sm:p-6">
              <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-accent/12 blur-3xl" />
              <p className="relative text-xs font-semibold uppercase tracking-[0.13em] text-accent">{ui.profileTitle}</p>
              <p className="relative mt-3 text-sm leading-relaxed text-text-secondary">{ui.profileDesc}</p>

              <div className="relative mt-5 space-y-2">
                {[ui.profileBullet1, ui.profileBullet2, ui.profileBullet3].map((item) => (
                  <div key={item} className="flex items-start gap-2 rounded-xl border border-border/80 bg-bg-card/55 px-3 py-2.5">
                    <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-accent" />
                    <p className="text-sm text-text-primary">{item}</p>
                  </div>
                ))}
              </div>

              <div className="relative mt-5 rounded-xl border border-border/80 bg-bg-card/55 p-3">
                <p className="text-[11px] uppercase tracking-[0.12em] text-text-secondary">Email</p>
                <p className="mt-1 break-all text-sm font-semibold text-text-primary">{SOCIAL.email || "hello@domain.com"}</p>
              </div>
            </aside>
          </div>
        </motion.section>

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <motion.section
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className="rounded-2xl border border-border/80 bg-bg-card/60 p-5 shadow-[0_18px_50px_-34px_rgba(0,0,0,0.8)] backdrop-blur-xl sm:p-6"
          >
            <h2 className="text-2xl font-extrabold tracking-tight text-text-primary">{ui.formTitle}</h2>
            <p className="mt-2 text-sm leading-relaxed text-text-secondary">{ui.formDesc}</p>

            <form className="mt-5 space-y-3" onSubmit={handleSubmit}>
              <input
                type="text"
                name="website"
                value={form.website}
                onChange={(event) => setForm((prev) => ({ ...prev, website: event.target.value }))}
                className="hidden"
                tabIndex={-1}
                autoComplete="off"
              />

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-text-secondary">{ui.inputName}</span>
                  <input
                    required
                    type="text"
                    value={form.name}
                    onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                    className="w-full rounded-xl border border-border/80 bg-bg-card/70 px-3 py-2.5 text-sm text-text-primary outline-none transition-colors focus:border-accent/45"
                  />
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-text-secondary">{ui.inputEmail}</span>
                  <input
                    required
                    type="email"
                    value={form.email}
                    onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
                    className="w-full rounded-xl border border-border/80 bg-bg-card/70 px-3 py-2.5 text-sm text-text-primary outline-none transition-colors focus:border-accent/45"
                  />
                </label>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-text-secondary">{ui.inputCompany}</span>
                  <input
                    type="text"
                    value={form.company}
                    onChange={(event) => setForm((prev) => ({ ...prev, company: event.target.value }))}
                    className="w-full rounded-xl border border-border/80 bg-bg-card/70 px-3 py-2.5 text-sm text-text-primary outline-none transition-colors focus:border-accent/45"
                  />
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-text-secondary">{ui.inputSubject}</span>
                  <input
                    type="text"
                    value={form.subject}
                    onChange={(event) => setForm((prev) => ({ ...prev, subject: event.target.value }))}
                    className="w-full rounded-xl border border-border/80 bg-bg-card/70 px-3 py-2.5 text-sm text-text-primary outline-none transition-colors focus:border-accent/45"
                  />
                </label>
              </div>

              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-text-secondary">{ui.inputMessage}</span>
                <textarea
                  required
                  rows={5}
                  value={form.message}
                  onChange={(event) => setForm((prev) => ({ ...prev, message: event.target.value }))}
                  placeholder={ui.inputMessagePlaceholder}
                  className="w-full resize-y rounded-xl border border-border/80 bg-bg-card/70 px-3 py-2.5 text-sm text-text-primary outline-none transition-colors focus:border-accent/45"
                />
              </label>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <button
                  type="submit"
                  disabled={isSubmitting || !canSubmit}
                  className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-white shadow-[0_10px_30px_-14px_var(--accent)] transition-all hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Mail size={15} /> {isSubmitting ? ui.submitLoading : ui.submitIdle}
                </button>
              </div>
            </form>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.45, ease: "easeOut", delay: 0.05 }}
            className="rounded-2xl border border-border/80 bg-bg-card/60 p-5 shadow-[0_18px_50px_-34px_rgba(0,0,0,0.8)] backdrop-blur-xl sm:p-6"
          >
            <h2 className="text-2xl font-extrabold tracking-tight text-text-primary">{ui.locationTitle}</h2>
            <p className="mt-2 text-sm leading-relaxed text-text-secondary">{ui.locationDesc}</p>

            <div className="mt-4 rounded-xl border border-border/80 bg-bg-card/55 p-3.5">
              <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-text-secondary">
                <MapPin size={14} /> {ui.addressLabel}
              </p>
              <p className="mt-1.5 text-sm font-semibold leading-relaxed text-text-primary">{contactAddress}</p>
              <a
                href={mapLink}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-accent transition-opacity hover:opacity-85"
              >
                {ui.openMaps} <ArrowUpRight size={14} />
              </a>
            </div>

            <div className="mt-4 overflow-hidden rounded-xl border border-border/80">
              <iframe
                src={mapEmbedUrl}
                title="Google Maps"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="h-[320px] w-full"
              />
            </div>
          </motion.section>
        </div>
      </div>
    </main>
  );
}
