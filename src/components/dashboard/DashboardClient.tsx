"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  Award,
  Briefcase,
  CheckSquare,
  FolderKanban,
  LogOut,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { LanguageToggle } from "@/components/ui/LanguageToggle";
import { useLanguage } from "@/contexts/LanguageContext";

type ResourceName = "experiences" | "certifications" | "projects";

type CvItem = Record<string, unknown> & {
  id: string;
  created_at?: string;
  updated_at?: string;
};

type FieldConfig = {
  key: string;
  label: string;
  optional?: boolean;
  type?: "text" | "textarea" | "select";
  options?: string[];
};

type ResourceMeta = {
  label: string;
  subtitle: string;
  accentClass: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  titleField: string;
  subtitleField: string;
  summaryField: string;
};

type ToastType = "success" | "error" | "info";

type ToastItem = {
  id: number;
  message: string;
  type: ToastType;
};

const RESOURCE_FIELDS: Record<ResourceName, FieldConfig[]> = {
  experiences: [
    { key: "role", label: "Role" },
    { key: "company", label: "Company" },
    { key: "location", label: "Location" },
    { key: "period", label: "Period" },
    {
      key: "type",
      label: "Type",
      type: "select",
      options: ["Full-time", "Freelance", "Part-time", "Contract", "Internship"],
    },
    { key: "description", label: "Description", type: "textarea" },
    { key: "tags", label: "Tags (pisahkan dengan koma)", optional: true },
  ],
  certifications: [
    { key: "name", label: "Name" },
    { key: "issuer", label: "Issuer" },
    { key: "date", label: "Date" },
    { key: "credential_id", label: "Credential ID" },
    { key: "badge", label: "Badge", optional: true },
    { key: "gradient", label: "Gradient", optional: true },
    { key: "hover_border", label: "Hover Border", optional: true },
    { key: "href", label: "Link", optional: true },
  ],
  projects: [
    { key: "title", label: "Title" },
    { key: "description", label: "Description", type: "textarea" },
    { key: "tags", label: "Tags (pisahkan dengan koma)", optional: true },
    { key: "href", label: "Demo Link", optional: true },
    { key: "repo", label: "Repository Link", optional: true },
    { key: "gradient", label: "Gradient", optional: true },
  ],
};

const RESOURCE_META: Record<ResourceName, ResourceMeta> = {
  experiences: {
    label: "Experiences",
    subtitle: "Riwayat pengalaman kerja dan peran.",
    accentClass: "bg-blue-500/10 text-blue-500 border-blue-500/30",
    icon: Briefcase,
    titleField: "role",
    subtitleField: "company",
    summaryField: "description",
  },
  certifications: {
    label: "Certifications",
    subtitle: "Data sertifikasi dan kredensial.",
    accentClass: "bg-amber-500/10 text-amber-500 border-amber-500/30",
    icon: Award,
    titleField: "name",
    subtitleField: "issuer",
    summaryField: "credential_id",
  },
  projects: {
    label: "Projects",
    subtitle: "Portofolio project dan repository.",
    accentClass: "bg-emerald-500/10 text-emerald-500 border-emerald-500/30",
    icon: FolderKanban,
    titleField: "title",
    subtitleField: "repo",
    summaryField: "description",
  },
};

function buildEmptyValues(resource: ResourceName): Record<string, string> {
  const next: Record<string, string> = {};
  for (const field of RESOURCE_FIELDS[resource]) {
    if (field.type === "select" && field.options?.length) {
      next[field.key] = field.options[0];
    } else {
      next[field.key] = "";
    }
  }
  return next;
}

function stringifyValue(value: unknown): string {
  if (Array.isArray(value)) {
    return value
      .filter((item): item is string => typeof item === "string")
      .join(", ");
  }

  if (typeof value === "string") {
    return value;
  }

  if (value === null || value === undefined) {
    return "-";
  }

  return String(value);
}

