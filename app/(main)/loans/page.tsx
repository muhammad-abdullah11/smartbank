"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { FaCheckCircle, FaTimesCircle, FaClock, FaSortAmountDown, FaRedo } from "react-icons/fa";
import Link from "next/link";

type Loan = {
  _id: string;
  user: { fullName: string };
  amount: number;
  duration: number;
  reason: string;
  status: string;
  createdAt: string;
};

const statusConfig = {
  APPROVED: { icon: FaCheckCircle, bg: "bg-emerald-50 dark:bg-emerald-900/25", text: "text-emerald-700 dark:text-emerald-300", dot: "bg-emerald-500", label: "Approved" },
  REJECTED: { icon: FaTimesCircle, bg: "bg-rose-50 dark:bg-rose-900/25", text: "text-rose-700 dark:text-rose-300", dot: "bg-rose-500", label: "Rejected" },
  PENDING: { icon: FaClock, bg: "bg-amber-50 dark:bg-amber-900/25", text: "text-amber-700 dark:text-amber-300", dot: "bg-amber-500", label: "Pending" },
} as const;

export default function LoansPage() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchLoans = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get("/api/loan");
      setLoans(res.data.loans);
    } catch {
      setError("Failed to load loan requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLoans() }, []);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8 flex items-center justify-center">
        <div className="text-center bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 max-w-sm">
          <div className="w-14 h-14 mx-auto rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center mb-4">
            <FaTimesCircle className="w-6 h-6 text-rose-500" />
          </div>
          <p className="text-gray-900 dark:text-gray-100 font-medium mb-1">Failed to load</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">{error}</p>
          <button onClick={fetchLoans} className="inline-flex items-center gap-2 px-5 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
            <FaRedo className="w-3.5 h-3.5" /> Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8 transition-colors">
      <section className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Loan Requests</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {loading ? "Loading..." : `${loans.length} request${loans.length !== 1 ? "s" : ""} found`}
            </p>
        
          </div>
          <div className="flex gap-3">
          <Link
          href="/request-loan"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 dark:bg-gray-800 text-white dark:text-gray-300 text-sm font-medium rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm disabled:opacity-50">
         Request new loan
          </Link>
          <button onClick={fetchLoans} disabled={loading} className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm disabled:opacity-50">
            <FaRedo className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
          </button>
        </div>
          </div>  

        <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          {loading ? (
            <div className="p-6 space-y-5">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="flex items-center gap-4 animate-pulse">
                  <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
                  <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
                  <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
                  <div className="h-4 w-48 bg-gray-200 dark:bg-gray-700 rounded flex-1" />
                  <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded-full" />
                </div>
              ))}
            </div>
          ) : loans.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 mx-auto rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-4">
                <FaClock className="w-6 h-6 text-gray-400" />
              </div>
              <p className="text-gray-900 dark:text-gray-100 font-medium">No loan requests</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">New requests will appear here</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-700">
                  {["User", "Amount", "Duration", "Reason", "Date", "Status"].map(h => (
                    <th key={h} className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      <span className="inline-flex items-center gap-1.5">
                        {h === "Amount" && <FaSortAmountDown className="w-3 h-3" />}
                        {h}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
                {loans.map((loan, idx) => {
                  const status = statusConfig[loan.status as keyof typeof statusConfig] || statusConfig.PENDING;
                  const StatusIcon = status.icon;
                  return (
                    <tr key={loan._id} className="py-2 group hover:bg-gray-50/80 dark:hover:bg-gray-700/30 transition-colors">
                      <td className="p-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs font-bold">
                            {loan.user.fullName.charAt(0)}
                          </div>
                          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{loan.user.fullName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">Rs. {loan.amount.toLocaleString()}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600 dark:text-gray-400">{loan.duration}mo</span>
                      </td>
                      <td className="px-6 py-4 max-w-xs">
                        <p className="text-sm text-gray-600 dark:text-gray-400 truncate group-hover:text-clip">{loan.reason}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-500 dark:text-gray-400">{new Date(loan.createdAt).toLocaleDateString("en-GB")}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${status.bg} ${status.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                          <StatusIcon className="w-3 h-3" />
                          {status.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </section>
      </section>
    </main>
  );
}
