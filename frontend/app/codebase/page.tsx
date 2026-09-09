"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "../../lib/api";
import { Insight } from "../../types";

const SAMPLE_CODEBASE_INSIGHTS: Insight[] = [
  {
    title: "src/services/paymentService.ts",
    summary:
      "High complexity in payment retry logic and exception handling. Missing idempotency key check on webhook callbacks.",
    severity: "high",
    impact:
      "Concurrent webhook deliveries from payment gateways can result in double-crediting customer balances.",
    action:
      "Wrap webhook handler in a distributed Redis mutex transaction and verify idempotency key uniqueness.",
    evidence: [
      {
        text: "Cyclomatic complexity of 24 in handleWebhookCallback function.",
        source: "SONAR / ESLINT",
        reference: "L142-198",
      },
      {
        text: "Direct DB write without prior transaction lock on payments table.",
        source: "CODE INSPECTION",
        reference: "L165",
      },
    ],
  },
  {
    title: "src/api/payment.ts",
    summary:
      "Express/FastAPI router lacks schema validation for refund request payload parameters.",
    severity: "medium",
    impact:
      "Negative amount values could bypass business validation if not validated at gateway boundary.",
    action:
      "Attach Zod schema validator middleware to POST /api/payment/refund endpoint.",
    evidence: [
      {
        text: "Request body cast directly to PaymentRefundDto without runtime type validation.",
        source: "STATIC ANALYSIS",
        reference: "L48",
      },
    ],
  },
  {
    title: "src/auth/jwt.ts",
    summary:
      "JWT expiration is hardcoded to 7 days without refresh token rotation support.",
    severity: "medium",
    impact:
      "Revoked credentials remain valid until token expiry; security compliance standard mandates max 15m lifetime.",
    action:
      "Implement refresh token rotation and shorten access token TTL to 15 minutes.",
    evidence: [
      {
        text: "expiresIn: '7d' hardcoded in token generation config.",
        source: "AUTH AUDIT",
        reference: "L24",
      },
    ],
  },
  {
    title: "src/services/OrderService.ts",
    summary:
      "Database connection pooling is unconfigured, using default connection limit of 5.",
    severity: "low",
    impact:
      "Under high concurrent order load, database connection pool exhaustion will introduce HTTP 500 errors.",
    action:
      "Increase pool size to min 20 / max 100 with active healthcheck ping.",
    evidence: [
      {
        text: "TypeORM/Prisma client initialized without custom pool configuration.",
        source: "DB CONFIG SCAN",
        reference: "L12",
      },
    ],
  },
];

