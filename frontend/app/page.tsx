"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LandingPage() {
  const router = useRouter();
  const [emailMode, setEmailMode] = useState(false);
  const [email, setEmail] = useState("");
  const [signingIn, setSigningIn] = useState(false);

  const handleSignIn = (role = "Developer") => {
    setSigningIn(true);
    setTimeout(() => {
      router.push("/dashboard");
    }, 400);
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSignIn();
  };

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-[#07080f] text-slate-100 flex flex-col justify-between selection:bg-purple-500/30 selection:text-purple-200">
      {/* Background ambient lighting */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Left glow behind the refracting prism */}
        <div className="absolute -left-[10%] top-[40%] h-[550px] w-[550px] rounded-full bg-[radial-gradient(circle,rgba(112,50,220,0.18)_0%,rgba(56,189,248,0.06)_45%,transparent_70%)] blur-[90px]" />
        
        {/* Right glow behind the constellation */}
        <div className="absolute -right-[10%] top-[35%] h-[600px] w-[600px] rounded-full bg-[radial-gradient(circle,rgba(139,92,246,0.16)_0%,rgba(99,102,241,0.08)_45%,transparent_70%)] blur-[100px]" />
        
        {/* Subtle center ambient radiance */}
        <div className="absolute left-1/2 top-[20%] -translate-x-1/2 h-[400px] w-[700px] rounded-full bg-[radial-gradient(ellipse,rgba(168,85,247,0.08)_0%,transparent_65%)] blur-[80px]" />
      </div>

      {/* Main Content Container */}
      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col items-center justify-between px-6 pt-10 pb-6">
        
        {/* Top Header Logo */}
        <header className="flex flex-col items-center gap-3">
          <div className="relative flex items-center justify-center">
            {/* PRISM Wireframe Tetrahedron Logo */}
            <svg
              width="44"
              height="44"
              viewBox="0 0 48 48"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="drop-shadow-[0_0_12px_rgba(255,255,255,0.4)]"
            >
              {/* Outer triangle facets */}
              <polygon
                points="24,4 44,38 4,38"
                stroke="white"
                strokeWidth="1.8"
                strokeLinejoin="round"
                fill="none"
                opacity="0.95"
              />
              {/* Internal wireframe perspective edges */}
              <line x1="24" y1="4" x2="24" y2="24" stroke="white" strokeWidth="1.6" opacity="0.9" />
              <line x1="4" y1="38" x2="24" y2="24" stroke="white" strokeWidth="1.6" opacity="0.9" />
              <line x1="44" y1="38" x2="24" y2="24" stroke="white" strokeWidth="1.6" opacity="0.9" />
              {/* Subtle back edge facet */}
              <line x1="24" y1="24" x2="24" y2="38" stroke="rgba(255,255,255,0.4)" strokeWidth="1.2" strokeDasharray="2 2" />
            </svg>
          </div>
          <span className="text-[12px] font-semibold tracking-[0.45em] text-slate-200">
            PRISM
          </span>
        </header>

        {/* Hero Section */}
        <div className="mt-8 flex flex-col items-center text-center">
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl md:text-[3.25rem] text-white leading-tight">
            Same{" "}
            <span className="bg-gradient-to-r from-[#b388ff] via-[#c084fc] to-[#d8b4fe] bg-clip-text text-transparent drop-shadow-[0_0_25px_rgba(179,136,255,0.35)]">
              Project
            </span>
            <span className="text-slate-500 font-light mx-2.5">| .</span>
            Different Perspective
          </h1>

          <p className="mt-3.5 text-sm sm:text-base text-slate-400 font-normal tracking-wide max-w-xl">
            One source of truth. Multiple ways to create impact.
          </p>

          {/* 3 Feature Highlights */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-8 md:gap-14 text-left">
            {/* Feature 1 */}
            <div className="flex items-center gap-3.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-950/40 text-[#c084fc] border border-purple-500/20 shadow-[0_0_15px_rgba(192,132,252,0.15)]">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <div className="text-xs md:text-sm font-semibold text-slate-100">Role-based Insights</div>
                <div className="text-[11px] md:text-xs text-slate-400 mt-0.5">See what matters most to you.</div>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="flex items-center gap-3.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-950/40 text-[#c084fc] border border-purple-500/20 shadow-[0_0_15px_rgba(192,132,252,0.15)]">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              <div>
                <div className="text-xs md:text-sm font-semibold text-slate-100">AI-Powered Clarity</div>
                <div className="text-[11px] md:text-xs text-slate-400 mt-0.5">Intelligent insights that help you decide faster.</div>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="flex items-center gap-3.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-950/40 text-[#c084fc] border border-purple-500/20 shadow-[0_0_15px_rgba(192,132,252,0.15)]">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <div className="text-xs md:text-sm font-semibold text-slate-100">Aligned & Focused</div>
                <div className="text-[11px] md:text-xs text-slate-400 mt-0.5">Bring your team together around what counts.</div>
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Visual Stage: Left Prism, Center Card, Right Constellation */}
        <div className="relative mt-10 mb-4 flex w-full items-center justify-center">

          {/* LEFT: 3D Refracting Prism Illustration */}
          <div className="pointer-events-none absolute left-0 top-1/2 -translate-y-1/2 hidden xl:block w-[460px] h-[480px]">
            <svg
              viewBox="0 0 460 480"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-full"
            >
              <defs>
                {/* Incident light gradient */}
                <linearGradient id="incidentRay" x1="0%" y1="50%" x2="100%" y2="50%">
                  <stop offset="0%" stopColor="rgba(255,255,255,0.0)" />
                  <stop offset="60%" stopColor="rgba(255,255,255,0.6)" />
                  <stop offset="100%" stopColor="rgba(255,255,255,1)" />
                </linearGradient>

                {/* Spectral dispersion beam gradient */}
                <linearGradient id="rainbowSpectrum" x1="0%" y1="50%" x2="100%" y2="50%">
                  <stop offset="0%" stopColor="rgba(255,255,255,0.9)" />
                  <stop offset="25%" stopColor="rgba(56,189,248,0.7)" />
                  <stop offset="50%" stopColor="rgba(99,102,241,0.6)" />
                  <stop offset="75%" stopColor="rgba(168,85,247,0.7)" />
                  <stop offset="100%" stopColor="rgba(236,72,153,0.0)" />
                </linearGradient>

                {/* Soft glow filter */}
                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="8" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* White incident light ray entering from the left */}
              <line
                x1="0"
                y1="285"
                x2="175"
                y2="280"
                stroke="url(#incidentRay)"
                strokeWidth="2.5"
                filter="url(#glow)"
              />

              {/* Refracted spectrum dispersion fan emerging from the prism */}
              <path
                d="M 175 280 L 460 210 L 460 380 Z"
                fill="url(#rainbowSpectrum)"
                opacity="0.32"
                filter="url(#glow)"
              />

              {/* Prism Facet 1 (Back facet) */}
              <polygon
                points="175,190 220,380 40,320"
                fill="rgba(88, 28, 135, 0.08)"
                stroke="rgba(192, 132, 252, 0.4)"
                strokeWidth="1.2"
              />

              {/* Prism Facet 2 (Front main refraction facet) */}
              <polygon
                points="175,190 270,330 40,320"
                fill="rgba(147, 51, 234, 0.12)"
                stroke="rgba(255, 255, 255, 0.75)"
                strokeWidth="1.6"
              />

              {/* Prism Facet 3 (Right edge facet) */}
              <polygon
                points="175,190 270,330 220,380"
                fill="rgba(124, 58, 237, 0.16)"
                stroke="rgba(216, 180, 254, 0.6)"
                strokeWidth="1.4"
              />

              {/* Base inner wireframe edge */}
              <line
                x1="40"
                y1="320"
                x2="220"
                y2="380"
                stroke="rgba(255, 255, 255, 0.35)"
                strokeWidth="1"
                strokeDasharray="3 3"
              />

              {/* Brilliant starburst flare at the upper prism vertex */}
              <g transform="translate(175, 190)">
                <circle r="14" fill="rgba(192,132,252,0.45)" filter="url(#glow)" />
                <circle r="4" fill="#ffffff" />
                {/* 4-point flare rays */}
                <line x1="-24" y1="0" x2="24" y2="0" stroke="white" strokeWidth="1.5" opacity="0.9" />
                <line x1="0" y1="-24" x2="0" y2="24" stroke="white" strokeWidth="1.5" opacity="0.9" />
              </g>

              {/* Entry refraction point highlight */}
              <circle cx="175" cy="280" r="3.5" fill="#ffffff" filter="url(#glow)" />
            </svg>
          </div>

          {/* CENTER: Welcome Sign-In Card */}
          <div className="relative z-20 w-full max-w-[430px] rounded-2xl bg-[#0f111d]/90 backdrop-blur-2xl border border-white/10 p-8 shadow-[0_0_60px_rgba(124,58,237,0.18)] transition-all">
            
            {/* Ambient top border glow */}
            <div className="pointer-events-none absolute -top-px left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-purple-400 to-transparent opacity-80" />

            {/* Card Header */}
            <div className="text-center">
              <h2 className="text-xl font-bold text-white flex items-center justify-center gap-2">
                Welcome to Prism
                <span className="text-purple-400 drop-shadow-[0_0_8px_rgba(192,132,252,0.8)]">✦</span>
              </h2>
              <p className="mt-1.5 text-xs text-slate-400">
                Sign in to continue to your workspace
              </p>
            </div>

            {/* Sign-in Controls */}
            <div className="mt-7 space-y-4">
              {/* Continue with Microsoft 365 Button */}
              <button
                type="button"
                onClick={() => handleSignIn()}
                disabled={signingIn}
                className="group relative flex w-full items-center justify-center gap-3 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-900 shadow-md transition-all hover:bg-slate-100 hover:shadow-lg active:scale-[0.99] cursor-pointer disabled:opacity-75"
              >
                {/* Authentic 4-square Microsoft Logo */}
                <svg width="18" height="18" viewBox="0 0 21 21" xmlns="http://www.w3.org/2000/svg">
                  <rect x="1" y="1" width="9" height="9" fill="#F25022" />
                  <rect x="11" y="1" width="9" height="9" fill="#7FBA00" />
                  <rect x="1" y="11" width="9" height="9" fill="#00A4EF" />
                  <rect x="11" y="11" width="9" height="9" fill="#FFB900" />
                </svg>
                <span>{signingIn ? "Entering Workspace…" : "Continue with Microsoft 365"}</span>
              </button>

              {/* OR Divider */}
              <div className="relative my-4 flex items-center justify-center">
                <div className="w-full border-t border-slate-800" />
                <span className="absolute bg-[#0f111d] px-3 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                  OR
                </span>
              </div>

              {/* Sign in with Email Button / Input */}
              {!emailMode ? (
                <button
                  type="button"
                  onClick={() => setEmailMode(true)}
                  className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-slate-700/60 bg-[#161826] px-5 py-3 text-sm font-medium text-slate-200 transition-all hover:bg-[#1f2233] hover:border-slate-600 active:scale-[0.99] cursor-pointer"
                >
                  <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span>Sign in with Email</span>
                </button>
              ) : (
                <form onSubmit={handleEmailSubmit} className="space-y-2.5">
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@company.com"
                      autoFocus
                      className="w-full rounded-xl border border-purple-500/40 bg-[#161826] px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={signingIn}
                      className="flex-1 rounded-xl bg-purple-600 hover:bg-purple-500 py-2.5 text-sm font-semibold text-white transition cursor-pointer disabled:opacity-70"
                    >
                      {signingIn ? "Entering…" : "Continue"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setEmailMode(false)}
                      className="rounded-xl border border-slate-700 bg-slate-800 px-3 text-xs text-slate-300 hover:bg-slate-700 transition cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Disclaimer */}
            <p className="mt-7 text-center text-[11px] leading-relaxed text-slate-400">
              By continuing, you agree to our{" "}
              <Link href="#" className="text-purple-400 hover:text-purple-300 underline underline-offset-2">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="#" className="text-purple-400 hover:text-purple-300 underline underline-offset-2">
                Privacy Policy
              </Link>
              .
            </p>
          </div>

          {/* RIGHT: Role Constellation / Network Graph Illustration */}
          <div className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 hidden xl:block w-[460px] h-[480px]">
            {/* SVG Connecting Lines & Ambient Constellation */}
            <svg
              viewBox="0 0 460 480"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-full"
            >
              {/* Connecting constellation lines */}
              <g stroke="rgba(168, 85, 247, 0.28)" strokeWidth="1.2">
                {/* Node connections */}
                <line x1="390" y1="90" x2="350" y2="230" />
                <line x1="390" y1="90" x2="250" y2="170" />
                <line x1="250" y1="170" x2="160" y2="280" />
                <line x1="160" y1="280" x2="280" y2="340" />
                <line x1="280" y1="340" x2="350" y2="230" />
                <line x1="350" y1="230" x2="430" y2="300" />
                <line x1="280" y1="340" x2="380" y2="420" />
                <line x1="160" y1="280" x2="230" y2="430" />
                <line x1="230" y1="430" x2="380" y2="420" />
                <line x1="250" y1="170" x2="350" y2="230" />
                <line x1="350" y1="230" x2="380" y2="420" />
              </g>

              {/* Constellation star vertices */}
              <circle cx="250" cy="170" r="3" fill="#a855f7" opacity="0.8" />
              <circle cx="160" cy="280" r="2.5" fill="#a855f7" opacity="0.6" />
              <circle cx="280" cy="340" r="2.5" fill="#a855f7" opacity="0.6" />
              <circle cx="430" cy="300" r="3.5" fill="#c084fc" opacity="0.7" />
              <circle cx="230" cy="430" r="2" fill="#818cf8" opacity="0.5" />
            </svg>

            {/* Role Node 1: Engineering Manager (Top Right) */}
            <div className="pointer-events-auto absolute top-[70px] right-[20px] flex items-center gap-3 group cursor-default">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#181a2e] border border-purple-500/40 text-purple-300 shadow-[0_0_20px_rgba(168,85,247,0.3)] transition-transform group-hover:scale-105">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="text-left">
                <div className="text-xs font-semibold text-slate-200">Engineering</div>
                <div className="text-xs font-semibold text-slate-200">Manager</div>
              </div>
            </div>

            {/* Role Node 2: Team Lead (Middle Left) */}
            <div className="pointer-events-auto absolute top-[210px] left-[70px] flex items-center gap-3 group cursor-default">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#181a2e] border border-purple-500/40 text-purple-300 shadow-[0_0_20px_rgba(168,85,247,0.3)] transition-transform group-hover:scale-105">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="text-left">
                <div className="text-xs font-semibold text-slate-200">Team</div>
                <div className="text-xs font-semibold text-slate-200">Lead</div>
              </div>
            </div>

            {/* Role Node 3: Developer (Active/Highlighted, Middle Right) */}
            <div
              onClick={() => handleSignIn("Developer")}
              title="Click to enter Developer Workspace"
              className="pointer-events-auto absolute top-[270px] right-[40px] flex items-center gap-3 group cursor-pointer"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#201d42] border-2 border-purple-400 text-purple-200 shadow-[0_0_25px_rgba(192,132,252,0.6)] transition-transform group-hover:scale-110">
                <span className="font-mono text-sm font-bold tracking-tighter">&lt;/&gt;</span>
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-white group-hover:text-purple-300 transition">Developer</div>
              </div>
            </div>

            {/* Role Node 4: QA Analyst (Bottom Right) */}
            <div className="pointer-events-auto absolute bottom-[50px] right-[50px] flex items-center gap-3 group cursor-default">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#181a2e] border border-purple-500/40 text-purple-300 shadow-[0_0_20px_rgba(168,85,247,0.3)] transition-transform group-hover:scale-105">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <div className="text-left">
                <div className="text-xs font-semibold text-slate-200">QA</div>
                <div className="text-xs font-semibold text-slate-200">Analyst</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-8 text-center text-[11px] text-slate-500 tracking-wider">
          © 2024 Prism. All rights reserved.
        </footer>
      </div>
    </div>
  );
}
