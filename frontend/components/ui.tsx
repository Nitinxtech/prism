import { ReactNode } from "react";

export function Header({
  eyebrow,
  title,
  sub,
}: {
  eyebrow: string;
  title: string;
  sub?: string;
}) {
  return (
    <header className="mb-8">
      <div
        className="text-[10px] font-semibold uppercase tracking-[.2em]"
        style={{ color: "var(--indigo)" }}
      >
        {eyebrow}
      </div>
      <h1
        className="mt-2 text-4xl font-bold tracking-tight"
        style={{ color: "var(--ink)" }}
      >
        {title}
      </h1>
      {sub && (
        <p className="mt-2 max-w-2xl text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
          {sub}
        </p>
      )}
    </header>
  );
}

export function Panel({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-2xl border ${className}`}
      style={{ background: "var(--panel)", borderColor: "var(--line)" }}
    >
      {children}
    </section>
  );
}

export function Badge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "red" | "amber" | "green" | "indigo";
}) {
  const styles: Record<string, { bg: string; color: string }> = {
    neutral: { bg: "var(--panel-2)",    color: "var(--muted)" },
    red:     { bg: "var(--red-dim)",    color: "var(--red)" },
    amber:   { bg: "var(--amber-dim)",  color: "var(--amber)" },
    green:   { bg: "var(--green-dim)",  color: "var(--green)" },
    indigo:  { bg: "var(--indigo-dim)", color: "var(--indigo)" },
  };
  const s = styles[tone];

  return (
    <span
      className="inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide"
      style={{ background: s.bg, color: s.color }}
    >
      {children}
    </span>
  );
}

export function EvidenceList({
  items,
}: {
  items: { text: string; source: string; reference?: string }[];
}) {
  return (
    <div className="space-y-2">
      {items.map((e, i) => (
        <div
          key={i}
          className="rounded-xl p-3"
          style={{ background: "var(--panel-2)", border: "1px solid var(--line)" }}
        >
          <div className="text-sm" style={{ color: "var(--ink)" }}>
            {e.text}
          </div>
          <div
            className="mt-1 text-[10px] uppercase tracking-wide"
            style={{ color: "var(--muted)" }}
          >
            {e.source}
            {e.reference ? ` · ${e.reference}` : ""}
          </div>
        </div>
      ))}
    </div>
  );
}
