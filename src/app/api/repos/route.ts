import { NextResponse } from "next/server";
import type { GithubRepo } from "@/lib/github";

// Revalidate setiap 1 jam (ISR) — tidak re-fetch ke GitHub setiap request
export const revalidate = 3600;

export async function GET() {
  // Ambil username dari env social github yang sudah ada
  const githubUrl = process.env.NEXT_PUBLIC_SOCIAL_GITHUB ?? "";
  const username = githubUrl.split("github.com/")[1]?.split("/")[0];

  const featuredRaw = process.env.GITHUB_FEATURED_REPOS ?? "";
  const featured = featuredRaw
    .split(",")
    .map((r) => r.trim())
    .filter(Boolean);

  if (!username || !featured.length) {
    return NextResponse.json([]);
  }

  const headers: HeadersInit = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };

  // GITHUB_TOKEN opsional — tanpa token rate limit 60 req/jam, sudah cukup
  const token = process.env.GITHUB_TOKEN;
  if (token) headers.Authorization = `Bearer ${token}`;

  const results = await Promise.all(
    featured.map(async (repo) => {
      try {
        const res = await fetch(
          `https://api.github.com/repos/${username}/${repo}`,
          { headers, next: { revalidate: 3600 } }
        );
        if (!res.ok) return null;
        return (await res.json()) as GithubRepo;
      } catch {
        return null;
      }
    })
  );

  return NextResponse.json(results.filter(Boolean));
}
