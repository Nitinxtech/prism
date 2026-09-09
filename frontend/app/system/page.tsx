"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  MarkerType,
  Handle,
  Position,
  NodeProps,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { api } from "../../lib/api";

type ComponentData = {
  id: string;
  name: string;
  type: string;
  tech: string;
  risk?: "high" | "medium" | "low";
  iconType: "web" | "gateway" | "auth" | "order" | "payment" | "user" | "postgres" | "redis" | "mongo";
  description: string;
  repository: string;
  team: string;
  owner: string;
  lastDeployed: string;
  healthScore: number;
  openIssues: number;
  activePRs: number;
  recentChanges: number;
  testCoverage: number;
  dependencies: string[];
  dependents: string[];
  responsibilities: string[];
};

const SYSTEM_COMPONENTS: Record<string, ComponentData> = {
  web: {
    id: "web",
    name: "Web App",
    type: "Frontend",
    tech: "Next.js",
    iconType: "web",
    description: "Customer-facing web application with responsive UI, SSR catalog browsing, checkout flows, and user dashboards.",
    repository: "phoenix/web-app",
    team: "Frontend Core",
    owner: "Nitin Pandey",
    lastDeployed: "1 day ago",
    healthScore: 92,
    openIssues: 3,
    activePRs: 4,
    recentChanges: 24,
    testCoverage: 88,
    dependencies: ["gateway"],
    dependents: [],
    responsibilities: [
      "Render server-side catalog and product details",
      "Manage client state and authentication session",
      "Process checkout cart and initiate payment intent",
    ],
  },
  gateway: {
    id: "gateway",
    name: "API Gateway",
    type: "Gateway",
    tech: "Kong",
    iconType: "gateway",
    risk: "medium",
    description: "Unified entry point routing external requests, enforcing rate limits, CORS policies, and token validation.",
    repository: "phoenix/api-gateway",
    team: "Platform Ops",
    owner: "Sarah Jenkins",
    lastDeployed: "5 days ago",
    healthScore: 78,
    openIssues: 6,
    activePRs: 2,
    recentChanges: 14,
    testCoverage: 75,
    dependencies: ["auth", "order", "payment", "user"],
    dependents: ["web"],
    responsibilities: [
      "JWT verification and route authorization",
      "Traffic shaping, throttling, and API telemetry",
      "SSL termination and upstream service mesh routing",
    ],
  },
  auth: {
    id: "auth",
    name: "Auth Service",
    type: "Security",
    tech: "Keycloak",
    iconType: "auth",
    description: "Identity and access management providing OAuth 2.0, OpenID Connect SSO, and role-based permissions.",
    repository: "phoenix/auth-service",
    team: "Security Team",
    owner: "David Miller",
    lastDeployed: "2 weeks ago",
    healthScore: 89,
    openIssues: 2,
    activePRs: 1,
    recentChanges: 9,
    testCoverage: 91,
    dependencies: [],
    dependents: ["gateway"],
    responsibilities: [
      "User credential issuance and token rotation",
      "MFA and federated identity broker",
      "RBAC role and tenant entitlement checks",
    ],
  },
  order: {
    id: "order",
    name: "Order Service",
    type: "Microservice",
    tech: "Node.js",
    iconType: "order",
    description: "Manages shopping carts, order creation, inventory reservations, fulfillment events, and order lifecycle states.",
    repository: "phoenix/order-service",
    team: "Commerce Team",
    owner: "Jessica Chen",
    lastDeployed: "2 days ago",
    healthScore: 84,
    openIssues: 5,
    activePRs: 3,
    recentChanges: 22,
    testCoverage: 79,
    dependencies: ["db_postgres"],
    dependents: ["gateway"],
    responsibilities: [
      "Order placement and distributed transaction coordination",
      "Inventory reservation locking",
      "Order status event publication to Kafka bus",
    ],
  },
  payment: {
    id: "payment",
    name: "Payment Service",
    type: "Microservice",
    tech: "Python",
    risk: "high",
    iconType: "payment",
    description: "Handles payment processing, transaction verification, refunds and integration with external payment providers.",
    repository: "phoenix/payment-service",
    team: "Payments Team",
    owner: "Akshat Singh",
    lastDeployed: "3 days ago",
    healthScore: 64,
    openIssues: 12,
    activePRs: 8,
    recentChanges: 18,
    testCoverage: 64,
    dependencies: ["db_redis"],
    dependents: ["gateway"],
    responsibilities: [
      "Stripe and third-party gateway API communication",
      "PCI-compliant tokenization and idempotency tracking",
      "Webhook processing for charge settlements and chargebacks",
    ],
  },
  user: {
    id: "user",
    name: "User Service",
    type: "Microservice",
    tech: "Node.js",
    iconType: "user",
    description: "Customer profile store, shipping addresses, notification preferences, and customer loyalty tier tracking.",
    repository: "phoenix/user-service",
    team: "Customer Experience",
    owner: "Liam Patel",
    lastDeployed: "4 days ago",
    healthScore: 90,
    openIssues: 4,
    activePRs: 2,
    recentChanges: 12,
    testCoverage: 86,
    dependencies: ["db_mongo"],
    dependents: ["gateway"],
    responsibilities: [
      "Profile CRUD and address validation",
      "Customer preferences and GDPR data exports",
      "Loyalty rewards point calculation",
    ],
  },
  db_postgres: {
    id: "db_postgres",
    name: "PostgreSQL",
    type: "Database",
    tech: "Orders DB",
    iconType: "postgres",
    description: "Primary relational database hosting transactional order schemas, line items, and financial ledger.",
    repository: "infra/database/postgres",
    team: "Data Infra",
    owner: "Marcus Vance",
    lastDeployed: "1 week ago",
    healthScore: 96,
    openIssues: 1,
    activePRs: 0,
    recentChanges: 6,
    testCoverage: 98,
    dependencies: [],
    dependents: ["order"],
    responsibilities: [
      "ACID transactional durability for orders",
      "Read replica pooling for analytical queries",
    ],
  },
  db_redis: {
    id: "db_redis",
    name: "Redis",
    type: "Database",
    tech: "Cache",
    iconType: "redis",
    description: "In-memory cache for distributed idempotency keys, rate limit counters, and payment session tokens.",
    repository: "infra/database/redis",
    team: "Platform Ops",
    owner: "Sarah Jenkins",
    lastDeployed: "2 weeks ago",
    healthScore: 99,
    openIssues: 0,
    activePRs: 1,
    recentChanges: 4,
    testCoverage: 100,
    dependencies: [],
    dependents: ["payment"],
    responsibilities: [
      "High-throughput sub-millisecond caching",
      "Distributed mutex locks for checkout concurrency",
    ],
  },
  db_mongo: {
    id: "db_mongo",
    name: "MongoDB",
    type: "Database",
    tech: "User DB",
    iconType: "mongo",
    description: "Document datastore holding flexible customer profile attributes and activity logs.",
    repository: "infra/database/mongo",
    team: "Data Infra",
    owner: "Marcus Vance",
    lastDeployed: "3 weeks ago",
    healthScore: 94,
    openIssues: 1,
    activePRs: 0,
    recentChanges: 5,
    testCoverage: 92,
    dependencies: [],
    dependents: ["user"],
    responsibilities: [
      "Flexible customer schema document persistence",
      "Indexing for high-concurrency customer lookups",
    ],
  },
};

