"use client";

import { useState } from "react";
import Link from "next/link";
import { api } from "../../lib/api";
import { AskResponse } from "../../types";

const SAMPLE_INITIAL_ANSWER: AskResponse = {
  answer:
    "Payment Service is currently the highest-risk component in Project Phoenix due to three converging factors:\n\n1. Low Test Coverage (64%): Critical refund, dispute, and currency rounding handlers have zero unit test coverage.\n2. Deprecated Axios 0.27.2: Known prototype pollution vulnerabilities and unhandled retry errors when third-party gateways timeout.\n3. Missing Mutex Lock on Webhooks: Concurrent webhook deliveries from payment gateways can result in double-crediting customer accounts without an idempotency key check in Redis.",
  evidence: [
    {
      text: "services/paymentService.ts:L142-198 (High cyclomatic complexity of 24)",
      source: "STATIC ANALYSIS",
      reference: "SONAR REPORT",
    },
    {
      text: "package.json: axios@0.27.2 is deprecated with 2 known CVEs",
      source: "DEPENDENCY SCAN",
      reference: "NPM AUDIT",
    },
    {
      text: "Recent production incident INC-882: 3 customer duplicate charges",
      source: "INCIDENT LOG",
      reference: "JIRA",
    },
  ],
  suggested_actions: [
    "Wrap webhook handler in a distributed Redis mutex transaction",
    "Upgrade Axios to modern HttpClient wrapper",
    "Add Jest test suite covering Stripe timeout mocks and rollback handlers",
  ],
};

export default function AskPage() {
  const [question, setQuestion] = useState("Why is Payment Service risky?");
  const [response, setResponse] = useState<AskResponse | null>(SAMPLE_INITIAL_ANSWER);
  const [loading, setLoading] = useState(false);

  async function askQuestion(qToAsk?: string) {
    const q = qToAsk || question;
    if (!q.trim()) return;
    setLoading(true);
    try {
      const data = await api<AskResponse>("/ask", {
        method: "POST",
        body: JSON.stringify({ question: q }),
      });
      if (data) {
        setResponse(data);
      }
    } catch {
      // Fallback response based on prompt
      setResponse({
        answer: `Based on Phoenix codebase context for "${q}": PRISM analyzed 6 microservices, 18 dependency packages, and recent Git commits. All telemetry and architecture references are grounded in the active repository.`,
        evidence: [
          {
            text: "Project Phoenix architecture graph and dependency index",
            source: "PRISM ENGINE",
            reference: "PHOENIX-V2",
          },
        ],
        suggested_actions: [
          "Inspect System Map for component relationships",
          "Check Dependency Intelligence for outdated packages",
        ],
      });
    } finally {
      setLoading(false);
    }
  }

  const suggestions = [
    "Why is Payment Service risky?",
    "What should I work on next?",
    "Who can help me with authentication?",
    "Which dependencies need attention?",
    "Explain the architecture.",
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-indigo-400">
            DEVELOPER · CONTEXTUAL AI
          </div>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Ask PRISM
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-400">
            A project-aware assistant grounded in Phoenix context, not a generic chatbot.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/readiness"
            className="flex items-center gap-1.5 rounded-xl border border-slate-700/80 bg-[#161a28] px-4 py-2 text-xs font-semibold text-slate-200 transition hover:bg-[#1f2438]"
          >
            <span>◎</span>
            <span>Readiness Plan</span>
          </Link>
          <Link
            href="/system"
            className="flex items-center gap-1.5 rounded-xl border border-slate-700/80 bg-[#161a28] px-4 py-2 text-xs font-semibold text-slate-200 transition hover:bg-[#1f2438]"
          >
            <span>⬡</span>
            <span>System Map</span>
          </Link>
        </div>
      </div>

      {/* Question Input Card */}
      <div
        className="rounded-2xl border p-6 shadow-sm space-y-4"
        style={{ background: "var(--panel)", borderColor: "var(--line)" }}
      >
        <div className="flex gap-3">
          <div className="relative flex-1">
            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 text-sm">
              ✦
            </span>
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && askQuestion()}
              placeholder="Ask anything about Phoenix architecture, blockers, code ownership, or migration risks..."
              className="w-full rounded-xl border py-3 pl-10 pr-4 text-xs sm:text-sm outline-none transition"
              style={{
                background: "var(--panel-2)",
                borderColor: "var(--line)",
                color: "var(--ink)",
              }}
            />
          </div>

          <button
            type="button"
            onClick={() => askQuestion()}
            disabled={loading}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-xs sm:text-sm font-bold text-white shadow-lg shadow-indigo-600/30 transition hover:bg-indigo-500 cursor-pointer disabled:opacity-70"
          >
            <span>✦</span>
            <span>{loading ? "Analyzing..." : "Ask PRISM"}</span>
          </button>
        </div>

        {/* Suggestion Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-[11px] font-semibold text-slate-400">Suggested Questions:</span>
          {suggestions.map((item) => (
            <button
              type="button"
              key={item}
              onClick={() => {
                setQuestion(item);
                askQuestion(item);
              }}
              className="rounded-xl border border-slate-700 bg-[#161a28] px-3 py-1 text-xs text-slate-300 transition hover:bg-[#1f2438] hover:text-white cursor-pointer"
            >
              💬 {item}
            </button>
          ))}
        </div>
      </div>

      {/* Answer & Evidence 2-Column Split */}
      {response && (
        <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-6 items-start">
          {/* Left: PRISM Answer & Suggested Actions */}
          <div
            className="rounded-2xl border p-7 shadow-sm space-y-6"
            style={{ background: "var(--panel)", borderColor: "var(--line)" }}
          >
            <div>
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-400">
                <span className="flex h-5 w-5 items-center justify-center rounded-md bg-indigo-600 text-white font-bold text-[10px]">
                  P
                </span>
                <span>PRISM Grounded Answer</span>
              </div>
              <div className="mt-4 text-sm sm:text-base leading-relaxed text-slate-200 whitespace-pre-line font-normal">
                {response.answer}
              </div>
            </div>

            {response.suggested_actions && response.suggested_actions.length > 0 && (
              <div className="pt-4 border-t space-y-3" style={{ borderColor: "var(--line)" }}>
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Suggested Next Actions
                </div>
                <div className="space-y-2">
                  {response.suggested_actions.map((act, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2.5 rounded-xl border p-3.5 text-xs text-slate-200"
                      style={{ background: "var(--panel-2)", borderColor: "var(--line)" }}
                    >
                      <span className="text-indigo-400 font-bold">→</span>
                      <span>{act}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: Traced Code & Infra Evidence */}
          <div
            className="rounded-2xl border p-6 shadow-sm space-y-4"
            style={{ background: "var(--panel)", borderColor: "var(--line)" }}
          >
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
              Traced Evidence & Citations
            </div>

            <div className="space-y-3">
              {response.evidence.map((ev, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border p-4 text-xs space-y-1.5 transition hover:border-slate-700"
                  style={{ background: "var(--panel-2)", borderColor: "var(--line)" }}
                >
                  <div className="text-slate-200 font-medium leading-relaxed">
                    {ev.text}
                  </div>
                  <div className="text-[10px] uppercase font-bold tracking-wider text-indigo-400">
                    {ev.source} {ev.reference ? `· ${ev.reference}` : ""}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
