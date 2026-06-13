import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FlowPay — Cross-chain payments in plain language",
  description: "Type what you want to pay. FlowPay's AI agent handles routing, cross-chain execution, and Hedera settlement in one flow. Built at ETHGlobal New York 2026.",
  openGraph: {
    title: "FlowPay",
    description: "AI-powered cross-chain payments. Type a sentence. Move money across any chain in 3 seconds.",
    siteName: "FlowPay",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
