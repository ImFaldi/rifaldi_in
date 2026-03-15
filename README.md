<div align="center">

# ✦ rifaldi.in

**Personal Portfolio Website — Futuristic & Fully Animated**

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

## ✨ Features

| Feature | Description |
|---|---|
| 🌙 **Dark / Light Mode** | Seamless theme switching with `next-themes` and CSS variable design tokens |
| 🌐 **Bilingual (ID / EN)** | Full language switching with React Context + `localStorage` persistence |
| 🖱️ **Custom Cursor** | Magnetic cursor that morphs on hover with spring physics |
| 🧲 **Magnetic Buttons** | CTA buttons with spring-physics magnetic pull effect |
| 🃏 **3D Project Cards** | Cards with `useMotionValue` tilt + dynamic glare highlight |
| 📜 **Smooth Scroll** | Ultra-smooth scroll powered by Lenis |
| 🎭 **Scroll Animations** | Staggered `whileInView` entrance animations throughout |
| ♾️ **Infinite Marquee** | Framer Motion–powered looping tech stack ticker |
| 📊 **Animated Counters** | Spring-based number counters that trigger on scroll |
| 📱 **Fully Responsive** | Mobile-first layout, works on all screen sizes |

---

## 🛠️ Tech Stack

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

## 📁 Project Structure

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

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18.x
- **npm** ≥ 9.x

### Installation

```bash
# Clone the repository
git clone https://github.com/ImFaldi/rifaldi_in.git
cd rifaldi_in

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Available Scripts

```bash
npm run dev      # Start dev server with Turbopack
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

---

## 🌐 Deployment

This project is deployed to **Vercel** via the Vercel CLI.

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy to production
vercel --yes --prod
```

Live URL: **[https://rifaldiin.vercel.app](https://rifaldiin.vercel.app)**

---

## 🎨 Design System

The entire color system is built on CSS custom properties with automatic dark/light switching via the `.dark` class (`next-themes`).

```css
/* Key design tokens */
--bg-primary       /* Page background */
--bg-card          /* Card / glass surface */
--border-color     /* Border color */
--text-primary     /* Headings */
--text-secondary   /* Body text */
--accent           /* Primary brand color (violet) */
--accent-soft      /* Accent with low opacity */
```

All tokens are mapped to Tailwind shortcuts via `@theme inline`:
```
bg-bg-primary  ·  text-text-primary  ·  text-accent  ·  border-border  ·  bg-accent-soft
```

---

## 🌍 Adding a New Language

1. Add the new locale to `Lang` type in [`src/lib/i18n.ts`](src/lib/i18n.ts):
   ```ts
   export type Lang = "id" | "en" | "jp"; // add here
   ```
2. Add the full translation object under `translations.jp`.
3. Add the new locale to the `LANGS` array in [`src/components/ui/LanguageToggle.tsx`](src/components/ui/LanguageToggle.tsx).

---

## 🗄️ Supabase CRUD Setup

Project ini sekarang sudah support CRUD Supabase untuk 3 resource utama:

- `experiences`
- `certifications`
- `projects`

### 1) Set Environment Variable

Isi file `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
SUPABASE_SERVICE_ROLE_KEY=YOUR_SUPABASE_SERVICE_ROLE_KEY
```

### 2) Jalankan SQL Schema

Copy isi file `supabase/schema.sql` ke Supabase SQL Editor, lalu jalankan.

### 3) Endpoint CRUD

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

### 4) Integrasi UI

- Section `Experience` membaca dari `/api/cv/experiences`.
- Section `Certifications` membaca dari `/api/cv/certifications`.
- Section `Projects` membaca dari `/api/cv/projects`.

Jika tabel masih kosong atau API gagal, UI otomatis fallback ke data lama.

---

## 📸 Adding Your Real Photo

Replace the initials placeholder in `src/app/page.tsx`:

1. Place your photo at `/public/images/profile.jpg`
2. Add the import at the top of `page.tsx`:
   ```tsx
   import Image from "next/image";
   ```
3. Replace the placeholder div with:
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

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

<div align="center">

Made with ♥ by **[Rifaldi](https://rifaldiin.vercel.app)** — using Next.js, Tailwind CSS & Framer Motion.

</div>

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
