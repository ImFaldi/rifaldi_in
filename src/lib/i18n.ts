export type Lang = "id" | "en";

export interface NavLink {
  label: string;
  href: string;
}

export interface StatEntry {
  value: string;
  label: string;
}

export interface ProjectEntry {
  title: string;
  description: string;
}

export interface ExperienceEntry {
  role: string;
  company: string;
  location: string;
  period: string;
  type: string;
  description: string;
  tags: string[];
}

export interface Translations {
  nav: { links: NavLink[] };
  hero: {
    availableBadge: string;
    greeting: string;
    role: string;
    location: string;
    tech: string;
    bio: string;
    ctaContact: string;
    ctaCV: string;
    floatingAvailable: string;
    floatingExp: string;
    floatingExpValue: string;
  };
  stats: StatEntry[];
  techStack: { label: string };
  projects: {
    subheader: string;
    header: string;
    viewAll: string;
    list: ProjectEntry[];
  };
  experience: {
    subheader: string;
    header: string;
    list: ExperienceEntry[];
  };
  certs: {
    subheader: string;
    header: string;
  };
  about: {
    label: string;
    headline: string;
    headlineHighlight: string;
    headlineEnd: string;
    bio: string;
    tags: string[];
  };
  contact: {
    label: string;
    headline: string;
    bio: string;
    emailBtn: string;
    linkedinBtn: string;
  };
  deepWork: { label: string };
  statsGrid: { labels: string[] };
  footer: { credit: string };
}

