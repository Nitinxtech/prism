"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center px-4">
      <div className="text-4xl font-extrabold text-red-400">Error</div>
      <h1 className="mt-2 text-2xl font-bold text-white">Something went wrong</h1>
      <p className="mt-1 text-sm text-slate-400 max-w-md">
        {error.message || "An unexpected error occurred while loading this view."}
      </p>
      <button
        onClick={() => reset()}
        className="mt-6 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 transition hover:bg-indigo-500 cursor-pointer"
      >
        Try Again
      </button>
    </div>
  );
}
