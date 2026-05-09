"use client";

import React, { useState } from "react";
import axios from "axios";

const LoanRequest = () => {
  const [amount, setAmount] = useState("");
  const [duration, setDuration] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await axios.post("/api/loan/request", {
        amount: Number(amount),
        duration: Number(duration),
        reason,
      });

      setSuccess("Loan request submitted successfully");
      setAmount("");
      setDuration("");
      setReason("");
    } catch {
      setError("Failed to submit loan request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-50 to-slate-100 dark:from-gray-950 dark:to-gray-900 px-4">
      <section className="w-full max-w-lg bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-slate-800 dark:text-white">
            Loan Request
          </h2>
          <p className="text-sm text-slate-500 dark:text-gray-400 mt-1">
            Fill in the details below to request a loan
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">
              Amount
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">
              Duration (months)
            </label>
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="Enter duration"
              className="w-full px-4 py-3 overflow-hidden rounded-xl border border-slate-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">
              Reason
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Explain your reason"
              rows={4}
              className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition resize-none"
              required
            />
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
              {error}
            </div>
          )}

          {success && (
            <div className="text-sm text-green-700 bg-green-50 p-3 rounded-lg border border-green-200">
              {success}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium transition disabled:opacity-60 disabled:cursor-not-allowed shadow-md"
          >
            {loading ? "Submitting..." : "Submit Request"}
          </button>
        </form>
      </section>
    </main>
  );
};

export default LoanRequest;