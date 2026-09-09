"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "../../lib/api";
import { Opportunity } from "../../types";

const SAMPLE_OPPORTUNITIES: Opportunity[] = [
  {
    title: "Improve Payment Service Test Coverage",
    summary:
      "Increase test coverage across payment gateway retry mechanisms, tokenization handlers, and currency conversion edge cases.",
    severity: "high",
    impact:
      "Reduces customer-facing transaction failures during checkout spikes by an estimated 35%.",
    action:
      "Add unit and integration test suites covering Stripe failure mocks and SQL transaction rollbacks.",
    match: 92,
    effort: "2-3 days",
    relevant_files: [
      "src/services/paymentService.ts",
      "src/api/payment.ts",
      "tests/payment.test.ts",
    ],
    relevant_work_items: ["#1042 Payment gateway timeout retry", "#1088 Stripe error code handler"],
    why_you: [
      "Deep TypeScript & Node.js backend experience",
      "Authored the initial payment webhook processing pipeline",
      "Strong track record in financial idempotency testing",
    ],
    evidence: [
      {
        text: "Payment Service has 64% coverage; critical refund flow paths are currently untested.",
        source: "CODE COVERAGE SCAN",
        reference: "JEST REPORT",
      },
      {
        text: "3 recent production incidents linked to unhandled Stripe HTTP 429 rate limit exceptions.",
        source: "INCIDENT LOG",
        reference: "INC-882",
      },
    ],
  },
  {
    title: "Migrate Deprecated Axios Dependency",
    summary:
      "Replace the deprecated Axios 0.27.x version with a modern, type-safe HTTP client wrapper across payments and order services.",
    severity: "medium",
    impact:
      "Eliminates known prototype pollution vulnerabilities and standardizes telemetry logging across microservices.",
    action:
      "Introduce a shared HttpClient class, migrate existing endpoint calls, and verify request/response interceptors.",
    match: 87,
    effort: "1-2 days",
    relevant_files: [
      "src/services/paymentService.ts",
      "src/services/OrderService.ts",
      "src/lib/httpClient.ts",
    ],
    relevant_work_items: ["#988 Dependency security update", "#994 HttpClient wrapper standardization"],
    why_you: [
      "Experience with TypeScript API architecture",
      "Previously refactored API Gateway request interceptors",
    ],
    evidence: [
      {
        text: "Axios 0.27.2 is flagged as deprecated in npm security audit.",
        source: "DEPENDENCY SCAN",
        reference: "NPM AUDIT",
      },
      {
        text: "Used in 3 critical business files across 2 repository modules.",
        source: "AST CALL GRAPH",
        reference: "PHOENIX CODEBASE",
      },
    ],
  },
  {
    title: "Improve API Documentation & OpenAPI Schemas",
    summary:
      "Document authentication, rate limits, and payment API schemas with interactive Swagger / OpenAPI 3.1 definitions.",
    severity: "medium",
    impact:
      "Accelerates partner onboarding and reduces developer support tickets for external integrations.",
    action:
      "Add Zod / JSDoc type annotations and auto-generate OpenAPI documentation specs for all public endpoints.",
    match: 81,
    effort: "1 day",
    relevant_files: [
      "src/api/payment.ts",
      "src/api/auth.ts",
      "docs/openapi.yaml",
    ],
    relevant_work_items: ["#1102 Developer portal documentation"],
    why_you: [
      "High familiarity with API Gateway endpoint routing",
      "Authored the developer onboarding documentation guide",
    ],
    evidence: [
      {
        text: "4 out of 12 endpoints currently lack formal request/response contract schemas.",
        source: "API SPEC SCAN",
        reference: "OPENAPI LINTER",
      },
    ],
  },
];

