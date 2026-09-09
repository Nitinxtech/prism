"use client";

import { useState } from "react";
import Link from "next/link";
import { Header, Panel, Badge, EvidenceList } from "../../components/ui";

type DependencyItem = {
  id: string;
  name: string;
  requiredRole: string;
  source: string;
  status: "resolved" | "pending" | "blocking";
  why: string;
  evidence: { text: string; source: string; reference?: string }[];
  impact: string;
  action: string;
  affectedComponents: string[];
};

type DeliverableItem = {
  id: string;
  title: string;
  description: string;
  status: "Verified" | "Ready" | "In Review";
  details: string;
};

type ProjectComparison = {
  id: string;
  name: string;
  score: number;
  updatedAt: string;
  statusTone: "green" | "amber" | "red";
  differentiator: string;
  keyBlocker?: string;
};

const PROJECT_ANALYSES: ProjectComparison[] = [
  {
    id: "ecom",
    name: "Ecommerce Platform",
    score: 92,
    updatedAt: "2h ago",
    statusTone: "green",
    differentiator: "6/6 dependencies resolved; only 1 non-blocking ADR pending",
  },
  {
    id: "portal",
    name: "Customer Portal",
    score: 78,
    updatedAt: "1d ago",
    statusTone: "amber",
    differentiator: "Blocked on Entra ID multi-tenant admin consent & DB private link (-14%)",
    keyBlocker: "Entra ID admin consent",
  },
  {
    id: "analytics",
    name: "Analytics Dashboard",
    score: 88,
    updatedAt: "3d ago",
    statusTone: "green",
    differentiator: "Architecture locked; waiting on Kafka streaming consumer group quota",
  },
];

const DEPENDENCIES: DependencyItem[] = [
  {
    id: "azure-sub",
    name: "Azure subscription access",
    requiredRole: "Contributor role",
    source: "Client Cloud Ops",
    status: "resolved",
    why: "Required by Terraform & Bicep provisioning scripts in infrastructure/ to configure App Service plans and container environments.",
    evidence: [
      {
        text: "Resource group creation and RBAC assignment requires Microsoft.Resources/deployments write access.",
        source: "infra/bicep/main.bicep",
        reference: "L14-28",
      },
    ],
    impact: "Inability to deploy staging test environments prior to Sprint 1 Day 2.",
    action: "Subscription ID linked and validated via Azure Management Connector.",
    affectedComponents: ["Infrastructure", "Container Apps", "API Gateway"],
  },
  {
    id: "entra-app",
    name: "Entra ID app registration",
    requiredRole: "Application Administrator",
    source: "Client IAM Team",
    status: "resolved",
    why: "Required for OAuth 2.0 / OpenID Connect single sign-on across the frontend client and API microservices.",
    evidence: [
      {
        text: "OAuth client_id, tenant_id, and redirect_uri configured for staging environment.",
        source: "src/auth/entra.ts",
        reference: "L31-54",
      },
    ],
    impact: "End-to-end authentication flow tests fail; developers forced to use mocked tokens without client realm validation.",
    action: "App registration 'PRISM-Ecommerce-Staging' created and secret saved in Key Vault.",
    affectedComponents: ["Auth Service", "Frontend Web", "Customer API"],
  },
  {
    id: "key-vault",
    name: "Key Vault access",
    requiredRole: "Key Vault Secrets User (RBAC)",
    source: "Client Security Officer",
    status: "pending",
    why: "Order Processing Service and Payment Gateway connector must retrieve Stripe API keys and SQL connection strings at startup.",
    evidence: [
      {
        text: "DefaultAzureCredential().get_secret('STRIPE_SECRET_KEY') invoked in service bootstrap.",
        source: "services/payment/config.py",
        reference: "L18-24",
      },
    ],
    impact: "Payment processing integration tests fail on staging boot; emulator mock fallback currently active.",
    action: "Awaiting Client Security Officer sign-off on Service Principal Object ID '9a4f-821b'.",
    affectedComponents: ["Payment Gateway", "Order Service"],
  },
  {
    id: "sql-firewall",
    name: "SQL firewall rule & VNet link",
    requiredRole: "Network team approval",
    source: "Client Infra / SecOps",
    status: "resolved",
    why: "Azure SQL database rejects incoming TCP connections from AKS node subnet unless the subnet VNet rule is explicitly whitelisted.",
    evidence: [
      {
        text: "azurerm_sql_virtual_network_rule.aks_subnet binds subnet to primary database server.",
        source: "infra/terraform/network.tf",
        reference: "L88-102",
      },
    ],
    impact: "Microservices encounter connection timeout (error: connection refused port 1433) during initial healthcheck.",
    action: "Rule 'Allow-AKS-Subnet' added to SQL server firewall policy.",
    affectedComponents: ["Azure SQL", "Order DB", "Catalog DB"],
  },
  {
    id: "private-endpoint",
    name: "Private endpoint configuration",
    requiredRole: "Network engineer",
    source: "Client Infra",
    status: "resolved",
    why: "Client infosec standard mandates zero public IP exposure for storage accounts and redis cache layers.",
    evidence: [
      {
        text: "All data-at-rest stores must route over private endpoints with disablePublicNetworkAccess=true.",
        source: "docs/architecture/adr-004-network-isolation.md",
        reference: "Section 3.1",
      },
    ],
    impact: "Blob storage writes and Redis session synchronization blocked over internet gateway.",
    action: "Private DNS zone 'privatelink.blob.core.windows.net' mapped and validated.",
    affectedComponents: ["Storage Account", "Redis Cache"],
  },
  {
    id: "service-principal",
    name: "Service principal credentials",
    requiredRole: "Client Security",
    source: "Client SecOps",
    status: "resolved",
    why: "CI/CD GitHub Actions and deployment pipelines require federated OIDC credentials for non-interactive publishing.",
    evidence: [
      {
        text: "azure/login@v1 action configured with audience api://AzureADTokenExchange.",
        source: ".github/workflows/deploy-staging.yml",
        reference: "L24-38",
      },
    ],
    impact: "Automated continuous delivery pipeline cannot run builds; manual deployments violate client governance.",
    action: "Federated credential mapped to repository 'Nitinxtech/prism' on branch 'main'.",
    affectedComponents: ["CI/CD Pipeline", "Release Automation"],
  },
];