export default function CodebasePage() {
  const [insights, setInsights] = useState<Insight[]>(SAMPLE_CODEBASE_INSIGHTS);
  const [selected, setSelected] = useState<Insight>(SAMPLE_CODEBASE_INSIGHTS[0]);

  useEffect(() => {
    api<Insight[]>("/codebase-insights")
      .then((data) => {
        if (data && data.length > 0) {
          setInsights(data);
          setSelected(data[0]);
        }
      })
      .catch(() => {
        // Fallback to rich sample data
      });
  }, []);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-indigo-400">
            DEVELOPER &gt; PROJECT PHOENIX
          </div>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Codebase Insights
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-400">
            Contextual signals from the codebase, recent activity, and engineering health.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/system"
            className="flex items-center gap-2 rounded-xl border border-slate-700/80 bg-[#161a28] px-4 py-2 text-xs font-semibold text-slate-200 transition hover:bg-[#1f2438]"
          >
            <span>⬡</span>
            <span>View in System Map</span>
          </Link>
          <Link
            href="/ask?q=Analyze+codebase+architecture+risks"
            className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 transition hover:bg-indigo-500"
          >
            <span>✦</span>
            <span>Deep Codebase Scan</span>
          </Link>
        </div>
      </div>

      {/* 2-Column Split */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1.9fr] gap-6 items-start">
        {/* Left: Files & Insights List */}
        <div
          className="rounded-2xl border p-5 shadow-sm space-y-3"
          style={{ background: "var(--panel)", borderColor: "var(--line)" }}
        >
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-2">
            Files Flagged For Review
          </div>

          <div className="space-y-2.5">
            {insights.map((item) => {
              const isSelected = selected?.title === item.title;
              const isHigh = item.severity === "high";

              return (
                <button
                  type="button"
                  key={item.title}
                  onClick={() => setSelected(item)}
                  className={`group w-full flex flex-col gap-2 rounded-2xl border p-4 text-left transition-all duration-150 cursor-pointer ${
                    isSelected
                      ? "border-indigo-500/80 shadow-md ring-1 ring-indigo-500/50"
                      : "hover:border-slate-700"
                  }`}
                  style={{
                    background: isSelected ? "var(--indigo-dim)" : "var(--panel-2)",
                    borderColor: isSelected ? "rgba(99, 102, 241, 0.6)" : "var(--line)",
                  }}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="mono text-xs font-bold text-white group-hover:text-indigo-300 transition-colors">
                      {item.title}
                    </span>
                    <span
                      className={`inline-flex rounded-lg px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide border ${
                        isHigh
                          ? "bg-red-950/80 border-red-800/60 text-red-400"
                          : "bg-amber-950/80 border-amber-800/60 text-amber-400"
                      }`}
                    >
                      {item.severity}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {item.summary}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Detailed File Insight Panel */}
        {selected && (
          <div
            className="rounded-2xl border p-7 shadow-sm space-y-6"
            style={{ background: "var(--panel)", borderColor: "var(--line)" }}
          >
            {/* Header */}
            <div className="flex items-start justify-between border-b pb-5" style={{ borderColor: "var(--line)" }}>
              <div>
                <div className="mono text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-400">
                  FILE INSIGHT
                </div>
                <h2 className="mt-1 text-xl font-extrabold text-white mono">
                  {selected.title}
                </h2>
                <p className="mt-1.5 text-xs sm:text-sm text-slate-400 leading-relaxed">
                  {selected.summary}
                </p>
              </div>

              <span
                className={`inline-flex rounded-lg px-3 py-1 text-xs font-bold uppercase tracking-wide border ${
                  selected.severity === "high"
                    ? "bg-red-950/80 border-red-800/60 text-red-400 shadow-sm"
                    : "bg-amber-950/80 border-amber-800/60 text-amber-400"
                }`}
              >
                {selected.severity} risk
              </span>
            </div>

            {/* PRISM Interpretation & Action */}
            <div className="space-y-4">
              <div
                className="rounded-2xl border p-4 space-y-2 text-xs"
                style={{ background: "var(--panel-2)", borderColor: "var(--line)" }}
              >
                <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                  PRISM Interpretation
                </div>
                <p className="text-slate-300 leading-relaxed font-medium">
                  {selected.impact}
                </p>
              </div>

              <div
                className="rounded-2xl border p-4 space-y-2 text-xs"
                style={{ background: "var(--panel-2)", borderColor: "var(--line)" }}
              >
                <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                  Recommended Action
                </div>
                <p className="text-slate-300 leading-relaxed font-medium">
                  {selected.action}
                </p>
              </div>
            </div>

            {/* Evidence List */}
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2.5">
                TRACED EVIDENCE
              </div>
              <div className="space-y-2">
                {selected.evidence.map((ev, i) => (
                  <div
                    key={i}
                    className="rounded-xl border p-3.5 text-xs space-y-1"
                    style={{ background: "var(--panel-2)", borderColor: "var(--line)" }}
                  >
                    <div className="text-slate-200 font-medium">{ev.text}</div>
                    <div className="text-[10px] uppercase font-bold tracking-wider text-slate-500">
                      {ev.source} {ev.reference ? `· ${ev.reference}` : ""}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-2 border-t flex flex-wrap items-center gap-3" style={{ borderColor: "var(--line)" }}>
              <Link
                href={`/ask?q=How+to+fix+issues+in+${encodeURIComponent(selected.title)}`}
                className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 transition hover:bg-indigo-500 cursor-pointer"
              >
                <span>✦</span>
                <span>Ask PRISM How to Refactor</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
