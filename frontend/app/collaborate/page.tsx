"use client";

import { useState } from "react";
import Link from "next/link";
import { api } from "../../lib/api";

type ExpertItem = {
  id: string;
  name: string;
  role: string;
  avatar: string;
  avatarColor: string;
  skills: string[];
  status: "available" | "busy";
  email: string;
};

type DiscussionItem = {
  id: string;
  title: string;
  author: string;
  avatar: string;
  avatarColor: string;
  replies: number;
  timeAgo: string;
  tag: string;
};

type ResourceItem = {
  id: string;
  title: string;
  type: string;
  updatedAgo: string;
  iconBg: string;
  iconColor: string;
};

const EXPERTS: ExpertItem[] = [
  {
    id: "ak",
    name: "Akshat Singh",
    role: "Senior Software Engineer",
    avatar: "AK",
    avatarColor: "bg-cyan-900/70 text-cyan-200 border-cyan-700/60",
    skills: ["OAuth", "API Security", "Node.js"],
    status: "available",
    email: "akshat.singh@prism.internal",
  },
  {
    id: "rp",
    name: "Rohan Patel",
    role: "Tech Lead",
    avatar: "RP",
    avatarColor: "bg-purple-900/70 text-purple-200 border-purple-700/60",
    skills: ["System Design", "Microservices", "Architecture"],
    status: "available",
    email: "rohan.patel@prism.internal",
  },
  {
    id: "sm",
    name: "Sneha Menon",
    role: "Staff Engineer",
    avatar: "SM",
    avatarColor: "bg-pink-900/70 text-pink-200 border-pink-700/60",
    skills: ["Observability", "Monitoring", "SRE"],
    status: "busy",
    email: "sneha.menon@prism.internal",
  },
  {
    id: "vk",
    name: "Vikram Kulkarni",
    role: "DevOps Engineer",
    avatar: "VK",
    avatarColor: "bg-blue-900/70 text-blue-200 border-blue-700/60",
    skills: ["CI/CD", "Azure", "Infrastructure"],
    status: "available",
    email: "vikram.k@prism.internal",
  },
  {
    id: "ps",
    name: "Priya Sharma",
    role: "Software Engineer",
    avatar: "PS",
    avatarColor: "bg-cyan-900/70 text-cyan-200 border-cyan-700/60",
    skills: ["React", "Frontend", "Design Systems"],
    status: "available",
    email: "priya.sharma@prism.internal",
  },
];

const DISCUSSIONS: DiscussionItem[] = [
  {
    id: "d1",
    title: "OAuth token refresh issue in Payment Service",
    author: "Akshat Singh",
    avatar: "AK",
    avatarColor: "bg-cyan-900/70 text-cyan-200 border-cyan-700/60",
    replies: 4,
    timeAgo: "2 hours ago",
    tag: "Backend",
  },
  {
    id: "d2",
    title: "Best approach for database migration?",
    author: "Rohan Patel",
    avatar: "RP",
    avatarColor: "bg-purple-900/70 text-purple-200 border-purple-700/60",
    replies: 6,
    timeAgo: "5 hours ago",
    tag: "Database",
  },
  {
    id: "d3",
    title: "Observability setup for microservices",
    author: "Sneha Menon",
    avatar: "SM",
    avatarColor: "bg-pink-900/70 text-pink-200 border-pink-700/60",
    replies: 3,
    timeAgo: "1 day ago",
    tag: "DevOps",
  },
  {
    id: "d4",
    title: "Need review for API design (v2)",
    author: "Priya Sharma",
    avatar: "PS",
    avatarColor: "bg-cyan-900/70 text-cyan-200 border-cyan-700/60",
    replies: 2,
    timeAgo: "1 day ago",
    tag: "API",
  },
];

const RESOURCES: ResourceItem[] = [
  {
    id: "r1",
    title: "Authentication with Azure AD",
    type: "Guide",
    updatedAgo: "Updated 2 weeks ago",
    iconBg: "bg-blue-950/70 border-blue-800/60",
    iconColor: "text-blue-400",
  },
  {
    id: "r2",
    title: "System Design Best Practices",
    type: "Guide",
    updatedAgo: "Updated 1 month ago",
    iconBg: "bg-emerald-950/70 border-emerald-800/60",
    iconColor: "text-emerald-400",
  },
  {
    id: "r3",
    title: "Observability Setup Guide",
    type: "Guide",
    updatedAgo: "Updated 1 month ago",
    iconBg: "bg-amber-950/70 border-amber-800/60",
    iconColor: "text-amber-400",
  },
];

