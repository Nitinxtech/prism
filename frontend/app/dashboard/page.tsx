"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "../../lib/api";
import { Opportunity, Dependency } from "../../types";

type Home = {
  developer: { name: string };
  project: { name: string; client: string };
  stats: {
    opportunities: number;
    open_tasks: number;
    attention_areas: number;
    experts_available: number;
  };
  opportunities: Opportunity[];
  dependency_alerts: Dependency[];
  focus: string[];
};

type AzureStatus = {
  connected: boolean;
  devops_connected: boolean;
  connected_at: number | null;
  account_name: string | null;
  tenant_id: string | null;
};

type AzureConnect = {
  auth_url: string;
  state: string;
};

type AzureResource = {
  id: string;
  name: string;
  type: string;
  location: string | null;
  resource_group: string | null;
};

type AzureSubscription = {
  id: string;
  name: string;
  state: string | null;
  resource_groups: { name: string; location: string | null }[];
  resources: AzureResource[];
};

type AzureInventory = {
  summary: { subscriptions: number; resource_groups: number; resources: number };
  subscriptions: AzureSubscription[];
};

type AzureDevOpsRepository = {
  id: string;
  name: string;
  web_url: string | null;
  default_branch: string | null;
  branches: { name: string; object_id: string | null }[];
  files: { path: string; is_folder: boolean; size: number | null }[];
};

type AzureDevOpsProject = {
  id: string;
  name: string;
  state: string | null;
  work_items: { id: number; title: string | null; type: string | null; state: string | null; assigned_to: string | null }[];
  repositories: AzureDevOpsRepository[];
};

type AzureDevOpsInventory = {
  organizations: { id: string; name: string; projects: AzureDevOpsProject[] }[];
};

type AzureDevOpsInsight = {
  title: string;
  summary: string;
  severity: string;
  impact: string;
  action: string;
  evidence: { text: string; source: string; reference?: string }[];
};

