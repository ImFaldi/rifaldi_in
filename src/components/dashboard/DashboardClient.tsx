"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Briefcase,
  Award,
  FolderKanban,
  AlertTriangle,
  ArrowUpDown,
  CheckSquare,
  LogOut,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  X,
} from "lucide-react";

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
  type?: "text" | "textarea";
};

type ResourceMeta = {
  label: string;
  subtitle: string;
  accentClass: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
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
    { key: "type", label: "Type" },
    { key: "description", label: "Description", type: "textarea" },
    { key: "description_en", label: "Description EN", optional: true, type: "textarea" },
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
    { key: "title_en", label: "Title EN", optional: true },
    { key: "description", label: "Description", type: "textarea" },
    { key: "description_en", label: "Description EN", optional: true, type: "textarea" },
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
  },
  certifications: {
    label: "Certifications",
    subtitle: "Data sertifikasi dan kredensial.",
    accentClass: "bg-amber-500/10 text-amber-500 border-amber-500/30",
    icon: Award,
  },
  projects: {
    label: "Projects",
    subtitle: "Portofolio project dan repository.",
    accentClass: "bg-emerald-500/10 text-emerald-500 border-emerald-500/30",
    icon: FolderKanban,
  },
};

const TABLE_FIELDS: Record<ResourceName, string[]> = {
  experiences: ["role", "company", "period", "type", "tags"],
  certifications: ["name", "issuer", "date", "credential_id"],
  projects: ["title", "description", "tags", "repo"],
};

