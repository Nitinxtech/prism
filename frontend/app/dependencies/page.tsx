"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "../../lib/api";
import { Dependency, Insight } from "../../types";

type DetailedDependency = Dependency & {
  type?: string;
  category?: "npm" | "python" | "core" | "external";
  license?: string;
  recommendedVersion?: string;
  riskLevel?: "high" | "medium" | "low";
  cveCount?: number;
};

const SAMPLE_DEPENDENCIES: DetailedDependency[] = [
  {
    id: "axios",
    name: "axios",
    version: "0.27.2",
    status: "Deprecated",
    used_in: [
      "src/services/paymentservice.ts",
      "src/api/payment.ts",
      "src/services/OrderService.ts",
    ],
    affected_services: ["Payment Service", "Order Service", "API Gateway"],
    category: "npm",
    license: "MIT",
    recommendedVersion: "1.7.9",
    riskLevel: "high",
    cveCount: 2,
  },
  {
    id: "lodash",
    name: "lodash",
    version: "4.17.20",
    status: "Outdated",
    used_in: [
      "src/utils/formatters.ts",
      "src/services/catalogService.ts",
      "src/auth/jwt.ts",
    ],
    affected_services: ["Web App", "Catalog Service", "Auth Service"],
    category: "npm",
    license: "MIT",
    recommendedVersion: "4.17.21",
    riskLevel: "medium",
    cveCount: 1,
  },
  {
    id: "react",
    name: "react",
    version: "18.3.1",
    status: "Current",
    used_in: [
      "src/components/ui/Button.tsx",
      "src/app/page.tsx",
      "src/hooks/useAuth.ts",
    ],
    affected_services: ["Web App", "Customer Portal"],
    category: "core",
    license: "MIT",
    recommendedVersion: "19.0.0",
    riskLevel: "low",
    cveCount: 0,
  },
  {
    id: "jsonwebtoken",
    name: "jsonwebtoken",
    version: "8.5.1",
    status: "Outdated",
    used_in: ["src/auth/jwt.ts", "src/middleware/authGuard.ts"],
    affected_services: ["Auth Service", "API Gateway"],
    category: "npm",
    license: "MIT",
    recommendedVersion: "9.0.2",
    riskLevel: "medium",
    cveCount: 1,
  },
  {
    id: "redis",
    name: "redis",
    version: "4.6.7",
    status: "Current",
    used_in: ["src/cache/redisClient.ts", "src/services/sessionStore.ts"],
    affected_services: ["Payment Service", "Web App"],
    category: "core",
    license: "MIT",
    recommendedVersion: "4.7.0",
    riskLevel: "low",
    cveCount: 0,
  },
];

const SAMPLE_INSIGHTS: Record<string, Insight> = {
  axios: {
    title: "Axios 0.27.2 Migration Impact",
    summary:
      "3 files and 3 services are affected. The 0.27.x release line has known security vulnerabilities regarding SSRF and prototype pollution in query string parsing.",
    severity: "high",
    impact:
      "Direct HTTP client calls in Payment Service and Order Service risk payload injection on external webhook forwarding.",
    action:
      "Update the dependency behind a shared HTTP client wrapper, run focused tests across payment flows, then migrate dependent modules.",
    evidence: [
      {
        text: "Used in 3 critical business files across payments and orders.",
        source: "DEPENDENCY INVENTORY",
        reference: "AXIOS",
      },
      {
        text: "Affected services: Payment Service, Order Service, API Gateway.",
        source: "DEPENDENCY GRAPH",
        reference: "AXIOS",
      },
      {
        text: "Estimated effort: 2-3 days (Breaking changes in Axios headers & error response schema).",
        source: "PRISM ESTIMATE",
        reference: "AST ANALYSIS",
      },
    ],
  },
  lodash: {
    title: "Lodash 4.17.20 Security Patch",
    summary:
      "3 files and 3 services are affected. Minor patch update to 4.17.21 fixes prototype pollution in lodash.template and zipObjectDeep.",
    severity: "medium",
    impact:
      "Utility helper calls in formatters and catalog transformers are safe from breaking API changes.",
    action:
      "Bump package.json to lodash@^4.17.21 and run unit test suite.",
    evidence: [
      {
        text: "Used in 3 utility and catalog formatting files.",
        source: "DEPENDENCY INVENTORY",
        reference: "LODASH",
      },
      {
        text: "Affected services: Web App, Catalog Service, Auth Service.",
        source: "DEPENDENCY GRAPH",
        reference: "LODASH",
      },
      {
        text: "Estimated effort: 0.5 day (Zero breaking changes, drop-in replacement).",
        source: "PRISM ESTIMATE",
        reference: "VERSION COMPATIBILITY",
      },
    ],
  },
  react: {
    title: "React 18.3.1 Health Assessment",
    summary:
      "React is currently at a stable release with full compatibility across all frontend components. Ready for React 19 upgrade assessment.",
    severity: "low",
    impact: "No immediate risks. Production build is fully optimized.",
    action: "Maintain current version; evaluate React 19 canary features in staging.",
    evidence: [
      {
        text: "Used in 42 UI components across the frontend workspace.",
        source: "DEPENDENCY INVENTORY",
        reference: "REACT",
      },
      {
        text: "Zero known vulnerabilities or deprecated lifecycle warnings.",
        source: "SECURITY SCAN",
        reference: "NPM AUDIT",
      },
    ],
  },
};

