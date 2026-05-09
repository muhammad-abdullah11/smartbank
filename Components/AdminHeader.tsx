"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { LogOut, ShieldAlert } from "lucide-react";

export default function AdminHeader() {
  return (
    <header className="sticky top-0 z-50 flex h-16 w-full items-center justify-between border-b border-gray-200 bg-white px-6 shadow-sm dark:border-gray-800 dark:bg-gray-950">
      <div className="flex items-center gap-4">
        <Link href="/dashboard" className="flex items-center gap-2 font-bold text-red-600 dark:text-red-500">
          <ShieldAlert className="h-5 w-5" />
          <span>SmartBank Admin</span>
        </Link>
        <nav className="ml-6 hidden space-x-6 md:flex">
          <Link href="/dashboard" className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
            Dashboard
          </Link>
          <Link href="/admin/loans" className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
            Loan Management
          </Link>
          <Link href="/admin/users" className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
            User Management
          </Link>
        </nav>
      </div>
      <button
        onClick={() => signOut({ callbackUrl: '/login' })}
        className="flex items-center gap-2 rounded-md bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
      >
        <LogOut className="h-4 w-4" />
        Sign Out
      </button>
    </header>
  );
}
