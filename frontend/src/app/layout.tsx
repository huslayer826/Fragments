import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import FragmentsLogo from "./components/FragmentsLogo";

export const metadata: Metadata = {
  title: "Fragments — Network Security Platform",
  description: "AI-Powered Network Security Platform",
};

const navItems = [
  { href: "/", label: "Dashboard" },
  { href: "/devices", label: "Devices" },
  { href: "/threats", label: "Threats" },
  { href: "/simulate", label: "Simulate" },
  { href: "/chat", label: "Chat" },
  { href: "/compliance", label: "Compliance" },
  { href: "/report", label: "Report" },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body
        className="min-h-screen flex"
        style={{
          background: "var(--bg-deep)",
          color: "var(--text-primary)",
          fontFamily: "var(--font-sans)",
        }}
      >
        {/* Sidebar */}
        <nav
          className="w-60 flex-shrink-0 flex flex-col h-screen sticky top-0"
          style={{
            background: "var(--bg-card)",
            borderRight: "1px solid color-mix(in srgb, var(--bg-border) 40%, transparent)",
          }}
        >
          <div
            className="px-5 py-6"
            style={{
              borderBottom: "1px solid color-mix(in srgb, var(--bg-border) 40%, transparent)",
            }}
          >
            <Link href="/" className="inline-flex">
              <FragmentsLogo size={32} variant="wordmark" />
            </Link>
            <p
              className="mt-2"
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "10px",
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: "var(--text-ghost)",
              }}
            >
              Network Terrain
            </p>
          </div>

          <ul className="flex-1 py-3 px-2 space-y-1">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="group flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all"
                  style={{
                    color: "var(--text-secondary)",
                    fontFamily: "var(--font-sans)",
                    fontWeight: 500,
                    fontSize: "13px",
                    letterSpacing: "0.02em",
                  }}
                >
                  <span
                    className="inline-block w-1 h-4 rounded-full"
                    style={{ background: "var(--bg-border)" }}
                  />
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          <div
            className="px-5 py-4"
            style={{
              borderTop: "1px solid color-mix(in srgb, var(--bg-border) 40%, transparent)",
              fontFamily: "var(--font-mono)",
              fontSize: "10px",
              textTransform: "uppercase",
              letterSpacing: "0.12em",
              color: "var(--text-ghost)",
            }}
          >
            <div className="flex items-center justify-between">
              <span>v0.1.0</span>
              <span style={{ color: "var(--orange)" }}>● live</span>
            </div>
          </div>
        </nav>

        {/* Main content */}
        <main className="flex-1 overflow-auto">
          <div className="p-8 max-w-[1600px] mx-auto">{children}</div>
        </main>
      </body>
    </html>
  );
}
