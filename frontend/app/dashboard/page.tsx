"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "../../lib/api";
import { Opportunity, Dependency } from "../../types";
import { Header, Panel, Badge } from "../../components/ui";

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

export default function HomePage() {
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

    // Open popup immediately on user click to avoid browser popup blocking.
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
          const status = await api<AzureStatus>("/integrations/azure/status").catch(
            () => null
          );
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

  return (
    <>
      <Header
        eyebrow="Developer · Project Phoenix"
        title={`Good morning, ${data.developer.name}.`}
        sub="PRISM turns project context into the places where you can create the most impact."
      />

      <Panel className="mb-6 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-xs uppercase tracking-[.18em] text-[var(--indigo)]">
              Project onboarding
            </div>
            <h2 className="mt-1 text-xl font-bold">Connect Microsoft Azure</h2>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Add a project by linking your Azure account and tenant context.
            </p>
          </div>

          <button
            type="button"
            onClick={() => startAzureConnect("management")}
            disabled={isConnecting}
            className="rounded-xl bg-[var(--indigo)] px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isConnecting ? "Connecting..." : "Add Project"}
          </button>
          <button
            type="button"
            onClick={() => startAzureConnect("devops")}
            disabled={isConnecting}
            className="rounded-xl border border-[var(--line)] px-4 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isConnecting ? "Connecting..." : "Connect Azure DevOps"}
          </button>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Badge tone={azure?.connected ? "green" : "amber"}>
            {azure?.connected ? "Azure connected" : "Not connected"}
          </Badge>
          <Badge tone={azure?.devops_connected ? "green" : "amber"}>
            {azure?.devops_connected ? "Azure DevOps connected" : "DevOps not connected"}
          </Badge>
          {azure?.account_name ? (
            <span className="text-xs text-[var(--muted)]">{azure.account_name}</span>
          ) : null}
          {azure?.tenant_id ? (
            <span className="text-xs text-[var(--muted)]">Tenant: {azure.tenant_id}</span>
          ) : null}
          {azure?.connected ? (
            <button
              type="button"
              onClick={loadAzureInventory}
              disabled={isLoadingInventory}
              className="rounded-lg border border-[var(--line)] px-3 py-1 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isLoadingInventory ? "Loading Azure data..." : "Refresh Azure data"}
            </button>
          ) : null}
          {azure?.devops_connected ? (
            <>
              <button
                type="button"
                onClick={loadAzureDevOps}
                disabled={isLoadingDevOps}
                className="rounded-lg border border-[var(--line)] px-3 py-1 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isLoadingDevOps ? "Loading DevOps data..." : "Refresh DevOps data"}
              </button>
            </>
          ) : null}
        </div>

        {connectError ? (
          <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
            {connectError}
          </div>
        ) : null}

        {azureInventory ? (
          <div className="mt-5 border-t border-[var(--line)] pt-4">
            <div className="grid grid-cols-3 gap-3 text-sm">
              <div><span className="text-[var(--muted)]">Subscriptions</span><div className="font-bold">{azureInventory.summary.subscriptions}</div></div>
              <div><span className="text-[var(--muted)]">Resource groups</span><div className="font-bold">{azureInventory.summary.resource_groups}</div></div>
              <div><span className="text-[var(--muted)]">Resources</span><div className="font-bold">{azureInventory.summary.resources}</div></div>
            </div>
            <div className="mt-4 space-y-3">
              {azureInventory.subscriptions.map((subscription) => (
                <details key={subscription.id} className="rounded-lg border border-[var(--line)] p-3">
                  <summary className="cursor-pointer text-sm font-semibold">
                    {subscription.name} ({subscription.resources.length} resources)
                  </summary>
                  <div className="mt-3 text-xs text-[var(--muted)]">
                    Resource groups: {subscription.resource_groups.map((group) => group.name).join(", ") || "None"}
                  </div>
                  <div className="mt-3 space-y-2">
                    {subscription.resources.map((resource) => (
                      <div key={resource.id} className="border-t border-[var(--line)] pt-2 text-xs">
                        <div className="font-semibold">{resource.name}</div>
                        <div className="text-[var(--muted)]">{resource.type} · {resource.resource_group || "No resource group"} · {resource.location || "No location"}</div>
                      </div>
                    ))}
                  </div>
                </details>
              ))}
            </div>
          </div>
        ) : null}

        {azureDevOps ? (
          <div className="mt-5 border-t border-[var(--line)] pt-4">
            <div className="text-xs font-semibold uppercase tracking-[.18em] text-[var(--indigo)]">Azure DevOps</div>
            {azureDevOpsInsights.length ? (
              <div className="mt-3 space-y-2">
                {azureDevOpsInsights.map((insight) => (
                  <div key={insight.title} className="rounded-lg border border-[var(--line)] p-3 text-xs">
                    <div className="font-semibold">{insight.title}</div>
                    <div className="mt-1 text-[var(--muted)]">{insight.summary}</div>
                    <div className="mt-2">{insight.action}</div>
                    <div className="mt-1 text-[var(--muted)]">{insight.evidence.map((item) => item.text).join(" ")}</div>
                  </div>
                ))}
              </div>
            ) : null}
            <div className="mt-3 space-y-3">
              {azureDevOps.organizations.map((organization) => (
                <details key={organization.id} className="rounded-lg border border-[var(--line)] p-3">
                  <summary className="cursor-pointer text-sm font-semibold">{organization.name} ({organization.projects.length} projects)</summary>
                  <div className="mt-3 space-y-3">
                    {organization.projects.map((project) => (
                      <details key={project.id} className="border-t border-[var(--line)] pt-3">
                        <summary className="cursor-pointer text-xs font-semibold">
                          {project.name} · {project.work_items.length} work items · {project.repositories.length} repositories
                        </summary>
                        <div className="mt-3 grid gap-3 md:grid-cols-2">
                          <div>
                            <div className="text-xs font-semibold">Recent work items</div>
                            <div className="mt-2 space-y-1 text-xs text-[var(--muted)]">
                              {project.work_items.map((item) => <div key={item.id}>#{item.id} {item.title || "Untitled"} · {item.type || "Work item"} · {item.state || "Unknown"}</div>)}
                              {!project.work_items.length ? <div>No work items found.</div> : null}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs font-semibold">Repositories</div>
                            <div className="mt-2 space-y-2 text-xs text-[var(--muted)]">
                              {project.repositories.map((repository) => (
                                <div key={repository.id}>
                                  <a className="font-semibold underline" href={repository.web_url || undefined} target="_blank" rel="noreferrer">{repository.name}</a>
                                  <div>{repository.files.length} files and folders · {repository.branches.length} branches · {repository.default_branch || "No default branch"}</div>
                                  <div className="mt-1">Branches: {repository.branches.map((branch) => branch.name).join(", ") || "None"}</div>
                                  <div className="mt-1 max-h-24 overflow-auto">{repository.files.filter((file) => !file.is_folder).map((file) => file.path).join(", ") || "No files found."}</div>
                                </div>
                              ))}
                              {!project.repositories.length ? <div>No repositories found.</div> : null}
                            </div>
                          </div>
                        </div>
                      </details>
                    ))}
                  </div>
                </details>
              ))}
              {!azureDevOps.organizations.length ? <div className="text-sm text-[var(--muted)]">No Azure DevOps organizations are available for this account.</div> : null}
            </div>
          </div>
        ) : null}
      </Panel>

      <div className="mb-6 grid grid-cols-4 gap-3">
        {[
          ["Opportunities", data.stats.opportunities],
          ["Open tasks", data.stats.open_tasks],
          ["Needs attention", data.stats.attention_areas],
          ["Experts available", data.stats.experts_available],
        ].map(([label, value]) => (
          <Panel key={label as string} className="p-5">
            <div className="text-xs text-[var(--muted)]">{label}</div>
            <div className="mt-2 text-3xl font-bold">{value}</div>
          </Panel>
        ))}
      </div>

      <div className="grid grid-cols-[1.4fr_.8fr] gap-5">
        <Panel className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs uppercase tracking-[.18em] text-[var(--indigo)]">Your focus</div>
              <h2 className="mt-1 text-xl font-bold">Where you can contribute</h2>
            </div>
            <Link className="signal text-xs font-semibold" href="/opportunities">
              View all →
            </Link>
          </div>

          <div className="mt-5 space-y-3">
            {data.opportunities.map((opportunity) => (
              <Link
                href="/opportunities"
                key={opportunity.title}
                className="block rounded-xl border border-[var(--line)] p-4 hover:border-[#c9c6ee]"
              >
                <div className="flex justify-between gap-4">
                  <div>
                    <div className="font-semibold">{opportunity.title}</div>
                    <div className="mt-1 text-xs text-[var(--muted)]">{opportunity.summary}</div>
                  </div>
                  <div className="text-right">
                    <div className="signal text-lg font-bold">{opportunity.match}%</div>
                    <div className="text-[9px] uppercase text-[var(--muted)]">match</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </Panel>

        <Panel className="p-6">
          <div className="text-xs uppercase tracking-[.18em] text-[var(--indigo)]">Signals</div>
          <h2 className="mt-1 text-xl font-bold">Dependency alerts</h2>
          <div className="mt-5 space-y-3">
            {data.dependency_alerts.map((dependency) => (
              <Link
                href="/dependencies"
                key={dependency.id}
                className="flex items-center justify-between rounded-xl border border-[var(--line)] p-3"
              >
                <div>
                  <div className="text-sm font-semibold">{dependency.name}</div>
                  <div className="text-xs text-[var(--muted)]">Current version: {dependency.version}</div>
                </div>
                <Badge tone="amber">{dependency.status}</Badge>
              </Link>
            ))}
          </div>

          <div className="mt-6 text-xs uppercase tracking-[.18em] text-[var(--muted)]">Top focus areas</div>
          <div className="mt-2 flex flex-wrap gap-2">
            {data.focus.map((area) => (
              <Badge key={area}>{area}</Badge>
            ))}
          </div>
        </Panel>
      </div>
    </>
  );
}

function LoadingCard() {
  return (
    <div className="animate-pulse">
      <div className="h-3 w-28 rounded bg-gray-200" />
      <div className="mt-4 h-10 w-96 rounded bg-gray-200" />
      <div className="mt-8 h-40 rounded-2xl border border-[var(--line)] bg-white" />
    </div>
  );
}

function ErrorCard({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm">
      Could not reach PRISM API. {text}
    </div>
  );
}