function buildEmptyValues(resource: ResourceName): Record<string, string> {
  const next: Record<string, string> = {};
  for (const field of RESOURCE_FIELDS[resource]) {
    next[field.key] = "";
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
  const [sortField, setSortField] = useState<string>("updated_at");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<CvItem | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const currentFields = useMemo(() => RESOURCE_FIELDS[resource], [resource]);
  const meta = RESOURCE_META[resource];

  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;

    return items.filter((item) => {
      const combined = TABLE_FIELDS[resource]
        .map((field) => stringifyValue(item[field]))
        .join(" ")
        .toLowerCase();
      return combined.includes(q) || item.id.toLowerCase().includes(q);
    });
  }, [items, query, resource]);

  const sortedItems = useMemo(() => {
    const copy = [...filteredItems];

    copy.sort((a, b) => {
      const left = stringifyValue(a[sortField]).toLowerCase();
      const right = stringifyValue(b[sortField]).toLowerCase();

      if (left < right) return sortDirection === "asc" ? -1 : 1;
      if (left > right) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return copy;
  }, [filteredItems, sortField, sortDirection]);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(filteredItems.length / pageSize)),
    [filteredItems.length, pageSize]
  );

  const paginatedItems = useMemo(() => {
    const startIndex = (page - 1) * pageSize;
    return sortedItems.slice(startIndex, startIndex + pageSize);
  }, [sortedItems, page, pageSize]);

  const pageStart = filteredItems.length === 0 ? 0 : (page - 1) * pageSize + 1;
  const pageEnd = Math.min(page * pageSize, filteredItems.length);

  useEffect(() => {
    setFormValues(buildEmptyValues(resource));
    setEditingId(null);
    setQuery("");
    setPage(1);
    setSelectedIds([]);
    setSortField("updated_at");
    setSortDirection("desc");
    setMessage(null);
    setError(null);
  }, [resource]);

  useEffect(() => {
    setSelectedIds([]);
  }, [query, page, pageSize, sortField, sortDirection, resource]);

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
          setItems([]);
          return;
        }

        if (!active) return;
        setItems(Array.isArray(data) ? data : []);
      } catch {
        if (active) {
          setError("Tidak bisa terhubung ke server.");
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

  function handleInputChange(key: string, value: string) {
    setFormValues((prev) => ({ ...prev, [key]: value }));
  }

  function resetForm(messageText?: string) {
    setEditingId(null);
    setFormValues(buildEmptyValues(resource));
    setError(null);
    if (messageText) {
      setMessage(messageText);
      pushToast(messageText, "info");
    }
  }

  function pushToast(messageText: string, type: ToastType) {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    setToasts((prev) => [...prev, { id, message: messageText, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 2800);
  }

  function buildPayload(): Record<string, unknown> {
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

    return payload;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    setMessage(null);

    try {
      const payload = buildPayload();
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
        setError(data?.message ?? "Gagal menyimpan data.");
        pushToast(data?.message ?? "Gagal menyimpan data.", "error");
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
    setMessage(`Mode edit aktif untuk item ${item.id.slice(0, 8)}...`);
    setError(null);
  }

  async function handleDelete() {
    if (!deleteTarget) return;

    setDeleting(true);
    setError(null);
    setMessage(null);

    try {
      const response = await fetch(`/api/cv/${resource}/${deleteTarget.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { message?: string } | null;
        setError(data?.message ?? "Gagal menghapus data.");
        pushToast(data?.message ?? "Gagal menghapus data.", "error");
        return;
      }

      setMessage("Data berhasil dihapus.");
      pushToast("Data berhasil dihapus.", "success");
      if (editingId === deleteTarget.id) {
        resetForm("Item yang sedang diedit telah dihapus.");
      }
      setDeleteTarget(null);
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

      const failed = results.filter((result) => result.status === "rejected").length;
      const fulfilled = results.filter((result) => result.status === "fulfilled");
      const failedHttp = fulfilled.filter(
        (result) => result.status === "fulfilled" && !result.value.ok
      ).length;
      const successCount = selectedIds.length - failed - failedHttp;

      if (successCount > 0) {
        pushToast(`${successCount} item berhasil dihapus.`, "success");
      }

      if (failed + failedHttp > 0) {
        pushToast(`${failed + failedHttp} item gagal dihapus.`, "error");
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

  function toggleSort(field: string) {
    if (sortField === field) {
      setSortDirection((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }

    setSortField(field);
    setSortDirection("asc");
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

  const Icon = meta.icon;

  return (
    <main className="min-h-screen bg-bg-primary text-text-primary px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="rounded-3xl border border-border bg-linear-to-br from-bg-card via-bg-card to-accent-soft/30 p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-text-secondary">
                Admin Control Panel
              </p>
              <h1 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-4xl">Dashboard CRUD CV</h1>
              <p className="mt-2 max-w-2xl text-sm text-text-secondary sm:text-base">
                Kelola data portfolio secara profesional dengan alur create, update, dan delete yang rapi.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setRefreshTick((value) => value + 1)}
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-bg-card px-4 py-2 text-sm font-semibold hover:bg-accent-soft transition-colors"
              >
                <RefreshCw size={15} />
                Refresh Data
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-bg-card px-4 py-2 text-sm font-semibold text-red-500 hover:bg-red-500/10 transition-colors"
              >
                <LogOut size={15} />
                Logout
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
              <p className="text-xs text-text-secondary">Mode form</p>
              <p className="mt-2 text-2xl font-extrabold">{editingId ? "Edit" : "Create"}</p>
              <p className="mt-1 text-xs text-text-secondary">
                {editingId ? `Editing ID ${editingId.slice(0, 8)}...` : "Siap menambah item baru."}
              </p>
            </article>
          </div>
        </header>

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-[340px_minmax(0,1fr)]">
          <aside className="rounded-2xl border border-border bg-bg-card p-5 sm:p-6 xl:sticky xl:top-6 xl:self-start">
            <h2 className="text-lg font-bold">Form {meta.label}</h2>
            <p className="mt-1 text-xs text-text-secondary">Isi field di bawah, lalu simpan perubahan.</p>

            <div className="mt-4 flex flex-wrap gap-2">
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

              {error && <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-500">{error}</p>}
              {message && (
                <p className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-500">
                  {message}
                </p>
              )}

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
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-bold">Data {meta.label}</h2>
                <p className="text-xs text-text-secondary">Kelola item dengan pencarian cepat dan aksi langsung.</p>
              </div>

              <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
                <label className="relative block w-full sm:w-72">
                  <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
                  <input
                    type="text"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Cari data..."
                    className="w-full rounded-xl border border-border bg-bg-primary py-2 pl-9 pr-3 text-sm outline-none focus:border-accent"
                  />
                </label>

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

            <div className="mt-4 overflow-x-auto rounded-xl border border-border">
              <table className="min-w-full divide-y divide-border text-sm">
                <thead className="bg-bg-primary/80">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-text-secondary">
                      <button
                        type="button"
                        onClick={toggleSelectAllOnPage}
                        className="inline-flex items-center gap-1 text-text-secondary hover:text-text-primary"
                        title="Pilih semua di halaman ini"
                      >
                        <CheckSquare size={13} />
                        Pick
                      </button>
                    </th>
                    {TABLE_FIELDS[resource].map((field) => (
                      <th key={field} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-text-secondary">
                        <button
                          type="button"
                          onClick={() => toggleSort(field)}
                          className="inline-flex items-center gap-1 hover:text-text-primary"
                        >
                          {field.replaceAll("_", " ")}
                          <ArrowUpDown size={12} className={sortField === field ? "text-accent" : ""} />
                        </button>
                      </th>
                    ))}
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-text-secondary">
                      <button
                        type="button"
                        onClick={() => toggleSort("updated_at")}
                        className="inline-flex items-center gap-1 hover:text-text-primary"
                      >
                        Updated
                        <ArrowUpDown size={12} className={sortField === "updated_at" ? "text-accent" : ""} />
                      </button>
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-text-secondary">
                      Aksi
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-border">
                  {loadingList ? (
                    <tr>
                      <td colSpan={TABLE_FIELDS[resource].length + 2} className="px-4 py-8 text-center text-text-secondary">
                        Memuat data...
                      </td>
                    </tr>
                  ) : filteredItems.length === 0 ? (
                    <tr>
                      <td colSpan={TABLE_FIELDS[resource].length + 2} className="px-4 py-8 text-center text-text-secondary">
                        {query ? "Tidak ada data yang cocok dengan pencarian." : "Belum ada data."}
                      </td>
                    </tr>
                  ) : (
                    paginatedItems.map((item) => (
                      <tr key={item.id} className="hover:bg-accent-soft/40 transition-colors">
                        <td className="px-4 py-3 align-top">
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(item.id)}
                            onChange={() => toggleSelectItem(item.id)}
                            className="h-4 w-4 rounded border-border"
                          />
                        </td>
                        {TABLE_FIELDS[resource].map((field) => (
                          <td key={field} className="max-w-56 truncate px-4 py-3 align-top text-text-primary">
                            {stringifyValue(item[field])}
                          </td>
                        ))}

                        <td className="px-4 py-3 align-top text-xs text-text-secondary">
                          {formatDateLabel(item.updated_at ?? item.created_at)}
                        </td>

                        <td className="px-4 py-3 align-top">
                          <div className="flex justify-end gap-2">
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
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {selectedIds.length > 0 && (
              <div className="mt-3 flex flex-col gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs font-semibold text-amber-500">
                  {selectedIds.length} item dipilih.
                </p>
                <button
                  type="button"
                  onClick={() => setBulkDeleteOpen(true)}
                  className="inline-flex items-center gap-1 rounded-lg border border-red-500/40 px-3 py-1.5 text-xs font-semibold text-red-500 hover:bg-red-500/10"
                >
                  <Trash2 size={12} />
                  Hapus Terpilih
                </button>
              </div>
            )}

            <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-text-secondary">
                Menampilkan {pageStart}-{pageEnd} dari {filteredItems.length} item (total {items.length}).
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
