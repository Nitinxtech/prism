import "./globals.css";
import { ReactNode } from "react";
import AppShell from "../components/AppShell";
import { ThemeProvider } from "../components/ThemeProvider";

export const metadata = {
  title: "PRISM — Same Project. Different Perspective.",
  description: "One source of truth. Multiple ways to create impact.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    // Start with `dark` class so SSR/initial paint matches the default dark theme
    <html lang="en" className="dark">
      <body>
        <ThemeProvider>
          <AppShell>{children}</AppShell>
        </ThemeProvider>
      </body>
    </html>
  );
}