export default function OpportunitiesPage() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>(SAMPLE_OPPORTUNITIES);
  const [selected, setSelected] = useState<Opportunity>(SAMPLE_OPPORTUNITIES[0]);

  useEffect(() => {
    api<Opportunity[]>("/opportunities")
      .then((data) => {
        if (data && data.length > 0) {
          setOpportunities(data);
          setSelected(data[0]);
        }
      })
      .catch(() => {
        // Fallback to rich sample data
      });
  }, []);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-indigo-400">
            DEVELOPER &gt; PROJECT PHOENIX
          </div>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            My Opportunities
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-400">
            PRISM matches your skills and project needs to identify high-impact contribution areas.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/collaborate"
            className="flex items-center gap-2 rounded-xl border border-slate-700/80 bg-[#161a28] px-4 py-2 text-xs font-semibold text-slate-200 transition hover:bg-[#1f2438]"
          >
            <span>👥</span>
            <span>Find Teammates</span>
          </Link>
          <Link
            href="/ask?q=What+should+I+work+on+next?"
            className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 transition hover:bg-indigo-500"
          >
            <span>✦</span>
            <span>Ask PRISM Recommendation</span>
          </Link>
        </div>
      </div>

      {/* 2-Column Split: Opportunities List & Detail Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_1.85fr] gap-6 items-start">
        {/* Left: Opportunity Cards */}
        <div
          className="rounded-2xl border p-5 shadow-sm space-y-3"
          style={{ background: "var(--panel)", borderColor: "var(--line)" }}
        >
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-2">
            Recommended For You
          </div>

          <div className="space-y-3">
            {opportunities.map((opp) => {
              const isSelected = selected?.title === opp.title;
              const isHigh = opp.severity === "high";

              return (
                <button
                  type="button"
                  key={opp.title}
                  onClick={() => setSelected(opp)}
                  className={`group w-full flex flex-col gap-2.5 rounded-2xl border p-4 text-left transition-all duration-150 cursor-pointer ${
                    isSelected
                      ? "border-indigo-500/80 shadow-md ring-1 ring-indigo-500/50"
                      : "hover:border-slate-700"
                  }`}
                  style={{
                    background: isSelected ? "var(--indigo-dim)" : "var(--panel-2)",
                    borderColor: isSelected ? "rgba(99, 102, 241, 0.6)" : "var(--line)",
                  }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="font-bold text-sm text-white group-hover:text-indigo-300 transition-colors">
                      {opp.title}
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-sm font-extrabold text-indigo-400">{opp.match}%</div>
                      <div className="text-[9px] uppercase tracking-wider text-slate-500">match</div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {opp.summary}
                  </p>

                  <div className="flex items-center gap-2 pt-1">
                    <span
                      className={`inline-flex rounded-lg px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide border ${
                        isHigh
                          ? "bg-red-950/80 border-red-800/60 text-red-400"
                          : "bg-amber-950/80 border-amber-800/60 text-amber-400"
                      }`}
                    >
                      {opp.severity} priority
                    </span>
                    <span className="inline-flex rounded-lg border border-slate-700 bg-[#161a28] px-2 py-0.5 text-[10px] font-medium text-slate-300">
                      ⏱ {opp.effort}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Opportunity Detail Panel */}
        {selected && (
          <div
            className="rounded-2xl border p-7 shadow-sm space-y-6"
            style={{ background: "var(--panel)", borderColor: "var(--line)" }}
          >
            {/* Header Area */}
            <div className="flex items-start justify-between border-b pb-5" style={{ borderColor: "var(--line)" }}>
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-950/70 border border-indigo-800/60 px-3 py-1 text-xs font-bold text-indigo-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
                  {selected.match}% Skill Match
                </span>
                <h2 className="mt-2.5 text-2xl font-extrabold text-white">
                  {selected.title}
                </h2>
                <p className="mt-1 text-xs sm:text-sm text-slate-400 leading-relaxed">
                  {selected.summary}
                </p>
              </div>
            </div>

            {/* Why You & Expected Impact */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Why You */}
              <div
                className="rounded-2xl border p-4 space-y-2 text-xs"
                style={{ background: "var(--panel-2)", borderColor: "var(--line)" }}
              >
                <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                  Why PRISM Recommended You
                </div>
                <div className="space-y-1.5 pt-1">
                  {selected.why_you.map((reason, i) => (
                    <div key={i} className="flex items-start gap-2 text-slate-300">
                      <span className="text-emerald-400 font-bold">✓</span>
                      <span>{reason}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Impact & Action */}
              <div
                className="rounded-2xl border p-4 space-y-3 text-xs"
                style={{ background: "var(--panel-2)", borderColor: "var(--line)" }}
              >
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                    Expected Impact
                  </div>
                  <p className="mt-1 text-slate-300 leading-relaxed">{selected.impact}</p>
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                    Recommended Action
                  </div>
                  <p className="mt-1 text-slate-300 leading-relaxed">{selected.action}</p>
                </div>
              </div>
            </div>

            {/* Relevant Code Files */}
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2.5">
                RELEVANT CODE FILES
              </div>
              <div className="flex flex-wrap gap-2">
                {selected.relevant_files.map((file) => (
                  <span
                    key={file}
                    className="mono rounded-xl border border-slate-700 bg-[#161a28] px-3 py-1.5 text-xs text-indigo-300 font-semibold cursor-pointer hover:bg-[#1f2438]"
                  >
                    {file}
                  </span>
                ))}
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
                href={`/ask?q=Plan+implementation+for+${encodeURIComponent(selected.title)}`}
                className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 transition hover:bg-indigo-500 cursor-pointer"
              >
                <span>✦</span>
                <span>Generate Implementation Plan</span>
              </Link>
              <Link
                href="/codebase"
                className="rounded-xl border border-slate-700 bg-[#161a28] px-4 py-2.5 text-xs font-semibold text-slate-200 transition hover:bg-[#1f2438] cursor-pointer"
              >
                Explore in Codebase
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