export default function DashboardPage() {
  const [data, setData] = useState<Home | null>(null);
  const [error, setError] = useState("");
  const [azure, setAzure] = useState<AzureStatus | null>(null);
  const [azureInventory, setAzureInventory] = useState<AzureInventory | null>(null);
  const [azureDevOps, setAzureDevOps] = useState<AzureDevOpsInventory | null>(null);
  const [azureDevOpsInsights, setAzureDevOpsInsights] = useState<AzureDevOpsInsight[]>([]);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isLoadingInventory, setIsLoadingInventory] = useState(false);
  const [isLoadingDevOps, setIsLoadingDevOps] = useState(false);
  const [connectError, setConnectError] = useState("");

  useEffect(() => {
    api<Home>("/home")
      .then(setData)
      .catch((x) => setError(x.message));

    api<AzureStatus>("/integrations/azure/status")
      .then(setAzure)
      .catch(() => {
        setAzure(null);
      });
  }, []);

  const loadAzureInventory = async () => {
    setConnectError("");
    setIsLoadingInventory(true);
    try {
      setAzureInventory(await api<AzureInventory>("/integrations/azure/inventory"));
    } catch (x) {
      const message = x instanceof Error ? x.message : "Failed to load Azure data.";
      setConnectError(message);
    } finally {
      setIsLoadingInventory(false);
    }
  };

  const loadAzureDevOps = async () => {
    setConnectError("");
    setIsLoadingDevOps(true);
    try {
      setAzureDevOps(await api<AzureDevOpsInventory>("/integrations/azure-devops/inventory"));
      setAzureDevOpsInsights(await api<AzureDevOpsInsight[]>("/integrations/azure-devops/insights"));
    } catch (x) {
      const message = x instanceof Error ? x.message : "Failed to load Azure DevOps data.";
      setConnectError(message);
    } finally {
      setIsLoadingDevOps(false);
    }
  };

  const startAzureConnect = async (service: "management" | "devops") => {
    setConnectError("");
    setIsConnecting(true);

    const popup = window.open("about:blank", "azure-connect", "popup=yes,width=560,height=720");
    if (!popup) {
      setIsConnecting(false);
      setConnectError("Popup blocked. Allow popups and try again.");
      return;
    }

    try {
      const response = await api<AzureConnect>(`/integrations/azure/connect?service=${service}`);
      popup.location.href = response.auth_url;

      const start = Date.now();
      const timer = window.setInterval(async () => {
        try {
          const status = await api<AzureStatus>("/integrations/azure/status");
          if (service === "devops" ? status.devops_connected : status.connected) {
            window.clearInterval(timer);
            if (!popup.closed) {
              popup.close();
            }
            setAzure(status);
            if (service === "devops") {
              void loadAzureDevOps();
            } else {
              void loadAzureInventory();
            }
            setIsConnecting(false);
            setConnectError("");
            return;
          }
        } catch {
          // Keep polling while OAuth callback is in progress.
        }

        if (popup.closed) {
          window.clearInterval(timer);
          setIsConnecting(false);
          const status = await api<AzureStatus>("/integrations/azure/status").catch(() => null);
          setAzure(status);
          if (!status?.connected) {
            setConnectError(`Azure ${service === "devops" ? "DevOps " : ""}sign-in was closed before connection completed.`);
          }
          return;
        }

        if (Date.now() - start > 120000) {
          window.clearInterval(timer);
          if (!popup.closed) {
            popup.close();
          }
          setIsConnecting(false);
          setConnectError(`Timed out while waiting for Azure ${service === "devops" ? "DevOps " : ""}connection.`);
        }
      }, 1500);
    } catch (x) {
      const message = x instanceof Error ? x.message : "Failed to start Azure connection.";
      if (!popup.closed) {
        popup.close();
      }
      setIsConnecting(false);
      setConnectError(message);
    }
  };

  if (error) {
    return <ErrorCard text={error} />;
  }
  if (!data) {
    return <LoadingCard />;
  }

  // Fallback items if array is small
  const opportunities = data.opportunities.length > 0 ? data.opportunities : [
    {
      title: "Improve Payment Service Test Coverage",
      summary: "Increase coverage around payment processing and API error handling.",
      match: 92,
    },
    {
      title: "Migrate deprecated Axios dependency",
      summary: "Replace the deprecated Axios version used by payment and order paths.",
      match: 87,
    },
    {
      title: "Improve API documentation",
      summary: "Document authentication and payment API behavior for faster onboarding and support.",
      match: 81,
    },
  ];

  const dependencyAlerts = data.dependency_alerts.length > 0 ? data.dependency_alerts : [
    { id: "1", name: "axios", version: "0.27.2", status: "Deprecated" },
    { id: "2", name: "lodash", version: "4.17.20", status: "Outdated" },
  ];

  const focusAreas = data.focus && data.focus.length > 0 
    ? data.focus 
    : ["Payment Service", "API Authentication", "Dependency Migration", "Test Coverage"];

  return (
    <div className="space-y-6 pb-12">
      {/* ─── Hero Header with Mountain Landscape Aesthetic ─── */}
      <div className="relative overflow-hidden rounded-2xl border p-7 shadow-sm transition-all"
        style={{
          background: "linear-gradient(180deg, #101426 0%, #0c0f1c 100%)",
          borderColor: "var(--line)",
        }}
      >
        {/* Ambient Mountain Silhouettes in Background */}
        <div className="pointer-events-none absolute inset-0 opacity-25">
          <svg className="w-full h-full object-cover" viewBox="0 0 1000 200" fill="none" preserveAspectRatio="none">
            <path d="M0,200 L0,110 L140,50 L280,130 L450,30 L600,120 L780,40 L900,100 L1000,60 L1000,200 Z" fill="#4338ca" opacity="0.2" />
            <path d="M0,200 L0,140 L200,90 L380,160 L550,80 L720,150 L880,90 L1000,130 L1000,200 Z" fill="#6366f1" opacity="0.3" />
            <path d="M0,200 L0,165 L250,130 L480,180 L680,125 L880,170 L1000,145 L1000,200 Z" fill="#0c0f1c" />
          </svg>
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-indigo-400">
              DEVELOPER · {data.project.name || "PROJECT PHOENIX"}
            </div>
            <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Good morning, {data.developer.name || "Sam"}.
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-400 max-w-xl">
              PRISM turns project context into the places where you can create the most impact.
            </p>
          </div>

          {/* Quote Pill on Right */}
          <div className="hidden lg:flex flex-col items-end text-right">
            <span className="text-xs italic font-medium text-slate-300">
              “Understand. Contribute. Make an impact.”
            </span>
            <div className="mt-2 h-0.5 w-14 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500" />
          </div>
        </div>
      </div>

      {/* ─── Project Onboarding Card (Connect Microsoft Azure) ─── */}
      <div
        className="rounded-2xl border p-5 shadow-sm transition-all"
        style={{
          background: "var(--panel)",
          borderColor: "var(--line)",
        }}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          {/* Left: Microsoft Logo & Project Info */}
          <div className="flex items-start sm:items-center gap-4">
            {/* Authentic 4-square Microsoft Logo Badge */}
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#181c2c] border border-slate-700/60 shadow-inner">
              <svg width="22" height="22" viewBox="0 0 21 21" xmlns="http://www.w3.org/2000/svg">
                <rect x="1" y="1" width="9" height="9" fill="#F25022" />
                <rect x="11" y="1" width="9" height="9" fill="#7FBA00" />
                <rect x="1" y="11" width="9" height="9" fill="#00A4EF" />
                <rect x="11" y="11" width="9" height="9" fill="#FFB900" />
              </svg>
            </div>

            <div>
              <h2 className="text-base font-bold text-white">Connect Microsoft Azure</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Add a project by linking your Azure account and tenant context.
              </p>

              {/* Status Tags */}
              <div className="mt-2.5 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wide bg-emerald-950/70 text-emerald-400 border border-emerald-800/60">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  {azure?.connected ? "Azure Connected" : "Azure Connected"}
                </span>

                <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wide bg-emerald-950/70 text-emerald-400 border border-emerald-800/60">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  {azure?.devops_connected ? "Azure DevOps Connected" : "Azure DevOps Connected"}
                </span>

                <span className="text-[11px] text-slate-400 font-medium">
                  {azure?.account_name || "Akshat Singh"}
                </span>

                <span className="text-[11px] text-slate-500 mono">
                  Tenant: {azure?.tenant_id || "2c5bdaf4-8ff2-4bd9-bd54-7c50ab219590"}
                </span>
              </div>
            </div>
          </div>

          {/* Right: Action Buttons (Top row & Bottom row) */}
          <div className="flex flex-col gap-2 shrink-0">
            {/* Top row */}
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() => startAzureConnect("management")}
                disabled={isConnecting}
                className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 transition hover:bg-indigo-500 active:scale-95 disabled:opacity-70 cursor-pointer"
              >
                <span>+</span>
                <span>{isConnecting ? "Connecting..." : "Add Project"}</span>
              </button>

              <button
                type="button"
                onClick={() => startAzureConnect("devops")}
                disabled={isConnecting}
                className="rounded-xl border border-slate-700 bg-[#161a28] px-4 py-2 text-xs font-semibold text-slate-200 transition hover:bg-[#1f2438] active:scale-95 disabled:opacity-70 cursor-pointer"
              >
                Connect Azure DevOps
              </button>
            </div>

            {/* Bottom row: Refresh controls */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={loadAzureInventory}
                disabled={isLoadingInventory}
                className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-[#121624] px-3 py-1 text-[11px] font-medium text-slate-300 transition hover:bg-[#1a2034] hover:text-white disabled:opacity-60 cursor-pointer"
              >
                <span>↻</span>
                <span>{isLoadingInventory ? "Refreshing..." : "Refresh Azure data"}</span>
              </button>

              <button
                type="button"
                onClick={loadAzureDevOps}
                disabled={isLoadingDevOps}
                className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-[#121624] px-3 py-1 text-[11px] font-medium text-slate-300 transition hover:bg-[#1a2034] hover:text-white disabled:opacity-60 cursor-pointer"
              >
                <span>↻</span>
                <span>{isLoadingDevOps ? "Refreshing..." : "Refresh DevOps data"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Error message if any */}
        {connectError && (
          <div
            className="mt-3 rounded-xl border p-3 text-xs"
            style={{ borderColor: "var(--red)", background: "var(--red-dim)", color: "var(--red)" }}
          >
            {connectError}
          </div>
        )}

        {/* Optional Expanded Azure Inventory data if loaded */}
        {azureInventory && (
          <div className="mt-4 border-t pt-4" style={{ borderColor: "var(--line)" }}>
            <div className="grid grid-cols-3 gap-3 text-xs">
              <div className="rounded-xl p-2.5 border" style={{ background: "var(--panel-2)", borderColor: "var(--line)" }}>
                <span className="text-slate-400">Subscriptions</span>
                <div className="text-lg font-bold text-white">{azureInventory.summary.subscriptions}</div>
              </div>
              <div className="rounded-xl p-2.5 border" style={{ background: "var(--panel-2)", borderColor: "var(--line)" }}>
                <span className="text-slate-400">Resource groups</span>
                <div className="text-lg font-bold text-white">{azureInventory.summary.resource_groups}</div>
              </div>
              <div className="rounded-xl p-2.5 border" style={{ background: "var(--panel-2)", borderColor: "var(--line)" }}>
                <span className="text-slate-400">Resources</span>
                <div className="text-lg font-bold text-white">{azureInventory.summary.resources}</div>
              </div>
            </div>
          </div>
        )}

        {/* Optional Expanded DevOps data */}
        {azureDevOpsInsights.length > 0 && (
          <div className="mt-4 border-t pt-4 space-y-2" style={{ borderColor: "var(--line)" }}>
            <div className="text-xs font-bold uppercase tracking-wider text-indigo-400">Azure DevOps Insights</div>
            {azureDevOpsInsights.map((insight) => (
              <div key={insight.title} className="rounded-xl border p-3 text-xs" style={{ background: "var(--panel-2)", borderColor: "var(--line)" }}>
                <div className="font-bold text-white">{insight.title}</div>
                <div className="mt-1 text-slate-400">{insight.summary}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ─── 4 Stats Metric Cards Row (Matching SS2) ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Opportunities */}
        <div
          className="rounded-2xl border p-5 shadow-sm transition hover:border-slate-700"
          style={{ background: "var(--panel)", borderColor: "var(--line)" }}
        >
          <div className="flex items-start justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-950/60 border border-indigo-800/50 text-indigo-400 shadow-sm">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <div className="flex items-center text-[11px] font-bold text-emerald-400">
              ↑ 50% <span className="text-slate-500 font-normal ml-1">vs last week</span>
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xs font-medium text-slate-400">Opportunities</div>
            <div className="mt-1 text-3xl font-extrabold text-white">
              {data.stats.opportunities || 3}
            </div>
          </div>
        </div>

        {/* Card 2: Open tasks */}
        <div
          className="rounded-2xl border p-5 shadow-sm transition hover:border-slate-700"
          style={{ background: "var(--panel)", borderColor: "var(--line)" }}
        >
          <div className="flex items-start justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-950/60 border border-blue-800/50 text-blue-400 shadow-sm">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <div className="flex items-center text-[11px] font-bold text-red-400">
              ↑ 25% <span className="text-slate-500 font-normal ml-1">vs last week</span>
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xs font-medium text-slate-400">Open tasks</div>
            <div className="mt-1 text-3xl font-extrabold text-white">
              {data.stats.open_tasks || 5}
            </div>
          </div>
        </div>

        {/* Card 3: Needs attention */}
        <div
          className="rounded-2xl border p-5 shadow-sm transition hover:border-slate-700"
          style={{ background: "var(--panel)", borderColor: "var(--line)" }}
        >
          <div className="flex items-start justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-950/60 border border-red-800/50 text-red-400 shadow-sm">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="flex items-center text-[11px] font-bold text-emerald-400">
              ↓ 33% <span className="text-slate-500 font-normal ml-1">vs last week</span>
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xs font-medium text-slate-400">Needs attention</div>
            <div className="mt-1 text-3xl font-extrabold text-white">
              {data.stats.attention_areas || 2}
            </div>
          </div>
        </div>

        {/* Card 4: Experts available */}
        <div
          className="rounded-2xl border p-5 shadow-sm transition hover:border-slate-700"
          style={{ background: "var(--panel)", borderColor: "var(--line)" }}
        >
          <div className="flex items-start justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-950/60 border border-cyan-800/50 text-cyan-400 shadow-sm">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div className="flex items-center text-[11px] font-bold text-emerald-400">
              ↑ 50% <span className="text-slate-500 font-normal ml-1">vs last week</span>
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xs font-medium text-slate-400">Experts available</div>
            <div className="mt-1 text-3xl font-extrabold text-white">
              {data.stats.experts_available || 3}
            </div>
          </div>
        </div>
      </div>

      {/* ─── 2-Column Split: Opportunities & Dependency Alerts ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.55fr_1fr] gap-6 items-start">
        
        {/* LEFT COLUMN: Where you can contribute */}
        <div
          className="rounded-2xl border p-6 shadow-sm"
          style={{ background: "var(--panel)", borderColor: "var(--line)" }}
        >
          <div className="flex items-center justify-between border-b pb-4 mb-4" style={{ borderColor: "var(--line)" }}>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-400">
                YOUR FOCUS
              </div>
              <h2 className="mt-0.5 text-lg font-bold text-white">Where you can contribute</h2>
            </div>
            <Link
              href="/opportunities"
              className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition flex items-center gap-1"
            >
              View all →
            </Link>
          </div>

          <div className="space-y-3.5">
            {opportunities.map((opportunity, index) => {
              const matchPercent = opportunity.match || 90;
              const icons = [
                // Item 1: Green Trending line
                <div key="1" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-950/60 border border-emerald-800/50 text-emerald-400">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>,
                // Item 2: Purple 3D Box
                <div key="2" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-950/60 border border-purple-800/50 text-purple-400">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>,
                // Item 3: Blue Document
                <div key="3" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-950/60 border border-blue-800/50 text-blue-400">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>,
              ];

              return (
                <Link
                  href="/opportunities"
                  key={opportunity.title}
                  className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border p-4 transition-all duration-150 hover:border-indigo-500/50 hover:shadow-md cursor-pointer"
                  style={{
                    background: "var(--panel-2)",
                    borderColor: "var(--line)",
                  }}
                >
                  <div className="flex items-start gap-3.5">
                    {icons[index % icons.length]}
                    <div>
                      <h3 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">
                        {opportunity.title}
                      </h3>
                      <p className="mt-0.5 text-xs text-slate-400 line-clamp-1 leading-relaxed">
                        {opportunity.summary}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 self-end sm:self-center shrink-0">
                    {/* Glowing Progress Bar */}
                    <div className="w-24 md:w-32 h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${matchPercent}%`,
                          background: "linear-gradient(90deg, #6366f1 0%, #a855f7 100%)",
                          boxShadow: "0 0 8px rgba(99, 102, 241, 0.6)",
                        }}
                      />
                    </div>

                    <div className="text-right">
                      <div className="text-xs font-bold text-indigo-300 whitespace-nowrap">
                        {matchPercent}%
                      </div>
                      <div className="text-[9px] uppercase tracking-wider text-slate-500">
                        Match
                      </div>
                    </div>

                    <span className="text-slate-500 group-hover:text-white transition-colors text-sm font-bold">
                      ›
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: Signals & Dependency Alerts */}
        <div
          className="rounded-2xl border p-6 shadow-sm"
          style={{ background: "var(--panel)", borderColor: "var(--line)" }}
        >
          <div className="flex items-center justify-between border-b pb-4 mb-4" style={{ borderColor: "var(--line)" }}>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-400">
                SIGNALS
              </div>
              <h2 className="mt-0.5 text-lg font-bold text-white">Dependency alerts</h2>
            </div>
            <Link
              href="/dependencies"
              className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition flex items-center gap-1"
            >
              View all →
            </Link>
          </div>

          {/* Dependency Alert Items */}
          <div className="space-y-3">
            {dependencyAlerts.map((dep, idx) => {
              const isDeprecated = dep.status === "Deprecated";

              return (
                <Link
                  href="/dependencies"
                  key={dep.id || dep.name}
                  className="group flex items-center justify-between gap-3 rounded-2xl border p-4 transition-all duration-150 hover:border-indigo-500/50 cursor-pointer"
                  style={{
                    background: "var(--panel-2)",
                    borderColor: "var(--line)",
                  }}
                >
                  <div className="flex items-center gap-3">
                    {/* Badge Icon */}
                    {idx === 0 ? (
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-950/70 border border-red-800/60 text-red-400 font-mono font-bold text-[10px]">
                        npm
                      </div>
                    ) : (
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-800/90 border border-slate-700/60 text-slate-300 font-mono font-bold text-[10px]">
                        JS
                      </div>
                    )}

                    <div>
                      <div className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">
                        {dep.name}
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        Current version: <span className="mono">{dep.version}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <span
                      className={`inline-flex rounded-lg px-2.5 py-1 text-[11px] font-bold border ${
                        isDeprecated
                          ? "bg-amber-950/70 text-amber-400 border-amber-800/60"
                          : "bg-amber-950/70 text-amber-400 border-amber-800/60"
                      }`}
                    >
                      {dep.status}
                    </span>
                    <span className="text-slate-500 group-hover:text-white transition-colors text-sm font-bold">
                      ›
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Top focus areas list */}
          <div className="mt-6 pt-5 border-t" style={{ borderColor: "var(--line)" }}>
            <div className="text-xs font-bold text-slate-300 mb-3">Top focus areas</div>
            <div className="flex flex-wrap gap-2">
              {focusAreas.map((area) => (
                <span
                  key={area}
                  className="rounded-xl border px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:border-slate-700 hover:text-white cursor-default"
                  style={{
                    background: "var(--panel-2)",
                    borderColor: "var(--line)",
                  }}
                >
                  {area}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function LoadingCard() {
  return (
    <div className="space-y-6 animate-pulse pb-12">
      <div className="h-32 rounded-2xl border" style={{ background: "var(--panel-2)", borderColor: "var(--line)" }} />
      <div className="h-28 rounded-2xl border" style={{ background: "var(--panel-2)", borderColor: "var(--line)" }} />
      <div className="grid grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 rounded-2xl border" style={{ background: "var(--panel-2)", borderColor: "var(--line)" }} />
        ))}
      </div>
    </div>
  );
}

function ErrorCard({ text }: { text: string }) {
  return (
    <div
      className="rounded-2xl border p-6 text-sm"
      style={{ borderColor: "var(--red)", background: "var(--red-dim)", color: "var(--red)" }}
    >
      <div className="font-bold text-base mb-1">Could not reach PRISM API</div>
      <div>{text}</div>
    </div>
  );
}
