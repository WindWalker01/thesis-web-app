"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import {
  AlertTriangle,
  RefreshCw,
  Users,
  Search,
  ChevronDown,
  Download,
  Filter,
  MoreHorizontal,
  Eye,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldAlert,
  Verified,
  Ban,
  UserX,
  UserCheck,
  KeyRound,
  Bell,
  Trash2,
  Send,
  ChevronLeft,
  ChevronRight,
  Loader2,
  ImageIcon,
  X,
} from "lucide-react";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  getFilteredRowModel,
  type SortingState,
  type ColumnDef,
  type OnChangeFn,
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useUserManagement, useUserManagementStats } from "../hooks/useUserManagement";
import {
  useUserDetail,
  useUserArtworks,
  useUserReports,
  useUserBlockchainActivity,
  useUserTimeline,
} from "../hooks/useUserDetail";
import { useAdminActions } from "../hooks/useAdminActions";
import { exportUsersCSV } from "../server/export";
import { cn } from "@/lib/client-utils";
import { UserManagementSkeleton } from "./page-skeleton";
import type {
  UserRow,
  UserManagementStats,
  UserFilters,
  UserSortOption,
  AccountStatus,
  SendNotificationPayload,
} from "../types";

export default function UserManagementPage() {
  // ── State ──
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(50);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState<UserFilters>({
    role: "all",
    account_status: "all",
    is_verified: null,
    has_reports: null,
    has_uploaded_artwork: null,
    has_blockchain_registrations: null,
    date_from: null,
    date_to: null,
  });
  const [sort, setSort] = useState<UserSortOption>("newest");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [bulkSelection, setBulkSelection] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState("profile");

  // Dialog states
  const [suspendDialogOpen, setSuspendDialogOpen] = useState(false);
  const [banDialogOpen, setBanDialogOpen] = useState(false);
  const [verifyDialogOpen, setVerifyDialogOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [notificationDialogOpen, setNotificationDialogOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{
    title: string;
    description: string;
    onConfirm: () => void;
  } | null>(null);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // ── Queries ──
  const { users, totalCount, pageCount, isLoading, error, refetch } =
    useUserManagement({
      page,
      perPage,
      search: debouncedSearch,
      filters,
      sort,
    });

  const { stats, isLoading: statsLoading } = useUserManagementStats();

  const {
    user: selectedUser,
    isLoading: userLoading,
  } = useUserDetail(selectedUserId);

  const {
    artworks,
    isLoading: artworksLoading,
  } = useUserArtworks(drawerOpen ? selectedUserId : null);

  const {
    reports,
    isLoading: reportsLoading,
  } = useUserReports(drawerOpen ? selectedUserId : null);

  const {
    activities: blockchainActivities,
    isLoading: blockchainLoading,
  } = useUserBlockchainActivity(drawerOpen ? selectedUserId : null);

  const {
    events: timelineEvents,
    isLoading: timelineLoading,
  } = useUserTimeline(drawerOpen ? selectedUserId : null);

  const actions = useAdminActions();

  // ── Derived sort from TanStack sorting ──
  // Map column sorting to our sort option
  const handleSortChange = useCallback((newSorting: SortingState) => {
    setSorting(newSorting);
    if (newSorting.length > 0) {
      const col = newSorting[0].id;
      const desc = newSorting[0].desc;
      if (col === "created_at") setSort(desc ? "newest" : "oldest");
      else if (col === "last_active") setSort("most_active");
      else if (col === "last_name") setSort("alphabetical");
      else setSort("newest");
    }
  }, []);

  const sortOption = useMemo(() => {
    if (sorting.length === 0) return sort;
    return sort;
  }, [sorting, sort]);

  // ── Table Columns ──
  const columns = useMemo<ColumnDef<UserRow>[]>(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) => {
              table.toggleAllPageRowsSelected(!!value);
              if (value) {
                setBulkSelection(new Set(users.map((u) => u.id)));
              } else {
                setBulkSelection(new Set());
              }
            }}
            aria-label="Select all"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => {
              row.toggleSelected(!!value);
              setBulkSelection((prev) => {
                const next = new Set(prev);
                if (value) next.add(row.original.id);
                else next.delete(row.original.id);
                return next;
              });
            }}
            aria-label="Select row"
          />
        ),
        enableSorting: false,
        enableHiding: false,
        size: 40,
      },
      {
        id: "user",
        header: "User",
        accessorFn: (row) => `${row.last_name}, ${row.first_name}`,
        cell: ({ row }) => {
          const u = row.original;
          const displayName = [u.first_name, u.middle_name, u.last_name]
            .filter(Boolean)
            .join(" ");
          const initial = (u.first_name?.charAt(0) ?? u.last_name?.charAt(0) ?? "?").toUpperCase();
          return (
            <div className="flex items-center gap-3">
              <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full bg-muted">
                {u.c_profile_image ? (
                  <img
                    src={u.c_profile_image}
                    alt={u.username}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs font-bold text-muted-foreground">
                    {initial}
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="truncate text-sm font-medium">
                    {displayName}
                  </span>
                  {u.is_verified && (
                    <Verified className="h-3.5 w-3.5 text-primary shrink-0" />
                  )}
                </div>
                <p className="truncate text-xs text-muted-foreground">
                  @{u.username}
                </p>
              </div>
            </div>
          );
        },
        enableSorting: true,
      },
      {
        id: "email",
        header: "Email",
        accessorKey: "email",
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {row.original.email ?? "—"}
          </span>
        ),
      },
      {
        id: "role",
        header: "Role",
        accessorKey: "role",
        cell: ({ row }) => (
          <Badge
            variant={row.original.role === "admin" ? "default" : "secondary"}
            className="capitalize text-xs"
          >
            {row.original.role}
          </Badge>
        ),
      },
      {
        id: "account_status",
        header: "Status",
        accessorKey: "account_status",
        cell: ({ row }) => {
          const status = row.original.account_status;
          return (
            <Badge
              variant={
                status === "active"
                  ? "outline"
                  : status === "suspended"
                    ? "secondary"
                    : "destructive"
              }
              className={cn(
                "capitalize text-xs",
                status === "active" && "border-green-500 text-green-600"
              )}
            >
              {status === "active" && (
                <CheckCircle2 className="mr-1 h-3 w-3" />
              )}
              {status === "suspended" && (
                <Clock className="mr-1 h-3 w-3" />
              )}
              {status === "banned" && (
                <Ban className="mr-1 h-3 w-3" />
              )}
              {status}
            </Badge>
          );
        },
      },
      {
        id: "registered_artworks_count",
        header: "Artworks",
        accessorKey: "registered_artworks_count",
        cell: ({ row }) => (
          <span className="text-sm tabular-nums">
            {row.original.registered_artworks_count}
          </span>
        ),
      },
      {
        id: "reports_filed_count",
        header: "Reports",
        accessorKey: "reports_filed_count",
        cell: ({ row }) => (
          <span className="text-sm tabular-nums">
            {row.original.reports_filed_count}
          </span>
        ),
      },
      {
        id: "created_at",
        header: "Registered",
        accessorKey: "created_at",
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {new Date(row.original.created_at).toLocaleDateString()}
          </span>
        ),
      },
      {
        id: "last_active",
        header: "Last Active",
        accessorKey: "last_active",
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {new Date(row.original.last_active).toLocaleDateString()}
          </span>
        ),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => {
          const userId = row.original.id;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => openDrawer(userId)}>
                  <Eye className="mr-2 h-4 w-4" /> View Details
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Admin</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => openSuspend(userId)}>
                  <Clock className="mr-2 h-4 w-4" /> Suspend
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => openBan(userId)}>
                  <Ban className="mr-2 h-4 w-4" /> Ban
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => openVerify(userId)}>
                  <CheckCircle2 className="mr-2 h-4 w-4" /> Verify Artist
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleResetPassword(userId)}>
                  <KeyRound className="mr-2 h-4 w-4" /> Reset Password
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => handleDeleteUser(userId)}
                  className="text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" /> Delete Account
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
        enableSorting: false,
      },
    ],
    [users, bulkSelection]
  );

  const table = useReactTable({
    data: users,
    columns,
    state: {
      sorting,
    },
    onSortingChange: handleSortChange as OnChangeFn<SortingState>,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    manualPagination: true,
    pageCount,
    rowCount: totalCount,
  });

  // ── Handlers ──
  const openDrawer = useCallback((userId: string) => {
    setSelectedUserId(userId);
    setActiveTab("profile");
    setDrawerOpen(true);
  }, []);

  const openSuspend = useCallback((userId: string) => {
    setSelectedUserId(userId);
    setSuspendDialogOpen(true);
  }, []);

  const openBan = useCallback((userId: string) => {
    setSelectedUserId(userId);
    setBanDialogOpen(true);
  }, []);

  const openVerify = useCallback((userId: string) => {
    setSelectedUserId(userId);
    setVerifyDialogOpen(true);
  }, []);

  const handleResetPassword = useCallback((userId: string) => {
    setConfirmAction({
      title: "Reset Password",
      description:
        "This will send a password reset email to the user. Continue?",
      onConfirm: () => {
        actions.resetPassword.mutate(userId);
        setConfirmDialogOpen(false);
      },
    });
    setConfirmDialogOpen(true);
  }, [actions]);

  const handleDeleteUser = useCallback((userId: string) => {
    setSelectedUserId(userId);
    setConfirmAction({
      title: "Delete Account",
      description:
        "This will soft-delete and anonymize the account. This action cannot be undone. Continue?",
      onConfirm: () => {
        actions.deleteUser.mutate({ userId, reason: "Deleted by administrator." });
        setConfirmDialogOpen(false);
      },
    });
    setConfirmDialogOpen(true);
  }, [actions]);

  const handleExport = useCallback(async () => {
    try {
      const result = await exportUsersCSV({ search: debouncedSearch, filters, sort });
      if (!result.success) {
        actions.suspend.mutate({ user_id: "", reason: "", duration: "permanent" }); // dummy for toast
        return;
      }

      // Generate CSV
      const headers = [
        "Username,Email,Role,Status,Verified,Registration Date,Artwork Count,Report Count",
      ];
      const rows = result.data.map(
        (r) =>
          `"${r.username}","${r.email}","${r.role}","${r.status}","${r.verified}","${r.registration_date}",${r.artwork_count},${r.report_count}`
      );
      const csv = [...headers, ...rows].join("\n");
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `users-export-${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch {
      // Error handled silently
    }
  }, [debouncedSearch, filters, sort, actions]);

  const clearFilters = useCallback(() => {
    setFilters({
      role: "all",
      account_status: "all",
      is_verified: null,
      has_reports: null,
      has_uploaded_artwork: null,
      has_blockchain_registrations: null,
      date_from: null,
      date_to: null,
    });
    setSort("newest");
    setPage(1);
  }, []);

  const pageCount_ = pageCount;

  // ── Loading ──
  if (isLoading && page === 1) {
    return <UserManagementSkeleton />;
  }

  // ── Error ──
  if (error && !isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="max-w-md text-center space-y-4">
          <AlertTriangle className="mx-auto h-12 w-12 text-destructive" />
          <h2 className="text-xl font-bold">Failed to Load Users</h2>
          <p className="text-muted-foreground text-sm">{error}</p>
          <Button onClick={() => refetch()} className="gap-2">
            <RefreshCw className="h-4 w-4" /> Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Top Bar */}
      <div className="border-b border-border bg-card px-4 py-3">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Users className="h-5 w-5 text-primary" />
            <h1 className="text-lg font-bold tracking-tight sm:text-xl">
              User Management
            </h1>
            {totalCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {totalCount} total
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-9 w-56 pl-9 text-sm lg:w-80"
              />
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setFiltersOpen(!filtersOpen)}
              className="gap-2"
            >
              <Filter className="h-4 w-4" />
              Filters
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Download className="h-4 w-4" />
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleExport}>
                  Export as CSV
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => refetch()}
              disabled={isLoading}
            >
              <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
            </Button>
          </div>
        </div>
      </div>

      {/* Filters Panel */}
      {filtersOpen && (
        <div className="border-b border-border bg-muted/30 px-4 py-3">
          <div className="flex flex-wrap items-end gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Role</Label>
              <Select
                value={filters.role}
                onValueChange={(v: "all" | "user" | "admin") =>
                  setFilters({ ...filters, role: v })
                }
              >
                <SelectTrigger className="h-9 w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Status</Label>
              <Select
                value={filters.account_status}
                onValueChange={(v: "all" | AccountStatus) =>
                  setFilters({ ...filters, account_status: v })
                }
              >
                <SelectTrigger className="h-9 w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                  <SelectItem value="banned">Banned</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Verified</Label>
              <Select
                value={
                  filters.is_verified === null
                    ? "all"
                    : filters.is_verified
                      ? "yes"
                      : "no"
                }
                onValueChange={(v) =>
                  setFilters({
                    ...filters,
                    is_verified: v === "all" ? null : v === "yes",
                  })
                }
              >
                <SelectTrigger className="h-9 w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="yes">Verified Only</SelectItem>
                  <SelectItem value="no">Unverified Only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Has Artwork</Label>
              <Select
                value={
                  filters.has_uploaded_artwork === null
                    ? "all"
                    : filters.has_uploaded_artwork
                      ? "yes"
                      : "no"
                }
                onValueChange={(v) =>
                  setFilters({
                    ...filters,
                    has_uploaded_artwork:
                      v === "all" ? null : v === "yes",
                  })
                }
              >
                <SelectTrigger className="h-9 w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="yes">Has Artwork</SelectItem>
                  <SelectItem value="no">No Artwork</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Has Reports</Label>
              <Select
                value={
                  filters.has_reports === null
                    ? "all"
                    : filters.has_reports
                      ? "yes"
                      : "no"
                }
                onValueChange={(v) =>
                  setFilters({
                    ...filters,
                    has_reports: v === "all" ? null : v === "yes",
                  })
                }
              >
                <SelectTrigger className="h-9 w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="yes">Has Reports</SelectItem>
                  <SelectItem value="no">No Reports</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Sort</Label>
              <Select
                value={sort}
                onValueChange={(v: UserSortOption) => setSort(v)}
              >
                <SelectTrigger className="h-9 w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="oldest">Oldest</SelectItem>
                  <SelectItem value="most_active">Most Active</SelectItem>
                  <SelectItem value="most_reported">Most Reported</SelectItem>
                  <SelectItem value="alphabetical">Alphabetical</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="h-9 text-xs"
            >
              Reset Filters
            </Button>
          </div>
        </div>
      )}

      {/* Bulk Action Bar */}
      {bulkSelection.size > 0 && (
        <div className="flex items-center gap-3 border-b border-border bg-primary/5 px-4 py-2.5">
          <span className="text-sm font-medium">
            {bulkSelection.size} selected
          </span>
          <Separator orientation="vertical" className="h-5" />
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setConfirmAction({
                title: "Bulk Suspend",
                description: `Suspend ${bulkSelection.size} user(s)?`,
                onConfirm: () => {
                  actions.bulkSuspend.mutate({
                    userIds: [...bulkSelection],
                    reason: "Bulk suspension by administrator.",
                  });
                  setBulkSelection(new Set());
                  setConfirmDialogOpen(false);
                },
              });
              setConfirmDialogOpen(true);
            }}
            className="text-xs"
          >
            Suspend Selected
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setConfirmAction({
                title: "Bulk Ban",
                description: `Ban ${bulkSelection.size} user(s)?`,
                onConfirm: () => {
                  actions.bulkBan.mutate({
                    userIds: [...bulkSelection],
                    reason: "Bulk ban by administrator.",
                  });
                  setBulkSelection(new Set());
                  setConfirmDialogOpen(false);
                },
              });
              setConfirmDialogOpen(true);
            }}
            className="text-xs"
          >
            Ban Selected
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              actions.bulkVerify.mutate([...bulkSelection]);
              setBulkSelection(new Set());
            }}
            className="text-xs"
          >
            Verify Selected
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setNotificationDialogOpen(true);
            }}
            className="text-xs"
          >
            Notify Selected
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setBulkSelection(new Set())}
            className="text-xs text-muted-foreground"
          >
            Clear
          </Button>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="p-4 lg:p-6 space-y-6">
        {stats && (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-7">
            <StatCard
              label="Total Users"
              value={stats.total_users}
              icon={<Users className="h-4 w-4" />}
            />
            <StatCard
              label="Verified Artists"
              value={stats.verified_artists}
              icon={<Verified className="h-4 w-4" />}
              color="text-primary"
            />
            <StatCard
              label="Suspended"
              value={stats.suspended_users}
              icon={<Clock className="h-4 w-4" />}
              color="text-yellow-500"
            />
            <StatCard
              label="Banned"
              value={stats.banned_users}
              icon={<Ban className="h-4 w-4" />}
              color="text-destructive"
            />
            <StatCard
              label="New This Month"
              value={stats.new_users_this_month}
              icon={<UserCheck className="h-4 w-4" />}
              color="text-green-500"
            />
            <StatCard
              label="With Artwork"
              value={stats.artists_with_artwork}
              icon={<ImageIcon className="h-4 w-4" />}
            />
            <StatCard
              label="With Reports"
              value={stats.users_with_reports}
              icon={<ShieldAlert className="h-4 w-4" />}
              color="text-orange-500"
            />
          </div>
        )}

        {/* Table */}
        <div className="overflow-hidden rounded-xl border border-border">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id} className="border-b border-border bg-muted/30">
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        className={cn(
                          "px-4 py-3 text-left text-xs font-medium text-muted-foreground",
                          header.column.getCanSort() && "cursor-pointer select-none"
                        )}
                        onClick={header.column.getToggleSortingHandler()}
                        style={{ width: header.getSize() }}
                      >
                        <div className="flex items-center gap-1">
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                          {{
                            asc: " ↑",
                            desc: " ↓",
                          }[header.column.getIsSorted() as string] ?? null}
                        </div>
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={columns.length}
                      className="px-4 py-16 text-center"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <Users className="h-8 w-8 text-muted-foreground/40" />
                        <p className="text-sm text-muted-foreground">
                          {debouncedSearch || filters.role !== "all" || filters.account_status !== "all"
                            ? "No users match your search criteria."
                            : "No users found."}
                        </p>
                        {(debouncedSearch || filters.role !== "all" || filters.account_status !== "all") && (
                          <Button
                            variant="link"
                            size="sm"
                            onClick={clearFilters}
                          >
                            Clear filters
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  table.getRowModel().rows.map((row) => (
                    <tr
                      key={row.id}
                      className="border-b border-border transition-colors hover:bg-muted/50 cursor-pointer"
                      onClick={() => openDrawer(row.original.id)}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td
                          key={cell.id}
                          className="px-4 py-3"
                          style={{ width: cell.column.getSize() }}
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pageCount_ > 0 && (
            <div className="flex items-center justify-between border-t border-border px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  Rows per page
                </span>
                <Select
                  value={String(perPage)}
                  onValueChange={(v) => {
                    setPerPage(Number(v));
                    setPage(1);
                  }}
                >
                  <SelectTrigger className="h-8 w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  Page {page} of {pageCount_}
                </span>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    disabled={page >= pageCount_}
                    onClick={() => setPage((p) => Math.min(pageCount_, p + 1))}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── User Details Dialog ── */}
      <Dialog open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DialogContent showCloseButton={false} className="flex flex-col p-0 gap-0" style={{ maxWidth: "85vw", maxHeight: "90vh" }}>
          {userLoading ? (
            <div className="space-y-4 p-4">
              <div className="h-8 w-48 animate-pulse rounded bg-muted" />
              <div className="h-32 animate-pulse rounded-xl bg-muted" />
              <div className="h-64 animate-pulse rounded-xl bg-muted" />
            </div>
          ) : selectedUser ? (
            <>
              <div className="sticky top-0 z-10 border-b border-border bg-card px-6 py-4">
                <div className="flex items-center justify-between">
                  <DialogTitle className="flex items-center gap-3 text-lg">
                    <div className="relative h-10 w-10 overflow-hidden rounded-full bg-muted">
                      {selectedUser.c_profile_image ? (
                        <img
                          src={selectedUser.c_profile_image}
                          alt={selectedUser.username}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-sm font-bold text-muted-foreground">
                          {selectedUser.first_name?.charAt(0) ?? selectedUser.last_name?.charAt(0) ?? "?"}
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-base font-semibold">
                        {[selectedUser.first_name, selectedUser.middle_name, selectedUser.last_name].filter(Boolean).join(" ")}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        @{selectedUser.username}
                      </p>
                    </div>
                  </DialogTitle>
                  <DialogClose asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                      <X className="h-4 w-4" />
                      <span className="sr-only">Close</span>
                    </Button>
                  </DialogClose>
                </div>
              </div>

              {/* Dialog Body (scrollable) */}
              <div className="flex-1 overflow-y-auto px-6 py-4">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="w-full justify-start">
                  <TabsTrigger value="profile" className="text-xs">Profile</TabsTrigger>
                  <TabsTrigger value="artworks" className="text-xs">Artworks</TabsTrigger>
                  <TabsTrigger value="reports" className="text-xs">Reports</TabsTrigger>
                  <TabsTrigger value="blockchain" className="text-xs">Blockchain</TabsTrigger>
                  <TabsTrigger value="timeline" className="text-xs">Activity</TabsTrigger>
                </TabsList>

                <TabsContent value="profile" className="space-y-4 pt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Profile Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-xs text-muted-foreground">Email</p>
                          <p>{selectedUser.email ?? "—"}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Role</p>
                          <Badge variant={selectedUser.role === "admin" ? "default" : "secondary"} className="capitalize text-xs">
                            {selectedUser.role}
                          </Badge>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Status</p>
                          <Badge className={cn(
                            "capitalize text-xs",
                            selectedUser.account_status === "active" && "border-green-500 text-green-600"
                          )}>
                            {selectedUser.account_status}
                          </Badge>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Verified</p>
                          <p>{selectedUser.is_verified ? "Yes" : "No"}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Country</p>
                          <p>{selectedUser.country ?? "—"}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Online</p>
                          <p>{selectedUser.is_online ? "Yes" : "No"}</p>
                        </div>
                      </div>
                      <Separator />
                      <div>
                        <p className="text-xs text-muted-foreground">Bio</p>
                        <p className="text-muted-foreground">{selectedUser.bio ?? "No bio."}</p>
                      </div>
                      <Separator />
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-xs text-muted-foreground">Created</p>
                          <p>{new Date(selectedUser.created_at).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Last Active</p>
                          <p>{new Date(selectedUser.last_active).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Statistics</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                        <StatMini label="Artworks" value={selectedUser.statistics.registered_artworks} />
                        <StatMini label="Posts" value={selectedUser.statistics.public_posts} />
                        <StatMini label="Upvotes" value={selectedUser.statistics.total_upvotes_received} />
                        <StatMini label="Reports Filed" value={selectedUser.statistics.reports_filed} />
                        <StatMini label="Reports Against" value={selectedUser.statistics.reports_against} />
                        <StatMini label="Similarity" value={selectedUser.statistics.similarity_matches} />
                        <StatMini label="Blockchain" value={selectedUser.statistics.blockchain_registrations} />
                        <StatMini label="Notifications" value={selectedUser.statistics.notifications_count} />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="artworks" className="space-y-4 pt-4">
                  {artworksLoading ? (
                    <div className="space-y-3">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="h-20 animate-pulse rounded-lg bg-muted" />
                      ))}
                    </div>
                  ) : artworks.length === 0 ? (
                    <div className="flex flex-col items-center gap-2 py-12 text-center">
                      <ImageIcon className="h-8 w-8 text-muted-foreground/40" />
                      <p className="text-sm text-muted-foreground">No artworks found.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {artworks.map((art) => (
                        <div
                          key={art.id}
                          className="flex items-center gap-3 rounded-lg border border-border p-3"
                        >
                          <div className="h-14 w-14 shrink-0 overflow-hidden rounded-md bg-muted">
                            {art.c_secure_url ? (
                              <img
                                src={art.c_secure_url}
                                alt={art.title}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                                No img
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium">{art.title}</p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Badge variant="outline" className="text-[10px] px-1.5">
                                {art.visibility}
                              </Badge>
                              {art.similarity_score !== null && (
                                <span>{art.similarity_score}% match</span>
                              )}
                              <span>{new Date(art.created_at).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                              <a href={`/art/${art.id}`} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-3.5 w-3.5" />
                              </a>
                            </Button>
                            {art.tx_hash && (
                              <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                                <a
                                  href={`https://amoy.polygonscan.com/tx/${art.tx_hash}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <ExternalLink className="h-3.5 w-3.5" />
                                </a>
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="reports" className="space-y-4 pt-4">
                  {reportsLoading ? (
                    <div className="space-y-3">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="h-16 animate-pulse rounded-lg bg-muted" />
                      ))}
                    </div>
                  ) : reports.length === 0 ? (
                    <div className="flex flex-col items-center gap-2 py-12 text-center">
                      <ShieldAlert className="h-8 w-8 text-muted-foreground/40" />
                      <p className="text-sm text-muted-foreground">No reports found.</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {reports.map((report) => (
                        <div
                          key={report.id}
                          className="flex items-center justify-between rounded-lg border border-border p-3"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium">{report.title}</p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Badge variant="outline" className="text-[10px] px-1.5 capitalize">
                                {report.report_type}
                              </Badge>
                              <span>{new Date(report.created_at).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className="text-[10px] capitalize">{report.status}</Badge>
                            <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
                              <a href={`/admin/reports/${report.id}`} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-3.5 w-3.5" />
                              </a>
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="blockchain" className="space-y-4 pt-4">
                  {blockchainLoading ? (
                    <div className="space-y-3">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="h-16 animate-pulse rounded-lg bg-muted" />
                      ))}
                    </div>
                  ) : blockchainActivities.length === 0 ? (
                    <div className="flex flex-col items-center gap-2 py-12 text-center">
                      <ExternalLink className="h-8 w-8 text-muted-foreground/40" />
                      <p className="text-sm text-muted-foreground">No blockchain activity found.</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {blockchainActivities.map((act) => (
                        <div
                          key={act.id}
                          className="flex items-center justify-between rounded-lg border border-border p-3"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium">{act.artwork_title}</p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span className="truncate font-mono">{act.tx_hash?.slice(0, 16)}...</span>
                              {act.chain && <Badge variant="outline" className="text-[10px]">{act.chain}</Badge>}
                            </div>
                          </div>
                          <Badge className={cn(
                            "text-[10px] capitalize",
                            act.verification_status === "verified" && "border-green-500 text-green-600"
                          )}>
                            {act.verification_status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="timeline" className="space-y-4 pt-4">
                  {timelineLoading ? (
                    <div className="space-y-3">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="flex gap-3">
                          <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
                          <div className="flex-1 space-y-2">
                            <div className="h-4 w-32 animate-pulse rounded bg-muted" />
                            <div className="h-3 w-48 animate-pulse rounded bg-muted" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : timelineEvents.length === 0 ? (
                    <div className="flex flex-col items-center gap-2 py-12 text-center">
                      <Clock className="h-8 w-8 text-muted-foreground/40" />
                      <p className="text-sm text-muted-foreground">No activity recorded.</p>
                    </div>
                  ) : (
                    <div className="relative space-y-0">
                      {timelineEvents.map((event, idx) => (
                        <div key={event.id} className="relative flex gap-4 pb-6 last:pb-0">
                          {idx < timelineEvents.length - 1 && (
                            <div className="absolute left-[15px] top-8 h-full w-px bg-border" />
                          )}
                          <div className={cn(
                            "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                            event.type === "account_created" && "bg-blue-100 text-blue-600",
                            event.type === "artwork_uploaded" && "bg-green-100 text-green-600",
                            event.type === "blockchain_recorded" && "bg-purple-100 text-purple-600",
                            event.type === "report_filed" && "bg-orange-100 text-orange-600",
                            event.type === "report_received" && "bg-red-100 text-red-600",
                            event.type === "similarity_detected" && "bg-yellow-100 text-yellow-600",
                            event.type === "admin_action" && "bg-gray-100 text-gray-600",
                            !["account_created","artwork_uploaded","blockchain_recorded","report_filed","report_received","similarity_detected","admin_action"].includes(event.type) && "bg-muted text-muted-foreground"
                          )}>
                            {event.type === "account_created" && <UserCheck className="h-4 w-4" />}
                            {event.type === "artwork_uploaded" && <ImageIcon className="h-4 w-4" />}
                            {event.type === "blockchain_recorded" && <Verified className="h-4 w-4" />}
                            {event.type === "report_filed" && <ShieldAlert className="h-4 w-4" />}
                            {event.type === "report_received" && <Ban className="h-4 w-4" />}
                            {event.type === "similarity_detected" && <AlertTriangle className="h-4 w-4" />}
                            {event.type === "notification_received" && <Bell className="h-4 w-4" />}
                            {event.type === "admin_action" && <ShieldAlert className="h-4 w-4" />}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium">{event.title}</p>
                            {event.description && (
                              <p className="text-xs text-muted-foreground">{event.description}</p>
                            )}
                            <p className="text-[10px] text-muted-foreground/60 mt-0.5">
                              {new Date(event.created_at).toLocaleDateString(undefined, {
                                month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit"
                              })}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full p-6">
              <div className="flex flex-col items-center gap-2 text-center">
                <Users className="h-8 w-8 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">Select a user to view details.</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Suspend Dialog ── */}
      <Dialog open={suspendDialogOpen} onOpenChange={setSuspendDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Suspend User</DialogTitle>
            <DialogDescription>
              Suspending will restrict the user from accessing the platform.
            </DialogDescription>
          </DialogHeader>
          <SuspendForm
            userId={selectedUserId ?? ""}
            onSuccess={() => setSuspendDialogOpen(false)}
            onSuspend={(payload) => actions.suspend.mutate(payload)}
            isLoading={actions.suspend.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* ── Ban Dialog ── */}
      <Dialog open={banDialogOpen} onOpenChange={setBanDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ban User</DialogTitle>
            <DialogDescription>
              This will permanently ban the user. This action requires confirmation.
            </DialogDescription>
          </DialogHeader>
          <BanForm
            userId={selectedUserId ?? ""}
            onSuccess={() => setBanDialogOpen(false)}
            onBan={(payload) => actions.ban.mutate(payload)}
            isLoading={actions.ban.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* ── Verify Dialog ── */}
      <Dialog open={verifyDialogOpen} onOpenChange={setVerifyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Verify Artist</DialogTitle>
            <DialogDescription>
              Mark this user as a verified artist.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              This will mark the account as verified and notify the user.
            </p>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setVerifyDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (selectedUserId) {
                    actions.verify.mutate({ userId: selectedUserId });
                  }
                  setVerifyDialogOpen(false);
                }}
                disabled={actions.verify.isPending}
                className="gap-2"
              >
                {actions.verify.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                Verify Artist
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Send Notification Dialog ── */}
      <Dialog open={notificationDialogOpen} onOpenChange={setNotificationDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Notification</DialogTitle>
            <DialogDescription>
              Send a notification to the selected user(s).
            </DialogDescription>
          </DialogHeader>
          <NotificationForm
            recipientIds={
              bulkSelection.size > 0
                ? [...bulkSelection]
                : selectedUserId
                  ? [selectedUserId]
                  : []
            }
            onSuccess={() => setNotificationDialogOpen(false)}
            onSend={(payload) => actions.sendNotification.mutate(payload)}
            isLoading={actions.sendNotification.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* ── Confirm Dialog ── */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{confirmAction?.title}</DialogTitle>
            <DialogDescription>{confirmAction?.description}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => confirmAction?.onConfirm()}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ── Sub-components ──

function StatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  color?: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-3 lg:p-4">
      <div className="flex items-center gap-2">
        <div className={cn("text-muted-foreground", color)}>{icon}</div>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
      <p className={cn("mt-1 text-xl font-bold", color)}>
        {value.toLocaleString()}
      </p>
    </div>
  );
}

function StatMini({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg bg-muted/50 p-3 text-center">
      <p className="text-lg font-bold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

function SuspendForm({
  userId,
  onSuccess,
  onSuspend,
  isLoading,
}: {
  userId: string;
  onSuccess: () => void;
  onSuspend: (payload: { user_id: string; reason: string; duration: "temporary" | "permanent"; duration_days?: number; admin_notes?: string }) => void;
  isLoading: boolean;
}) {
  const [reason, setReason] = useState("");
  const [duration, setDuration] = useState<"temporary" | "permanent">("temporary");
  const [durationDays, setDurationDays] = useState(7);
  const [adminNotes, setAdminNotes] = useState("");

  const handleSubmit = () => {
    if (!reason.trim()) return;
    onSuspend({
      user_id: userId,
      reason: reason.trim(),
      duration,
      duration_days: duration === "temporary" ? durationDays : undefined,
      admin_notes: adminNotes.trim() || undefined,
    });
    onSuccess();
  };

  return (
    <div className="space-y-4 py-4">
      <div className="space-y-2">
        <Label>Reason for suspension *</Label>
        <Textarea
          placeholder="Enter the reason..."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={3}
        />
      </div>
      <div className="space-y-2">
        <Label>Duration</Label>
        <Select value={duration} onValueChange={(v: "temporary" | "permanent") => setDuration(v)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="temporary">Temporary</SelectItem>
            <SelectItem value="permanent">Permanent</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {duration === "temporary" && (
        <div className="space-y-2">
          <Label>Duration (days)</Label>
          <Input
            type="number"
            min={1}
            max={365}
            value={durationDays}
            onChange={(e) => setDurationDays(Number(e.target.value))}
          />
        </div>
      )}
      <div className="space-y-2">
        <Label>Admin Notes (optional)</Label>
        <Textarea
          placeholder="Internal notes..."
          value={adminNotes}
          onChange={(e) => setAdminNotes(e.target.value)}
          rows={2}
        />
      </div>
      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={onSuccess}>Cancel</Button>
        <Button onClick={handleSubmit} disabled={!reason.trim() || isLoading} className="gap-2">
          {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
          Suspend User
        </Button>
      </div>
    </div>
  );
}

function BanForm({
  userId,
  onSuccess,
  onBan,
  isLoading,
}: {
  userId: string;
  onSuccess: () => void;
  onBan: (payload: { user_id: string; reason: string; evidence?: string }) => void;
  isLoading: boolean;
}) {
  const [reason, setReason] = useState("");
  const [evidence, setEvidence] = useState("");
  const [confirmed, setConfirmed] = useState(false);

  const handleSubmit = () => {
    if (!reason.trim() || !confirmed) return;
    onBan({
      user_id: userId,
      reason: reason.trim(),
      evidence: evidence.trim() || undefined,
    });
    onSuccess();
  };

  return (
    <div className="space-y-4 py-4">
      <div className="space-y-2">
        <Label>Reason for ban *</Label>
        <Textarea
          placeholder="Enter the reason..."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={3}
        />
      </div>
      <div className="space-y-2">
        <Label>Evidence (optional)</Label>
        <Textarea
          placeholder="Links or descriptions of evidence..."
          value={evidence}
          onChange={(e) => setEvidence(e.target.value)}
          rows={2}
        />
      </div>
      <div className="flex items-start gap-2 rounded-lg border border-destructive/20 bg-destructive/5 p-3">
        <Checkbox
          id="ban-confirm"
          checked={confirmed}
          onCheckedChange={(v) => setConfirmed(v as boolean)}
        />
        <Label htmlFor="ban-confirm" className="text-xs text-destructive">
          I confirm that I want to permanently ban this user. This action cannot be undone.
        </Label>
      </div>
      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={onSuccess}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          disabled={!reason.trim() || !confirmed || isLoading}
          variant="destructive"
          className="gap-2"
        >
          {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
          Ban User
        </Button>
      </div>
    </div>
  );
}

function NotificationForm({
  recipientIds,
  onSuccess,
  onSend,
  isLoading,
}: {
  recipientIds: string[];
  onSuccess: () => void;
  onSend: (payload: SendNotificationPayload) => void;
  isLoading: boolean;
}) {
  const [type, setType] = useState<"information" | "warning" | "announcement">("information");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = () => {
    if (!title.trim() || !message.trim() || recipientIds.length === 0) return;
    onSend({
      recipient_ids: recipientIds,
      type,
      title: title.trim(),
      message: message.trim(),
    });
    onSuccess();
  };

  return (
    <div className="space-y-4 py-4">
      <p className="text-xs text-muted-foreground">
        Recipients: {recipientIds.length} user(s)
      </p>
      <div className="space-y-2">
        <Label>Type</Label>
        <Select value={type} onValueChange={(v: "information" | "warning" | "announcement") => setType(v)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="information">Information</SelectItem>
            <SelectItem value="warning">Warning</SelectItem>
            <SelectItem value="announcement">Announcement</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Title *</Label>
        <Input
          placeholder="Notification title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label>Message *</Label>
        <Textarea
          placeholder="Notification message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={3}
        />
      </div>
      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={onSuccess}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          disabled={!title.trim() || !message.trim() || recipientIds.length === 0 || isLoading}
          className="gap-2"
        >
          {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
          <Send className="h-4 w-4" />
          Send
        </Button>
      </div>
    </div>
  );
}