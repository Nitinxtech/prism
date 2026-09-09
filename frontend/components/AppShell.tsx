"use client";

import { ReactNode, useState } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import { useTheme } from "./ThemeProvider";

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { theme, toggle } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const isLandingPage = pathname === "/";

  if (isLandingPage) {
    return (
      <div className="min-h-screen w-full" style={{ background: "#07080f", color: "#e8e9ee" }}>
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--paper)", color: "var(--ink)" }}>
      <Sidebar />
      <div className="ml-[240px] min-h-screen flex flex-col">
        {/* Top Global Navigation Bar (Matching SS2) */}
        <header
          className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b px-8 backdrop-blur-md transition-colors"
          style={{
            background: "rgba(13, 16, 26, 0.75)",
            borderColor: "var(--line)",
          }}
        >
          {/* Search Input */}
          <div className="relative w-full max-w-md">
            <span
              className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-xs"
              style={{ color: "var(--muted)" }}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search projects, code, people, or ask PRISM..."
              className="w-full rounded-xl border py-2 pl-9 pr-4 text-xs transition outline-none"
              style={{
                background: "var(--panel)",
                borderColor: "var(--line)",
                color: "var(--ink)",
              }}
            />
          </div>

          {/* Top Right Action Icons & Profile */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle Button */}
            <button
              type="button"
              onClick={toggle}
              title={`Switch to ${theme === "dark" ? "Light" : "Dark"} mode`}
              className="flex h-8 w-8 items-center justify-center rounded-lg border text-sm transition cursor-pointer hover:opacity-80"
              style={{
                background: "var(--panel)",
                borderColor: "var(--line)",
                color: "var(--muted)",
              }}
            >
              {theme === "dark" ? "☀" : "⏾"}
            </button>

            {/* Notification Bell with Red Badge Dot */}
            <button
              type="button"
              className="relative flex h-8 w-8 items-center justify-center rounded-lg border text-sm transition cursor-pointer hover:opacity-80"
              style={{
                background: "var(--panel)",
                borderColor: "var(--line)",
                color: "var(--muted)",
              }}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.8"
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
              {/* Red dot badge */}
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-slate-900" />
            </button>

            {/* User Avatar Circle */}
            <div
              className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white shadow-md cursor-pointer"
              style={{
                background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                boxShadow: "0 0 12px rgba(99, 102, 241, 0.4)",
              }}
              title="Sam · Developer"
            >
              S
            </div>
          </div>
        </header>

        {/* Main Content View */}
        <main className="flex-1 px-8 py-6">{children}</main>
      </div>
    </div>
  );
}
