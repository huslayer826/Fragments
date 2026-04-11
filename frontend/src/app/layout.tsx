import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Fragments — Network Security Platform",
  description: "AI-Powered Network Security Platform",
};

const navItems = [
  { href: "/", label: "Dashboard", icon: "◉" },
  { href: "/devices", label: "Devices", icon: "▤" },
  { href: "/threats", label: "Threats", icon: "⚠" },
  { href: "/simulate", label: "Simulate", icon: "⚡" },
  { href: "/chat", label: "Chat", icon: "💬" },
  { href: "/compliance", label: "Compliance", icon: "✓" },
  { href: "/report", label: "Report", icon: "📄" },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-screen flex" style={{ background: "var(--bg-primary)", color: "var(--text-primary)" }}>
        {/* Sidebar */}
        <nav
          className="w-56 flex-shrink-0 flex flex-col border-r h-screen sticky top-0"
          style={{ background: "var(--bg-secondary)", borderColor: "var(--border-color)" }}
        >
          <div className="p-4 border-b" style={{ borderColor: "var(--border-color)" }}>
            <h1 className="text-xl font-bold tracking-tight">
              <span style={{ color: "var(--accent-orange)" }}>▲</span> Fragments
            </h1>
            <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
              Network Security
            </p>
          </div>
          <ul className="flex-1 py-2">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-white/5"
                  style={{ color: "var(--text-secondary)" }}
                >
                  <span className="w-5 text-center">{item.icon}</span>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="p-4 border-t text-xs" style={{ borderColor: "var(--border-color)", color: "var(--text-muted)" }}>
            v0.1.0
          </div>
        </nav>

        {/* Main content */}
        <main className="flex-1 overflow-auto">
          <div className="p-6">{children}</div>
        </main>
      </body>
    </html>
  );
}
