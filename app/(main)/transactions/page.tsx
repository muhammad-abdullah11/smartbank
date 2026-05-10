"use client";
import React, { useEffect, useMemo, useState } from "react";
import { FaArrowUp, FaArrowDown } from "react-icons/fa";
import axios from "axios";

type Transaction = {
  _id: string;
  amount: number;
  description: string;
  createdAt: string;
  ledgerType: "DEBIT" | "CREDIT";
  idempotencyKey: string;
  fromAccount: { fullName: string; accountNumber: string };
  toAccount: { fullName: string; accountNumber: string };
};

const Transactions = () => {
  const [transactionType, setTransactionsType] = useState<"send" | "receive">(
    "send",
  );

  return (
    <main className="w-full max-w-md m-12 bg-white dark:bg-gray-800  rounded-2xl py-4 overflow-x-hidden ">
      <h2 className="text-3xl  text-center mb-4 font-black tracking-tight text-gray-900 dark:text-white">
        Transactions History
      </h2>
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setTransactionsType("send")}
          className={`flex-1 py-2 rounded-xl font-medium transition ${
            transactionType === "send"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
          }`}
        >
          Send
        </button>
        <button
          onClick={() => setTransactionsType("receive")}
          className={`flex-1 py-2 rounded-xl font-medium transition ${
            transactionType === "receive"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
          }`}
        >
          Receive
        </button>
      </div>

      <TransactionList type={transactionType} />
    </main>
  );
};

export default Transactions;

function TransactionList({ type }: { type: "send" | "receive" }) {
  const [data, setData] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      const res = await axios.get("/api/transactions");
      setData(res.data.transactions || []);
      setLoading(false);
    };
    fetchTransactions();
  }, []);

  const uniqueTransactions = useMemo(() => {
    const map = new Map<string, Transaction>();
    data.forEach((tx) => {
      const key = tx.idempotencyKey.replace("_credit", "");
      if (!map.has(key)) {
        map.set(key, tx);
      }
    });
    return Array.from(map.values());
  }, [data]);

  const filtered = uniqueTransactions.filter((tx) =>
    type === "send" ? tx.ledgerType === "DEBIT" : tx.ledgerType === "CREDIT",
  );

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="flex items-center justify-between bg-gray-50 dark:bg-gray-900 p-3 rounded-xl animate-pulse"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
              <div className="space-y-2">
                <div className="w-32 h-3 bg-gray-300 dark:bg-gray-600 rounded"></div>
                <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            </div>
            <div className="w-16 h-3 bg-gray-300 dark:bg-gray-600 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="max-h-md overflow-hidden mx-auto flex flex-col items-center lg:items-start justify-center gap-4">
      {filtered.length === 0 && (
        <div className="text-center text-gray-500 dark:text-gray-400">
          No transactions
        </div>
      )}
      {filtered.map((tx) => (
        <div
          key={tx._id}
          className="w-full max-w-2xl flex flex-col sm:flex-row items-center sm:items-center justify-between gap-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300"
        >
          <div className="flex flex-col sm:flex-row items-center sm:items-center gap-3 text-center sm:text-left">
            <div
              className={`p-3 rounded-2xl ${
                tx.ledgerType === "DEBIT"
                  ? "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
                  : "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
              }`}
            >
              {tx.ledgerType === "DEBIT" ? <FaArrowUp /> : <FaArrowDown />}
            </div>

            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {tx.ledgerType === "DEBIT"
                  ? `To: ${tx.toAccount.fullName}`
                  : `From: ${tx.fromAccount.fullName}`}
              </p>

              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {new Date(tx.createdAt).toLocaleString()}
              </p>

              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                {tx.description}
              </p>
            </div>
          </div>

          <div
            className={`text-base font-bold ${
              tx.ledgerType === "DEBIT"
                ? "text-red-600 dark:text-red-400"
                : "text-green-600 dark:text-green-400"
            }`}
          >
            {tx.ledgerType === "DEBIT" ? "-" : "+"} Rs{" "}
            {tx.amount.toLocaleString()}
          </div>
        </div>
      ))}
    </div>
  );
}