// Custom Node Component to match SS2
function CustomSystemNode({ data, selected }: NodeProps) {
  const comp = data.comp as ComponentData;
  const isHighRisk = comp.risk === "high";
  const isSelected = selected || data.isSelected;

  // Icons based on component type
  const renderIcon = () => {
    switch (comp.iconType) {
      case "web":
        return (
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-950/70 border border-purple-800/60 text-purple-300">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
        );
      case "gateway":
        return (
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-cyan-950/70 border border-cyan-800/60 text-cyan-300">
            <span className="font-bold text-xs">▲</span>
          </div>
        );
      case "auth":
        return (
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-950/70 border border-emerald-800/60 text-emerald-300">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
        );
      case "order":
        return (
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-950/70 border border-blue-800/60 text-blue-300">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
        );
      case "payment":
        return (
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-red-950/70 border border-red-800/60 text-red-300">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
        );
      case "user":
        return (
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-950/70 border border-blue-800/60 text-blue-300">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
        );
      case "postgres":
        return (
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-950/70 border border-purple-800/60 text-purple-300">
            <span className="font-bold text-xs">🗄</span>
          </div>
        );
      case "redis":
        return (
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-950/70 border border-purple-800/60 text-purple-300">
            <span className="font-bold text-xs">⚡</span>
          </div>
        );
      case "mongo":
        return (
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-950/70 border border-purple-800/60 text-purple-300">
            <span className="font-bold text-xs">🍃</span>
          </div>
        );
    }
  };

  // Node background & border styling
  let containerStyle = "border-blue-500/70 bg-[#0d1628]";
  if (comp.type === "Frontend") {
    containerStyle = "border-indigo-500/80 bg-[#14122c]";
  } else if (comp.type === "Security") {
    containerStyle = "border-emerald-500/80 bg-[#0b201a]";
  } else if (comp.type === "Database") {
    containerStyle = "border-purple-500/80 bg-[#16112c]";
  } else if (isHighRisk) {
    containerStyle = "border-red-500/90 bg-[#24111c] shadow-[0_0_20px_rgba(239,68,68,0.25)]";
  }

  if (isSelected) {
    containerStyle += " ring-2 ring-indigo-400 ring-offset-2 ring-offset-slate-900";
  }

  return (
    <div
      className={`relative flex items-center gap-3 rounded-2xl border px-3.5 py-2.5 shadow-lg transition-all duration-150 min-w-[170px] ${containerStyle} cursor-pointer hover:scale-102`}
    >
      <Handle type="target" position={Position.Top} className="!bg-indigo-400 !w-2 !h-2" />

      {/* Red Alert Pill for High Risk */}
      {isHighRisk && (
        <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-extrabold text-white shadow-md">
          !
        </span>
      )}

      {renderIcon()}

      <div>
        <div className="text-xs font-bold text-white tracking-tight leading-tight">
          {comp.name}
        </div>
        <div className="text-[10px] text-slate-400 leading-tight mt-0.5 font-medium">
          {comp.tech}
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} className="!bg-indigo-400 !w-2 !h-2" />
    </div>
  );
}

