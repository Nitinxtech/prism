"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isLandingPage = pathname === "/";

  if (isLandingPage) {
    return <main className="min-h-screen w-full bg-[#07080f] text-white">{children}</main>;
  }

  return (
    <div className="min-h-screen bg-[var(--paper)] text-[var(--ink)]">
      <Sidebar />
      <main className="ml-[250px] min-h-screen px-10 py-8">
        {children}
      </main>
    </div>
  );
}