export const translations: Record<Lang, Translations> = {
  id: {
    nav: {
      links: [
        { label: "Proyek",      href: "#proyek" },
        { label: "Pengalaman",  href: "#pengalaman" },
        { label: "Sertifikasi", href: "#sertifikasi" },
        { label: "Kontak",      href: "#kontak" },
      ],
    },
    hero: {
      availableBadge:    "Tersedia untuk freelance & full-time",
      greeting:          "Hi, saya",
      role:              "Full Stack Developer.",
      location:          "Jakarta, Indonesia",
      tech:              "Laravel · Next.js · Flutter · AI Agents",
      bio:               "Saya membangun produk digital yang cepat, indah, dan berdampak. Spesialis memadukan keahlian backend, frontend, mobile, dan kecerdasan buatan menjadi satu solusi yang kohesif dan scalable.",
      ctaContact:        "Hubungi Saya",
      ctaCV:             "Download CV",
      floatingAvailable: "Available",
      floatingExp:       "Pengalaman",
      floatingExpValue:  "5+ Tahun",
    },
    stats: [
      { value: "5+",    label: "Tahun Pengalaman" },
      { value: "24+",   label: "Proyek Selesai" },
      { value: "18+",   label: "Klien Puas" },
      { value: "1.4k+", label: "Kontribusi GitHub" },
    ],
    techStack: { label: "Tech Stack" },
    projects: {
      subheader: "Karya Terpilih",
      header:    "Featured Projects",
      viewAll:   "Lihat Semua",
      list: [
        {
          title:       "SaaSify Dashboard",
          description: "Platform manajemen SaaS real-time dengan analitik interaktif, role-based access control, dan integrasi payment gateway Midtrans.",
        },
        {
          title:       "NutriTrack Mobile",
          description: "Aplikasi pelacak nutrisi berbasis Flutter dengan AI meal recognition, integrasi dengan wearables, dan dashboard kesehatan harian.",
        },
        {
          title:       "AI Document Agent",
          description: "Agen AI multi-step yang dapat membaca, meringkas, dan menjawab pertanyaan dari dokumen PDF panjang menggunakan RAG pipeline.",
        },
      ],
    },
    experience: {
      subheader: "Perjalanan Karir",
      header:    "Pengalaman Kerja",
      list: [
        {
          role:        "Full Stack Developer",
          company:     "PT. Solusi Digital Nusantara",
          location:    "Jakarta, Indonesia",
          period:      "Jan 2024 – Sekarang",
          type:        "Full-time",
          description: "Memimpin pengembangan platform SaaS multi-tenant berbasis Next.js & Laravel. Mengintegrasikan fitur AI menggunakan OpenAI API untuk otomatisasi laporan keuangan. Berhasil meningkatkan performa API sebesar 60% melalui query optimization dan Redis caching strategy.",
          tags:        ["Next.js", "Laravel", "OpenAI", "Redis", "MySQL"],
        },
        {
          role:        "Mobile Developer",
          company:     "PT. Kreasi Teknologi Indonesia",
          location:    "Bandung, Indonesia",
          period:      "Jun 2022 – Des 2023",
          type:        "Full-time",
          description: "Mengembangkan 3 aplikasi mobile cross-platform untuk sektor kesehatan dan logistik menggunakan Flutter. Menerapkan Clean Architecture + BLoC pattern. Rating 4.8/5 di Play Store dengan 50.000+ downloads aktif.",
          tags:        ["Flutter", "Dart", "Firebase", "BLoC", "REST API"],
        },
        {
          role:        "Junior Web Developer",
          company:     "Freelance / Remote",
          location:    "Remote",
          period:      "Mar 2021 – Mei 2022",
          type:        "Freelance",
          description: "Menangani 15+ proyek web development untuk klien dalam dan luar negeri, mulai dari company profiles, e-commerce, hingga sistem informasi manajemen berbasis Laravel & Vue.js.",
          tags:        ["Laravel", "Vue.js", "PHP", "MySQL", "Bootstrap"],
        },
      ],
    },
    certs: {
      subheader: "Kemampuan Terverifikasi",
      header:    "Sertifikasi",
    },
    about: {
      label:              "About Me",
      headline:           "Terobsesi dengan",
      headlineHighlight:  "craft",
      headlineEnd:        "& impact.",
      bio:                "Dengan pengalaman end-to-end dari backend hingga mobile, saya memadukan keahlian teknis dengan sensibilitas desain untuk menciptakan produk yang berkesan dan berdampak nyata bagi pengguna.",
      tags:               ["Problem Solver", "Clean Code", "Design-Minded", "AI Enthusiast"],
    },
    contact: {
      label:       "Let\u2019s Work Together",
      headline:    "Punya proyek impian? Mari wujudkan bersama.",
      bio:         "Terbuka untuk proyek freelance, full-time, atau kolaborasi menarik lainnya.",
      emailBtn:    "Kirim Email",
      linkedinBtn: "LinkedIn",
    },
    deepWork: { label: "Deep-Work Stats" },
    statsGrid: {
      labels: ["Skor Fokus Coding", "Proyek Selesai", "Cangkir Kopi", "Kontribusi GitHub"],
    },
    footer: {
      credit: "Dibuat dengan Next.js 15, Tailwind CSS & Framer Motion.",
    },
  },

  en: {
    nav: {
      links: [
        { label: "Projects",       href: "#proyek" },
        { label: "Experience",     href: "#pengalaman" },
        { label: "Certifications", href: "#sertifikasi" },
        { label: "Contact",        href: "#kontak" },
      ],
    },
    hero: {
      availableBadge:    "Available for freelance & full-time",
      greeting:          "Hi, I\u2019m",
      role:              "Full Stack Developer.",
      location:          "Jakarta, Indonesia",
      tech:              "Laravel · Next.js · Flutter · AI Agents",
      bio:               "I build digital products that are fast, beautiful, and impactful. A specialist in merging backend, frontend, mobile, and AI expertise into one cohesive and scalable solution.",
      ctaContact:        "Contact Me",
      ctaCV:             "Download CV",
      floatingAvailable: "Available",
      floatingExp:       "Experience",
      floatingExpValue:  "5+ Years",
    },
    stats: [
      { value: "5+",    label: "Years Experience" },
      { value: "24+",   label: "Projects Completed" },
      { value: "18+",   label: "Happy Clients" },
      { value: "1.4k+", label: "GitHub Contributions" },
    ],
    techStack: { label: "Tech Stack" },
    projects: {
      subheader: "Selected Works",
      header:    "Featured Projects",
      viewAll:   "View All",
      list: [
        {
          title:       "SaaSify Dashboard",
          description: "A real-time SaaS management platform with interactive analytics, role-based access control, and Midtrans payment gateway integration.",
        },
        {
          title:       "NutriTrack Mobile",
          description: "A Flutter-based nutrition tracking app with AI meal recognition, wearables integration, and a daily health dashboard.",
        },
        {
          title:       "AI Document Agent",
          description: "A multi-step AI agent that reads, summarizes, and answers questions from long PDF documents using a RAG pipeline.",
        },
      ],
    },
    experience: {
      subheader: "Career Journey",
      header:    "Work Experience",
      list: [
        {
          role:        "Full Stack Developer",
          company:     "PT. Solusi Digital Nusantara",
          location:    "Jakarta, Indonesia",
          period:      "Jan 2024 \u2013 Present",
          type:        "Full-time",
          description: "Led development of a multi-tenant SaaS platform using Next.js & Laravel. Integrated AI features via OpenAI API to automate financial reporting. Improved API performance by 60% through query optimization and Redis caching strategy.",
          tags:        ["Next.js", "Laravel", "OpenAI", "Redis", "MySQL"],
        },
        {
          role:        "Mobile Developer",
          company:     "PT. Kreasi Teknologi Indonesia",
          location:    "Bandung, Indonesia",
          period:      "Jun 2022 \u2013 Dec 2023",
          type:        "Full-time",
          description: "Developed 3 cross-platform mobile apps for healthcare and logistics using Flutter. Implemented Clean Architecture + BLoC pattern. Achieved 4.8/5 on the Play Store with 50,000+ active downloads.",
          tags:        ["Flutter", "Dart", "Firebase", "BLoC", "REST API"],
        },
        {
          role:        "Junior Web Developer",
          company:     "Freelance / Remote",
          location:    "Remote",
          period:      "Mar 2021 \u2013 May 2022",
          type:        "Freelance",
          description: "Handled 15+ web development projects for local and international clients \u2014 from company profiles and e-commerce to management information systems built with Laravel & Vue.js.",
          tags:        ["Laravel", "Vue.js", "PHP", "MySQL", "Bootstrap"],
        },
      ],
    },
    certs: {
      subheader: "Verified Skills",
      header:    "Certifications",
    },
    about: {
      label:             "About Me",
      headline:          "Obsessed with",
      headlineHighlight: "craft",
      headlineEnd:       "& impact.",
      bio:               "With end-to-end experience from backend to mobile, I combine technical expertise with design sensibility to create memorable products with real impact on users.",
      tags:              ["Problem Solver", "Clean Code", "Design-Minded", "AI Enthusiast"],
    },
    contact: {
      label:       "Let\u2019s Work Together",
      headline:    "Have a dream project? Let\u2019s build it together.",
      bio:         "Open to freelance projects, full-time roles, or any interesting collaboration.",
      emailBtn:    "Send Email",
      linkedinBtn: "LinkedIn",
    },
    deepWork: { label: "Deep-Work Stats" },
    statsGrid: {
      labels: ["Coding Focus Score", "Projects Shipped", "Cups of Coffee", "GitHub Contributions"],
    },
    footer: {
      credit: "Built with Next.js 15, Tailwind CSS & Framer Motion.",
    },
  },
};
