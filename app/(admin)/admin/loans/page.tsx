"use client";

import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import {
  RefreshCw,
  Search,
  Check,
  Ban,
  Wallet,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  Hourglass,
  AlertTriangle,
  RotateCcw,
} from "lucide-react";

import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/Components/ui/table";
import { Badge } from "@/Components/ui/badge";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";

type Loan = {
  _id: string;
  user: { fullName: string; balance: number; _id: string };
  amount: number;
  duration: number;
  reason: string;
  status: string;
  createdAt: string;
};

/* ─── Status config ─────────────────────────────────────── */
const statusConfig: Record<
  string,
  {
    variant: "default" | "secondary" | "destructive" | "outline";
    icon: React.ElementType;
    label: string;
    pill: string;
  }
> = {
  APPROVED: {
    variant: "outline",
    icon: CheckCircle2,
    label: "Approved",
    pill: "border border-emerald-500/40 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  },
  REJECTED: {
    variant: "destructive",
    icon: XCircle,
    label: "Rejected",
    pill: "border border-rose-500/40 bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400",
  },
  PENDING: {
    variant: "outline",
    icon: Clock,
    label: "Pending",
    pill: "border border-amber-500/40 bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  },
  RETURNED: {
    variant: "outline",
    icon: Hourglass,
    label: "Returned",
    pill: "border border-purple-500/40 bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  },
};

/* ─── Stat card definitions ──────────────────────────────── */
const statCards = [
  { key: "ALL",      label: "Total Loans", Icon: Wallet,       iconBg: "bg-blue-100 dark:bg-blue-900/40",   iconColor: "text-blue-600 dark:text-blue-400" },
  { key: "PENDING",  label: "Pending",     Icon: Clock,        iconBg: "bg-amber-100 dark:bg-amber-900/40", iconColor: "text-amber-600 dark:text-amber-400" },
  { key: "APPROVED", label: "Approved",    Icon: CheckCircle2, iconBg: "bg-emerald-100 dark:bg-emerald-900/40", iconColor: "text-emerald-600 dark:text-emerald-400" },
  { key: "REJECTED", label: "Rejected",    Icon: XCircle,      iconBg: "bg-rose-100 dark:bg-rose-900/40",   iconColor: "text-rose-600 dark:text-rose-400" },
  { key: "RETURNED", label: "Returned",    Icon: Hourglass,    iconBg: "bg-purple-100 dark:bg-purple-900/40", iconColor: "text-purple-600 dark:text-purple-400" },
];

/* ─── Avatar colours cycling ─────────────────────────────── */
const avatarColors = [
  "from-blue-500 to-blue-600",
  "from-violet-500 to-violet-600",
  "from-emerald-500 to-emerald-600",
  "from-rose-500 to-rose-600",
  "from-amber-500 to-amber-600",
];

export default function AdminLoansPage() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  const fetchLoans = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get("/api/loan/all");
      setLoans(res.data.loans);
    } catch {
      setError("Failed to load loan requests");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchLoans(); }, [fetchLoans]);

  const handleAction = async (loanId: string, action: "approve" | "reject") => {
    setActionLoading(loanId);
    try {
      await axios.patch(`/api/loan/${action}`, { loanId });
      await fetchLoans();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        `Failed to ${action} loan`;
      alert(msg);
    } finally {
      setActionLoading(null);
    }
  };

  const counts = {
    ALL:      loans.length,
    PENDING:  loans.filter((l) => l.status === "PENDING").length,
    APPROVED: loans.filter((l) => l.status === "APPROVED").length,
    REJECTED: loans.filter((l) => l.status === "REJECTED").length,
    RETURNED: loans.filter((l) => l.status === "RETURNED").length,
  };

  const filtered = loans.filter((l) => {
    if (filter !== "ALL" && l.status !== filter) return false;
    if (search && !l.user.fullName.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  /* ── Error state ───────────────────────────────────────── */
  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-6 dark:bg-gray-950">
        <div className="w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-rose-50 dark:bg-rose-900/30">
            <AlertTriangle className="h-7 w-7 text-rose-500" />
          </div>
          <p className="text-base font-semibold text-gray-900 dark:text-gray-100">Failed to load</p>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{error}</p>
          <Button onClick={fetchLoans} className="mt-6 w-full gap-2">
            <RotateCcw className="h-4 w-4" /> Try Again
          </Button>
        </div>
      </div>
    );
  }

  /* ── Main ──────────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8 dark:bg-gray-950">
      <div className="mx-auto max-w-7xl space-y-6">

        {/* ── Page header ── */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-gray-100">
              Loan Management
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Review, approve, or reject loan applications
            </p>
          </div>
          <Button variant="outline" onClick={fetchLoans} disabled={loading} className="gap-2 self-start">
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {/* ── Stat cards grid ── */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
          {statCards.map(({ key, label, Icon, iconBg, iconColor }) => {
            const val   = counts[key as keyof typeof counts];
            const active = filter === key;
            return (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={[
                  "w-full rounded-2xl border bg-white p-4 text-left transition-all dark:bg-gray-900",
                  "hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
                  active
                    ? "border-blue-500 ring-2 ring-blue-500/20 dark:border-blue-400"
                    : "border-gray-200 dark:border-gray-800",
                ].join(" ")}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    {label}
                  </span>
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${iconBg}`}>
                    <Icon className={`h-4 w-4 ${iconColor}`} />
                  </div>
                </div>
                {loading ? (
                  <div className="mt-3 h-7 w-10 animate-pulse rounded-md bg-gray-200 dark:bg-gray-700" />
                ) : (
                  <p className="mt-3 text-2xl font-bold text-gray-900 dark:text-gray-100">{val}</p>
                )}
              </button>
            );
          })}
        </div>

        {/* ── Applications card ── */}
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">

          {/* Toolbar */}
          <div className="flex flex-col gap-3 border-b border-gray-100 px-5 py-4 sm:flex-row sm:items-center dark:border-gray-800">
            <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">Applications</h2>
            <div className="relative sm:ml-auto">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder="Search by name…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 sm:w-64"
              />
            </div>
          </div>

          {/* Loading rows */}
          {loading ? (
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex animate-pulse items-center gap-4 px-5 py-3.5">
                  <div className="h-9 w-9 shrink-0 rounded-full bg-gray-200 dark:bg-gray-700" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3.5 w-32 rounded bg-gray-200 dark:bg-gray-700" />
                    <div className="h-3 w-48 rounded bg-gray-100 dark:bg-gray-800" />
                  </div>
                  <div className="h-6 w-20 rounded-full bg-gray-200 dark:bg-gray-700" />
                  <div className="h-8 w-36 rounded-lg bg-gray-200 dark:bg-gray-700" />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            /* Empty state */
            <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 dark:bg-gray-800">
                <Wallet className="h-7 w-7 text-gray-400" />
              </div>
              <p className="text-base font-medium text-gray-900 dark:text-gray-100">No loans found</p>
              <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400">
                {search ? "Try a different search term" : "No applications match the current filter"}
              </p>
            </div>
          ) : (
            /* Table */
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/80 dark:bg-gray-800/50">
                  <TableHead className="pl-5">Applicant</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Balance</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="pr-5 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((loan, idx) => {
                  const sc         = statusConfig[loan.status] ?? statusConfig.PENDING;
                  const ScIcon     = sc.icon;
                  const isPending  = loan.status === "PENDING";
                  const isProc     = actionLoading === loan._id;
                  const avatarGrad = avatarColors[idx % avatarColors.length];

                  return (
                    <TableRow key={loan._id} className="hover:bg-gray-50/60 dark:hover:bg-gray-800/40">
                      {/* Applicant */}
                      <TableCell className="pl-5">
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${avatarGrad} text-xs font-bold text-white shadow-sm`}
                          >
                            {loan.user.fullName.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {loan.user.fullName}
                          </span>
                        </div>
                      </TableCell>

                      {/* Amount */}
                      <TableCell>
                        <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                          Rs.&nbsp;{loan.amount.toLocaleString()}
                        </span>
                      </TableCell>

                      {/* Duration */}
                      <TableCell>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {loan.duration}&nbsp;mo
                        </span>
                      </TableCell>

                      {/* Reason */}
                      <TableCell className="max-w-[160px]">
                        <p className="truncate text-sm text-gray-500 dark:text-gray-400">
                          {loan.reason || "—"}
                        </p>
                      </TableCell>

                      {/* Balance */}
                      <TableCell>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          Rs.&nbsp;{loan.user.balance?.toLocaleString() ?? "0"}
                        </span>
                      </TableCell>

                      {/* Date */}
                      <TableCell>
                        <span className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
                          <Calendar className="h-3.5 w-3.5 shrink-0" />
                          {new Date(loan.createdAt).toLocaleDateString("en-GB")}
                        </span>
                      </TableCell>

                      {/* Status pill */}
                      <TableCell>
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${sc.pill}`}
                        >
                          <ScIcon className="h-3 w-3" />
                          {sc.label}
                        </span>
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="pr-5 text-right">
                        {isPending ? (
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              disabled={isProc}
                              onClick={() => handleAction(loan._id, "approve")}
                              className="gap-1.5 bg-emerald-600 text-white hover:bg-emerald-500 dark:bg-emerald-600 dark:hover:bg-emerald-500"
                            >
                              {isProc
                                ? <RefreshCw className="h-3 w-3 animate-spin" />
                                : <Check className="h-3 w-3" />}
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              disabled={isProc}
                              onClick={() => handleAction(loan._id, "reject")}
                              className="gap-1.5"
                            >
                              {isProc
                                ? <RefreshCw className="h-3 w-3 animate-spin" />
                                : <Ban className="h-3 w-3" />}
                              Reject
                            </Button>
                          </div>
                        ) : (
                          <span className="text-xs italic text-gray-400 dark:text-gray-500">
                            Processed
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </div>
  );
}
