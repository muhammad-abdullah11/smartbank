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
  const [transactionType, setTransactionsType] = useState<"send" | "receive">("send");

  return (
    <main className="w-full max-w-md m-12 bg-white shadow-lg rounded-2xl p-4">
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setTransactionsType("send")}
          className={`flex-1 py-2 rounded-xl font-medium transition ${
            transactionType === "send"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          Send
        </button>
        <button
          onClick={() => setTransactionsType("receive")}
          className={`flex-1 py-2 rounded-xl font-medium transition ${
            transactionType === "receive"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700"
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
    type === "send"
      ? tx.ledgerType === "DEBIT"
      : tx.ledgerType === "CREDIT"
  );

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="flex items-center justify-between bg-gray-50 p-3 rounded-xl animate-pulse"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
              <div className="space-y-2">
                <div className="w-32 h-3 bg-gray-300 rounded"></div>
                <div className="w-24 h-2 bg-gray-200 rounded"></div>
              </div>
            </div>
            <div className="w-16 h-3 bg-gray-300 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3 max-h-[400px] overflow-y-auto">
      {filtered.length === 0 && (
        <div className="text-center text-gray-500">No transactions</div>
      )}

      {filtered.map((tx) => (
        <div
          key={tx._id}
          className="flex items-center justify-between bg-gray-50 p-3 rounded-xl shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-full ${
                tx.ledgerType === "DEBIT"
                  ? "bg-red-100 text-red-600"
                  : "bg-green-100 text-green-600"
              }`}
            >
              {tx.ledgerType === "DEBIT" ? <FaArrowUp /> : <FaArrowDown />}
            </div>

            <div>
              <p className="text-sm font-semibold">
                {tx.ledgerType === "DEBIT"
                  ? `To: ${tx.toAccount.fullName}`
                  : `From: ${tx.fromAccount.fullName}`}
              </p>
              <p className="text-xs text-gray-500">
                {new Date(tx.createdAt).toLocaleString()}
              </p>
              <p className="text-xs text-gray-400">{tx.description}</p>
            </div>
          </div>

          <div
            className={`font-semibold ${
              tx.ledgerType === "DEBIT" ? "text-red-600" : "text-green-600"
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