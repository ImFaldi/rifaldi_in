<div align="center">

# ✦ rifaldi.in

**Website Portfolio Pribadi — Futuristik & Full Animasi**

[![Next.js](https://img.shields.io/badge/Next.js-16.1.6-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.x-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-12.x-EF2D5E?style=flat-square&logo=framer&logoColor=white)](https://www.framer.com/motion)
[![Vercel](https://img.shields.io/badge/Deployed_on-Vercel-000?style=flat-square&logo=vercel)](https://rifaldiin.vercel.app)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

<br />

**→ [rifaldiin.vercel.app](https://rifaldiin.vercel.app)**

</div>

---

## ✨ Fitur

| Fitur | Deskripsi |
|---|---|
| 🌙 **Dark / Light Mode** | Pergantian tema mulus dengan `next-themes` dan design token berbasis CSS variables |
| 🌐 **Bilingual (ID / EN)** | Dukungan ganti bahasa penuh dengan React Context + persistensi `localStorage` |
| 🖱️ **Custom Cursor** | Cursor magnetik dengan efek morph saat hover menggunakan spring physics |
| 🧲 **Magnetic Buttons** | Tombol CTA dengan efek tarikan magnetik berbasis spring |
| 🃏 **3D Project Cards** | Kartu proyek dengan tilt `useMotionValue` + dynamic glare highlight |
| 📜 **Smooth Scroll** | Scroll sangat halus menggunakan Lenis |
| 🎭 **Scroll Animations** | Animasi masuk bertahap berbasis `whileInView` di berbagai section |
| ♾️ **Infinite Marquee** | Ticker tech stack looping menggunakan Framer Motion |
| 📊 **Animated Counters** | Counter angka berbasis spring yang aktif saat elemen terlihat |
| 📱 **Fully Responsive** | Mobile-first dan adaptif di berbagai ukuran layar |

---

## 🛠️ Teknologi

```
Framework       Next.js 16.1.6  (App Router, TypeScript, Turbopack)
Styling         Tailwind CSS v4  (CSS-first config, @theme inline)
Animation       Framer Motion 12
Icons           Lucide React
Theming         next-themes
Smooth Scroll   Lenis 1.3
i18n            React Context   (custom, no external library)
Utilities       clsx + tailwind-merge
Deploy          Vercel
```

---

## 📁 Struktur Proyek

```
src/
├── app/
│   ├── globals.css          # Design tokens, glassmorphism, CSS vars (light/dark)
│   ├── layout.tsx           # Root layout + SEO metadata
│   └── page.tsx             # Main one-page portfolio
│
├── components/
│   ├── layout/
│   │   └── Providers.tsx    # ThemeProvider + LanguageProvider + Lenis init
│   ├── sections/
│   │   ├── ExperienceSection.tsx   # Career timeline
│   │   └── CertSection.tsx         # Certifications grid
│   └── ui/
│       ├── CustomCursor.tsx        # Magnetic spring cursor
│       ├── LanguageToggle.tsx      # ID / EN pill toggle
│       ├── MagneticButton.tsx      # Physics-based CTA button
│       ├── ProjectCard.tsx         # 3D tilt card with glare
│       ├── StatsGrid.tsx           # Animated number counters
│       ├── TechMarquee.tsx         # Infinite scrolling ticker
│       └── ThemeToggle.tsx         # Sun ↔ Moon animation
│
├── contexts/
│   └── LanguageContext.tsx  # i18n context + useLanguage() hook
│
└── lib/
    ├── i18n.ts              # Full ID/EN translation dictionary
    └── utils.ts             # cn() helper (clsx + tailwind-merge)
```

---

## 🚀 Memulai

### Prasyarat

- **Node.js** ≥ 18.x
- **npm** ≥ 9.x

### Instalasi

```bash
# Clone repository
git clone https://github.com/ImFaldi/rifaldi_in.git
cd rifaldi_in

# Install dependency
npm install

# Jalankan server development
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

### Script Tersedia

```bash
npm run dev               # Menjalankan dev server
npm run build             # Build production
npm run start             # Menjalankan hasil build production
npm run lint              # Menjalankan ESLint
npm run migrate:supabase  # Migrasi/seed data ke Supabase
```

---

## 🌐 Deployment

Project ini dapat dideploy ke **Vercel** via Vercel CLI.

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy ke production
vercel --yes --prod
```

Live URL: **[https://rifaldiin.vercel.app](https://rifaldiin.vercel.app)**

---

## 🎨 Design System

Sistem warna dibangun dengan CSS custom properties dan otomatis mendukung dark/light mode via class `.dark` (`next-themes`).

```css
/* Design tokens utama */
--bg-primary       /* Page background */
--bg-card          /* Card / glass surface */
--border-color     /* Border color */
--text-primary     /* Headings */
--text-secondary   /* Body text */
--accent           /* Primary brand color (violet) */
--accent-soft      /* Accent with low opacity */
```

Semua token dipetakan ke shortcut Tailwind melalui `@theme inline`:
```
bg-bg-primary  ·  text-text-primary  ·  text-accent  ·  border-border  ·  bg-accent-soft
```

---

## 🌍 Menambah Bahasa Baru

1. Tambahkan locale baru ke type `Lang` di [`src/lib/i18n.ts`](src/lib/i18n.ts):
   ```ts
   export type Lang = "id" | "en" | "jp"; // add here
   ```
2. Tambahkan objek translasi lengkap di `translations.jp`.
3. Tambahkan locale baru di array `LANGS` pada [`src/components/ui/LanguageToggle.tsx`](src/components/ui/LanguageToggle.tsx).

---

## 🗄️ Setup CRUD Supabase

Project ini sekarang sudah support CRUD Supabase untuk 3 resource utama:

- `experiences`
- `certifications`
- `projects`

### Struktur Folder Supabase

```txt
supabase/
├── schema.sql
└── seeds/
   ├── experiences.json
   ├── certifications.json
   └── projects.json

scripts/
└── migrate-supabase.mjs
```

### 1) Set Environment Variables

Isi file `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
SUPABASE_SERVICE_ROLE_KEY=YOUR_SUPABASE_SERVICE_ROLE_KEY
```

Catatan:

- Gunakan URL project Supabase, bukan URL dashboard.
- `SUPABASE_SERVICE_ROLE_KEY` hanya dipakai di server (API route + script migrasi).

### 2) Jalankan SQL Schema

Copy isi file `supabase/schema.sql` ke Supabase SQL Editor, lalu jalankan.

### 3) Seed / Migrasi Data Awal

Data seed disimpan di:

- `supabase/seeds/experiences.json`
- `supabase/seeds/certifications.json`
- `supabase/seeds/projects.json`

Jalankan migrasi:

```bash
npm run migrate:supabase
```

Sifat migrasi:

- `experiences` dan `projects`: insert jika belum ada, update jika sudah ada.
- `certifications`: upsert berdasarkan `credential_id`.

Jika ingin update data CV, cukup edit file di folder `supabase/seeds`, lalu jalankan ulang `npm run migrate:supabase`.

### 4) Endpoint CRUD

Semua endpoint berada di prefix: `/api/cv`

- `GET /api/cv/experiences`
- `POST /api/cv/experiences`
- `GET /api/cv/experiences/:id`
- `PATCH /api/cv/experiences/:id`
- `DELETE /api/cv/experiences/:id`

- `GET /api/cv/certifications`
- `POST /api/cv/certifications`
- `GET /api/cv/certifications/:id`
- `PATCH /api/cv/certifications/:id`
- `DELETE /api/cv/certifications/:id`

- `GET /api/cv/projects`
- `POST /api/cv/projects`
- `GET /api/cv/projects/:id`
- `PATCH /api/cv/projects/:id`
- `DELETE /api/cv/projects/:id`

### 5) Integrasi UI

- Section `Experience` membaca dari `/api/cv/experiences`.
- Section `Certifications` membaca dari `/api/cv/certifications`.
- Section `Projects` membaca dari `/api/cv/projects`.

Catatan UI saat ini:

- `Experience` dan `Certifications` mengambil data langsung dari Supabase API.
- `Projects` prioritas dari Supabase API, fallback ke GitHub API jika data Supabase kosong.

### 6) Verifikasi Cepat

Setelah schema + seed sukses, cek endpoint ini:

```bash
GET /api/cv/experiences
GET /api/cv/certifications
GET /api/cv/projects
```

Expected: endpoint mengembalikan array data (bukan error env / table not found).

### 7) Troubleshooting

1. Error `Could not find the table ... in the schema cache`

- Pastikan `supabase/schema.sql` sudah dijalankan pada project yang sama dengan URL dan key di `.env.local`.

2. Error `Supabase belum dikonfigurasi`

- Cek kembali `NEXT_PUBLIC_SUPABASE_URL` dan `SUPABASE_SERVICE_ROLE_KEY` di `.env.local`.

3. `npm run dev` gagal karena Turbopack internal error

- Jalankan mode webpack sementara:

```bash
npx next dev --webpack
```

---

## 📸 Menambahkan Foto Profil Asli

Ganti placeholder inisial di `src/app/page.tsx`:

1. Simpan foto di `/public/images/profile.jpg`
2. Tambahkan import berikut di bagian atas `page.tsx`:
   ```tsx
   import Image from "next/image";
   ```
3. Ganti div placeholder dengan:
   ```tsx
   <Image
     src="/images/profile.jpg"
     alt="Rifaldi"
     fill
     className="object-cover object-top"
     priority
   />
   ```

---

## 📄 Lisensi

Project ini bersifat open source dengan lisensi [MIT License](LICENSE).

---

<div align="center">

Made with ♥ by **[Rifaldi](https://rifaldiin.vercel.app)** using Next.js, Tailwind CSS, dan Framer Motion.

</div>