function formatDateLabel(value: unknown): string {
  if (typeof value !== "string") return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getToastStyles(type: ToastType): string {
  if (type === "success") return "border-emerald-500/40 bg-emerald-500/10 text-emerald-500";
  if (type === "error") return "border-red-500/40 bg-red-500/10 text-red-500";
  return "border-blue-500/40 bg-blue-500/10 text-blue-500";
}

export function DashboardClient() {
  const router = useRouter();
  const { lang } = useLanguage();
  const [resource, setResource] = useState<ResourceName>("experiences");
  const [items, setItems] = useState<CvItem[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [refreshTick, setRefreshTick] = useState(0);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<Record<string, string>>(buildEmptyValues("experiences"));
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [sortMode, setSortMode] = useState<"updated" | "title">("updated");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<CvItem | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  const currentFields = useMemo(() => RESOURCE_FIELDS[resource], [resource]);
  const meta = RESOURCE_META[resource];
  const Icon = meta.icon;
  const isEn = lang === "en";

  const text = {
    title: isEn ? "CV CRUD Dashboard" : "Dashboard CRUD CV",
    subtitle: isEn
      ? "Manage portfolio data with editorial card view, bulk actions, and auto-translate."
      : "Kelola data portfolio dengan tampilan editorial card, bulk action, dan auto-translate.",
    refresh: isEn ? "Refresh Data" : "Refresh Data",
    logout: "Logout",
    resourceSwitch: isEn ? "Switch Resource" : "Pilih Resource",
    formSubtitle: isEn ? "Fill in the fields below, then save." : "Isi field di bawah, lalu simpan perubahan.",
    autoTranslateHint: isEn
      ? "EN fields are generated automatically by translation."
      : "Field EN akan diisi otomatis oleh sistem translate.",
    dataSubtitle: isEn ? "Cleaner card view and easier to scan." : "Card view yang lebih clean dan mudah dipindai.",
    searchPlaceholder: isEn ? "Search data..." : "Cari data...",
    loading: isEn ? "Loading data..." : "Memuat data...",
    emptySearch: isEn ? "No matching data found." : "Tidak ada data yang cocok dengan pencarian.",
    emptyData: isEn ? "No data yet." : "Belum ada data.",
  };

  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;

    return items.filter((item) => {
      const combined = Object.values(item)
        .map((value) => stringifyValue(value).toLowerCase())
        .join(" ");
      return combined.includes(q);
    });
  }, [items, query]);

  const sortedItems = useMemo(() => {
    const copy = [...filteredItems];

    copy.sort((a, b) => {
      const left =
        sortMode === "updated"
          ? stringifyValue(a.updated_at ?? a.created_at)
          : stringifyValue(a[meta.titleField]);
      const right =
        sortMode === "updated"
          ? stringifyValue(b.updated_at ?? b.created_at)
          : stringifyValue(b[meta.titleField]);

      if (left < right) return sortDirection === "asc" ? -1 : 1;
      if (left > right) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return copy;
  }, [filteredItems, sortMode, sortDirection, meta.titleField]);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(sortedItems.length / pageSize)),
    [sortedItems.length, pageSize]
  );

  const paginatedItems = useMemo(() => {
    const startIndex = (page - 1) * pageSize;
    return sortedItems.slice(startIndex, startIndex + pageSize);
  }, [sortedItems, page, pageSize]);

  const pageStart = sortedItems.length === 0 ? 0 : (page - 1) * pageSize + 1;
  const pageEnd = Math.min(page * pageSize, sortedItems.length);

  useEffect(() => {
    setFormValues(buildEmptyValues(resource));
    setEditingId(null);
    setQuery("");
    setPage(1);
    setSelectedIds([]);
    setSortMode("updated");
    setSortDirection("desc");
    setError(null);
  }, [resource]);

  useEffect(() => {
    setPage(1);
  }, [query, pageSize]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  useEffect(() => {
    let active = true;

    async function loadResource() {
      setLoadingList(true);
      setError(null);

      try {
        const response = await fetch(`/api/cv/${resource}`, { cache: "no-store" });
        const data = (await response.json()) as CvItem[] | { message?: string };

        if (!response.ok) {
          if (!active) return;
          const messageText = !Array.isArray(data) ? data.message : undefined;
          setError(messageText ?? "Gagal memuat data.");
          pushToast(messageText ?? "Gagal memuat data.", "error");
          setItems([]);
          return;
        }

        if (!active) return;
        setItems(Array.isArray(data) ? data : []);
      } catch {
        if (active) {
          setError("Tidak bisa terhubung ke server.");
          pushToast("Tidak bisa terhubung ke server.", "error");
          setItems([]);
        }
      } finally {
        if (active) setLoadingList(false);
      }
    }

    void loadResource();

    return () => {
      active = false;
    };
  }, [resource, refreshTick]);

  function pushToast(message: string, type: ToastType) {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 2800);
  }

  function handleInputChange(key: string, value: string) {
    setFormValues((prev) => ({ ...prev, [key]: value }));
  }

  function resetForm(infoText?: string) {
    setEditingId(null);
    setFormValues(buildEmptyValues(resource));
    setError(null);
    if (infoText) pushToast(infoText, "info");
  }

  async function autoTranslate(text: string): Promise<string> {
    if (!text.trim()) return "";

    try {
      const response = await fetch("/api/translate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text, source: "id", target: "en" }),
      });

      if (!response.ok) {
        return text;
      }

      const data = (await response.json()) as { translatedText?: string };
      return data.translatedText?.trim() || text;
    } catch {
      return text;
    }
  }

  async function buildPayload(): Promise<Record<string, unknown>> {
    const payload: Record<string, unknown> = {};

    for (const field of currentFields) {
      const rawValue = (formValues[field.key] ?? "").trim();

      if (field.key === "tags") {
        payload.tags = rawValue
          ? rawValue
              .split(",")
              .map((item) => item.trim())
              .filter(Boolean)
          : [];
        continue;
      }

      if (!rawValue && field.optional) {
        payload[field.key] = null;
        continue;
      }

      payload[field.key] = rawValue;
    }

    // Auto-translate agar tidak input manual 2x.
    if (resource === "experiences") {
      const description = stringifyValue(payload.description);
      payload.description_en = await autoTranslate(description);
    }

    if (resource === "projects") {
      const title = stringifyValue(payload.title);
      const description = stringifyValue(payload.description);
      payload.title_en = await autoTranslate(title);
      payload.description_en = await autoTranslate(description);
    }

    return payload;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const payload = await buildPayload();
      const endpoint = editingId ? `/api/cv/${resource}/${editingId}` : `/api/cv/${resource}`;
      const method = editingId ? "PATCH" : "POST";

      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = (await response.json().catch(() => null)) as { message?: string } | null;

      if (!response.ok) {
        const msg = data?.message ?? "Gagal menyimpan data.";
        setError(msg);
        pushToast(msg, "error");
        return;
      }

      resetForm(editingId ? "Data berhasil diupdate." : "Data berhasil ditambahkan.");
      pushToast(editingId ? "Data berhasil diupdate." : "Data berhasil ditambahkan.", "success");
      setRefreshTick((value) => value + 1);
    } catch {
      setError("Tidak bisa terhubung ke server.");
      pushToast("Tidak bisa terhubung ke server.", "error");
    } finally {
      setSubmitting(false);
    }
  }

  function startEdit(item: CvItem) {
    const nextValues: Record<string, string> = {};

    for (const field of currentFields) {
      const value = item[field.key];
      if (field.key === "tags") {
        nextValues[field.key] = Array.isArray(value)
          ? value.filter((tag): tag is string => typeof tag === "string").join(", ")
          : "";
      } else {
        nextValues[field.key] = typeof value === "string" ? value : "";
      }
    }

    setEditingId(item.id);
    setFormValues(nextValues);
    setError(null);
    pushToast(`Mode edit aktif untuk item ${item.id.slice(0, 8)}...`, "info");
  }

  async function handleDelete() {
    if (!deleteTarget) return;

    setDeleting(true);
    setError(null);

    try {
      const response = await fetch(`/api/cv/${resource}/${deleteTarget.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { message?: string } | null;
        const msg = data?.message ?? "Gagal menghapus data.";
        setError(msg);
        pushToast(msg, "error");
        return;
      }

      if (editingId === deleteTarget.id) {
        resetForm("Item yang sedang diedit telah dihapus.");
      }
      setDeleteTarget(null);
      pushToast("Data berhasil dihapus.", "success");
      setRefreshTick((value) => value + 1);
    } catch {
      setError("Tidak bisa terhubung ke server.");
      pushToast("Tidak bisa terhubung ke server.", "error");
    } finally {
      setDeleting(false);
    }
  }

  async function handleBulkDelete() {
    if (!selectedIds.length) return;

    setBulkDeleting(true);
    setError(null);

    try {
      const results = await Promise.allSettled(
        selectedIds.map((id) => fetch(`/api/cv/${resource}/${id}`, { method: "DELETE" }))
      );

      const failedNetwork = results.filter((result) => result.status === "rejected").length;
      const fulfilled = results.filter(
        (result): result is PromiseFulfilledResult<Response> => result.status === "fulfilled"
      );
      const failedHttp = fulfilled.filter((result) => !result.value.ok).length;
      const successCount = selectedIds.length - failedNetwork - failedHttp;

      if (successCount > 0) {
        pushToast(`${successCount} item berhasil dihapus.`, "success");
      }

      if (failedNetwork + failedHttp > 0) {
        pushToast(`${failedNetwork + failedHttp} item gagal dihapus.`, "error");
      }

      setSelectedIds([]);
      setBulkDeleteOpen(false);
      setRefreshTick((value) => value + 1);
    } catch {
      pushToast("Bulk delete gagal diproses.", "error");
    } finally {
      setBulkDeleting(false);
    }
  }

  function toggleSelectAllOnPage() {
    const pageIds = paginatedItems.map((item) => item.id);
    const allSelected = pageIds.length > 0 && pageIds.every((id) => selectedIds.includes(id));

    if (allSelected) {
      setSelectedIds((prev) => prev.filter((id) => !pageIds.includes(id)));
      return;
    }

    setSelectedIds((prev) => Array.from(new Set([...prev, ...pageIds])));
  }

  function toggleSelectItem(id: string) {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  }

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      router.push("/auth");
      router.refresh();
    }
  }

  return (
    <main className="min-h-screen bg-bg-primary text-text-primary px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="rounded-3xl border border-border bg-linear-to-br from-bg-card via-bg-card to-accent-soft/30 p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-text-secondary">
                Admin Control Panel
              </p>
              <h1 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-4xl">{text.title}</h1>
              <p className="mt-2 max-w-2xl text-sm text-text-secondary sm:text-base">
                {text.subtitle}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <LanguageToggle />
              <ThemeToggle />
              <button
                type="button"
                onClick={() => setRefreshTick((value) => value + 1)}
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-bg-card px-4 py-2 text-sm font-semibold hover:bg-accent-soft transition-colors"
              >
                <RefreshCw size={15} />
                {text.refresh}
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-bg-card px-4 py-2 text-sm font-semibold text-red-500 hover:bg-red-500/10 transition-colors"
              >
                <LogOut size={15} />
                {text.logout}
              </button>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <article className="rounded-2xl border border-border bg-bg-card p-4">
              <p className="text-xs text-text-secondary">Resource aktif</p>
              <div className="mt-2 flex items-center gap-2">
                <span className={`inline-flex rounded-lg border px-2 py-1 text-xs font-semibold ${meta.accentClass}`}>
                  <Icon size={14} />
                </span>
                <p className="text-base font-bold">{meta.label}</p>
              </div>
              <p className="mt-1 text-xs text-text-secondary">{meta.subtitle}</p>
            </article>

            <article className="rounded-2xl border border-border bg-bg-card p-4">
              <p className="text-xs text-text-secondary">Total item</p>
              <p className="mt-2 text-2xl font-extrabold">{items.length}</p>
              <p className="mt-1 text-xs text-text-secondary">Data mentah di resource saat ini.</p>
            </article>

            <article className="rounded-2xl border border-border bg-bg-card p-4">
              <p className="text-xs text-text-secondary">Selection</p>
              <p className="mt-2 text-2xl font-extrabold">{selectedIds.length}</p>
              <p className="mt-1 text-xs text-text-secondary">Item terpilih untuk bulk action.</p>
            </article>
          </div>
        </header>

        <section className="rounded-2xl border border-border bg-bg-card p-4 sm:p-5">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-text-secondary">{text.resourceSwitch}</p>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(RESOURCE_META) as ResourceName[]).map((name) => {
              const tab = RESOURCE_META[name];
              const TabIcon = tab.icon;
              const active = name === resource;

              return (
                <button
                  key={name}
                  type="button"
                  onClick={() => setResource(name)}
                  className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
                    active
                      ? `${tab.accentClass} border-current`
                      : "border-border text-text-secondary hover:text-text-primary hover:bg-accent-soft"
                  }`}
                >
                  <TabIcon size={13} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </section>

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-[340px_minmax(0,1fr)]">
          <aside className="rounded-2xl border border-border bg-bg-card p-5 sm:p-6 xl:sticky xl:top-6 xl:self-start">
            <h2 className="text-lg font-bold">Form {meta.label}</h2>
            <p className="mt-1 text-xs text-text-secondary">{text.formSubtitle}</p>

            <form onSubmit={handleSubmit} className="mt-5 space-y-3">
              {currentFields.map((field) => (
                <div key={field.key}>
                  <label className="mb-1 block text-xs font-semibold text-text-secondary">
                    {field.label} {field.optional ? "(opsional)" : "*"}
                  </label>

                  {field.type === "textarea" ? (
                    <textarea
                      rows={4}
                      value={formValues[field.key] ?? ""}
                      onChange={(event) => handleInputChange(field.key, event.target.value)}
                      placeholder={field.optional ? "Opsional" : "Wajib diisi"}
                      className="w-full rounded-xl border border-border bg-bg-primary px-3 py-2 text-sm outline-none focus:border-accent"
                      required={!field.optional}
                    />
                  ) : field.type === "select" ? (
                    <select
                      value={formValues[field.key] ?? ""}
                      onChange={(event) => handleInputChange(field.key, event.target.value)}
                      className="w-full rounded-xl border border-border bg-bg-primary px-3 py-2 text-sm outline-none focus:border-accent"
                      required={!field.optional}
                    >
                      {field.options?.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={formValues[field.key] ?? ""}
                      onChange={(event) => handleInputChange(field.key, event.target.value)}
                      placeholder={field.optional ? "Opsional" : "Wajib diisi"}
                      className="w-full rounded-xl border border-border bg-bg-primary px-3 py-2 text-sm outline-none focus:border-accent"
                      required={!field.optional}
                    />
                  )}
                </div>
              ))}

              <p className="rounded-lg border border-blue-500/30 bg-blue-500/10 px-3 py-2 text-xs text-blue-500">
                {text.autoTranslateHint}
              </p>

              {error && <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-500">{error}</p>}

              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                >
                  {editingId ? <Pencil size={14} /> : <Plus size={14} />}
                  {submitting ? "Memproses..." : editingId ? "Update Data" : "Tambah Data"}
                </button>

                <button
                  type="button"
                  onClick={() => resetForm("Form dibersihkan.")}
                  className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-semibold hover:bg-accent-soft"
                >
                  <X size={14} />
                  Reset Form
                </button>
              </div>
            </form>
          </aside>

          <section className="rounded-2xl border border-border bg-bg-card p-5 sm:p-6">
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-bold">Data {meta.label}</h2>
                  <p className="text-xs text-text-secondary">{text.dataSubtitle}</p>
                </div>

                <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
                  <label className="relative block w-full sm:w-72">
                    <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
                    <input
                      type="text"
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      placeholder={text.searchPlaceholder}
                      className="w-full rounded-xl border border-border bg-bg-primary py-2 pl-9 pr-3 text-sm outline-none focus:border-accent"
                    />
                  </label>

                  <select
                    value={`${sortMode}:${sortDirection}`}
                    onChange={(event) => {
                      const [mode, direction] = event.target.value.split(":") as [
                        "updated" | "title",
                        "asc" | "desc"
                      ];
                      setSortMode(mode);
                      setSortDirection(direction);
                    }}
                    className="rounded-xl border border-border bg-bg-primary px-3 py-2 text-sm outline-none focus:border-accent"
                  >
                    <option value="updated:desc">Terbaru</option>
                    <option value="updated:asc">Terlama</option>
                    <option value="title:asc">Judul A-Z</option>
                    <option value="title:desc">Judul Z-A</option>
                  </select>

                  <select
                    value={pageSize}
                    onChange={(event) => setPageSize(Number(event.target.value))}
                    className="rounded-xl border border-border bg-bg-primary px-3 py-2 text-sm outline-none focus:border-accent"
                  >
                    <option value={8}>8 / halaman</option>
                    <option value={12}>12 / halaman</option>
                    <option value={20}>20 / halaman</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={toggleSelectAllOnPage}
                  className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold hover:bg-accent-soft"
                >
                  <CheckSquare size={13} />
                  Toggle Select Page
                </button>

                {selectedIds.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setBulkDeleteOpen(true)}
                    className="inline-flex items-center gap-1 rounded-lg border border-red-500/40 px-3 py-1.5 text-xs font-semibold text-red-500 hover:bg-red-500/10"
                  >
                    <Trash2 size={13} />
                    Hapus {selectedIds.length} Item
                  </button>
                )}
              </div>
            </div>

            {loadingList ? (
              <div className="mt-4 rounded-xl border border-border p-8 text-center text-sm text-text-secondary">
                {text.loading}
              </div>
            ) : paginatedItems.length === 0 ? (
              <div className="mt-4 rounded-xl border border-border p-8 text-center text-sm text-text-secondary">
                {query ? text.emptySearch : text.emptyData}
              </div>
            ) : (
              <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-2">
                {paginatedItems.map((item) => {
                  const title = stringifyValue(item[meta.titleField]);
                  const subtitle = stringifyValue(item[meta.subtitleField]);
                  const summary = stringifyValue(item[meta.summaryField]);
                  const tags = Array.isArray(item.tags)
                    ? item.tags.filter((tag): tag is string => typeof tag === "string")
                    : [];

                  return (
                    <article
                      key={item.id}
                      className="rounded-2xl border border-border bg-bg-primary/65 p-4 transition-colors hover:bg-accent-soft/30"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="truncate text-sm font-bold sm:text-base">{title || "(Tanpa judul)"}</h3>
                          <p className="mt-0.5 truncate text-xs text-text-secondary">{subtitle}</p>
                        </div>

                        <input
                          type="checkbox"
                          checked={selectedIds.includes(item.id)}
                          onChange={() => toggleSelectItem(item.id)}
                          className="h-4 w-4 rounded border-border"
                        />
                      </div>

                      <p className="mt-3 line-clamp-2 text-xs text-text-secondary sm:text-sm">{summary}</p>

                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {tags.length ? (
                          tags.slice(0, 4).map((tag) => (
                            <span
                              key={`${item.id}-${tag}`}
                              className="rounded-full border border-border px-2 py-0.5 text-[11px] text-text-secondary"
                            >
                              {tag}
                            </span>
                          ))
                        ) : (
                          <span className="text-[11px] text-text-secondary">Tanpa tag</span>
                        )}
                      </div>

                      <div className="mt-4 flex items-center justify-between gap-2">
                        <span className="text-[11px] text-text-secondary">
                          Update: {formatDateLabel(item.updated_at ?? item.created_at)}
                        </span>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => startEdit(item)}
                            className="inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-xs font-semibold hover:bg-accent-soft"
                          >
                            <Pencil size={12} />
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(item)}
                            className="inline-flex items-center gap-1 rounded-lg border border-red-500/40 px-2.5 py-1.5 text-xs font-semibold text-red-500 hover:bg-red-500/10"
                          >
                            <Trash2 size={12} />
                            Hapus
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}

            <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-text-secondary">
                Menampilkan {pageStart}-{pageEnd} dari {sortedItems.length} item (total {items.length}).
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPage((value) => Math.max(1, value - 1))}
                  disabled={page <= 1}
                  className="rounded-lg border border-border px-2.5 py-1.5 text-xs font-semibold disabled:opacity-50"
                >
                  Prev
                </button>
                <span className="text-xs text-text-secondary">
                  Halaman {page} / {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
                  disabled={page >= totalPages}
                  className="rounded-lg border border-border px-2.5 py-1.5 text-xs font-semibold disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </section>
        </section>

        {deleteTarget && (
          <div className="fixed inset-0 z-90 flex items-center justify-center bg-black/55 px-4">
            <div className="w-full max-w-md rounded-2xl border border-border bg-bg-card p-5 shadow-2xl sm:p-6">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 rounded-xl border border-red-500/30 bg-red-500/10 p-2 text-red-500">
                  <AlertTriangle size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold">Konfirmasi Hapus Data</h3>
                  <p className="mt-1 text-sm text-text-secondary">
                    Data yang dihapus tidak bisa dikembalikan. Lanjutkan hapus item ini?
                  </p>
                  <p className="mt-2 rounded-lg bg-bg-primary px-3 py-2 text-xs text-text-secondary break-all">
                    ID: {deleteTarget.id}
                  </p>
                </div>
              </div>

              <div className="mt-5 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setDeleteTarget(null)}
                  disabled={deleting}
                  className="rounded-xl border border-border px-4 py-2 text-sm font-semibold disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="rounded-xl bg-red-500 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                >
                  {deleting ? "Menghapus..." : "Ya, Hapus"}
                </button>
              </div>
            </div>
          </div>
        )}

        {bulkDeleteOpen && (
          <div className="fixed inset-0 z-90 flex items-center justify-center bg-black/55 px-4">
            <div className="w-full max-w-md rounded-2xl border border-border bg-bg-card p-5 shadow-2xl sm:p-6">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 rounded-xl border border-red-500/30 bg-red-500/10 p-2 text-red-500">
                  <AlertTriangle size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold">Konfirmasi Bulk Delete</h3>
                  <p className="mt-1 text-sm text-text-secondary">
                    Kamu akan menghapus {selectedIds.length} item sekaligus. Lanjutkan?
                  </p>
                </div>
              </div>

              <div className="mt-5 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setBulkDeleteOpen(false)}
                  disabled={bulkDeleting}
                  className="rounded-xl border border-border px-4 py-2 text-sm font-semibold disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleBulkDelete}
                  disabled={bulkDeleting}
                  className="rounded-xl bg-red-500 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                >
                  {bulkDeleting ? "Menghapus..." : "Ya, Hapus Semua"}
                </button>
              </div>
            </div>
          </div>
        )}

        {toasts.length > 0 && (
          <div className="pointer-events-none fixed right-4 top-4 z-90 flex w-[92vw] max-w-sm flex-col gap-2">
            {toasts.map((toast) => (
              <div
                key={toast.id}
                className={`rounded-xl border px-3 py-2 text-sm font-semibold shadow-lg ${getToastStyles(toast.type)}`}
              >
                {toast.message}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