const nodeTypes = {
  custom: CustomSystemNode,
};

export default function SystemMapPage() {
  const [selectedId, setSelectedId] = useState<string>("payment");
  const [activeViewTab, setActiveViewTab] = useState<"arch" | "dep" | "flow" | "impact">("arch");
  const [rightPanelTab, setRightPanelTab] = useState<"overview" | "dependencies" | "activity" | "ownership">("overview");

  // Initial nodes layout matching SS2 exactly
  const initialNodes: Node[] = useMemo(
    () => [
      {
        id: "web",
        type: "custom",
        position: { x: 340, y: 20 },
        data: { comp: SYSTEM_COMPONENTS.web, isSelected: selectedId === "web" },
      },
      {
        id: "gateway",
        type: "custom",
        position: { x: 340, y: 140 },
        data: { comp: SYSTEM_COMPONENTS.gateway, isSelected: selectedId === "gateway" },
      },
      {
        id: "auth",
        type: "custom",
        position: { x: 570, y: 140 },
        data: { comp: SYSTEM_COMPONENTS.auth, isSelected: selectedId === "auth" },
      },
      {
        id: "order",
        type: "custom",
        position: { x: 130, y: 290 },
        data: { comp: SYSTEM_COMPONENTS.order, isSelected: selectedId === "order" },
      },
      {
        id: "payment",
        type: "custom",
        position: { x: 340, y: 290 },
        data: { comp: SYSTEM_COMPONENTS.payment, isSelected: selectedId === "payment" },
      },
      {
        id: "user",
        type: "custom",
        position: { x: 550, y: 290 },
        data: { comp: SYSTEM_COMPONENTS.user, isSelected: selectedId === "user" },
      },
      {
        id: "db_postgres",
        type: "custom",
        position: { x: 130, y: 440 },
        data: { comp: SYSTEM_COMPONENTS.db_postgres, isSelected: selectedId === "db_postgres" },
      },
      {
        id: "db_redis",
        type: "custom",
        position: { x: 340, y: 440 },
        data: { comp: SYSTEM_COMPONENTS.db_redis, isSelected: selectedId === "db_redis" },
      },
      {
        id: "db_mongo",
        type: "custom",
        position: { x: 550, y: 440 },
        data: { comp: SYSTEM_COMPONENTS.db_mongo, isSelected: selectedId === "db_mongo" },
      },
    ],
    [selectedId]
  );

  // Edges connecting nodes with styled curves and Auth label pill
  const initialEdges: Edge[] = useMemo(
    () => [
      {
        id: "e-web-gateway",
        source: "web",
        target: "gateway",
        type: "smoothstep",
        style: { stroke: "#6366f1", strokeWidth: 2 },
      },
      {
        id: "e-gateway-auth",
        source: "gateway",
        target: "auth",
        type: "straight",
        label: "Auth",
        labelStyle: { fill: "#cbd5e1", fontSize: 10, fontWeight: 700 },
        labelBgStyle: { fill: "#1e2438", stroke: "#475569", strokeWidth: 1 },
        labelBgPadding: [6, 3],
        labelBgBorderRadius: 6,
        style: { stroke: "#64748b", strokeWidth: 1.8, strokeDasharray: "4 4" },
      },
      {
        id: "e-gateway-order",
        source: "gateway",
        target: "order",
        type: "smoothstep",
        style: { stroke: "#6366f1", strokeWidth: 1.8 },
      },
      {
        id: "e-gateway-payment",
        source: "gateway",
        target: "payment",
        type: "smoothstep",
        style: { stroke: "#ef4444", strokeWidth: 2 },
      },
      {
        id: "e-gateway-user",
        source: "gateway",
        target: "user",
        type: "smoothstep",
        style: { stroke: "#6366f1", strokeWidth: 1.8 },
      },
      {
        id: "e-order-postgres",
        source: "order",
        target: "db_postgres",
        type: "smoothstep",
        style: { stroke: "#818cf8", strokeWidth: 1.8 },
      },
      {
        id: "e-payment-redis",
        source: "payment",
        target: "db_redis",
        type: "smoothstep",
        style: { stroke: "#818cf8", strokeWidth: 1.8 },
      },
      {
        id: "e-user-mongo",
        source: "user",
        target: "db_mongo",
        type: "smoothstep",
        style: { stroke: "#818cf8", strokeWidth: 1.8 },
      },
    ],
    []
  );

  const selectedComp = SYSTEM_COMPONENTS[selectedId] || SYSTEM_COMPONENTS.payment;

  const onNodeClick = (_: unknown, node: Node) => {
    if (SYSTEM_COMPONENTS[node.id]) {
      setSelectedId(node.id);
    }
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
            System Map
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-400">
            Explore architecture, dependencies, ownership signals and change impact from one contextual map.
          </p>
        </div>

        {/* Top Right Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            className="flex items-center gap-2 rounded-xl border border-slate-700/80 bg-[#161a28] px-4 py-2 text-xs font-semibold text-slate-200 transition hover:bg-[#1f2438] cursor-pointer"
          >
            <span>≡</span>
            <span>View as List</span>
          </button>
          <button
            type="button"
            className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 transition hover:bg-indigo-500 cursor-pointer"
          >
            <span>⤓</span>
            <span>Export ↓</span>
          </button>
        </div>
      </div>

      {/* ─── 5 Metrics Cards Across Top (Matching SS2) ─── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* Card 1: Services */}
        <div
          className="flex items-center gap-3 rounded-2xl border p-4 shadow-sm"
          style={{ background: "var(--panel)", borderColor: "var(--line)" }}
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-950/60 border border-purple-800/50 text-purple-400">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <div>
            <div className="text-xl font-extrabold text-white">6</div>
            <div className="text-xs text-slate-400">Services</div>
          </div>
        </div>

        {/* Card 2: Dependencies */}
        <div
          className="flex items-center gap-3 rounded-2xl border p-4 shadow-sm"
          style={{ background: "var(--panel)", borderColor: "var(--line)" }}
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-950/60 border border-cyan-800/50 text-cyan-400">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
          </div>
          <div>
            <div className="text-xl font-extrabold text-white">12</div>
            <div className="text-xs text-slate-400">Dependencies</div>
          </div>
        </div>

        {/* Card 3: External Integrations */}
        <div
          className="flex items-center gap-3 rounded-2xl border p-4 shadow-sm"
          style={{ background: "var(--panel)", borderColor: "var(--line)" }}
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-950/60 border border-emerald-800/50 text-emerald-400">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-3-3-3m0 18c-1.657 0-3-4.03-3-9s1.343-3 3-3m-9 9a9 9 0 019-9" />
            </svg>
          </div>
          <div>
            <div className="text-xl font-extrabold text-white">4</div>
            <div className="text-xs text-slate-400">External Integrations</div>
          </div>
        </div>

        {/* Card 4: Data Stores */}
        <div
          className="flex items-center gap-3 rounded-2xl border p-4 shadow-sm"
          style={{ background: "var(--panel)", borderColor: "var(--line)" }}
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-950/60 border border-blue-800/50 text-blue-400">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
            </svg>
          </div>
          <div>
            <div className="text-xl font-extrabold text-white">3</div>
            <div className="text-xs text-slate-400">Data Stores</div>
          </div>
        </div>

        {/* Card 5: High Risk Areas */}
        <div
          className="flex items-center gap-3 rounded-2xl border p-4 shadow-sm"
          style={{ background: "var(--panel)", borderColor: "var(--line)" }}
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-950/60 border border-red-800/50 text-red-400">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <div className="text-xl font-extrabold text-white">2</div>
            <div className="text-xs text-slate-400">High Risk Areas</div>
          </div>
        </div>
      </div>

      {/* ─── Main 2-Column Split: System Map Canvas & Component Inspector ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.55fr_1fr] gap-6 items-start">
        
        {/* LEFT: System Map ReactFlow Canvas */}
        <div
          className="rounded-2xl border shadow-sm overflow-hidden flex flex-col"
          style={{
            background: "#0a0d16",
            borderColor: "var(--line)",
            height: "640px",
          }}
        >
          {/* Map Top Toolbar & Legend */}
          <div
            className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3"
            style={{ background: "#0e111d", borderColor: "var(--line)" }}
          >
            {/* View Mode Tabs */}
            <div className="flex items-center rounded-xl bg-[#141828] p-1 border border-slate-800">
              <button
                type="button"
                onClick={() => setActiveViewTab("arch")}
                className={`rounded-lg px-3 py-1 text-xs font-semibold transition cursor-pointer ${
                  activeViewTab === "arch"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Architecture View
              </button>
              <button
                type="button"
                onClick={() => setActiveViewTab("dep")}
                className={`rounded-lg px-3 py-1 text-xs font-semibold transition cursor-pointer ${
                  activeViewTab === "dep"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Dependency View
              </button>
              <button
                type="button"
                onClick={() => setActiveViewTab("flow")}
                className={`rounded-lg px-3 py-1 text-xs font-semibold transition cursor-pointer ${
                  activeViewTab === "flow"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Data Flow View
              </button>
              <button
                type="button"
                onClick={() => setActiveViewTab("impact")}
                className={`rounded-lg px-3 py-1 text-xs font-semibold transition cursor-pointer ${
                  activeViewTab === "impact"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Change Impact
              </button>
            </div>

            {/* Legend & Fullscreen */}
            <div className="flex items-center gap-3 text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-indigo-400" /> Service
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-sky-400" /> Database
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-amber-400" /> External
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-400" /> Frontend
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-red-400" /> High Risk
              </span>
              <button
                type="button"
                title="Toggle Fullscreen"
                className="ml-2 text-slate-400 hover:text-white transition cursor-pointer"
              >
                ⛶
              </button>
            </div>
          </div>

          {/* Interactive React Flow Canvas */}
          <div className="relative flex-1 w-full h-full">
            <ReactFlow
              nodes={initialNodes}
              edges={initialEdges}
              nodeTypes={nodeTypes}
              onNodeClick={onNodeClick}
              fitView
              fitViewOptions={{ padding: 0.18 }}
              className="bg-[#0a0d16]"
            >
              <Background gap={22} color="#1e2438" size={1.2} />
              <Controls
                className="!bg-[#111424] !border-slate-800 !rounded-xl !shadow-lg [&>button]:!bg-[#111424] [&>button]:!border-slate-800 [&>button]:!text-slate-300 hover:[&>button]:!bg-[#1e2438]"
              />
              <MiniMap
                nodeColor={(n) => {
                  if (n.id === "payment") return "#ef4444";
                  if (n.id === "auth") return "#10b981";
                  if (n.id.startsWith("db_")) return "#818cf8";
                  return "#3b82f6";
                }}
                className="!bg-[#0e111d] !border-slate-800 !rounded-xl"
                maskColor="rgba(10, 13, 22, 0.7)"
              />
            </ReactFlow>
          </div>
        </div>

        {/* RIGHT: Component Detail Inspector Card */}
        <div
          className="rounded-2xl border p-6 shadow-sm space-y-5"
          style={{ background: "var(--panel)", borderColor: "var(--line)" }}
        >
          {/* Header Card: Component Name & Risk Badge */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              {/* Service Icon Box */}
              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border ${
                  selectedComp.risk === "high"
                    ? "bg-red-950/70 border-red-800/60 text-red-400 shadow-md shadow-red-900/20"
                    : "bg-indigo-950/70 border-indigo-800/60 text-indigo-400"
                }`}
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>

              <div>
                <h2 className="text-lg font-bold text-white leading-tight">
                  {selectedComp.name}
                </h2>
                <div className="text-xs text-slate-400 mt-0.5">
                  {selectedComp.type} · {selectedComp.tech}
                </div>
              </div>
            </div>

            {/* Risk Badge */}
            {selectedComp.risk === "high" ? (
              <span className="inline-flex rounded-full bg-red-950/80 border border-red-800/60 px-3 py-1 text-[11px] font-bold text-red-400">
                High Risk
              </span>
            ) : selectedComp.risk === "medium" ? (
              <span className="inline-flex rounded-full bg-amber-950/80 border border-amber-800/60 px-3 py-1 text-[11px] font-bold text-amber-400">
                Medium Risk
              </span>
            ) : (
              <span className="inline-flex rounded-full bg-emerald-950/80 border border-emerald-800/60 px-3 py-1 text-[11px] font-bold text-emerald-400">
                Healthy
              </span>
            )}
          </div>

          {/* Sub-Navigation Tabs */}
          <div className="flex border-b text-xs font-semibold" style={{ borderColor: "var(--line)" }}>
            {(["overview", "dependencies", "activity", "ownership"] as const).map((tab) => {
              const labels = {
                overview: "Overview",
                dependencies: "Dependencies",
                activity: "Recent Activity",
                ownership: "Ownership",
              };
              const isActive = rightPanelTab === tab;

              return (
                <button
                  key={tab}
                  onClick={() => setRightPanelTab(tab)}
                  className={`pb-2.5 px-3 transition cursor-pointer border-b-2 -mb-px ${
                    isActive
                      ? "border-indigo-500 text-white font-bold"
                      : "border-transparent text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {labels[tab]}
                </button>
              );
            })}
          </div>

          {/* Tab 1: Overview Tab Content */}
          {rightPanelTab === "overview" && (
            <div className="space-y-4 text-xs">
              {/* Description */}
              <div>
                <div className="text-[11px] font-bold text-slate-300">Description</div>
                <p className="mt-1 text-slate-400 leading-relaxed">
                  {selectedComp.description}
                </p>
              </div>

              {/* Metadata Key-Value List */}
              <div className="space-y-2.5 pt-1">
                {/* Repository */}
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Repository</span>
                  <Link
                    href={`https://github.com/${selectedComp.repository}`}
                    target="_blank"
                    className="font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                  >
                    <span>{selectedComp.repository}</span>
                    <span className="text-[10px]">↗</span>
                  </Link>
                </div>

                {/* Team */}
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Team</span>
                  <span className="font-semibold text-white flex items-center gap-1">
                    <span>👥</span>
                    <span>{selectedComp.team}</span>
                  </span>
                </div>

                {/* Owner */}
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Owner</span>
                  <div className="flex items-center gap-1.5 font-semibold text-white">
                    <div className="h-5 w-5 rounded-full bg-cyan-800 text-[10px] text-cyan-200 font-bold flex items-center justify-center">
                      {selectedComp.owner.charAt(0)}
                    </div>
                    <span>{selectedComp.owner}</span>
                  </div>
                </div>

                {/* Last Deployed */}
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Last Deployed</span>
                  <span className="text-slate-300 font-medium">🕒 {selectedComp.lastDeployed}</span>
                </div>

                {/* Health Score */}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-slate-400 flex items-center gap-1">
                    <span>Health Score</span>
                    <span className="text-[10px] text-slate-500">ⓘ</span>
                  </span>
                  <div className="flex items-center gap-2.5">
                    <span className="font-bold text-white">{selectedComp.healthScore} / 100</span>
                    <div className="w-20 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${selectedComp.healthScore}%`,
                          background: selectedComp.healthScore > 80 ? "#10b981" : "#f59e0b",
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Key Signals (4 Grid Tiles) */}
              <div className="pt-3 border-t" style={{ borderColor: "var(--line)" }}>
                <div className="flex items-center justify-between mb-2.5">
                  <div className="text-[11px] font-bold text-slate-300">Key Signals</div>
                  <Link href="/codebase" className="text-[11px] font-semibold text-indigo-400 hover:underline">
                    View all →
                  </Link>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  {/* Tile 1: Open Issues */}
                  <div
                    className="rounded-xl border p-3 flex items-center gap-2.5"
                    style={{ background: "var(--panel-2)", borderColor: "var(--line)" }}
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-950/60 border border-red-800/50 text-red-400">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-extrabold text-sm text-white">{selectedComp.openIssues}</div>
                      <div className="text-[10px] text-slate-400">Open Issues</div>
                    </div>
                  </div>

                  {/* Tile 2: Active PRs */}
                  <div
                    className="rounded-xl border p-3 flex items-center gap-2.5"
                    style={{ background: "var(--panel-2)", borderColor: "var(--line)" }}
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-950/60 border border-purple-800/50 text-purple-400">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-extrabold text-sm text-white">{selectedComp.activePRs}</div>
                      <div className="text-[10px] text-slate-400">Active PRs</div>
                    </div>
                  </div>

                  {/* Tile 3: Recent Changes */}
                  <div
                    className="rounded-xl border p-3 flex items-center gap-2.5"
                    style={{ background: "var(--panel-2)", borderColor: "var(--line)" }}
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-950/60 border border-blue-800/50 text-blue-400">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-extrabold text-sm text-white">{selectedComp.recentChanges}</div>
                      <div className="text-[10px] text-slate-400">Recent Changes (30d)</div>
                    </div>
                  </div>

                  {/* Tile 4: Test Coverage */}
                  <div
                    className="rounded-xl border p-3 flex items-center gap-2.5"
                    style={{ background: "var(--panel-2)", borderColor: "var(--line)" }}
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-950/60 border border-emerald-800/50 text-emerald-400">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-extrabold text-sm text-white">{selectedComp.testCoverage}%</div>
                      <div className="text-[10px] text-slate-400">Test Coverage</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Dependencies Content */}
          {rightPanelTab === "dependencies" && (
            <div className="space-y-3 text-xs">
              <div className="text-[11px] font-bold text-slate-300">Upstream Dependencies</div>
              <div className="flex flex-wrap gap-2">
                {selectedComp.dependencies.map((dep) => (
                  <span
                    key={dep}
                    onClick={() => setSelectedId(dep)}
                    className="rounded-xl border border-slate-700 bg-[#161a28] px-3 py-1.5 text-xs text-indigo-300 font-semibold cursor-pointer hover:bg-[#1f2438]"
                  >
                    {SYSTEM_COMPONENTS[dep]?.name || dep}
                  </span>
                ))}
                {selectedComp.dependencies.length === 0 && (
                  <span className="text-slate-500 italic">No upstream dependencies.</span>
                )}
              </div>

              <div className="text-[11px] font-bold text-slate-300 mt-4">Downstream Dependents</div>
              <div className="flex flex-wrap gap-2">
                {selectedComp.dependents.map((dep) => (
                  <span
                    key={dep}
                    onClick={() => setSelectedId(dep)}
                    className="rounded-xl border border-slate-700 bg-[#161a28] px-3 py-1.5 text-xs text-indigo-300 font-semibold cursor-pointer hover:bg-[#1f2438]"
                  >
                    {SYSTEM_COMPONENTS[dep]?.name || dep}
                  </span>
                ))}
                {selectedComp.dependents.length === 0 && (
                  <span className="text-slate-500 italic">No downstream dependents.</span>
                )}
              </div>
            </div>
          )}

          {/* Tab 3: Activity Content */}
          {rightPanelTab === "activity" && (
            <div className="space-y-3 text-xs">
              <div className="text-[11px] font-bold text-slate-300">Core Responsibilities</div>
              <div className="space-y-1.5">
                {selectedComp.responsibilities.map((r, i) => (
                  <div key={i} className="rounded-xl p-2.5 border" style={{ background: "var(--panel-2)", borderColor: "var(--line)" }}>
                    • {r}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 4: Ownership Content */}
          {rightPanelTab === "ownership" && (
            <div className="space-y-3 text-xs">
              <div className="rounded-xl p-3 border" style={{ background: "var(--panel-2)", borderColor: "var(--line)" }}>
                <div className="text-slate-400">Team Lead / Owner</div>
                <div className="text-sm font-bold text-white mt-1">{selectedComp.owner}</div>
                <div className="text-[11px] text-slate-500">{selectedComp.team}</div>
              </div>
            </div>
          )}

          {/* Bottom Action Buttons */}
          <div className="pt-2 flex items-center gap-2.5">
            <Link
              href="/codebase"
              className="flex-1 rounded-xl border border-slate-700 bg-[#161a28] px-3.5 py-2.5 text-xs font-bold text-slate-200 text-center transition hover:bg-[#1f2438] cursor-pointer"
            >
              View in Codebase
            </Link>
            <Link
              href={`/ask?q=Analyze+${encodeURIComponent(selectedComp.name)}`}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 transition hover:bg-indigo-500 cursor-pointer"
            >
              <span>✦</span>
              <span>Analyze with PRISM</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