const DELIVERABLES: DeliverableItem[] = [
  {
    id: "forecaster",
    title: "Client Dependency Forecaster",
    description: "Identifies everything your team needs from the client before Sprint 1 starts.",
    status: "Verified",
    details: "6 total external dependencies mapped across 4 client owner teams with verified RBAC roles.",
  },
  {
    id: "readiness-plan",
    title: "Client Dependency & Readiness Plan",
    description: "A clear timeline to get unblocked and achieve Sprint 1 operational readiness.",
    status: "Ready",
    details: "Phased unblocking schedule aligned with Sprint 1 backlog priority: Auth → DB → Payment.",
  },
  {
    id: "architecture-blueprint",
    title: "Architecture & Solution Blueprint",
    description: "High-level and detailed service boundary diagrams for clarity.",
    status: "Ready",
    details: "Microservices interaction map, event bus schema, and state flow diagrams confirmed.",
  },
  {
    id: "tech-stack",
    title: "Tech Stack Recommendation",
    description: "Right tools selected for performance, scale, and maintainability.",
    status: "Ready",
    details: "Next.js 15, FastAPI, Azure Container Apps, Azure SQL, Redis Enterprise.",
  },
  {
    id: "deployment-architecture",
    title: "Deployment Architecture",
    description: "Environments, container orchestration, pipelines, and release strategy.",
    status: "Ready",
    details: "Bicep IaC modules, GitHub Actions workflow with OIDC authentication, blue/green slots.",
  },
  {
    id: "sow-draft",
    title: "SOW / Requirements Draft",
    description: "Scope, assumptions, dependencies matrix, and deliverable estimations.",
    status: "In Review",
    details: "1 pending client clarification on SLA targets for third-party shipping API webhook.",
  },
  {
    id: "security-compliance",
    title: "Security & Compliance Requirements",
    description: "Built-in best practices, compliance checklist, and audit traceability.",
    status: "Verified",
    details: "SOC2 Type II controls, zero-trust network boundaries, secret rotation policy in place.",
  },
];

