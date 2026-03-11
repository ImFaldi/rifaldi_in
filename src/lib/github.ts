// ─── GitHub API Types ─────────────────────────────────────────────────────────

export interface GithubRepo {
  name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  topics: string[];
  stargazers_count: number;
  language: string | null;
}

// ─── Gradient rotation untuk ProjectCard ─────────────────────────────────────

export const REPO_GRADIENTS = [
  "from-violet-600 via-indigo-600 to-blue-600",
  "from-emerald-500 via-teal-500 to-cyan-500",
  "from-amber-500 via-orange-500 to-rose-500",
  "from-pink-500 via-rose-500 to-red-500",
  "from-blue-500 via-cyan-500 to-teal-500",
  "from-purple-500 via-violet-500 to-indigo-500",
] as const;

// ─── Format nama repo menjadi judul yang readable ─────────────────────────────
// contoh: "my-next-app" → "My Next App", "rifaldi_in" → "Rifaldi In"

export function formatRepoName(name: string): string {
  return name
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
