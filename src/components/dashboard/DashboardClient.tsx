"use client";

import { FormEvent, MouseEvent, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  Award,
  Briefcase,
  ChevronRight,
  CheckSquare,
  Download,
  FolderKanban,
  GraduationCap,
  History,
  LogOut,
  NotebookText,
  Pencil,
  Plus,
  RefreshCw,
  Save,
  Search,
  Shield,
  Trash2,
  Undo2,
  Upload,
  User,
  WandSparkles,
  X,
} from "lucide-react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { LanguageToggle } from "@/components/ui/LanguageToggle";
import { useLanguage } from "@/contexts/LanguageContext";

type ResourceName = "experiences" | "certifications" | "projects" | "educations" | "blogs";
type WorkflowStatus = "draft" | "review" | "published";
type UserRole = "admin" | "editor";

type CvItem = Record<string, unknown> & {
  id: string;
  status?: WorkflowStatus;
  deleted_at?: string | null;
  created_at?: string;
  updated_at?: string;
};

type AuditLog = {
  id: string;
  action: string;
  resource: string;
  resource_id: string | null;
  user_email: string | null;
  user_role: string | null;
  created_at: string;
};

type DashboardUser = {
  id: string;
  email: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
};

type SessionUser = {
  id: string;
  email: string;
  role: UserRole;
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

type NavItem = {
  id: string;
  label: string;
};

const STATUS_OPTIONS: WorkflowStatus[] = ["draft", "review", "published"];

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
    {
      key: "status",
      label: "Status",
      type: "select",
      options: STATUS_OPTIONS,
    },
    { key: "description", label: "Description", type: "textarea" },
    { key: "tags", label: "Tags (pisahkan dengan koma)", optional: true },
  ],
  certifications: [
    { key: "name", label: "Name" },
    { key: "issuer", label: "Issuer" },
    { key: "date", label: "Date" },
    { key: "credential_id", label: "Credential ID" },
    {
      key: "status",
      label: "Status",
      type: "select",
      options: STATUS_OPTIONS,
    },
    { key: "badge", label: "Badge", optional: true },
    { key: "gradient", label: "Gradient", optional: true },
    { key: "hover_border", label: "Hover Border", optional: true },
    { key: "href", label: "Link", optional: true },
  ],
  projects: [
    { key: "title", label: "Title" },
    {
      key: "status",
      label: "Status",
      type: "select",
      options: STATUS_OPTIONS,
    },
    { key: "description", label: "Description", type: "textarea" },
    { key: "tags", label: "Tags (pisahkan dengan koma)", optional: true },
    { key: "href", label: "Demo Link", optional: true },
    { key: "repo", label: "Repository Link", optional: true },
    { key: "gradient", label: "Gradient", optional: true },
  ],
  educations: [
    { key: "degree", label: "Degree" },
    { key: "institution", label: "Institution" },
    { key: "location", label: "Location" },
    { key: "period", label: "Period" },
    {
      key: "status",
      label: "Status",
      type: "select",
      options: STATUS_OPTIONS,
    },
    { key: "description", label: "Description", type: "textarea" },
    { key: "description_en", label: "Description (EN)", type: "textarea", optional: true },
  ],
  blogs: [
    { key: "title", label: "Title" },
    { key: "slug", label: "Slug" },
    { key: "read_time", label: "Read Time" },
    { key: "published_at", label: "Published At (ISO)" },
    {
      key: "status",
      label: "Status",
      type: "select",
      options: STATUS_OPTIONS,
    },
    { key: "excerpt", label: "Excerpt", type: "textarea" },
    { key: "content", label: "Content", type: "textarea" },
    { key: "cover_image", label: "Cover Image URL", optional: true },
    { key: "title_en", label: "Title (EN)", optional: true },
    { key: "excerpt_en", label: "Excerpt (EN)", type: "textarea", optional: true },
    { key: "content_en", label: "Content (EN)", type: "textarea", optional: true },
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
  educations: {
    label: "Educations",
    subtitle: "Riwayat pendidikan dan pembelajaran formal.",
    accentClass: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30",
    icon: GraduationCap,
    titleField: "degree",
    subtitleField: "institution",
    summaryField: "description",
  },
  blogs: {
    label: "Blogs",
    subtitle: "Artikel, insight, dan catatan teknis.",
    accentClass: "bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/30",
    icon: NotebookText,
    titleField: "title",
    subtitleField: "slug",
    summaryField: "excerpt",
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

function statusBadgeClass(status: WorkflowStatus | undefined): string {
  switch (status) {
    case "draft":
      return "border-slate-400/40 bg-slate-500/10 text-slate-300";
    case "review":
      return "border-amber-500/40 bg-amber-500/10 text-amber-400";
    case "published":
      return "border-emerald-500/40 bg-emerald-500/10 text-emerald-400";
    default:
      return "border-border bg-bg-card text-text-secondary";
  }
}

export function DashboardClient() {
  const router = useRouter();
  const { lang } = useLanguage();
  const isEn = lang === "en";

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
  const [autoTranslateEnabled, setAutoTranslateEnabled] = useState(true);
  const [includeDeleted, setIncludeDeleted] = useState(false);
  const [role, setRole] = useState<UserRole>("editor");
  const [sessionUser, setSessionUser] = useState<SessionUser | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loadingAudit, setLoadingAudit] = useState(false);
  const [dashboardUsers, setDashboardUsers] = useState<DashboardUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const [profileEmail, setProfileEmail] = useState("");
  const [profileCurrentPassword, setProfileCurrentPassword] = useState("");
  const [profileNewPassword, setProfileNewPassword] = useState("");
  const [profileConfirmPassword, setProfileConfirmPassword] = useState("");
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [activeSection, setActiveSection] = useState("section-overview");
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const formRef = useRef<HTMLFormElement>(null);
  const importInputRef = useRef<HTMLInputElement>(null);

  const currentFields = useMemo(() => RESOURCE_FIELDS[resource], [resource]);
  const meta = RESOURCE_META[resource];
  const Icon = meta.icon;

  const text = useMemo(() => ({
    adminControl: isEn ? "Admin Control Panel" : "Panel Kontrol Admin",
    title: isEn ? "CV CRUD Dashboard" : "Dashboard CRUD CV",
    subtitle: isEn
      ? "Manage portfolio data with workflow, audit trail, and smart automation."
      : "Kelola data portfolio dengan workflow, audit trail, dan automasi pintar.",
    activeRole: isEn ? "Active role" : "Role aktif",
    activeResource: isEn ? "Active resource" : "Resource aktif",
    totalItems: isEn ? "Total items" : "Total item",
    selection: isEn ? "Selection" : "Pilihan",
    workflow: "Workflow",
    workflowHint: isEn ? "Draft -> Review -> Published" : "Draft -> Review -> Published",
    refresh: isEn ? "Refresh Data" : "Refresh Data",
    logout: "Logout",
    autoTranslateLabel: isEn ? "Auto Translate" : "Auto Translate",
    on: isEn ? "ON" : "ON",
    off: isEn ? "OFF" : "OFF",
    optionalSuffix: isEn ? "(optional)" : "(opsional)",
    optionalPlaceholder: isEn ? "Optional" : "Opsional",
    requiredPlaceholder: isEn ? "Required" : "Wajib diisi",
    resourceSwitch: isEn ? "Switch Resource" : "Pilih Resource",
    formSubtitle: isEn ? "Fill in fields, then save." : "Isi field di bawah, lalu simpan perubahan.",
    autoTranslateHint: isEn
      ? "EN fields are generated automatically."
      : "Field EN akan diisi otomatis oleh sistem translate.",
    dataSubtitle: isEn ? "Professional card workspace." : "Workspace card yang lebih profesional.",
    dataHeaderHint: isEn
      ? "Search, filter, and run actions from one control deck."
      : "Cari, filter, dan jalankan aksi dari satu control deck.",
    actionTools: isEn ? "Action Tools" : "Alat Aksi",
    searchPlaceholder: isEn ? "Search data..." : "Cari data...",
    loading: isEn ? "Loading data..." : "Memuat data...",
    emptySearch: isEn ? "No matching data found." : "Tidak ada data yang cocok dengan pencarian.",
    emptyData: isEn ? "No data yet." : "Belum ada data.",
    noTitle: isEn ? "(Untitled)" : "(Tanpa judul)",
    noTags: isEn ? "No tags" : "Tanpa tag",
    updated: isEn ? "Updated" : "Update",
    edit: isEn ? "Edit" : "Edit",
    delete: isEn ? "Delete" : "Hapus",
    restore: isEn ? "Restore" : "Restore",
    processing: isEn ? "Processing..." : "Memproses...",
    saveAdd: isEn ? "Add Data" : "Tambah Data",
    saveUpdate: isEn ? "Update Data" : "Update Data",
    translatePreview: isEn ? "Translate Preview" : "Preview Translate",
    resetForm: isEn ? "Reset Form" : "Reset Form",
    sortNewest: isEn ? "Newest" : "Terbaru",
    sortOldest: isEn ? "Oldest" : "Terlama",
    sortTitleAsc: isEn ? "Title A-Z" : "Judul A-Z",
    sortTitleDesc: isEn ? "Title Z-A" : "Judul Z-A",
    pageUnit: isEn ? "page" : "halaman",
    toggleSelectPage: isEn ? "Toggle Select Page" : "Toggle Select Page",
    exportJson: "Export JSON",
    exportCsv: "Export CSV",
    importJson: "Import JSON",
    hideTrash: isEn ? "Hide Trash" : "Sembunyikan Trash",
    showTrash: isEn ? "Show Trash" : "Tampilkan Trash",
    deleteSelected: isEn ? "Delete" : "Hapus",
    itemLabel: isEn ? "item" : "item",
    showing: isEn ? "Showing" : "Menampilkan",
    of: isEn ? "of" : "dari",
    total: isEn ? "total" : "total",
    pageLabel: isEn ? "Page" : "Halaman",
    prev: isEn ? "Prev" : "Sebelumnya",
    next: isEn ? "Next" : "Berikutnya",
    activityLog: isEn ? "Activity Log" : "Log Aktivitas",
    loadingAudit: isEn ? "Loading audit log..." : "Memuat audit log...",
    emptyAudit: isEn ? "No activity log yet." : "Belum ada activity log.",
    deleteConfirmTitle: isEn ? "Confirm Delete" : "Konfirmasi Hapus Data",
    deleteConfirmDesc: isEn
      ? "Data will be moved to trash (soft delete)."
      : "Data akan dipindahkan ke trash (soft delete).",
    cancel: isEn ? "Cancel" : "Batal",
    deletingLabel: isEn ? "Deleting..." : "Menghapus...",
    deleteYes: isEn ? "Yes, Delete" : "Ya, Hapus",
    bulkDeleteTitle: isEn ? "Confirm Bulk Delete" : "Konfirmasi Bulk Delete",
    deleteAllYes: isEn ? "Yes, Delete All" : "Ya, Hapus Semua",
    userManagement: isEn ? "User Management" : "Manajemen User",
    loadingUsers: isEn ? "Loading users..." : "Memuat daftar user...",
    emptyUsers: isEn ? "No registered users yet." : "Belum ada user terdaftar.",
    joinDate: isEn ? "Join" : "Gabung",
    promoteAdmin: isEn ? "Promote Admin" : "Jadikan Admin",
    demoteEditor: isEn ? "Demote Editor" : "Jadikan Editor",
    roleLabel: isEn ? "Role" : "Role",
    unknownUser: isEn ? "unknown" : "tidak diketahui",
    idLabel: "ID",
    toastLoadFailed: isEn ? "Failed to load data." : "Gagal memuat data.",
    toastNetworkError: isEn ? "Cannot connect to server." : "Tidak bisa terhubung ke server.",
    toastUsersLoadFailed: isEn
      ? "Failed to load user list."
      : "Gagal memuat daftar user.",
    toastUsersNetworkError: isEn
      ? "Cannot connect to user management server."
      : "Tidak bisa terhubung ke server user management.",
    toastSaveFailed: isEn ? "Failed to save data." : "Gagal menyimpan data.",
    toastSavedUpdate: isEn ? "Data updated successfully." : "Data berhasil diupdate.",
    toastSavedCreate: isEn ? "Data added successfully." : "Data berhasil ditambahkan.",
    toastEditMode: isEn ? "Edit mode active for item" : "Mode edit aktif untuk item",
    toastDeleteFailed: isEn ? "Failed to delete data." : "Gagal menghapus data.",
    toastEditedDeleted: isEn
      ? "The item being edited has been deleted."
      : "Item yang sedang diedit telah dihapus.",
    toastDeleted: isEn ? "Data deleted successfully." : "Data berhasil dihapus.",
    toastRestoreFailed: isEn ? "Failed to restore data." : "Gagal restore data.",
    toastRestored: isEn ? "Data restored successfully." : "Data berhasil di-restore.",
    toastBulkFailed: isEn ? "Bulk delete failed." : "Bulk delete gagal diproses.",
    toastNoExportData: isEn ? "No data to export." : "Tidak ada data untuk diexport.",
    toastImportInvalid: isEn
      ? "Import file is empty or invalid."
      : "File import kosong atau format tidak valid.",
    toastImportReadFailed: isEn ? "Failed to read import file." : "Gagal membaca file import.",
    toastTranslateOff: isEn ? "Auto translate is disabled." : "Auto translate sedang nonaktif.",
    toastTranslateFill: isEn
      ? "Fill title/description first for translation preview."
      : "Isi title/description dulu untuk preview translate.",
    toastRoleUpdateFailed: isEn ? "Failed to update user role." : "Gagal update role user.",
    toastRoleUpdated: isEn ? "User role updated successfully." : "Role user berhasil diperbarui.",
    toastFormCleared: isEn ? "Form cleared." : "Form dibersihkan.",
    sessionTitle: isEn ? "Current Session" : "Sesi Login Saat Ini",
    sessionHint: isEn ? "Manage your account profile below." : "Kelola profil akun kamu di bawah ini.",
    emailLabel: "Email",
    currentPasswordLabel: isEn ? "Current Password" : "Password Saat Ini",
    newPasswordLabel: isEn ? "New Password" : "Password Baru",
    confirmPasswordLabel: isEn ? "Confirm New Password" : "Konfirmasi Password Baru",
    profileSave: isEn ? "Save Profile" : "Simpan Profil",
    profileSaving: isEn ? "Saving..." : "Menyimpan...",
    profileDrawerTitle: isEn ? "Profile Editor" : "Editor Profil",
    openProfileEditor: isEn ? "Edit Profile" : "Edit Profil",
    closeProfileEditor: isEn ? "Close Profile" : "Tutup Profil",
    profileCardHint: isEn
      ? "Update account details in drawer mode."
      : "Perbarui detail akun lewat mode drawer.",
    navTitle: isEn ? "Dashboard Navigation" : "Navigasi Dashboard",
    navOverview: isEn ? "Overview" : "Ringkasan",
    navResource: isEn ? "Resource Tabs" : "Tab Resource",
    navEditor: isEn ? "Editor Form" : "Form Editor",
    navData: isEn ? "Data Workspace" : "Workspace Data",
    navProfile: isEn ? "Profile Settings" : "Pengaturan Profil",
    navActivity: isEn ? "Activity Log" : "Log Aktivitas",
    navUsers: isEn ? "User Management" : "Manajemen User",
    quickAccess: isEn ? "Quick Access" : "Akses Cepat",
    navProgress: isEn ? "Navigation Progress" : "Progres Navigasi",
    navActiveNow: isEn ? "Active now" : "Sedang aktif",
    openEditor: isEn ? "Open Editor" : "Buka Editor",
    closeEditor: isEn ? "Close Editor" : "Tutup Editor",
    editorDeckHint: isEn
      ? "Use drawer mode to focus on data while editing."
      : "Pakai mode drawer agar fokus data tetap luas saat edit.",
    editorDrawerTitle: isEn ? "Data Editor Drawer" : "Drawer Editor Data",
    addNewData: isEn ? "Add New Data" : "Tambah Data Baru",
    toastConfirmPasswordMismatch: isEn
      ? "New password confirmation does not match."
      : "Konfirmasi password baru tidak sama.",
    toastProfileUpdated: isEn ? "Profile updated successfully." : "Profil berhasil diperbarui.",
    toastProfileUpdateFailed: isEn ? "Failed to update profile." : "Gagal memperbarui profil.",
  }), [isEn]);

  const bulkDeleteDesc = isEn
    ? `You will move ${selectedIds.length} items to trash. Continue?`
    : `Kamu akan memindahkan ${selectedIds.length} item ke trash. Lanjutkan?`;

  const navItems = useMemo<NavItem[]>(() => {
    const baseItems: NavItem[] = [
      { id: "section-overview", label: text.navOverview },
      { id: "section-resource", label: text.navResource },
      { id: "section-editor", label: text.navEditor },
      { id: "section-data", label: text.navData },
      { id: "section-profile", label: text.navProfile },
      { id: "section-activity", label: text.navActivity },
    ];

    if (role === "admin") {
      baseItems.push({ id: "section-users", label: text.navUsers });
    }

    return baseItems;
  }, [role, text.navActivity, text.navData, text.navEditor, text.navOverview, text.navProfile, text.navResource, text.navUsers]);

  const activeNavIndex = useMemo(
    () => Math.max(0, navItems.findIndex((item) => item.id === activeSection)),
    [navItems, activeSection]
  );

  const navProgressPercent = useMemo(() => {
    if (!navItems.length) return 0;
    return Math.round(((activeNavIndex + 1) / navItems.length) * 100);
  }, [activeNavIndex, navItems.length]);

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

  function pushToast(message: string, type: ToastType) {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 2800);
  }

  function draftStorageKey(targetResource: ResourceName) {
    return `dashboard:draft:${targetResource}`;
  }

  useEffect(() => {
    let active = true;

    async function loadMe() {
      try {
        const response = await fetch("/api/auth/me", { cache: "no-store" });
        const data = (await response.json()) as {
          authenticated?: boolean;
          user?: { id?: string; email?: string; role?: UserRole };
        };

        if (!active) return;
        const nextRole = data.user?.role === "admin" ? "admin" : "editor";
        setRole(nextRole);
        setSessionUser({
          id: data.user?.id ?? "",
          email: data.user?.email ?? "",
          role: nextRole,
        });
        setProfileEmail(data.user?.email ?? "");
      } catch {
        if (active) {
          setRole("editor");
          setSessionUser(null);
        }
      }
    }

    void loadMe();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visible[0]?.target?.id) {
          setActiveSection(visible[0].target.id);
        }
      },
      {
        root: null,
        rootMargin: "-30% 0px -55% 0px",
        threshold: [0.2, 0.4, 0.6],
      }
    );

    for (const item of navItems) {
      const section = document.getElementById(item.id);
      if (section) observer.observe(section);
    }

    return () => observer.disconnect();
  }, [navItems]);

  useEffect(() => {
    setEditingId(null);
    setQuery("");
    setPage(1);
    setSelectedIds([]);
    setSortMode("updated");
    setSortDirection("desc");
    setError(null);

    const saved = localStorage.getItem(draftStorageKey(resource));
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Record<string, string>;
        setFormValues({ ...buildEmptyValues(resource), ...parsed });
        return;
      } catch {
        // ignore invalid cache
      }
    }

    setFormValues(buildEmptyValues(resource));
  }, [resource]);

  useEffect(() => {
    localStorage.setItem(draftStorageKey(resource), JSON.stringify(formValues));
  }, [formValues, resource]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") {
        event.preventDefault();
        formRef.current?.requestSubmit();
      }

      if (event.key === "Escape") {
        event.preventDefault();
        setEditingId(null);
        setFormValues(buildEmptyValues(resource));
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [resource]);

  useEffect(() => {
    setPage(1);
  }, [query, pageSize]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  useEffect(() => {
    let active = true;

    async function loadResource() {
      setLoadingList(true);
      setError(null);

      try {
        const queryString = new URLSearchParams({
          includeDrafts: "true",
          includeDeleted: includeDeleted ? "true" : "false",
        });
        const response = await fetch(`/api/cv/${resource}?${queryString.toString()}`, {
          cache: "no-store",
        });
        const data = (await response.json()) as CvItem[] | { message?: string };

        if (!response.ok) {
          if (!active) return;
          const messageText = !Array.isArray(data) ? data.message : undefined;
          setError(messageText ?? text.toastLoadFailed);
          pushToast(messageText ?? text.toastLoadFailed, "error");
          setItems([]);
          return;
        }

        if (!active) return;
        setItems(Array.isArray(data) ? data : []);
      } catch {
        if (!active) return;
        setError(text.toastNetworkError);
        pushToast(text.toastNetworkError, "error");
        setItems([]);
      } finally {
        if (active) setLoadingList(false);
      }
    }

    void loadResource();

    return () => {
      active = false;
    };
  }, [resource, refreshTick, includeDeleted, text.toastLoadFailed, text.toastNetworkError]);

  useEffect(() => {
    let active = true;

    async function loadAudit() {
      setLoadingAudit(true);
      try {
        const response = await fetch("/api/audit-logs?limit=12", { cache: "no-store" });
        const data = (await response.json()) as AuditLog[];
        if (!active) return;
        setAuditLogs(Array.isArray(data) ? data : []);
      } catch {
        if (active) setAuditLogs([]);
      } finally {
        if (active) setLoadingAudit(false);
      }
    }

    void loadAudit();

    return () => {
      active = false;
    };
  }, [refreshTick]);

  useEffect(() => {
    if (role !== "admin") {
      setDashboardUsers([]);
      return;
    }

    let active = true;

    async function loadDashboardUsers() {
      setLoadingUsers(true);

      try {
        const response = await fetch("/api/dashboard-users", { cache: "no-store" });
        const data = (await response.json()) as DashboardUser[] | { message?: string };

        if (!active) return;

        if (!response.ok) {
          const messageText = !Array.isArray(data) ? data.message : undefined;
          pushToast(messageText ?? text.toastUsersLoadFailed, "error");
          setDashboardUsers([]);
          return;
        }

        setDashboardUsers(Array.isArray(data) ? data : []);
      } catch {
        if (!active) return;
        pushToast(text.toastUsersNetworkError, "error");
        setDashboardUsers([]);
      } finally {
        if (active) setLoadingUsers(false);
      }
    }

    void loadDashboardUsers();

    return () => {
      active = false;
    };
  }, [role, refreshTick, text.toastUsersLoadFailed, text.toastUsersNetworkError]);

  function handleInputChange(key: string, value: string) {
    setFormValues((prev) => ({ ...prev, [key]: value }));
  }

  function resetForm(infoText?: string) {
    setEditingId(null);
    setFormValues(buildEmptyValues(resource));
    localStorage.removeItem(draftStorageKey(resource));
    setError(null);
    if (infoText) pushToast(infoText, "info");
  }

  async function autoTranslate(textValue: string): Promise<string> {
    if (!textValue.trim() || !autoTranslateEnabled) return textValue;

    try {
      const response = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: textValue, source: "id", target: "en" }),
      });

      if (!response.ok) return textValue;
      const data = (await response.json()) as { translatedText?: string };
      return data.translatedText?.trim() || textValue;
    } catch {
      return textValue;
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

    if (resource === "experiences") {
      const description = stringifyValue(payload.description);
      payload.description_en = await autoTranslate(description);
    }

    if (resource === "educations") {
      const description = stringifyValue(payload.description);
      const manualDescriptionEn = (formValues.description_en ?? "").trim();
      payload.description_en = manualDescriptionEn || (await autoTranslate(description));
    }

    if (resource === "projects") {
      const title = stringifyValue(payload.title);
      const description = stringifyValue(payload.description);
      payload.title_en = await autoTranslate(title);
      payload.description_en = await autoTranslate(description);
    }

    if (resource === "blogs") {
      const title = stringifyValue(payload.title);
      const excerpt = stringifyValue(payload.excerpt);
      const content = stringifyValue(payload.content);

      const manualTitleEn = (formValues.title_en ?? "").trim();
      const manualExcerptEn = (formValues.excerpt_en ?? "").trim();
      const manualContentEn = (formValues.content_en ?? "").trim();

      payload.title_en = manualTitleEn || (await autoTranslate(title));
      payload.excerpt_en = manualExcerptEn || (await autoTranslate(excerpt));
      payload.content_en = manualContentEn || (await autoTranslate(content));
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = (await response.json().catch(() => null)) as { message?: string } | null;

      if (!response.ok) {
        const msg = data?.message ?? text.toastSaveFailed;
        setError(msg);
        pushToast(msg, "error");
        return;
      }

      const successMessage = editingId ? text.toastSavedUpdate : text.toastSavedCreate;
      resetForm(successMessage);
      pushToast(successMessage, "success");
      setIsEditorOpen(false);
      setRefreshTick((value) => value + 1);
    } catch {
      setError(text.toastNetworkError);
      pushToast(text.toastNetworkError, "error");
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
    setIsEditorOpen(true);
    pushToast(`${text.toastEditMode} ${item.id.slice(0, 8)}...`, "info");
  }

  async function handleDelete() {
    if (!deleteTarget) return;

    setDeleting(true);
    setError(null);

    try {
      const response = await fetch(`/api/cv/${resource}/${deleteTarget.id}`, { method: "DELETE" });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { message?: string } | null;
        const msg = data?.message ?? text.toastDeleteFailed;
        setError(msg);
        pushToast(msg, "error");
        return;
      }

      if (editingId === deleteTarget.id) {
        resetForm(text.toastEditedDeleted);
      }
      setDeleteTarget(null);
      pushToast(text.toastDeleted, "success");
      setRefreshTick((value) => value + 1);
    } catch {
      setError(text.toastNetworkError);
      pushToast(text.toastNetworkError, "error");
    } finally {
      setDeleting(false);
    }
  }

  async function handleRestore(item: CvItem) {
    try {
      const response = await fetch(`/api/cv/${resource}/${item.id}/restore`, { method: "POST" });
      const data = (await response.json().catch(() => null)) as { message?: string } | null;
      if (!response.ok) {
        pushToast(data?.message ?? text.toastRestoreFailed, "error");
        return;
      }
      pushToast(text.toastRestored, "success");
      setRefreshTick((value) => value + 1);
    } catch {
      pushToast(text.toastNetworkError, "error");
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

      if (successCount > 0) pushToast(`${successCount} item berhasil dihapus.`, "success");
      if (failedNetwork + failedHttp > 0) {
        pushToast(`${failedNetwork + failedHttp} item gagal dihapus.`, "error");
      }

      setSelectedIds([]);
      setBulkDeleteOpen(false);
      setRefreshTick((value) => value + 1);
    } catch {
      pushToast(text.toastBulkFailed, "error");
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

  function handleExportJson() {
    const content = JSON.stringify(sortedItems, null, 2);
    const blob = new Blob([content], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${resource}-export.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  function handleExportCsv() {
    if (!sortedItems.length) {
      pushToast(text.toastNoExportData, "info");
      return;
    }

    const keys = Array.from(new Set(sortedItems.flatMap((item) => Object.keys(item))));
    const rows = [
      keys.join(","),
      ...sortedItems.map((item) =>
        keys
          .map((key) => {
            const value = stringifyValue(item[key]).replaceAll('"', '""');
            return `"${value}"`;
          })
          .join(",")
      ),
    ];

    const blob = new Blob([rows.join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${resource}-export.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  async function handleImportFile(file: File) {
    try {
      const textContent = await file.text();
      const parsed = JSON.parse(textContent) as Record<string, unknown>[];
      const itemsToImport = Array.isArray(parsed) ? parsed : [];

      if (!itemsToImport.length) {
        pushToast(text.toastImportInvalid, "error");
        return;
      }

      let successCount = 0;
      let failedCount = 0;

      for (const row of itemsToImport) {
        const rowId = typeof row.id === "string" ? row.id : null;
        const endpoint = rowId ? `/api/cv/${resource}/${rowId}` : `/api/cv/${resource}`;
        const method = rowId ? "PATCH" : "POST";

        try {
          const response = await fetch(endpoint, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(row),
          });

          if (response.ok) {
            successCount += 1;
          } else {
            failedCount += 1;
          }
        } catch {
          failedCount += 1;
        }
      }

      if (successCount) pushToast(`${successCount} item berhasil diimport.`, "success");
      if (failedCount) pushToast(`${failedCount} item gagal diimport.`, "error");
      setRefreshTick((value) => value + 1);
    } catch {
      pushToast(text.toastImportReadFailed, "error");
    }
  }

  async function handleTranslatePreview() {
    if (!autoTranslateEnabled) {
      pushToast(text.toastTranslateOff, "info");
      return;
    }

    if ((resource === "projects" || resource === "blogs") && formValues.title) {
      const translated = await autoTranslate(formValues.title);
      pushToast(`Preview title EN: ${translated.slice(0, 40)}${translated.length > 40 ? "..." : ""}`, "info");
      return;
    }

    if (formValues.description) {
      const translated = await autoTranslate(formValues.description);
      pushToast(`Preview EN: ${translated.slice(0, 40)}${translated.length > 40 ? "..." : ""}`, "info");
      return;
    }

    pushToast(text.toastTranslateFill, "info");
  }

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      router.push("/auth");
      router.refresh();
    }
  }

  async function handleUpdateUserRole(userId: string, nextRole: UserRole) {
    setUpdatingUserId(userId);

    try {
      const response = await fetch(`/api/dashboard-users/${userId}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: nextRole }),
      });

      const data = (await response.json().catch(() => null)) as
        | { message?: string; user?: DashboardUser }
        | null;

      if (!response.ok) {
        pushToast(data?.message ?? text.toastRoleUpdateFailed, "error");
        return;
      }

      pushToast(text.toastRoleUpdated, "success");
      setDashboardUsers((prev) =>
        prev.map((item) => (item.id === userId ? { ...item, role: nextRole } : item))
      );
      setRefreshTick((value) => value + 1);
    } catch {
      pushToast(text.toastUsersNetworkError, "error");
    } finally {
      setUpdatingUserId(null);
    }
  }

  async function handleProfileSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (profileNewPassword && profileNewPassword !== profileConfirmPassword) {
      pushToast(text.toastConfirmPasswordMismatch, "error");
      return;
    }

    setUpdatingProfile(true);

    try {
      const response = await fetch("/api/auth/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: profileEmail,
          currentPassword: profileCurrentPassword,
          newPassword: profileNewPassword,
        }),
      });

      const data = (await response.json().catch(() => null)) as
        | { message?: string; user?: SessionUser }
        | null;

      if (!response.ok) {
        pushToast(data?.message ?? text.toastProfileUpdateFailed, "error");
        return;
      }

      if (data?.user) {
        setSessionUser(data.user);
        setRole(data.user.role);
        setProfileEmail(data.user.email);
      }

      setProfileCurrentPassword("");
      setProfileNewPassword("");
      setProfileConfirmPassword("");
      setIsProfileOpen(false);
      pushToast(data?.message ?? text.toastProfileUpdated, "success");
    } catch {
      pushToast(text.toastNetworkError, "error");
    } finally {
      setUpdatingProfile(false);
    }
  }

  function handleNavClick(event: MouseEvent<HTMLAnchorElement>, id: string) {
    event.preventDefault();
    const section = document.getElementById(id);
    if (!section) return;

    setActiveSection(id);
    section.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <main className="min-h-screen scroll-smooth bg-bg-primary text-text-primary px-4 py-8 sm:px-6 lg:px-6">
      <div className="mx-auto w-full max-w-[1560px] lg:grid lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-4 xl:grid-cols-[230px_minmax(0,1fr)] xl:gap-6">
        <aside className="h-fit rounded-3xl border border-border bg-linear-to-b from-bg-card via-bg-card to-accent-soft/20 p-4 shadow-sm sm:p-5 lg:sticky lg:top-6">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-text-secondary">{text.navTitle}</p>

          <div className="mt-3 rounded-xl border border-border bg-bg-primary/65 p-3">
            <div className="flex items-center justify-between text-[11px] font-semibold text-text-secondary">
              <span>{text.navProgress}</span>
              <span>{navProgressPercent}%</span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-bg-card">
              <div
                className="h-full rounded-full bg-linear-to-r from-accent via-emerald-400 to-sky-400 transition-all duration-500"
                style={{ width: `${navProgressPercent}%` }}
              />
            </div>
            <p className="mt-2 text-[11px] text-text-secondary">
              {text.navActiveNow}: <span className="font-semibold text-text-primary">{navItems[activeNavIndex]?.label}</span>
            </p>
          </div>

          <nav className="mt-3 space-y-1.5">
            {navItems.map((item) => {
              const isActive = item.id === activeSection;
              return (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  onClick={(event) => handleNavClick(event, item.id)}
                  className={`flex items-center justify-between rounded-xl border px-3 py-2 text-xs font-semibold transition-all duration-200 ${
                    isActive
                      ? "border-accent/50 bg-accent/15 text-accent shadow-sm"
                      : "border-border text-text-secondary hover:bg-accent-soft hover:text-text-primary"
                  }`}
                >
                  <span>{item.label}</span>
                  <ChevronRight size={13} className={isActive ? "opacity-100" : "opacity-50"} />
                </a>
              );
            })}
          </nav>

          <div className="mt-4 rounded-xl border border-border bg-bg-primary/60 p-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-text-secondary">{text.quickAccess}</p>
            <p className="mt-2 text-xs text-text-secondary">{text.emailLabel}</p>
            <p className="text-xs font-semibold break-all">{sessionUser?.email || "-"}</p>
            <p className="mt-2 text-xs text-text-secondary">{text.roleLabel}</p>
            <p className="text-xs font-semibold uppercase">{sessionUser?.role || role}</p>
          </div>
        </aside>

        <div className="mt-6 space-y-6 lg:mt-0">
        <header id="section-overview" className="rounded-3xl border border-border bg-linear-to-br from-bg-card via-bg-card to-accent-soft/30 p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-text-secondary">{text.adminControl}</p>
              <h1 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-4xl">{text.title}</h1>
              <p className="mt-2 max-w-2xl text-sm text-text-secondary sm:text-base">{text.subtitle}</p>
              <p className="mt-2 text-xs text-text-secondary">
                {text.activeRole}: {role.toUpperCase()}
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

          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-4">
            <article className="rounded-2xl border border-border bg-bg-card p-4">
              <p className="text-xs text-text-secondary">{text.activeResource}</p>
              <div className="mt-2 flex items-center gap-2">
                <span className={`inline-flex rounded-lg border px-2 py-1 text-xs font-semibold ${meta.accentClass}`}>
                  <Icon size={14} />
                </span>
                <p className="text-base font-bold">{meta.label}</p>
              </div>
            </article>

            <article className="rounded-2xl border border-border bg-bg-card p-4">
              <p className="text-xs text-text-secondary">{text.totalItems}</p>
              <p className="mt-2 text-2xl font-extrabold">{items.length}</p>
            </article>

            <article className="rounded-2xl border border-border bg-bg-card p-4">
              <p className="text-xs text-text-secondary">{text.selection}</p>
              <p className="mt-2 text-2xl font-extrabold">{selectedIds.length}</p>
            </article>

            <article className="rounded-2xl border border-border bg-bg-card p-4">
              <p className="text-xs text-text-secondary">{text.workflow}</p>
              <p className="mt-2 text-sm font-semibold text-text-secondary">{text.workflowHint}</p>
            </article>
          </div>
        </header>

        <section id="section-resource" className="rounded-2xl border border-border bg-bg-card p-4 sm:p-5">
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

        <section className="space-y-6">
            <section id="section-data" className="rounded-2xl border border-border bg-bg-card p-5 sm:p-6">
              <div className="space-y-3">
                <div className="rounded-2xl border border-border bg-linear-to-br from-bg-primary via-bg-primary to-accent-soft/25 p-3 sm:p-4">
                  <div id="section-editor" className="flex flex-col gap-3">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-text-secondary">{text.editorDrawerTitle}</p>
                        <h2 className="text-lg font-bold">Data {meta.label}</h2>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex h-fit rounded-full border border-border bg-bg-card px-2.5 py-1 text-[11px] font-semibold text-text-secondary">
                        {sortedItems.length} {text.itemLabel}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingId(null);
                          setFormValues(buildEmptyValues(resource));
                          setError(null);
                          setIsEditorOpen(true);
                        }}
                        className="inline-flex h-9 items-center gap-2 rounded-xl bg-accent px-3.5 text-xs font-semibold text-white"
                      >
                        <Plus size={13} />
                        {text.addNewData}
                      </button>
                        <button
                          type="button"
                          onClick={() => setIsEditorOpen(true)}
                          className="inline-flex h-9 items-center gap-2 rounded-xl border border-border bg-bg-primary px-3.5 text-xs font-semibold hover:bg-accent-soft"
                        >
                          <Pencil size={13} />
                          {text.openEditor}
                        </button>
                      </div>
                    </div>

                    <p className="text-xs text-text-secondary sm:whitespace-nowrap">
                      {text.dataSubtitle} • {text.dataHeaderHint} • {text.editorDeckHint}
                    </p>
                  </div>

                  <div className="mt-3 grid grid-cols-1 gap-2 lg:grid-cols-[minmax(0,1fr)_170px_140px]">
                    <label className="relative block">
                      <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
                      <input
                        type="text"
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder={text.searchPlaceholder}
                        className="h-11 w-full rounded-xl border border-border bg-bg-card py-2 pl-9 pr-3 text-sm outline-none transition-colors focus:border-accent"
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
                      className="h-11 rounded-xl border border-border bg-bg-card px-3 py-2 text-sm font-semibold outline-none transition-colors focus:border-accent"
                    >
                      <option value="updated:desc">{text.sortNewest}</option>
                      <option value="updated:asc">{text.sortOldest}</option>
                      <option value="title:asc">{text.sortTitleAsc}</option>
                      <option value="title:desc">{text.sortTitleDesc}</option>
                    </select>

                    <select
                      value={pageSize}
                      onChange={(event) => setPageSize(Number(event.target.value))}
                      className="h-11 rounded-xl border border-border bg-bg-card px-3 py-2 text-sm font-semibold outline-none transition-colors focus:border-accent"
                    >
                      <option value={8}>8 / {text.pageUnit}</option>
                      <option value={12}>12 / {text.pageUnit}</option>
                      <option value={20}>20 / {text.pageUnit}</option>
                    </select>
                  </div>
                </div>

                <div className="rounded-2xl border border-border bg-bg-primary/55 p-2.5 sm:p-3">
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-text-secondary">{text.actionTools}</p>
                  <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={toggleSelectAllOnPage}
                    className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-border bg-bg-card px-3 text-xs font-semibold transition-colors hover:bg-accent-soft"
                  >
                    <CheckSquare size={13} />
                    {text.toggleSelectPage}
                  </button>

                  <button
                    type="button"
                    onClick={handleExportJson}
                    className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-border bg-bg-card px-3 text-xs font-semibold transition-colors hover:bg-accent-soft"
                  >
                    <Download size={13} />
                    {text.exportJson}
                  </button>

                  <button
                    type="button"
                    onClick={handleExportCsv}
                    className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-border bg-bg-card px-3 text-xs font-semibold transition-colors hover:bg-accent-soft"
                  >
                    <Download size={13} />
                    {text.exportCsv}
                  </button>

                  <button
                    type="button"
                    onClick={() => importInputRef.current?.click()}
                    className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-border bg-bg-card px-3 text-xs font-semibold transition-colors hover:bg-accent-soft"
                  >
                    <Upload size={13} />
                    {text.importJson}
                  </button>
                  <input
                    ref={importInputRef}
                    type="file"
                    accept="application/json"
                    className="hidden"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) {
                        void handleImportFile(file);
                      }
                      event.currentTarget.value = "";
                    }}
                  />

                  <button
                    type="button"
                    onClick={() => setIncludeDeleted((prev) => !prev)}
                    className={`inline-flex h-9 items-center gap-1.5 rounded-xl border px-3 text-xs font-semibold transition-colors ${
                      includeDeleted
                        ? "border-amber-500/40 bg-amber-500/12 text-amber-500"
                        : "border-border bg-bg-card text-text-secondary hover:bg-accent-soft"
                    }`}
                  >
                    {includeDeleted ? text.hideTrash : text.showTrash}
                  </button>

                  {selectedIds.length > 0 && role === "admin" && (
                    <button
                      type="button"
                      onClick={() => setBulkDeleteOpen(true)}
                      className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-red-500/40 bg-red-500/5 px-3 text-xs font-semibold text-red-500 transition-colors hover:bg-red-500/10"
                    >
                      <Trash2 size={13} />
                      {text.deleteSelected} {selectedIds.length} {text.itemLabel}
                    </button>
                  )}
                </div>
                </div>
              </div>

              {loadingList ? (
                <div className="mt-4 rounded-xl border border-border p-8 text-center text-sm text-text-secondary">{text.loading}</div>
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
                    const deleted = Boolean(item.deleted_at);
                    const status = (item.status as WorkflowStatus | undefined) ?? "draft";

                    return (
                      <article
                        key={item.id}
                        className="rounded-2xl border border-border bg-bg-primary/65 p-4 transition-colors hover:bg-accent-soft/30"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h3 className="truncate text-sm font-bold sm:text-base">{title || text.noTitle}</h3>
                            <p className="mt-0.5 truncate text-xs text-text-secondary">{subtitle}</p>
                          </div>

                          <input
                            type="checkbox"
                            checked={selectedIds.includes(item.id)}
                            onChange={() => toggleSelectItem(item.id)}
                            className="h-4 w-4 rounded border-border"
                          />
                        </div>

                        <div className="mt-2 flex flex-wrap gap-1.5">
                          <span className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${statusBadgeClass(status)}`}>
                            {status.toUpperCase()}
                          </span>
                          {deleted && (
                            <span className="rounded-full border border-red-500/40 bg-red-500/10 px-2 py-0.5 text-[11px] font-semibold text-red-500">
                              TRASH
                            </span>
                          )}
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
                            <span className="text-[11px] text-text-secondary">{text.noTags}</span>
                          )}
                        </div>

                        <div className="mt-4 flex items-center justify-between gap-2">
                          <span className="text-[11px] text-text-secondary">
                            {text.updated}: {formatDateLabel(item.updated_at ?? item.created_at)}
                          </span>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => startEdit(item)}
                              className="inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-xs font-semibold hover:bg-accent-soft"
                            >
                              <Pencil size={12} />
                              {text.edit}
                            </button>

                            {deleted && role === "admin" ? (
                              <button
                                type="button"
                                onClick={() => void handleRestore(item)}
                                className="inline-flex items-center gap-1 rounded-lg border border-emerald-500/40 px-2.5 py-1.5 text-xs font-semibold text-emerald-500 hover:bg-emerald-500/10"
                              >
                                <Undo2 size={12} />
                                {text.restore}
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setDeleteTarget(item)}
                                disabled={role !== "admin"}
                                className="inline-flex items-center gap-1 rounded-lg border border-red-500/40 px-2.5 py-1.5 text-xs font-semibold text-red-500 hover:bg-red-500/10 disabled:opacity-40"
                              >
                                <Trash2 size={12} />
                                {text.delete}
                              </button>
                            )}
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}

              <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-text-secondary">
                  {text.showing} {pageStart}-{pageEnd} {text.of} {sortedItems.length} {text.itemLabel} ({text.total} {items.length}).
                </p>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPage((value) => Math.max(1, value - 1))}
                    disabled={page <= 1}
                    className="rounded-lg border border-border px-2.5 py-1.5 text-xs font-semibold disabled:opacity-50"
                  >
                    {text.prev}
                  </button>
                  <span className="text-xs text-text-secondary">
                    {text.pageLabel} {page} / {totalPages}
                  </span>
                  <button
                    type="button"
                    onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
                    disabled={page >= totalPages}
                    className="rounded-lg border border-border px-2.5 py-1.5 text-xs font-semibold disabled:opacity-50"
                  >
                    {text.next}
                  </button>
                </div>
              </div>
            </section>

            <section id="section-profile" className="rounded-2xl border border-border bg-bg-card p-5 sm:p-6">
              <div className="mb-3 flex items-center gap-2">
                <User size={16} className="text-accent" />
                <h3 className="text-sm font-bold">{text.sessionTitle}</h3>
              </div>
              <p className="text-xs text-text-secondary">{text.sessionHint}</p>
              <p className="mt-1 text-[11px] text-text-secondary">{text.profileCardHint}</p>

              <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                <article className="rounded-xl border border-border bg-bg-primary/60 px-3 py-2 text-xs">
                  <p className="text-text-secondary">{text.emailLabel}</p>
                  <p className="font-semibold break-all">{sessionUser?.email || "-"}</p>
                </article>
                <article className="rounded-xl border border-border bg-bg-primary/60 px-3 py-2 text-xs">
                  <p className="text-text-secondary">{text.roleLabel}</p>
                  <p className="font-semibold uppercase">{sessionUser?.role || role}</p>
                </article>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setIsProfileOpen(true)}
                  className="inline-flex h-10 items-center gap-2 rounded-xl bg-accent px-4 text-sm font-semibold text-white"
                >
                  <Pencil size={14} />
                  {text.openProfileEditor}
                </button>
              </div>
            </section>

            <section id="section-activity" className="rounded-2xl border border-border bg-bg-card p-5 sm:p-6">
              <div className="mb-3 flex items-center gap-2">
                <History size={16} className="text-accent" />
                <h3 className="text-sm font-bold">{text.activityLog}</h3>
              </div>

              {loadingAudit ? (
                <p className="text-xs text-text-secondary">{text.loadingAudit}</p>
              ) : auditLogs.length === 0 ? (
                <p className="text-xs text-text-secondary">{text.emptyAudit}</p>
              ) : (
                <div className="space-y-2">
                  {auditLogs.map((log) => (
                    <article key={log.id} className="rounded-xl border border-border bg-bg-primary/60 px-3 py-2 text-xs">
                      <p className="font-semibold text-text-primary">
                        {log.action.toUpperCase()} {log.resource} {log.resource_id ? `(${log.resource_id.slice(0, 8)}...)` : ""}
                      </p>
                      <p className="text-text-secondary">
                        {log.user_email ?? text.unknownUser} [{log.user_role ?? "-"}] • {formatDateLabel(log.created_at)}
                      </p>
                    </article>
                  ))}
                </div>
              )}
            </section>

            {role === "admin" && (
              <section id="section-users" className="rounded-2xl border border-border bg-bg-card p-5 sm:p-6">
                <div className="mb-3 flex items-center gap-2">
                  <Shield size={16} className="text-accent" />
                  <h3 className="text-sm font-bold">{text.userManagement}</h3>
                </div>

                {loadingUsers ? (
                  <p className="text-xs text-text-secondary">{text.loadingUsers}</p>
                ) : dashboardUsers.length === 0 ? (
                  <p className="text-xs text-text-secondary">{text.emptyUsers}</p>
                ) : (
                  <div className="space-y-2">
                    {dashboardUsers.map((user) => {
                      const canPromote = user.role === "editor";
                      const canDemote = user.role === "admin";

                      return (
                        <article
                          key={user.id}
                          className="rounded-xl border border-border bg-bg-primary/60 px-3 py-2 text-xs"
                        >
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                              <p className="font-semibold text-text-primary break-all">{user.email}</p>
                              <p className="text-text-secondary">
                                {text.roleLabel}: <span className="uppercase">{user.role}</span> • {text.joinDate}: {formatDateLabel(user.created_at)}
                              </p>
                            </div>

                            <div className="flex gap-2">
                              <button
                                type="button"
                                disabled={!canPromote || updatingUserId === user.id}
                                onClick={() => void handleUpdateUserRole(user.id, "admin")}
                                className="rounded-lg border border-blue-500/40 px-2.5 py-1.5 text-[11px] font-semibold text-blue-500 hover:bg-blue-500/10 disabled:opacity-40"
                              >
                                {text.promoteAdmin}
                              </button>

                              <button
                                type="button"
                                disabled={!canDemote || updatingUserId === user.id}
                                onClick={() => void handleUpdateUserRole(user.id, "editor")}
                                className="rounded-lg border border-amber-500/40 px-2.5 py-1.5 text-[11px] font-semibold text-amber-500 hover:bg-amber-500/10 disabled:opacity-40"
                              >
                                {text.demoteEditor}
                              </button>
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                )}
              </section>
            )}
          </section>

        {isEditorOpen && (
          <div className="fixed inset-0 z-80">
            <button
              type="button"
              aria-label="Close editor overlay"
              onClick={() => setIsEditorOpen(false)}
              className="absolute inset-0 bg-black/55"
            />
            <aside className="absolute right-0 top-0 h-full w-full max-w-xl overflow-y-auto border-l border-border bg-linear-to-b from-bg-card via-bg-card to-accent-soft/20 p-4 shadow-2xl sm:p-5">
              <div className="rounded-2xl border border-border bg-bg-primary/55 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="inline-flex items-center rounded-full border border-accent/40 bg-accent/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-accent">
                      {meta.label} Editor
                    </p>
                    <h2 className="mt-3 text-xl font-black tracking-tight">Form {meta.label}</h2>
                    <p className="mt-1 text-xs leading-relaxed text-text-secondary">{text.formSubtitle}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsEditorOpen(false)}
                    className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-border bg-bg-card px-3 text-xs font-semibold hover:bg-accent-soft"
                  >
                    <X size={13} />
                    {text.closeEditor}
                  </button>
                </div>
              </div>

              <div className="mt-4 rounded-2xl border border-border bg-bg-primary/45 p-3">
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-text-secondary">Automation</p>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setAutoTranslateEnabled((prev) => !prev)}
                    className={`rounded-xl border px-3 py-1.5 text-xs font-semibold transition-colors ${
                      autoTranslateEnabled
                        ? "border-blue-500/50 bg-blue-500/15 text-blue-500"
                        : "border-border bg-bg-card text-text-secondary"
                    }`}
                  >
                    {text.autoTranslateLabel}: {autoTranslateEnabled ? text.on : text.off}
                  </button>
                  <button
                    type="button"
                    onClick={handleTranslatePreview}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-bg-card px-3 py-1.5 text-xs font-semibold transition-colors hover:bg-accent-soft"
                  >
                    <WandSparkles size={13} />
                    {text.translatePreview}
                  </button>
                </div>
              </div>

              <form ref={formRef} onSubmit={handleSubmit} className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {currentFields.map((field) => (
                  <div key={field.key} className={field.type === "textarea" || field.key === "tags" ? "sm:col-span-2" : ""}>
                    <label className="mb-1 block text-xs font-semibold text-text-secondary">
                      {field.label} {field.optional ? text.optionalSuffix : "*"}
                    </label>

                    {field.type === "textarea" ? (
                      <textarea
                        rows={4}
                        value={formValues[field.key] ?? ""}
                        onChange={(event) => handleInputChange(field.key, event.target.value)}
                        placeholder={field.optional ? text.optionalPlaceholder : text.requiredPlaceholder}
                        className="w-full rounded-2xl border border-border bg-bg-primary/90 px-3 py-2.5 text-sm outline-none transition-colors focus:border-accent"
                        required={!field.optional}
                      />
                    ) : field.type === "select" ? (
                      <select
                        value={formValues[field.key] ?? ""}
                        onChange={(event) => handleInputChange(field.key, event.target.value)}
                        className="h-11 w-full rounded-2xl border border-border bg-bg-primary/90 px-3 py-2 text-sm font-semibold outline-none transition-colors focus:border-accent"
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
                        placeholder={field.optional ? text.optionalPlaceholder : text.requiredPlaceholder}
                        className="h-11 w-full rounded-2xl border border-border bg-bg-primary/90 px-3 py-2 text-sm outline-none transition-colors focus:border-accent"
                        required={!field.optional}
                      />
                    )}
                  </div>
                ))}

                <p className="sm:col-span-2 rounded-xl border border-blue-500/30 bg-blue-500/10 px-3 py-2 text-xs leading-relaxed text-blue-500">
                  {text.autoTranslateHint}
                </p>

                {error && <p className="sm:col-span-2 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-500">{error}</p>}

                <div className="sm:col-span-2 mt-1 rounded-2xl border border-border bg-bg-primary/45 p-2.5">
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="inline-flex h-11 items-center gap-2 rounded-2xl bg-accent px-4 text-sm font-semibold text-white shadow-sm disabled:opacity-60"
                    >
                      {editingId ? <Pencil size={14} /> : <Plus size={14} />}
                      {submitting ? text.processing : editingId ? text.saveUpdate : text.saveAdd}
                    </button>

                    <button
                      type="button"
                      onClick={() => resetForm(text.toastFormCleared)}
                      className="inline-flex h-11 items-center gap-2 rounded-2xl border border-border bg-bg-card px-4 text-sm font-semibold transition-colors hover:bg-accent-soft"
                    >
                      <X size={14} />
                      {text.resetForm}
                    </button>
                  </div>
                </div>
              </form>
            </aside>
          </div>
        )}

        {isProfileOpen && (
          <div className="fixed inset-0 z-80">
            <button
              type="button"
              aria-label="Close profile overlay"
              onClick={() => setIsProfileOpen(false)}
              className="absolute inset-0 bg-black/55"
            />
            <aside className="absolute right-0 top-0 h-full w-full max-w-xl overflow-y-auto border-l border-border bg-linear-to-b from-bg-card via-bg-card to-accent-soft/20 p-4 shadow-2xl sm:p-5">
              <div className="rounded-2xl border border-border bg-bg-primary/55 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="inline-flex items-center rounded-full border border-accent/40 bg-accent/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-accent">
                      {text.profileDrawerTitle}
                    </p>
                    <h2 className="mt-3 text-xl font-black tracking-tight">{text.sessionTitle}</h2>
                    <p className="mt-1 text-xs leading-relaxed text-text-secondary">{text.sessionHint}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsProfileOpen(false)}
                    className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-border bg-bg-card px-3 text-xs font-semibold hover:bg-accent-soft"
                  >
                    <X size={13} />
                    {text.closeProfileEditor}
                  </button>
                </div>
              </div>

              <form onSubmit={handleProfileSubmit} className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-xs font-semibold text-text-secondary">{text.emailLabel}</label>
                  <input
                    type="email"
                    value={profileEmail}
                    onChange={(event) => setProfileEmail(event.target.value)}
                    className="h-11 w-full rounded-2xl border border-border bg-bg-primary/90 px-3 py-2 text-sm outline-none transition-colors focus:border-accent"
                    required
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-text-secondary">{text.currentPasswordLabel}</label>
                  <input
                    type="password"
                    value={profileCurrentPassword}
                    onChange={(event) => setProfileCurrentPassword(event.target.value)}
                    className="h-11 w-full rounded-2xl border border-border bg-bg-primary/90 px-3 py-2 text-sm outline-none transition-colors focus:border-accent"
                    placeholder={text.requiredPlaceholder}
                    required
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-text-secondary">{text.newPasswordLabel}</label>
                  <input
                    type="password"
                    value={profileNewPassword}
                    onChange={(event) => setProfileNewPassword(event.target.value)}
                    className="h-11 w-full rounded-2xl border border-border bg-bg-primary/90 px-3 py-2 text-sm outline-none transition-colors focus:border-accent"
                    placeholder={text.optionalPlaceholder}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-1 block text-xs font-semibold text-text-secondary">{text.confirmPasswordLabel}</label>
                  <input
                    type="password"
                    value={profileConfirmPassword}
                    onChange={(event) => setProfileConfirmPassword(event.target.value)}
                    className="h-11 w-full rounded-2xl border border-border bg-bg-primary/90 px-3 py-2 text-sm outline-none transition-colors focus:border-accent"
                    placeholder={text.optionalPlaceholder}
                    disabled={!profileNewPassword}
                  />
                </div>

                <div className="sm:col-span-2 mt-1 rounded-2xl border border-border bg-bg-primary/45 p-2.5">
                  <button
                    type="submit"
                    disabled={updatingProfile}
                    className="inline-flex h-11 items-center gap-2 rounded-2xl bg-accent px-4 text-sm font-semibold text-white shadow-sm disabled:opacity-60"
                  >
                    <Save size={14} />
                    {updatingProfile ? text.profileSaving : text.profileSave}
                  </button>
                </div>
              </form>
            </aside>
          </div>
        )}

        {deleteTarget && (
          <div className="fixed inset-0 z-90 flex items-center justify-center bg-black/55 px-4">
            <div className="w-full max-w-md rounded-2xl border border-border bg-bg-card p-5 shadow-2xl sm:p-6">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 rounded-xl border border-red-500/30 bg-red-500/10 p-2 text-red-500">
                  <AlertTriangle size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold">{text.deleteConfirmTitle}</h3>
                  <p className="mt-1 text-sm text-text-secondary">{text.deleteConfirmDesc}</p>
                  <p className="mt-2 rounded-lg bg-bg-primary px-3 py-2 text-xs text-text-secondary break-all">{text.idLabel}: {deleteTarget.id}</p>
                </div>
              </div>

              <div className="mt-5 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setDeleteTarget(null)}
                  disabled={deleting}
                  className="rounded-xl border border-border px-4 py-2 text-sm font-semibold disabled:opacity-50"
                >
                  {text.cancel}
                </button>
                <button
                  type="button"
                  onClick={() => void handleDelete()}
                  disabled={deleting}
                  className="rounded-xl bg-red-500 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                >
                  {deleting ? text.deletingLabel : text.deleteYes}
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
                  <h3 className="text-base font-bold">{text.bulkDeleteTitle}</h3>
                  <p className="mt-1 text-sm text-text-secondary">{bulkDeleteDesc}</p>
                </div>
              </div>

              <div className="mt-5 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setBulkDeleteOpen(false)}
                  disabled={bulkDeleting}
                  className="rounded-xl border border-border px-4 py-2 text-sm font-semibold disabled:opacity-50"
                >
                  {text.cancel}
                </button>
                <button
                  type="button"
                  onClick={() => void handleBulkDelete()}
                  disabled={bulkDeleting}
                  className="rounded-xl bg-red-500 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                >
                  {bulkDeleting ? text.deletingLabel : text.deleteAllYes}
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
      </div>
    </main>
  );
}
