"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import {
  Wallet,
  Users,
  Activity,
  CreditCard,
  RefreshCw,
  AlertTriangle,
  RotateCcw,
  Clock,
  CheckCircle2,
  XCircle,
  Hourglass,
  ArrowRightLeft,
  ArrowDownRight,
  ArrowUpRight
} from "lucide-react";
import Link from "next/link";

import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

type DashboardData = {
  stats: {
    totalUsers: number;
    activeUsers: number;
    totalBalance: number;
    totalLoans: number;
    pendingLoans: number;
    totalTransactions: number;
  };
  recentLoans: Array<{
    _id: string;
    user: { fullName: string; email: string };
    amount: number;
    status: string;
    createdAt: string;
  }>;
  recentTransactions: Array<{
    _id: string;
    fromUser: { fullName: string };
    toUser: { fullName: string };
    amount: number;
    type: string;
    status: string;
    createdAt: string;
  }>;
  recentUsers: Array<{
    _id: string;
    fullName: string;
    email: string;
    accountStatus: string;
    createdAt: string;
  }>;
};

const loanStatusConfig: Record<string, { icon: any; pill: string }> = {
  APPROVED: { icon: CheckCircle2, pill: "border border-emerald-500/40 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" },
  REJECTED: { icon: XCircle, pill: "border border-rose-500/40 bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400" },
  PENDING: { icon: Clock, pill: "border border-amber-500/40 bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
  RETURNED: { icon: Hourglass, pill: "border border-purple-500/40 bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" },
};

const txStatusConfig: Record<string, { icon: any; text: string }> = {
  COMPLETED: { icon: CheckCircle2, text: "text-emerald-600 dark:text-emerald-400" },
  PENDING: { icon: Clock, text: "text-amber-600 dark:text-amber-400" },
  FAILED: { icon: XCircle, text: "text-rose-600 dark:text-rose-400" },
};

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboard = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get("/api/admin/dashboard");
      setData(res.data);
    } catch {
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-6 dark:bg-gray-950">
        <div className="w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-rose-50 dark:bg-rose-900/30">
            <AlertTriangle className="h-7 w-7 text-rose-500" />
          </div>
          <p className="text-base font-semibold text-gray-900 dark:text-gray-100">Failed to load</p>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{error}</p>
          <Button onClick={fetchDashboard} className="mt-6 w-full gap-2">
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
              Admin Overview
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Comprehensive summary of platform metrics and recent activities
            </p>
          </div>
          <Button variant="outline" onClick={fetchDashboard} disabled={loading} className="gap-2 self-start">
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col justify-between rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">System Balance</span>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/40">
                <Wallet className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
            <div className="mt-4">
              {loading ? (
                <div className="h-8 w-32 animate-pulse rounded-md bg-gray-200 dark:bg-gray-700" />
              ) : (
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  Rs. {data?.stats.totalBalance.toLocaleString()}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-col justify-between rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Users</span>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/40">
                <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="mt-4">
              {loading ? (
                <div className="h-8 w-24 animate-pulse rounded-md bg-gray-200 dark:bg-gray-700" />
              ) : (
                <div className="flex items-baseline gap-2">
                  <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{data?.stats.totalUsers}</p>
                  <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                    {data?.stats.activeUsers} active
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col justify-between rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Loan Applications</span>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-900/40">
                <CreditCard className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
            <div className="mt-4">
              {loading ? (
                <div className="h-8 w-24 animate-pulse rounded-md bg-gray-200 dark:bg-gray-700" />
              ) : (
                <div className="flex items-baseline gap-2">
                  <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{data?.stats.totalLoans}</p>
                  <span className="text-sm font-medium text-amber-600 dark:text-amber-400">
                    {data?.stats.pendingLoans} pending
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col justify-between rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Transactions</span>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-900/40">
                <Activity className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <div className="mt-4">
              {loading ? (
                <div className="h-8 w-24 animate-pulse rounded-md bg-gray-200 dark:bg-gray-700" />
              ) : (
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{data?.stats.totalTransactions}</p>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 dark:border-gray-800">
              <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">Recent Loans</h2>
              <Link href="/admin/loans" className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-400">
                View All
              </Link>
            </div>
            <div className="p-0">
              {loading ? (
                <div className="divide-y divide-gray-100 p-5 dark:divide-gray-800">
                  {[1, 2, 3].map(i => <div key={i} className="h-12 w-full animate-pulse rounded bg-gray-100 dark:bg-gray-800 mb-2" />)}
                </div>
              ) : data?.recentLoans.length === 0 ? (
                <div className="p-8 text-center text-sm text-gray-500">No recent loans</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50/80 dark:bg-gray-800/50">
                      <TableHead className="pl-5">User</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data?.recentLoans.map(loan => {
                      const sc = loanStatusConfig[loan.status] || loanStatusConfig.PENDING;
                      const Icon = sc.icon;
                      return (
                        <TableRow key={loan._id}>
                          <TableCell className="pl-5 py-3">
                            <span className="block text-sm font-medium text-gray-900 dark:text-gray-100">{loan.user.fullName}</span>
                          </TableCell>
                          <TableCell className="font-semibold">Rs. {loan.amount.toLocaleString()}</TableCell>
                          <TableCell>
                            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${sc.pill}`}>
                              <Icon className="h-3 w-3" />
                              {loan.status}
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

          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 dark:border-gray-800">
              <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">Recent Transactions</h2>
            </div>
            <div className="p-0">
              {loading ? (
                <div className="divide-y divide-gray-100 p-5 dark:divide-gray-800">
                  {[1, 2, 3].map(i => <div key={i} className="h-12 w-full animate-pulse rounded bg-gray-100 dark:bg-gray-800 mb-2" />)}
                </div>
              ) : data?.recentTransactions.length === 0 ? (
                <div className="p-8 text-center text-sm text-gray-500">No recent transactions</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50/80 dark:bg-gray-800/50">
                      <TableHead className="pl-5">Type</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Users</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data?.recentTransactions.map(tx => {
                      const isTransfer = tx.type === "TRANSFER";
                      const sc = txStatusConfig[tx.status] || txStatusConfig.PENDING;
                      const Icon = sc.icon;
                      return (
                        <TableRow key={tx._id}>
                          <TableCell className="pl-5 py-3">
                            <div className="flex items-center gap-2">
                              <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${isTransfer ? "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" : "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"}`}>
                                {isTransfer ? <ArrowRightLeft className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                              </div>
                              <span className="text-xs font-medium capitalize text-gray-600 dark:text-gray-300">{tx.type.toLowerCase()}</span>
                            </div>
                          </TableCell>
                          <TableCell className="font-semibold text-gray-900 dark:text-gray-100">Rs. {tx.amount.toLocaleString()}</TableCell>
                          <TableCell>
                             <div className="flex flex-col text-xs text-gray-500 dark:text-gray-400">
                                <span>From: <span className="font-medium text-gray-800 dark:text-gray-200">{tx.fromUser?.fullName || 'System'}</span></span>
                                {tx.toUser && <span>To: <span className="font-medium text-gray-800 dark:text-gray-200">{tx.toUser.fullName}</span></span>}
                             </div>
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

      </div>
    </div>
  );
}