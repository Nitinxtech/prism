import "./globals.css";
import { ReactNode } from "react";
import AppShell from "../components/AppShell";

export const metadata = {
  title: "PRISM — Same Project. Different Perspective.",
  description: "One source of truth. Multiple ways to create impact.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}