export default function ReadinessPage() {
  // Role selector: "lead" (aggregate + blockers) vs "dev" (expanded technical checklist)
  const [roleView, setRoleView] = useState<"lead" | "dev">("lead");
  const [selectedProject, setSelectedProject] = useState("ecom");
  const [selectedDepId, setSelectedDepId] = useState<string | null>("key-vault");
  const [showScoreBreakdown, setShowScoreBreakdown] = useState(false);
  const [selectedDeliverable, setSelectedDeliverable] = useState<DeliverableItem | null>(null);

  // Contextual AI assistant state
  const [aiQuestion, setAiQuestion] = useState("");
  const [aiChat, setAiChat] = useState<
    { q: string; a: string; evidence?: string[]; actions?: string[] }[]
  >([
    {
      q: "What is currently blocking Sprint 1 development start for Ecommerce Platform?",
      a: "Only 1 item is currently pending: Key Vault RBAC permission from the Client Security Officer. The payment service requires 'Key Vault Secrets User' on vault 'kv-prism-staging' to read Stripe API credentials. All other 5 infrastructure, networking, and Entra ID dependencies are verified.",
      evidence: [
        "services/payment/config.py:L18 (Stripe secret retrieval)",
        "docs/readiness/client-dependencies.md (Ticket #AZ-8921)",
      ],
      actions: [
        "Use copyable client access request template for Client Security Officer",
        "Enable local mock payment gateway emulator for initial Sprint 1 setup",
      ],
    },
  ]);
  const [isAskingAi, setIsAskingAi] = useState(false);

  const activeProject =
    PROJECT_ANALYSES.find((p) => p.id === selectedProject) || PROJECT_ANALYSES[0];

  const handleAskAi = (presetQuestion?: string) => {
    const q = presetQuestion || aiQuestion;
    if (!q.trim()) return;

    setIsAskingAi(true);
    setTimeout(() => {
      let responseAnswer = "";
      let evidenceItems: string[] = [];
      let actionItems: string[] = [];

      if (q.toLowerCase().includes("customer portal") || q.toLowerCase().includes("78%")) {
        responseAnswer =
          "Customer Portal is currently at 78% (vs Ecommerce Platform at 92%) because it is waiting on two unresolved client dependencies: 1) Entra ID multi-tenant admin consent for partner user federated login, and 2) Azure SQL private endpoint DNS link from the client network team.";
        evidenceItems = [
          "portal/auth/oidc.ts:L45 (Missing tenant admin consent)",
          "infra/portal-network.bicep:L88 (Private DNS zone not linked)",
        ];
        actionItems = [
          "Escalate Entra ID admin consent ticket to Client IAM lead",
          "Review private DNS zone setup with Network team",
        ];
      } else if (q.toLowerCase().includes("key vault") || q.toLowerCase().includes("permission")) {
        responseAnswer =
          "Key Vault access requires the 'Key Vault Secrets User' RBAC role assigned to Service Principal 'sp-prism-staging' (Object ID: 9a4f-821b). Without this, the Payment Gateway service will fail on startup when fetching Stripe credentials.";
        evidenceItems = [
          "services/payment/config.py:L18",
          "infra/bicep/keyvault-access.bicep:L12",
        ];
        actionItems = [
          "Send pre-formatted PowerShell RBAC assignment command to client admin",
          "Use mock provider in development mode until permission is granted",
        ];
      } else if (q.toLowerCase().includes("email") || q.toLowerCase().includes("template")) {
        responseAnswer =
          "Here is the recommended unblocking request for the Client Security Officer:\n\nSubject: [Action Required] Key Vault RBAC Access for PRISM Staging\n\nHi Team, To enable automated secret retrieval for the Order & Payment services during Sprint 1, please assign 'Key Vault Secrets User' role on vault 'kv-prism-staging' to Service Principal Object ID: 9a4f-821b.\nReference ticket: #AZ-8921.";
        evidenceItems = ["PRISM Readiness Generator"];
        actionItems = ["Copy email text to clipboard"];
      } else {
        responseAnswer = `Based on the readiness analysis for ${activeProject.name}: 6 dependencies are mapped, 5 are resolved, and 1 is awaiting client review. Architecture decisions are 85% verified with complete deployment blueprints ready.`;
        evidenceItems = ["PRISM Project Intelligence Engine"];
        actionItems = ["Inspect detailed dependency checklist below"];
      }

      setAiChat((prev) => [
        ...prev,
        { q, a: responseAnswer, evidence: evidenceItems, actions: actionItems },
      ]);
      setAiQuestion("");
      setIsAskingAi(false);
    }, 450);
  };

  const selectedDep =
    DEPENDENCIES.find((d) => d.id === selectedDepId) || DEPENDENCIES[0];

  return (
    <div className="space-y-7 pb-16">
      {/* Top Header & Role-Aware Density Control */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-[var(--line)] pb-6">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[.2em] text-[var(--indigo)]">
            <svg
              width="14"
              height="14"
              viewBox="0 0 48 48"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="inline-block"
            >
              <polygon
                points="24,4 44,38 4,38"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <line x1="24" y1="4" x2="24" y2="24" stroke="currentColor" strokeWidth="4" />
              <line x1="4" y1="38" x2="24" y2="24" stroke="currentColor" strokeWidth="4" />
              <line x1="44" y1="38" x2="24" y2="24" stroke="currentColor" strokeWidth="4" />
            </svg>
            Pre-Development Readiness
          </div>
          <h1 className="mt-1.5 text-3xl font-bold tracking-tight text-[var(--ink)]">
            Before You Build
          </h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Determine exact client dependencies, architecture sign-offs, and technical deliverables before Sprint 1 begins.
          </p>
        </div>

        {/* Controls: Project Switcher & Role Density Switcher */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Project Switcher */}
          <div className="flex items-center rounded-xl border border-[var(--line)] bg-[var(--panel)] px-3 py-1.5 shadow-sm">
            <span className="text-[11px] font-medium uppercase tracking-wider text-[var(--muted)] mr-2">
              Project:
            </span>
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="bg-transparent text-sm font-semibold text-[var(--ink)] outline-none cursor-pointer"
            >
              {PROJECT_ANALYSES.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.score}%)
                </option>
              ))}
            </select>
          </div>

          {/* Role Density Selector */}
          <div className="flex rounded-xl border border-[var(--line)] bg-[var(--panel-2)] p-1">
            <button
              onClick={() => setRoleView("lead")}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
                roleView === "lead"
                  ? "bg-[var(--panel)] text-[var(--ink)] shadow-sm"
                  : "text-[var(--muted)] hover:text-[var(--ink)]"
              }`}
            >
              Team Lead View
            </button>
            <button
              onClick={() => setRoleView("dev")}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
                roleView === "dev"
                  ? "bg-[var(--panel)] text-[var(--ink)] shadow-sm"
                  : "text-[var(--muted)] hover:text-[var(--ink)]"
              }`}
            >
              Developer View
            </button>
          </div>
        </div>
      </div>

      {/* Role-Aware Orientation Banner */}
      <div className="rounded-xl border border-[var(--line)] bg-[var(--panel)] px-5 py-3 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-2 w-2 rounded-full bg-[var(--indigo)]" />
          <span className="text-[var(--muted)]">
            {roleView === "lead" ? (
              <>
                <strong className="text-[var(--ink)]">Team Lead Density:</strong> Emphasizing aggregate readiness score, delivery milestones, and top blockers.
              </>
            ) : (
              <>
                <strong className="text-[var(--ink)]">Developer Density:</strong> Expanding full technical checklist, component impacts, code references, and unblocking actions.
              </>
            )}
          </span>
        </div>
        <div className="text-[11px] text-[var(--muted)]">
          Last analyzed: <span className="font-semibold text-[var(--ink)]">{activeProject.updatedAt}</span>
        </div>
      </div>

      {/* Top Section: Prominent Explainable Score + At-A-Glance Data Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Card 1: Explainable Readiness Score */}
        <div
          onClick={() => setShowScoreBreakdown(!showScoreBreakdown)}
          className="relative rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-5 shadow-sm transition hover:border-[var(--indigo)] cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]">
              Overall Readiness
            </div>
            <span className="text-[10px] font-semibold signal group-hover:underline">
              {showScoreBreakdown ? "Hide details" : "Why 92%?"}
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-3">
            <div className="text-4xl font-extrabold tracking-tight text-[var(--ink)]">
              {activeProject.score}%
            </div>
            <div className="flex items-center text-xs font-semibold text-[var(--green)]">
              ↑ 12% vs last week
            </div>
          </div>
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-[var(--line)]">
            <div
              className="h-full rounded-full bg-[var(--green)] transition-all duration-500"
              style={{ width: `${activeProject.score}%` }}
            />
          </div>
          <div className="mt-2 text-[11px] text-[var(--muted)] flex justify-between">
            <span>Sprint 1 Readiness: Strong</span>
            <span>Target: &gt;85%</span>
          </div>
        </div>

        {/* Card 2: Projects Analyzed */}
        <div className="rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]">
              Projects Analyzed
            </div>
            <span className="text-xs font-semibold text-[var(--green)]">↑ 100%</span>
          </div>
          <div className="mt-2 text-3xl font-extrabold text-[var(--ink)]">2 Active</div>
          <p className="mt-3 text-[11px] text-[var(--muted)]">
            Cross-repository intelligence synced across 2 active client codebases.
          </p>
        </div>

        {/* Card 3: Dependencies Identified */}
        <div className="rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]">
              Dependencies Mapped
            </div>
            <span className="text-xs font-semibold text-[var(--green)]">↑ 18%</span>
          </div>
          <div className="mt-2 text-3xl font-extrabold text-[var(--ink)]">24 Total</div>
          <p className="mt-3 text-[11px] text-[var(--muted)]">
            6 client-required permissions, 18 internal microservice bindings.
          </p>
        </div>

        {/* Card 4: Avg Time to Plan */}
        <div className="rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]">
              Avg. Time to Plan
            </div>
            <span className="text-xs font-semibold text-[var(--green)]">↓ 10% faster</span>
          </div>
          <div className="mt-2 text-3xl font-extrabold text-[var(--ink)]">1.6 Days</div>
          <p className="mt-3 text-[11px] text-[var(--muted)]">
            Down from 12+ days of manual discovery and stakeholder interviews.
          </p>
        </div>
      </div>

      {/* Explainable Score Breakdown Drawer (Opens on click) */}
      {showScoreBreakdown && (
        <div className="rounded-2xl border-2 border-[var(--indigo)] bg-[var(--panel)] p-6 shadow-md animate-in fade-in">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-[var(--indigo)]">
                Transparent Formula Breakdown
              </div>
              <h3 className="mt-1 text-lg font-bold text-[var(--ink)]">
                Why {activeProject.name} is at {activeProject.score}% Readiness
              </h3>
              <p className="mt-1 text-xs text-[var(--muted)]">
                PRISM does not use black-box scoring. This readiness percentage is weighted across 4 verifiable pillars:
              </p>
            </div>
            <button
              onClick={() => setShowScoreBreakdown(false)}
              className="text-xs text-[var(--muted)] hover:text-[var(--ink)] px-2 py-1 border rounded-lg"
            >
              Close
            </button>
          </div>

          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Pillar 1 */}
            <div className="rounded-xl border border-[var(--line)] bg-[var(--panel-2)] p-4">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-[var(--ink)]">Client Dependencies</span>
                <span className="font-bold text-[var(--green)]">40 / 40 pts</span>
              </div>
              <div className="mt-1 text-[11px] text-[var(--muted)]">Weight: 40%</div>
              <div className="mt-3 text-xs text-[var(--ink)]">
                5 of 6 client access items verified, 1 pending non-critical approval.
              </div>
              <div className="mt-2">
                <Badge tone="green">Passing</Badge>
              </div>
            </div>

            {/* Pillar 2 */}
            <div className="rounded-xl border border-[var(--line)] bg-[var(--panel-2)] p-4">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-[var(--ink)]">Architecture Decisions</span>
                <span className="font-bold text-[var(--green)]">27 / 30 pts</span>
              </div>
              <div className="mt-1 text-[11px] text-[var(--muted)]">Weight: 30%</div>
              <div className="mt-3 text-xs text-[var(--ink)]">
                2 of 3 ADRs approved. Event-driven queue schema verified in code.
              </div>
              <div className="mt-2">
                <Badge tone="green">Verified</Badge>
              </div>
            </div>

            {/* Pillar 3 */}
            <div className="rounded-xl border border-[var(--line)] bg-[var(--panel-2)] p-4">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-[var(--ink)]">Infra & Network</span>
                <span className="font-bold text-[var(--green)]">20 / 20 pts</span>
              </div>
              <div className="mt-1 text-[11px] text-[var(--muted)]">Weight: 20%</div>
              <div className="mt-3 text-xs text-[var(--ink)]">
                Private endpoints, SQL firewall rule, and Bicep scripts validated.
              </div>
              <div className="mt-2">
                <Badge tone="green">100% Ready</Badge>
              </div>
            </div>

            {/* Pillar 4 */}
            <div className="rounded-xl border border-[var(--line)] bg-[var(--panel-2)] p-4">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-[var(--ink)]">SOW & Scope Clarity</span>
                <span className="font-bold text-[var(--amber)]">5 / 10 pts</span>
              </div>
              <div className="mt-1 text-[11px] text-[var(--muted)]">Weight: 10%</div>
              <div className="mt-3 text-xs text-[var(--ink)]">
                Sprint 1 backlog locked; third-party shipping webhook SLA in review.
              </div>
              <div className="mt-2">
                <Badge tone="amber">In Review (-5%)</Badge>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Two-Column Working Surface */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.55fr_1fr] gap-6 items-start">
        {/* LEFT COLUMN: Dependency Checklist + What PRISM Will Deliver */}
        <div className="space-y-6">
          
          {/* Section 1: Client Dependency Checklist (With WHAT / WHY / EVIDENCE / IMPACT / ACTION) */}
          <Panel className="p-6">
            <div className="flex items-center justify-between border-b border-[var(--line)] pb-4">
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]">
                  Sprint 1 Requirements
                </div>
                <h2 className="mt-1 text-xl font-bold text-[var(--ink)]">
                  Before Development Starts
                </h2>
                <p className="mt-0.5 text-xs text-[var(--muted)]">
                  Prism verified what is needed from the client org before Sprint 1 begins. Click any row to inspect technical evidence.
                </p>
              </div>
              <div className="text-right">
                <Badge tone="indigo">5 / 6 Completed</Badge>
              </div>
            </div>

            {/* Checklist items list */}
            <div className="mt-4 divide-y divide-[var(--line)]">
              {DEPENDENCIES.map((dep) => {
                const isSelected = selectedDepId === dep.id;
                const isResolved = dep.status === "resolved";
                const isPending = dep.status === "pending";

                return (
                  <div
                    key={dep.id}
                    className={`transition-colors ${
                      isSelected ? "bg-[var(--panel-2)]" : "hover:bg-[var(--panel-2)]"
                    }`}
                  >
                    {/* Item Row Header */}
                    <button
                      type="button"
                      onClick={() => setSelectedDepId(isSelected ? null : dep.id)}
                      className="flex w-full items-center justify-between py-3.5 px-3 text-left cursor-pointer border-l-4 transition-all"
                      style={{
                        borderLeftColor: isResolved
                          ? "var(--green)"
                          : isPending
                          ? "var(--amber)"
                          : "var(--red)",
                      }}
                    >
                      <div className="flex items-center gap-3">
                        {/* Status Icon */}
                        <div
                          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
                            isResolved
                              ? "bg-[var(--green-dim)] text-[var(--green)]"
                              : "bg-[var(--amber-dim)] text-[var(--amber)]"
                          }`}
                        >
                          {isResolved ? "✓" : "!"}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-[var(--ink)]">
                            {dep.name}
                          </div>
                          <div className="text-xs text-[var(--muted)]">
                            Role: <span className="font-medium text-[var(--ink)]">{dep.requiredRole}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right text-xs">
                          <div className="text-[11px] text-[var(--muted)]">Required From</div>
                          <div className="font-medium text-[var(--ink)]">{dep.source}</div>
                        </div>
                        <span className="text-xs text-[var(--muted)]">
                          {isSelected ? "▲" : "▼"}
                        </span>
                      </div>
                    </button>

                    {/* Detailed Technical Evidence Accordion (Shown when selected or in Developer view) */}
                    {(isSelected || roleView === "dev") && (
                      <div className="border-t border-[var(--line)] bg-[var(--panel-2)] p-4 text-xs space-y-4">
                        {/* WHAT & WHY */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="rounded-xl border border-[var(--line)] bg-[var(--panel)] p-3.5">
                            <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">
                              Why This Is Required
                            </div>
                            <p className="mt-1.5 text-xs text-[var(--ink)] leading-relaxed">
                              {dep.why}
                            </p>
                          </div>
                          <div className="rounded-xl border border-[var(--line)] bg-[var(--panel)] p-3.5">
                            <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--red)]">
                              Sprint 1 Impact If Missing
                            </div>
                            <p className="mt-1.5 text-xs text-[var(--ink)] leading-relaxed">
                              {dep.impact}
                            </p>
                          </div>
                        </div>

                        {/* EVIDENCE */}
                        <div className="rounded-xl border border-[var(--line)] bg-[var(--panel)] p-3.5">
                          <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)] mb-2">
                            Code & Infra Evidence Traced By PRISM
                          </div>
                          <EvidenceList items={dep.evidence} />
                        </div>

                        {/* AFFECTED SERVICES & UNBLOCKING ACTION */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-[11px] text-[var(--muted)]">Affected Components:</span>
                            {dep.affectedComponents.map((c) => (
                              <Badge key={c}>{c}</Badge>
                            ))}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-semibold text-[var(--indigo)]">Action:</span>
                            <span className="text-[11px] text-[var(--ink)]">{dep.action}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Panel>

          {/* Section 2: What PRISM Will Deliver (Pre-development Assets) */}
          <Panel className="p-6">
            <div className="border-b border-[var(--line)] pb-4">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]">
                Pre-Development Deliverables
              </div>
              <h2 className="mt-1 text-xl font-bold text-[var(--ink)]">
                What Prism Will Deliver
              </h2>
              <p className="mt-0.5 text-xs text-[var(--muted)]">
                We analyze your inputs, repository, and cloud specs to generate actionable assets prior to kickoff.
              </p>
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {DELIVERABLES.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedDeliverable(item)}
                  className="rounded-xl border border-[var(--line)] bg-[var(--panel-2)] p-4 transition hover:border-[var(--indigo)] hover:bg-[var(--panel)] cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm text-[var(--ink)] group-hover:signal">
                      {item.title}
                    </span>
                    <Badge tone={item.status === "Verified" ? "green" : item.status === "Ready" ? "indigo" : "amber"}>
                      {item.status}
                    </Badge>
                  </div>
                  <p className="mt-1.5 text-xs text-[var(--muted)] leading-relaxed">
                    {item.description}
                  </p>
                  <div className="mt-3 flex items-center justify-between text-[11px] pt-2 border-t border-[var(--line)]">
                    <span className="text-[var(--muted)]">{item.details}</span>
                    <span className="signal font-semibold">Inspect →</span>
                  </div>
                </div>
              ))}
            </div>
          </Panel>

          {/* Section 3: How It Works — Practical Engineering Step Sequence */}
          <Panel className="p-6">
            <div className="border-b border-[var(--line)] pb-4">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]">
                Engineering Sequence
              </div>
              <h3 className="mt-1 text-lg font-bold text-[var(--ink)]">
                How PRISM Pre-Development Verification Works
              </h3>
            </div>

            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="relative border-l-2 border-[var(--indigo)] pl-3.5">
                <div className="text-xs font-bold text-[var(--ink)]">1. Connect & Ingest</div>
                <p className="mt-1 text-xs text-[var(--muted)] leading-relaxed">
                  Ingest repository code, Bicep/Terraform infra files, and client specification documents.
                </p>
              </div>

              <div className="relative border-l-2 border-[var(--indigo)] pl-3.5">
                <div className="text-xs font-bold text-[var(--ink)]">2. Trace Dependencies</div>
                <p className="mt-1 text-xs text-[var(--muted)] leading-relaxed">
                  Map application code references directly to required cloud RBAC roles and firewall rules.
                </p>
              </div>

              <div className="relative border-l-2 border-[var(--indigo)] pl-3.5">
                <div className="text-xs font-bold text-[var(--ink)]">3. Synthesize Plan</div>
                <p className="mt-1 text-xs text-[var(--muted)] leading-relaxed">
                  Compute explainable readiness scores, generate architecture blueprints, and flag Sprint 1 blockers.
                </p>
              </div>

              <div className="relative border-l-2 border-[var(--green)] pl-3.5">
                <div className="text-xs font-bold text-[var(--green)]">4. Start Confidently</div>
                <p className="mt-1 text-xs text-[var(--muted)] leading-relaxed">
                  Engineering team kicks off Sprint 1 with access, environments, and requirements unblocked.
                </p>
              </div>
            </div>
          </Panel>
        </div>

        {/* RIGHT COLUMN: Scoped AI Assistant + Recent Analyses with Comparative Differentiator */}
        <div className="space-y-6">
          
          {/* Component 1: Contextual Scoped AI Assistant Entry Point */}
          <Panel className="p-5 border-2 border-[var(--line)] bg-[var(--panel)] shadow-sm">
            <div className="flex items-center justify-between border-b border-[var(--line)] pb-3.5">
              <div className="flex items-center gap-2">
                <div className="grid h-7 w-7 place-items-center rounded-lg bg-[var(--ink)] text-white text-xs font-bold">
                  P
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[var(--ink)]">
                    Ask PRISM About Readiness
                  </h3>
                  <div className="text-[10px] text-[var(--muted)]">
                    Scoped to {activeProject.name} dependency context
                  </div>
                </div>
              </div>
              <Badge tone="indigo">Contextual Assistant</Badge>
            </div>

            {/* Suggested Contextual Prompts */}
            <div className="mt-3.5 space-y-2">
              <div className="text-[11px] font-semibold text-[var(--muted)]">
                Suggested questions for current blockers:
              </div>
              <button
                onClick={() =>
                  handleAskAi("Why is Customer Portal at 78% while Ecommerce is at 92%?")
                }
                className="w-full text-left rounded-xl bg-[var(--panel-2)] hover:bg-[var(--indigo-dim)] p-2.5 text-xs text-[var(--ink)] transition border border-[var(--line)] cursor-pointer"
              >
                💬 Why is Customer Portal at 78% while Ecommerce is at 92%?
              </button>
              <button
                onClick={() =>
                  handleAskAi("What is blocking Key Vault RBAC permission from the client?")
                }
                className="w-full text-left rounded-xl bg-[var(--panel-2)] hover:bg-[var(--indigo-dim)] p-2.5 text-xs text-[var(--ink)] transition border border-[var(--line)] cursor-pointer"
              >
                💬 What is blocking Key Vault RBAC permission from the client?
              </button>
              <button
                onClick={() =>
                  handleAskAi("Draft an email request template for the Client Security Officer")
                }
                className="w-full text-left rounded-xl bg-[var(--panel-2)] hover:bg-[var(--indigo-dim)] p-2.5 text-xs text-[var(--ink)] transition border border-[var(--line)] cursor-pointer"
              >
                💬 Draft an email request template for the Client Security Officer
              </button>
            </div>

            {/* AI Q&A Feed */}
            <div className="mt-4 max-h-[360px] overflow-y-auto space-y-3.5 pr-1">
              {aiChat.map((chat, idx) => (
                <div key={idx} className="rounded-xl bg-[var(--panel-2)] p-3.5 text-xs space-y-2 border border-[var(--line)]">
                  <div className="font-semibold text-[var(--ink)]">
                    Q: {chat.q}
                  </div>
                  <div className="text-[var(--ink)] leading-relaxed whitespace-pre-line">
                    {chat.a}
                  </div>
                  {chat.evidence && chat.evidence.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-[var(--line)]">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">
                        Traced Evidence:
                      </div>
                      <div className="mt-1 space-y-1">
                        {chat.evidence.map((ev, i) => (
                          <div key={i} className="mono text-[11px] text-[var(--indigo)]">
                            • {ev}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {chat.actions && chat.actions.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-[var(--line)] flex flex-wrap gap-1.5">
                      {chat.actions.map((act, i) => (
                        <span key={i} className="rounded bg-[var(--panel)] px-2 py-1 text-[10px] font-medium border border-[var(--line)]">
                          → {act}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {isAskingAi && (
                <div className="p-3 text-xs text-[var(--muted)] italic">
                  PRISM is analyzing codebase references and client tickets…
                </div>
              )}
            </div>

            {/* Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAskAi();
              }}
              className="mt-3 flex gap-2"
            >
              <input
                type="text"
                value={aiQuestion}
                onChange={(e) => setAiQuestion(e.target.value)}
                placeholder="Ask about this project's readiness, blockers, or access…"
                className="flex-1 rounded-xl border border-[var(--line)] bg-[var(--panel-2)] px-3.5 py-2 text-xs text-[var(--ink)] placeholder-[var(--muted)] focus:outline-none focus:border-[var(--indigo)]"
              />
              <button
                type="submit"
                disabled={isAskingAi}
                className="rounded-xl bg-[var(--ink)] px-3.5 py-2 text-xs font-semibold text-white transition hover:opacity-90 cursor-pointer disabled:opacity-50"
              >
                Ask
              </button>
            </form>
          </Panel>

          {/* Component 2: Recent Analyses with Comparative Differentiators */}
          <Panel className="p-5">
            <div className="flex items-center justify-between border-b border-[var(--line)] pb-3.5">
              <div>
                <h3 className="text-sm font-bold text-[var(--ink)]">
                  Recent Project Analyses
                </h3>
                <p className="text-[11px] text-[var(--muted)]">
                  Compare readiness posture across multiple repositories
                </p>
              </div>
              <Link href="/dashboard" className="text-xs signal font-semibold hover:underline">
                View all →
              </Link>
            </div>

            <div className="mt-3.5 space-y-3">
              {PROJECT_ANALYSES.map((proj) => {
                const isCurrent = proj.id === selectedProject;

                return (
                  <div
                    key={proj.id}
                    onClick={() => setSelectedProject(proj.id)}
                    className={`rounded-xl border p-3.5 transition cursor-pointer ${
                      isCurrent
                        ? "border-[var(--indigo)] bg-[var(--indigo-dim)]"
                        : "border-[var(--line)] bg-[var(--panel-2)] hover:bg-[var(--panel)]"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-semibold text-xs text-[var(--ink)]">
                        {proj.name}
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-block h-2 w-2 rounded-full ${
                            proj.score >= 90
                              ? "bg-[var(--green)]"
                              : proj.score >= 80
                              ? "bg-[var(--indigo)]"
                              : "bg-[var(--amber)]"
                          }`}
                        />
                        <span className="font-bold text-xs text-[var(--ink)]">
                          {proj.score}%
                        </span>
                        <span className="text-[10px] text-[var(--muted)]">
                          {proj.updatedAt}
                        </span>
                      </div>
                    </div>

                    {/* Single Biggest Differentiator (Requirement 5) */}
                    <div className="mt-2 text-[11px] text-[var(--muted)] leading-snug">
                      <strong className="text-[var(--ink)] font-medium">Differentiator: </strong>
                      {proj.differentiator}
                    </div>

                    {proj.keyBlocker && (
                      <div className="mt-2">
                        <Badge tone="red">Blocker: {proj.keyBlocker}</Badge>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Panel>
        </div>
      </div>

      {/* Deliverable Inspection Modal (If user clicks any deliverable) */}
      {selectedDeliverable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-6 shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <Badge tone="indigo">{selectedDeliverable.status}</Badge>
                <h3 className="mt-2 text-xl font-bold text-[var(--ink)]">
                  {selectedDeliverable.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedDeliverable(null)}
                className="rounded-lg p-1.5 text-[var(--muted)] hover:bg-[var(--panel-2)] cursor-pointer"
              >
                ✕
              </button>
            </div>
            <p className="mt-3 text-xs text-[var(--muted)] leading-relaxed">
              {selectedDeliverable.description}
            </p>
            <div className="mt-4 rounded-xl bg-[var(--panel-2)] p-4 text-xs">
              <div className="font-bold text-[var(--ink)] uppercase tracking-wider text-[10px]">
                Generated Analysis & Synthesis
              </div>
              <p className="mt-1.5 text-[var(--ink)] leading-relaxed">
                {selectedDeliverable.details}
              </p>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setSelectedDeliverable(null)}
                className="rounded-xl border border-[var(--line)] px-4 py-2 text-xs font-semibold text-[var(--ink)] hover:bg-[var(--panel-2)] cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => setSelectedDeliverable(null)}
                className="rounded-xl bg-[var(--ink)] px-4 py-2 text-xs font-semibold text-white hover:opacity-90 cursor-pointer"
              >
                Export Deliverable PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
