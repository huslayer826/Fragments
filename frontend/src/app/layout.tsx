import type { Metadata } from "next";
import "./globals.css";
import FragmentsLogo from "./components/FragmentsLogo";
import SidebarNav from "./components/SidebarNav";
import SidebarStatus from "./components/SidebarStatus";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Fragments — Network Security Platform",
  description: "AI-Powered Network Security Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/icon?family=Material+Symbols+Outlined"
        />
      </head>
      <body
        className="min-h-screen flex"
        style={{
          background: "var(--bg-deep)",
          color: "var(--text-primary)",
          fontFamily: "var(--font-sans)",
        }}
      >
        <nav
          className="w-60 flex-shrink-0 flex flex-col h-screen sticky top-0"
          style={{
            background: "var(--bg-sidebar)",
            borderRight: "1px solid color-mix(in srgb, var(--bg-border) 30%, transparent)",
          }}
        >
          <div className="px-5 pt-6 pb-4">
            <Link href="/" className="inline-flex">
              <FragmentsLogo size={34} variant="wordmark" />
            </Link>
          </div>

          <SidebarNav />
          <SidebarStatus />
        </nav>

        <main className="flex-1 h-screen overflow-auto">
          <div className="px-10 py-8 max-w-[1600px] mx-auto">{children}</div>
        </main>
      </body>
    </html>
  );
}
