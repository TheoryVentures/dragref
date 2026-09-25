import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "dragref playground",
  description: "Research harness for dragging references into AI clients",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <nav className="nav">
          <strong>dragref</strong>
          <Link href="/lab">Lab</Link>
          <Link href="/inspect">Inspect</Link>
          <Link href="/library">Library</Link>
        </nav>
        <main>{children}</main>
      </body>
    </html>
  );
}
