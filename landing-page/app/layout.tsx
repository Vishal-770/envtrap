import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import SmoothScroll from "./components/SmoothScroll";
import "./globals.css";

import "lenis/dist/lenis.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "envtrap | Runtime Security Agent for Node.js",
  description: "Block secret exfiltration from your Node.js processes in real-time. Zero-instrumentation runtime protection monitoring network egress, subprocesses, DNS tunneling, and console output.",
  keywords: ["nodejs security", "runtime protection", "secret exfiltration", "supply chain attacks", "npm security", "sandboxing"],
  authors: [{ name: "envtrap team" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      style={{ colorScheme: "light" }}
    >
      <body className="min-h-full flex flex-col bg-white text-zinc-900 selection:bg-indigo-500/10 selection:text-indigo-900">
        <SmoothScroll>
          {children}
        </SmoothScroll>
      </body>
    </html>
  );
}
