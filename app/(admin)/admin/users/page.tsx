"use client";

import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import {
    RefreshCw,
    Search,
    Users,
    UserCheck,
    UserMinus,
    UserX,
    AlertTriangle,
    RotateCcw,
    ShieldAlert,
    Calendar,
    CheckCircle2,
    Mail,
    XCircle,
    Clock
} from "lucide-react";

import {
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableHead,
    TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type UserType = {
    _id: string;
    fullName: string;
    email: string;
    accountNumber: string;
    accountType: string;
    balance: number;
    isEmailVerified: boolean;
    accountStatus: string;
    createdAt: string;
};

/* ─── Status config ─────────────────────────────────────── */
const statusConfig: Record<
    string,
    {
        icon: React.ElementType;
        label: string;
        pill: string;
    }
> = {
    active: {
        icon: CheckCircle2,
        label: "Active",
        pill: "border border-emerald-500/40 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    },
    pending_verification: {
        icon: Clock,
        label: "Pending",
        pill: "border border-amber-500/40 bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    },
    suspended: {
        icon: ShieldAlert,
        label: "Suspended",
        pill: "border border-rose-500/40 bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400",
    },
    blocked: {
        icon: UserX,
        label: "Blocked",
        pill: "border border-red-500/40 bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    },
    closed: {
        icon: UserMinus,
        label: "Closed",
        pill: "border border-gray-500/40 bg-gray-50 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400",
    },
};

const statCards = [
    { key: "ALL", label: "Total Users", Icon: Users, iconBg: "bg-blue-100 dark:bg-blue-900/40", iconColor: "text-blue-600 dark:text-blue-400" },
    { key: "active", label: "Active", Icon: UserCheck, iconBg: "bg-emerald-100 dark:bg-emerald-900/40", iconColor: "text-emerald-600 dark:text-emerald-400" },
    { key: "pending_verification", label: "Pending", Icon: Clock, iconBg: "bg-amber-100 dark:bg-amber-900/40", iconColor: "text-amber-600 dark:text-amber-400" },
    { key: "suspended", label: "Suspended", Icon: ShieldAlert, iconBg: "bg-rose-100 dark:bg-rose-900/40", iconColor: "text-rose-600 dark:text-rose-400" },
    { key: "blocked", label: "Blocked", Icon: UserX, iconBg: "bg-red-100 dark:bg-red-900/40", iconColor: "text-red-600 dark:text-red-400" },
];

const avatarColors = [
    "from-blue-500 to-blue-600",
    "from-violet-500 to-violet-600",
    "from-emerald-500 to-emerald-600",
    "from-rose-500 to-rose-600",
    "from-amber-500 to-amber-600",
];

export default function AdminUsersPage() {
    const [users, setUsers] = useState<UserType[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [filter, setFilter] = useState("ALL");
    const [search, setSearch] = useState("");

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const res = await axios.get("/api/users");
            setUsers(res.data.users);
        } catch {
            setError("Failed to load users");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchUsers(); }, [fetchUsers]);

    const counts = {
        ALL: users.length,
        active: users.filter((u) => u.accountStatus === "active").length,
        pending_verification: users.filter((u) => u.accountStatus === "pending_verification").length,
        suspended: users.filter((u) => u.accountStatus === "suspended").length,
        blocked: users.filter((u) => u.accountStatus === "blocked").length,
    };

    const filtered = users.filter((u) => {
        if (filter !== "ALL" && u.accountStatus !== filter) return false;
        if (search && !u.fullName.toLowerCase().includes(search.toLowerCase()) && !u.email.toLowerCase().includes(search.toLowerCase()) && !u.accountNumber.includes(search)) return false;
        return true;
    });

    if (error) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50 p-6 dark:bg-gray-950">
                <div className="w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm dark:border-gray-800 dark:bg-gray-900">
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-rose-50 dark:bg-rose-900/30">
                        <AlertTriangle className="h-7 w-7 text-rose-500" />
                    </div>
                    <p className="text-base font-semibold text-gray-900 dark:text-gray-100">Failed to load</p>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{error}</p>
                    <Button onClick={fetchUsers} className="mt-6 w-full gap-2">
                        <RotateCcw className="h-4 w-4" /> Try Again
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8 dark:bg-gray-950">
            <div className="mx-auto max-w-7xl space-y-6">

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-gray-100">
                            User Management
                        </h1>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            Monitor and manage all user accounts on the platform
                        </p>
                    </div>
                    <Button variant="outline" onClick={fetchUsers} disabled={loading} className="gap-2 self-start">
                        <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
                        Refresh
                    </Button>
                </div>

                <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
                    {statCards.map(({ key, label, Icon, iconBg, iconColor }) => {
                        const val = counts[key as keyof typeof counts] || 0;
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

                <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">

                    <div className="flex flex-col gap-3 border-b border-gray-100 px-5 py-4 sm:flex-row sm:items-center dark:border-gray-800">
                        <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">Accounts Directory</h2>
                        <div className="relative sm:ml-auto">
                            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            <Input
                                type="text"
                                placeholder="Search name, email, account no..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-9 sm:w-72"
                            />
                        </div>
                    </div>

                    {loading ? (
                        <div className="divide-y divide-gray-100 dark:divide-gray-800">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <div key={i} className="flex animate-pulse items-center gap-4 px-5 py-4">
                                    <div className="h-10 w-10 shrink-0 rounded-full bg-gray-200 dark:bg-gray-700" />
                                    <div className="flex-1 space-y-2">
                                        <div className="h-4 w-40 rounded bg-gray-200 dark:bg-gray-700" />
                                        <div className="h-3.5 w-48 rounded bg-gray-100 dark:bg-gray-800" />
                                    </div>
                                    <div className="h-6 w-24 rounded-full bg-gray-200 dark:bg-gray-700" />
                                    <div className="h-8 w-24 rounded-lg bg-gray-200 dark:bg-gray-700" />
                                </div>
                            ))}
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="flex flex-col items-center justify-center px-6 py-24 text-center">
                            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 dark:bg-gray-800">
                                <Users className="h-7 w-7 text-gray-400" />
                            </div>
                            <p className="text-base font-medium text-gray-900 dark:text-gray-100">No users found</p>
                            <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400">
                                {search ? "Try a different search term" : "No users match the current filter"}
                            </p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-gray-50/80 dark:bg-gray-800/50">
                                    <TableHead className="pl-5">User</TableHead>
                                    <TableHead>Account Info</TableHead>
                                    <TableHead>Balance</TableHead>
                                    <TableHead>Email Verified</TableHead>
                                    <TableHead>Joined</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filtered.map((user, idx) => {
                                    const sc = statusConfig[user.accountStatus] ?? { icon: AlertTriangle, label: "Unknown", pill: "bg-gray-100 text-gray-600" };
                                    const ScIcon = sc.icon;
                                    const avatarGrad = avatarColors[idx % avatarColors.length];

                                    return (
                                        <TableRow key={user._id} className="hover:bg-gray-50/60 dark:hover:bg-gray-800/40">
                                            <TableCell className="pl-5 py-3">
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${avatarGrad} text-sm font-bold text-white shadow-sm`}
                                                    >
                                                        {user.fullName.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <span className="block text-sm font-medium text-gray-900 dark:text-gray-100">
                                                            {user.fullName}
                                                        </span>
                                                        <span className="block text-xs text-gray-500 dark:text-gray-400">
                                                            {user.email}
                                                        </span>
                                                    </div>
                                                </div>
                                            </TableCell>

                                            <TableCell>
                                                <span className="block text-sm font-medium text-gray-900 dark:text-gray-100">
                                                    {user.accountNumber}
                                                </span>
                                                <span className="block text-xs text-gray-500 dark:text-gray-400 capitalize">
                                                    {user.accountType}
                                                </span>
                                            </TableCell>

                                            <TableCell>
                                                <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                                    Rs.&nbsp;{user.balance?.toLocaleString() ?? "0"}
                                                </span>
                                            </TableCell>

                                            <TableCell>
                                                {user.isEmailVerified ? (
                                                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                                                        <CheckCircle2 className="h-3.5 w-3.5" />
                                                        Verified
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-rose-600 dark:text-rose-400">
                                                        <XCircle className="h-3.5 w-3.5" />
                                                        Unverified
                                                    </span>
                                                )}
                                            </TableCell>

                                            <TableCell>
                                                <span className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
                                                    <Calendar className="h-3.5 w-3.5 shrink-0" />
                                                    {new Date(user.createdAt).toLocaleDateString("en-GB")}
                                                </span>
                                            </TableCell>

                                            <TableCell>
                                                <span
                                                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${sc.pill}`}
                                                >
                                                    <ScIcon className="h-3 w-3" />
                                                    {sc.label}
                                                </span>
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
