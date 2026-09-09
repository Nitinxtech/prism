"use client";

import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center px-4">
      <div className="text-4xl font-extrabold text-indigo-400">404</div>
      <h1 className="mt-2 text-2xl font-bold text-white">Page Not Found</h1>
      <p className="mt-1 text-sm text-slate-400">
        The page you are looking for does not exist in Project Phoenix.
      </p>
      <Link
        href="/dashboard"
        className="mt-6 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 transition hover:bg-indigo-500"
      >
        Return to Dashboard
      </Link>
    </div>
  );
}