export default function DependenciesPage() {
  const [dependencies, setDependencies] = useState<DetailedDependency[]>(SAMPLE_DEPENDENCIES);
  const [selectedDep, setSelectedDep] = useState<DetailedDependency>(SAMPLE_DEPENDENCIES[0]);
  const [insight, setInsight] = useState<Insight>(SAMPLE_INSIGHTS.axios);
  const [filter, setFilter] = useState<"all" | "deprecated" | "outdated" | "current">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"impact" | "files" | "security" | "plan">("impact");
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    api<Dependency[]>("/dependencies")
      .then((data) => {
        if (data && data.length > 0) {
          const merged = data.map((d) => ({
            ...d,
            category: "npm" as const,
            recommendedVersion: d.status === "Deprecated" ? "1.7.9" : "Latest",
            riskLevel: d.status === "Deprecated" ? "high" as const : d.status === "Outdated" ? "medium" as const : "low" as const,
            cveCount: d.status === "Deprecated" ? 2 : d.status === "Outdated" ? 1 : 0,
          }));
          setDependencies(merged);
          setSelectedDep(merged[0]);
        }
      })
      .catch(() => {
        // Fallback to rich sample data
      });
  }, []);

  useEffect(() => {
    if (!selectedDep) return;

    if (SAMPLE_INSIGHTS[selectedDep.id]) {
      setInsight(SAMPLE_INSIGHTS[selectedDep.id]);
    } else {
      api<Insight>(`/dependencies/${selectedDep.id}/impact`)
        .then(setInsight)
        .catch(() => {
          setInsight({
            title: `${selectedDep.name} ${selectedDep.version} Analysis`,
            summary: `${selectedDep.used_in.length} files and ${selectedDep.affected_services.length} services are affected.`,
            severity: selectedDep.status === "Deprecated" ? "high" : "medium",
            impact: "Requires dependency update and automated regression test execution.",
            action: `Update ${selectedDep.name} to the latest stable release.`,
            evidence: [
              {
                text: `Used in ${selectedDep.used_in.length} files across the codebase.`,
                source: "DEPENDENCY INVENTORY",
                reference: selectedDep.name.toUpperCase(),
              },
            ],
          });
        });
    }
  }, [selectedDep]);

  const handleScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
    }, 600);
  };

  const filteredDependencies = dependencies.filter((dep) => {
    const matchesFilter =
      filter === "all" ||
      (filter === "deprecated" && dep.status === "Deprecated") ||
      (filter === "outdated" && dep.status === "Outdated") ||
      (filter === "current" && dep.status === "Current");

    const matchesSearch =
      dep.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dep.version.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const counts = {
    total: dependencies.length,
    deprecated: dependencies.filter((d) => d.status === "Deprecated").length,
    outdated: dependencies.filter((d) => d.status === "Outdated").length,
    current: dependencies.filter((d) => d.status === "Current").length,
  };

  return (
    <div className="space-y-6 pb-12">
      {/* ─── Top Header & Global Actions ─── */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-indigo-400">
            DEVELOPER &gt; PROJECT PHOENIX
          </div>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Dependency Intelligence
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-400">
            See what is outdated, where it is used, and what a migration would affect.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            className="flex items-center gap-2 rounded-xl border border-slate-700/80 bg-[#161a28] px-4 py-2 text-xs font-semibold text-slate-200 transition hover:bg-[#1f2438] cursor-pointer"
          >
            <span>⤓</span>
            <span>Export Report</span>
          </button>
          <button
            type="button"
            onClick={handleScan}
            disabled={isScanning}
            className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 transition hover:bg-indigo-500 cursor-pointer disabled:opacity-70"
          >
            <span>✦</span>
            <span>{isScanning ? "Scanning Codebase..." : "Scan Dependencies"}</span>
          </button>
        </div>
      </div>

      {/* ─── 5 KPI Metric Indicator Strip ─── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* Metric 1 */}
        <div
          className="flex items-center gap-3 rounded-2xl border p-4 shadow-sm"
          style={{ background: "var(--panel)", borderColor: "var(--line)" }}
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-950/60 border border-indigo-800/50 text-indigo-400">
            <span className="font-bold text-sm">📦</span>
          </div>
          <div>
            <div className="text-xl font-extrabold text-white">{counts.total}</div>
            <div className="text-xs text-slate-400">Total Packages</div>
          </div>
        </div>

        {/* Metric 2 */}
        <div
          className="flex items-center gap-3 rounded-2xl border p-4 shadow-sm"
          style={{ background: "var(--panel)", borderColor: "var(--line)" }}
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-950/60 border border-red-800/50 text-red-400">
            <span className="font-bold text-sm">⚠</span>
          </div>
          <div>
            <div className="text-xl font-extrabold text-red-400">{counts.deprecated}</div>
            <div className="text-xs text-slate-400">Deprecated</div>
          </div>
        </div>

        {/* Metric 3 */}
        <div
          className="flex items-center gap-3 rounded-2xl border p-4 shadow-sm"
          style={{ background: "var(--panel)", borderColor: "var(--line)" }}
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-950/60 border border-amber-800/50 text-amber-400">
            <span className="font-bold text-sm">↻</span>
          </div>
          <div>
            <div className="text-xl font-extrabold text-amber-400">{counts.outdated}</div>
            <div className="text-xs text-slate-400">Outdated</div>
          </div>
        </div>

        {/* Metric 4 */}
        <div
          className="flex items-center gap-3 rounded-2xl border p-4 shadow-sm"
          style={{ background: "var(--panel)", borderColor: "var(--line)" }}
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-950/60 border border-emerald-800/50 text-emerald-400">
            <span className="font-bold text-sm">✓</span>
          </div>
          <div>
            <div className="text-xl font-extrabold text-emerald-400">{counts.current}</div>
            <div className="text-xs text-slate-400">Healthy & Current</div>
          </div>
        </div>

        {/* Metric 5 */}
        <div
          className="flex items-center gap-3 rounded-2xl border p-4 shadow-sm"
          style={{ background: "var(--panel)", borderColor: "var(--line)" }}
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-950/60 border border-cyan-800/50 text-cyan-400">
            <span className="font-bold text-sm">🛡</span>
          </div>
          <div>
            <div className="text-xl font-extrabold text-white">2-3d</div>
            <div className="text-xs text-slate-400">Est. Migration Time</div>
          </div>
        </div>
      </div>

      {/* ─── 2-Column Split: List of Dependencies & Migration Impact Details ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1.9fr] gap-6 items-start">
        
        {/* LEFT: Dependencies List */}
        <div
          className="rounded-2xl border p-5 shadow-sm space-y-4"
          style={{ background: "var(--panel)", borderColor: "var(--line)" }}
        >
          {/* Search & Filter Bar */}
          <div className="space-y-3">
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-xs text-slate-500">
                🔍
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter dependencies..."
                className="w-full rounded-xl border py-2 pl-8 pr-3 text-xs outline-none transition"
                style={{
                  background: "var(--panel-2)",
                  borderColor: "var(--line)",
                  color: "var(--ink)",
                }}
              />
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap gap-1.5">
              {(["all", "deprecated", "outdated", "current"] as const).map((f) => {
                const labels = {
                  all: `All (${counts.total})`,
                  deprecated: `Deprecated (${counts.deprecated})`,
                  outdated: `Outdated (${counts.outdated})`,
                  current: `Healthy (${counts.current})`,
                };
                const active = filter === f;

                return (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition cursor-pointer border ${
                      active
                        ? "bg-indigo-600 text-white border-indigo-500 shadow-sm"
                        : "border-slate-800 bg-[#121624] text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {labels[f]}
                  </button>
                );
              })}
            </div>
          </div>

          {/* List of Dependency Cards */}
          <div className="space-y-2.5 pt-1">
            {filteredDependencies.map((dep) => {
              const isSelected = selectedDep?.id === dep.id;
              const isDeprecated = dep.status === "Deprecated";
              const isOutdated = dep.status === "Outdated";

              return (
                <button
                  type="button"
                  key={dep.id}
                  onClick={() => setSelectedDep(dep)}
                  className={`group w-full flex items-center justify-between rounded-2xl border p-4 text-left transition-all duration-150 cursor-pointer ${
                    isSelected
                      ? "border-indigo-500/80 shadow-md ring-1 ring-indigo-500/50"
                      : "hover:border-slate-700"
                  }`}
                  style={{
                    background: isSelected ? "var(--indigo-dim)" : "var(--panel-2)",
                    borderColor: isSelected ? "rgba(99, 102, 241, 0.6)" : "var(--line)",
                  }}
                >
                  <div className="flex items-center gap-3">
                    {/* Badge Icon */}
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl font-mono font-bold text-[10px] border ${
                        isDeprecated
                          ? "bg-red-950/70 border-red-800/60 text-red-400"
                          : isOutdated
                          ? "bg-amber-950/70 border-amber-800/60 text-amber-400"
                          : "bg-emerald-950/70 border-emerald-800/60 text-emerald-400"
                      }`}
                    >
                      {dep.name.slice(0, 3)}
                    </div>

                    <div>
                      <div className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">
                        {dep.name}
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5 mono">
                        {dep.version}
                      </div>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div>
                    <span
                      className={`inline-flex rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide border ${
                        isDeprecated
                          ? "bg-red-950/80 border-red-800/60 text-red-400"
                          : isOutdated
                          ? "bg-amber-950/80 border-amber-800/60 text-amber-400"
                          : "bg-emerald-950/80 border-emerald-800/60 text-emerald-400"
                      }`}
                    >
                      {dep.status}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* RIGHT: Migration Impact & Intelligence Details */}
        {selectedDep && (
          <div
            className="rounded-2xl border p-7 shadow-sm space-y-6"
            style={{ background: "var(--panel)", borderColor: "var(--line)" }}
          >
            {/* Header Area */}
            <div className="flex items-start justify-between border-b pb-5" style={{ borderColor: "var(--line)" }}>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-400 mono">
                  MIGRATION IMPACT
                </div>
                <h2 className="mt-1 text-2xl font-extrabold text-white flex items-baseline gap-2.5">
                  <span>{selectedDep.name}</span>
                  <span className="text-base text-slate-400 font-mono font-normal">
                    {selectedDep.version}
                  </span>
                </h2>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex rounded-lg px-3 py-1.5 text-xs font-bold uppercase tracking-wide border ${
                    selectedDep.status === "Deprecated"
                      ? "bg-red-950/80 border-red-800/60 text-red-400 shadow-sm"
                      : selectedDep.status === "Outdated"
                      ? "bg-amber-950/80 border-amber-800/60 text-amber-400"
                      : "bg-emerald-950/80 border-emerald-800/60 text-emerald-400"
                  }`}
                >
                  {selectedDep.status}
                </span>
              </div>
            </div>

            {/* Impact Metric Cards (Files Affected & Services Affected) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div
                className="rounded-2xl border p-5"
                style={{ background: "var(--panel-2)", borderColor: "var(--line)" }}
              >
                <div className="text-xs text-slate-400">Files affected</div>
                <div className="mt-1 text-3xl font-extrabold text-white">
                  {selectedDep.used_in.length}
                </div>
              </div>

              <div
                className="rounded-2xl border p-5"
                style={{ background: "var(--panel-2)", borderColor: "var(--line)" }}
              >
                <div className="text-xs text-slate-400">Services affected</div>
                <div className="mt-1 text-3xl font-extrabold text-white">
                  {selectedDep.affected_services.length}
                </div>
              </div>
            </div>

            {/* Affected Services */}
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2.5">
                AFFECTED SERVICES
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedDep.affected_services.map((svc) => (
                  <span
                    key={svc}
                    className="rounded-xl border border-slate-700 bg-[#161a28] px-3 py-1.5 text-xs font-semibold text-slate-200"
                  >
                    {svc}
                  </span>
                ))}
              </div>
            </div>

            {/* Used In File Paths */}
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2.5">
                USED IN
              </div>
              <div className="space-y-1.5">
                {selectedDep.used_in.map((filePath) => (
                  <div
                    key={filePath}
                    className="flex items-center justify-between rounded-xl border p-3 mono text-xs"
                    style={{ background: "var(--panel-2)", borderColor: "var(--line)", color: "var(--ink)" }}
                  >
                    <span className="text-slate-300 font-mono">{filePath}</span>
                    <span className="text-[10px] text-indigo-400 font-sans font-bold hover:underline cursor-pointer">
                      View code ↗
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* PRISM Analysis & Action Section */}
            {insight && (
              <div className="space-y-3 pt-2">
                <div className="text-[11px] font-bold uppercase tracking-wider text-indigo-400">
                  PRISM ANALYSIS
                </div>
                <div
                  className="rounded-2xl border p-4 text-xs space-y-2 leading-relaxed"
                  style={{ background: "var(--panel-2)", borderColor: "var(--line)" }}
                >
                  <div className="text-slate-200 font-medium">{insight.summary}</div>
                  <div className="text-slate-300 pt-1">
                    <strong className="text-white font-bold">Action: </strong>
                    {insight.action}
                  </div>
                </div>

                {/* Evidence & Estimate Cards */}
                {insight.evidence && insight.evidence.length > 0 && (
                  <div className="space-y-2 pt-2">
                    {insight.evidence.map((ev, i) => (
                      <div
                        key={i}
                        className="rounded-xl border p-3.5 text-xs"
                        style={{ background: "var(--panel-2)", borderColor: "var(--line)" }}
                      >
                        <div className="text-slate-200 font-medium">{ev.text}</div>
                        <div className="mt-1 text-[10px] uppercase font-bold tracking-wider text-slate-500">
                          {ev.source} {ev.reference ? `· ${ev.reference}` : ""}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Bottom Actions */}
            <div className="pt-3 border-t flex flex-wrap items-center gap-3" style={{ borderColor: "var(--line)" }}>
              <Link
                href={`/ask?q=How+to+migrate+${encodeURIComponent(selectedDep.name)}+to+${encodeURIComponent(selectedDep.recommendedVersion || "latest")}`}
                className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 transition hover:bg-indigo-500 cursor-pointer"
              >
                <span>✦</span>
                <span>Plan Migration with PRISM</span>
              </Link>
              <button
                type="button"
                onClick={() => alert(`Copied migration command: npm install ${selectedDep.name}@${selectedDep.recommendedVersion || "latest"}`)}
                className="rounded-xl border border-slate-700 bg-[#161a28] px-4 py-2.5 text-xs font-semibold text-slate-200 transition hover:bg-[#1f2438] cursor-pointer"
              >
                Copy npm update command
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
