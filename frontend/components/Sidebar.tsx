"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "./ThemeProvider";

const NAV_ITEMS = [
  { href: "/dashboard",    label: "Home",               icon: "⊞" },
  { href: "/readiness",    label: "Readiness Plan",     icon: "◎" },
  { href: "/opportunities",label: "Opportunities",      icon: "◈" },
  { href: "/codebase",     label: "Codebase Insights",  icon: "⟨⟩" },
  { href: "/system",       label: "System Map",         icon: "⬡" },
  { href: "/dependencies", label: "Dependencies",       icon: "⛓" },
  { href: "/collaborate",  label: "Collaborate",        icon: "⊙" },
  { href: "/ask",          label: "Ask PRISM",          icon: "✦" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { theme, toggle } = useTheme();

  return (
    <aside
      className="fixed left-0 top-0 h-screen w-[240px] flex flex-col justify-between border-r z-30 select-none"
      style={{
        background: "var(--sidebar)",
        borderColor: "var(--line)",
      }}
    >
      {/* Top Brand / Logo */}
      <div>
        <div className="px-5 py-5 border-b" style={{ borderColor: "var(--line)" }}>
          <div className="flex items-center gap-3">
            {/* PRISM Glowing Logo Icon */}
            <div
              className="flex h-9 w-9 items-center justify-center rounded-xl font-bold text-sm shadow-md"
              style={{
                background: "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)",
                color: "#fff",
                boxShadow: "0 0 16px rgba(99, 102, 241, 0.4)",
              }}
            >
              <svg width="18" height="18" viewBox="0 0 48 48" fill="none">
                <polygon
                  points="24,5 43,38 5,38"
                  stroke="white"
                  strokeWidth="3.5"
                  strokeLinejoin="round"
                  fill="none"
                />
                <line x1="24" y1="5" x2="24" y2="24" stroke="white" strokeWidth="3" />
                <line x1="5" y1="38" x2="24" y2="24" stroke="white" strokeWidth="3" />
                <line x1="43" y1="38" x2="24" y2="24" stroke="white" strokeWidth="3" />
              </svg>
            </div>
            <div>
              <div className="font-bold text-sm tracking-tight" style={{ color: "var(--ink)" }}>
                PRISM
              </div>
              <div
                className="text-[9px] font-semibold uppercase tracking-[0.2em]"
                style={{ color: "var(--muted)" }}
              >
                Developer
              </div>
            </div>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="overflow-y-auto px-3 py-4 space-y-1">
          <div
            className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.2em]"
            style={{ color: "var(--muted)" }}
          >
            Navigation
          </div>
          {NAV_ITEMS.map(({ href, label, icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 rounded-xl px-3.5 py-2 text-xs font-medium transition-all duration-150 group ${
                  active ? "shadow-sm" : "hover:bg-[var(--panel-2)]"
                }`}
                style={{
                  background: active ? "var(--indigo-dim)" : "transparent",
                  color: active ? "var(--indigo)" : "var(--muted)",
                  fontWeight: active ? 600 : 500,
                  border: active ? "1px solid rgba(99, 102, 241, 0.3)" : "1px solid transparent",
                }}
              >
                <span className="text-sm w-4 text-center leading-none">{icon}</span>
                <span className="group-hover:text-[var(--ink)] transition-colors">{label}</span>
                {active && (
                  <span
                    className="ml-auto h-1.5 w-1.5 rounded-full"
                    style={{ background: "var(--indigo)" }}
                  />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section: Project Health Card + User Profile Pill */}
      <div className="px-3 pb-4 space-y-2.5">
        {/* Project Health Card */}
        <div
          className="rounded-2xl border p-3.5 space-y-2"
          style={{
            background: "var(--panel)",
            borderColor: "var(--line)",
          }}
        >
          <div className="flex items-center justify-between">
            <div className="text-xs font-bold" style={{ color: "var(--ink)" }}>
              Project Phoenix
            </div>
            <span
              className="text-[9px] font-bold px-2 py-0.5 rounded-full border"
              style={{
                background: "var(--green-dim)",
                color: "var(--green)",
                borderColor: "rgba(35, 130, 90, 0.3)",
              }}
            >
              On Track
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px]" style={{ color: "var(--muted)" }}>
            <span className="text-xs">🏢</span>
            <span>ABC Retail</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full" style={{ background: "var(--line)" }}>
            <div
              className="h-full rounded-full transition-all"
              style={{ width: "82%", background: "var(--green)" }}
            />
          </div>
          <div className="flex justify-between text-[10px]" style={{ color: "var(--muted)" }}>
            <span>Health score</span>
            <span className="font-bold" style={{ color: "var(--green)" }}>82 / 100</span>
          </div>
        </div>

        {/* User Profile Pill */}
        <div
          className="rounded-xl border p-2.5 flex items-center justify-between transition-all"
          style={{
            background: "var(--panel)",
            borderColor: "var(--line)",
          }}
        >
          <div className="flex items-center gap-2.5">
            <div
              className="h-8 w-8 rounded-full border flex items-center justify-center text-xs font-bold shrink-0"
              style={{
                background: "var(--panel-2)",
                color: "var(--ink)",
                borderColor: "var(--line)",
              }}
            >
              N
            </div>
            <div className="overflow-hidden">
              <div
                className="text-xs font-bold truncate leading-tight"
                style={{ color: "var(--ink)" }}
              >
                Nitin Pandey
              </div>
              <div
                className="text-[10px] truncate leading-tight mt-0.5"
                style={{ color: "var(--muted)" }}
              >
                Developer
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={toggle}
            title={`Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`}
            className="p-1.5 rounded-lg hover:bg-[var(--panel-2)] transition text-xs cursor-pointer"
            style={{ color: "var(--muted)" }}
          >
            ⚙
          </button>
        </div>
      </div>
    </aside>
  );
}
