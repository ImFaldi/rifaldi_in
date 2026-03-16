"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type AuthMode = "login" | "register";

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function checkAuth() {
      try {
        const response = await fetch("/api/auth/me", {
          method: "GET",
          cache: "no-store",
        });

        const data = (await response.json()) as { authenticated?: boolean };
        if (!active) return;

        if (data.authenticated) {
          router.replace("/dashboard");
          return;
        }
      } catch {
        // no-op
      } finally {
        if (active) setChecking(false);
      }
    }

    void checkAuth();

    return () => {
      active = false;
    };
  }, [router]);

  const title = useMemo(() => (mode === "login" ? "Login Dashboard" : "Register Dashboard"), [mode]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);

    if (mode === "register" && password !== confirmPassword) {
      setError("Konfirmasi password tidak sama.");
      return;
    }

    setLoading(true);

    try {
      const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = (await response.json()) as { message?: string };

      if (!response.ok) {
        setError(data.message ?? "Terjadi kesalahan saat autentikasi.");
        return;
      }

      setMessage(data.message ?? "Berhasil.");
      router.push("/dashboard");
    } catch {
      setError("Tidak bisa terhubung ke server.");
    } finally {
      setLoading(false);
    }
  }

  if (checking) {
    return (
      <main className="min-h-screen bg-bg-primary text-text-primary flex items-center justify-center px-4">
        <p className="text-text-secondary">Memeriksa sesi login...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-bg-primary text-text-primary px-4 py-10">
      <div className="max-w-md mx-auto glass-card rounded-2xl border border-border p-6 sm:p-8">
        <h1 className="text-2xl font-bold mb-2">{title}</h1>
        <p className="text-sm text-text-secondary mb-6">
          Silakan login atau register sebelum masuk ke halaman dashboard CRUD.
        </p>

        <div className="grid grid-cols-2 gap-2 mb-6">
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setError(null);
              setMessage(null);
            }}
            className={`rounded-lg px-3 py-2 text-sm font-semibold border transition-colors ${
              mode === "login"
                ? "bg-accent text-white border-accent"
                : "bg-transparent border-border text-text-secondary hover:text-text-primary"
            }`}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("register");
              setError(null);
              setMessage(null);
            }}
            className={`rounded-lg px-3 py-2 text-sm font-semibold border transition-colors ${
              mode === "register"
                ? "bg-accent text-white border-accent"
                : "bg-transparent border-border text-text-secondary hover:text-text-primary"
            }`}
          >
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="nama@email.com"
              className="w-full rounded-lg border border-border bg-bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent/40"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Minimal 8 karakter"
              className="w-full rounded-lg border border-border bg-bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent/40"
              required
            />
          </div>

          {mode === "register" && (
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1">
                Konfirmasi Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Ulangi password"
                className="w-full rounded-lg border border-border bg-bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent/40"
                required
              />
            </div>
          )}

          {error && <p className="text-sm text-red-500">{error}</p>}
          {message && <p className="text-sm text-emerald-500">{message}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-accent text-white py-2.5 text-sm font-semibold disabled:opacity-60"
          >
            {loading ? "Memproses..." : mode === "login" ? "Login" : "Register"}
          </button>
        </form>
      </div>
    </main>
  );
}