export default function CollaboratePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [experts, setExperts] = useState<ExpertItem[]>(EXPERTS);
  const [isSearching, setIsSearching] = useState(false);
  const [connectedIds, setConnectedIds] = useState<string[]>([]);

  const handleSearch = () => {
    setIsSearching(true);
    setTimeout(() => {
      if (!searchQuery.trim()) {
        setExperts(EXPERTS);
      } else {
        const q = searchQuery.toLowerCase();
        const filtered = EXPERTS.filter(
          (e) =>
            e.name.toLowerCase().includes(q) ||
            e.role.toLowerCase().includes(q) ||
            e.skills.some((s) => s.toLowerCase().includes(q))
        );
        setExperts(filtered.length > 0 ? filtered : EXPERTS);
      }
      setIsSearching(false);
    }, 300);
  };

  const toggleConnect = (id: string) => {
    setConnectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const suggestionChips = [
    "OAuth authentication",
    "System design",
    "Observability",
    "Node.js",
    "Database migration",
    "API integration",
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* ─── Top Header & Motivation Card ─── */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-indigo-400">
            DEVELOPER · PROJECT PHOENIX
          </div>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Collaborate
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-400">
            Find the right people, teams, and resources to move your work forward.
          </p>
        </div>

        {/* Stronger Together Motivation Card */}
        <div
          className="flex items-center gap-3.5 rounded-2xl border p-4 shadow-sm"
          style={{ background: "var(--panel)", borderColor: "var(--line)" }}
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-950/60 border border-purple-800/50 text-purple-400">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div>
            <div className="text-xs font-bold text-white">Stronger together</div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Connect with experts, get help, and build better.
            </div>
          </div>
        </div>
      </div>

      {/* ─── Hero Glowing Search Box & Suggestion Chips ─── */}
      <div
        className="relative overflow-hidden rounded-2xl border p-6 shadow-xl space-y-4"
        style={{
          background: "linear-gradient(135deg, rgba(30, 27, 75, 0.4) 0%, #0c0f1c 100%)",
          borderColor: "rgba(99, 102, 241, 0.25)",
        }}
      >
        {/* Ambient background glow & icon */}
        <div className="pointer-events-none absolute -left-4 -top-4 opacity-10 text-indigo-400">
          <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24">
            <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </div>

        {/* Search Bar Input Row */}
        <div className="relative z-10 flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 text-xs">
              🔍
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="What do you need help with?"
              className="w-full rounded-xl border py-3 pl-9 pr-4 text-xs sm:text-sm text-slate-200 placeholder-slate-500 outline-none transition focus:border-indigo-500"
              style={{
                background: "#0a0d18",
                borderColor: "var(--line)",
              }}
            />
          </div>

          <button
            type="button"
            onClick={handleSearch}
            disabled={isSearching}
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-5 py-3 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 transition hover:bg-indigo-500 cursor-pointer disabled:opacity-70 shrink-0"
          >
            <span>{isSearching ? "Searching..." : "Find experts"}</span>
            <span>→</span>
          </button>
        </div>

        {/* Suggestion Chips */}
        <div className="relative z-10 flex flex-wrap items-center gap-2 pt-1">
          <span className="text-[11px] font-semibold text-slate-400">Try asking</span>
          {suggestionChips.map((chip) => (
            <button
              type="button"
              key={chip}
              onClick={() => {
                setSearchQuery(chip);
                setIsSearching(true);
                setTimeout(() => {
                  const q = chip.toLowerCase();
                  const filtered = EXPERTS.filter(
                    (e) =>
                      e.name.toLowerCase().includes(q) ||
                      e.role.toLowerCase().includes(q) ||
                      e.skills.some((s) => s.toLowerCase().includes(q))
                  );
                  setExperts(filtered.length > 0 ? filtered : EXPERTS);
                  setIsSearching(false);
                }, 200);
              }}
              className="rounded-xl border border-slate-800 bg-[#0e1220] px-3 py-1 text-xs text-slate-300 transition hover:bg-[#161a2c] hover:border-slate-700 hover:text-white cursor-pointer"
            >
              {chip}
            </button>
          ))}
        </div>
      </div>

      {/* ─── 4 Quick Navigation Cards Row ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Find Experts */}
        <div
          className="group flex items-center justify-between rounded-2xl border p-4 shadow-sm transition hover:border-indigo-500/50 hover:shadow-md cursor-pointer"
          style={{ background: "var(--panel)", borderColor: "var(--line)" }}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-950/70 border border-indigo-800/60 text-indigo-400">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div>
              <div className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors">
                Find Experts
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                Get help from teammates with relevant experience
              </div>
            </div>
          </div>
          <span className="text-slate-500 group-hover:text-white transition-colors text-sm font-bold pl-2">
            ›
          </span>
        </div>

        {/* Card 2: Ask the Team */}
        <div
          className="group flex items-center justify-between rounded-2xl border p-4 shadow-sm transition hover:border-indigo-500/50 hover:shadow-md cursor-pointer"
          style={{ background: "var(--panel)", borderColor: "var(--line)" }}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-950/70 border border-blue-800/60 text-blue-400">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <div>
              <div className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors">
                Ask the Team
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                Start a discussion or ask a technical question
              </div>
            </div>
          </div>
          <span className="text-slate-500 group-hover:text-white transition-colors text-sm font-bold pl-2">
            ›
          </span>
        </div>

        {/* Card 3: Browse Knowledge */}
        <div
          className="group flex items-center justify-between rounded-2xl border p-4 shadow-sm transition hover:border-indigo-500/50 hover:shadow-md cursor-pointer"
          style={{ background: "var(--panel)", borderColor: "var(--line)" }}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-950/70 border border-emerald-800/60 text-emerald-400">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div>
              <div className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors">
                Browse Knowledge
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                Explore docs, guides and past solutions
              </div>
            </div>
          </div>
          <span className="text-slate-500 group-hover:text-white transition-colors text-sm font-bold pl-2">
            ›
          </span>
        </div>

        {/* Card 4: Create a Request */}
        <div
          className="group flex items-center justify-between rounded-2xl border p-4 shadow-sm transition hover:border-indigo-500/50 hover:shadow-md cursor-pointer"
          style={{ background: "var(--panel)", borderColor: "var(--line)" }}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-950/70 border border-amber-800/60 text-amber-400">
              <span className="text-lg font-bold">⊕</span>
            </div>
            <div>
              <div className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors">
                Create a Request
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                Request help or review from the right people
              </div>
            </div>
          </div>
          <span className="text-slate-500 group-hover:text-white transition-colors text-sm font-bold pl-2">
            ›
          </span>
        </div>
      </div>

      {/* ─── Main 2-Column Split: Recommended Experts & Sidebar Feeds ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-6 items-start">
        
        {/* LEFT COLUMN: Recommended Experts Table */}
        <div
          className="rounded-2xl border p-6 shadow-sm space-y-4"
          style={{ background: "var(--panel)", borderColor: "var(--line)" }}
        >
          <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: "var(--line)" }}>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-indigo-400 font-bold text-sm">✦</span>
                <h2 className="text-sm font-bold text-white">Recommended Experts</h2>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                People with relevant experience based on your query and project context.
              </p>
            </div>

            <Link href="/ask?q=Who+can+help+me?" className="text-xs font-semibold text-indigo-400 hover:underline">
              View all →
            </Link>
          </div>

          {/* Expert List Items */}
          <div className="divide-y" style={{ borderColor: "var(--line)" }}>
            {experts.map((expert) => {
              const isConnected = connectedIds.includes(expert.id);

              return (
                <div
                  key={expert.id}
                  className="py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 transition hover:bg-[#121626]/50 rounded-xl px-2"
                >
                  {/* Left: Avatar & Name */}
                  <div className="flex items-center gap-3 min-w-[200px]">
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-xs font-bold ${expert.avatarColor}`}
                    >
                      {expert.avatar}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">{expert.name}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{expert.role}</div>
                    </div>
                  </div>

                  {/* Middle: Skills Chips */}
                  <div className="flex flex-wrap items-center gap-1.5 flex-1">
                    {expert.skills.map((skill) => (
                      <span
                        key={skill}
                        className="rounded-lg border border-slate-800 bg-[#141828] px-2 py-0.5 text-[10px] font-medium text-slate-300"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>

                  {/* Right: Availability & Action Buttons */}
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="flex items-center gap-1.5 text-[11px]">
                      {expert.status === "available" ? (
                        <>
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                          <span className="text-emerald-400 font-medium">Available</span>
                        </>
                      ) : (
                        <>
                          <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                          <span className="text-amber-400 font-medium">Busy</span>
                        </>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => toggleConnect(expert.id)}
                        className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition cursor-pointer ${
                          isConnected
                            ? "bg-emerald-950 border border-emerald-800 text-emerald-300"
                            : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm shadow-indigo-600/30"
                        }`}
                      >
                        {isConnected ? "Connected ✓" : "Connect"}
                      </button>

                      <Link
                        href={`mailto:${expert.email}`}
                        title={`Email ${expert.name}`}
                        className="rounded-xl border border-slate-700 bg-[#161a28] p-1.5 text-slate-300 hover:text-white transition flex items-center justify-center"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Help Request Prompt Card */}
          <div
            className="rounded-2xl border p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-4"
            style={{
              background: "linear-gradient(135deg, rgba(20, 24, 40, 0.9) 0%, rgba(14, 17, 28, 0.9) 100%)",
              borderColor: "var(--line)",
            }}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-950/60 border border-amber-800/50 text-amber-400">
                <span className="text-base">💡</span>
              </div>
              <div>
                <div className="text-xs font-bold text-white">Can't find the right person?</div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Create a help request and we'll suggest the best teammates for you.
                </div>
              </div>
            </div>

            <button
              type="button"
              className="flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 transition hover:bg-indigo-500 cursor-pointer shrink-0"
            >
              <span>Create a request</span>
              <span>→</span>
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: Active Discussions & Knowledge Resources */}
        <div className="space-y-6">
          
          {/* Component 1: Active Discussions */}
          <div
            className="rounded-2xl border p-5 shadow-sm space-y-4"
            style={{ background: "var(--panel)", borderColor: "var(--line)" }}
          >
            <div className="flex items-center justify-between border-b pb-3.5" style={{ borderColor: "var(--line)" }}>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                <h3 className="text-xs font-bold text-white">Active Discussions</h3>
              </div>
              <Link href="/ask" className="text-[11px] font-semibold text-indigo-400 hover:underline">
                View all →
              </Link>
            </div>

            <div className="space-y-3">
              {DISCUSSIONS.map((disc) => (
                <div
                  key={disc.id}
                  className="flex items-start justify-between gap-3 group cursor-pointer"
                >
                  <div className="flex items-start gap-2.5">
                    <div
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-[10px] font-bold ${disc.avatarColor}`}
                    >
                      {disc.avatar}
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-white group-hover:text-indigo-300 transition-colors leading-snug">
                        {disc.title}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        {disc.author} · {disc.replies} replies · {disc.timeAgo}
                      </div>
                    </div>
                  </div>

                  <span className="shrink-0 rounded-lg border border-slate-800 bg-[#141828] px-2 py-0.5 text-[10px] font-medium text-slate-400">
                    {disc.tag}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Component 2: Knowledge Resources */}
          <div
            className="rounded-2xl border p-5 shadow-sm space-y-4"
            style={{ background: "var(--panel)", borderColor: "var(--line)" }}
          >
            <div className="flex items-center justify-between border-b pb-3.5" style={{ borderColor: "var(--line)" }}>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <h3 className="text-xs font-bold text-white">Knowledge Resources</h3>
              </div>
              <Link href="/codebase" className="text-[11px] font-semibold text-indigo-400 hover:underline">
                View all →
              </Link>
            </div>

            <div className="space-y-3">
              {RESOURCES.map((res) => (
                <div
                  key={res.id}
                  className="flex items-start gap-2.5 group cursor-pointer"
                >
                  <div
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border ${res.iconBg} ${res.iconColor}`}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-white group-hover:text-indigo-300 transition-colors leading-snug">
                      {res.title}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      {res.type} · {res.updatedAgo}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
