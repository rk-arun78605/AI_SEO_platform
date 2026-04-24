import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "RankFlow AI — Autonomous SEO Growth Engine",
  description:
    "AI-powered SEO automation platform that acts as an autonomous growth engine. Keyword intelligence, content optimization, rank prediction, and self-learning in one unified platform.",
  keywords: "SEO automation, AI SEO, keyword research, content optimization, rank tracking",
  openGraph: {
    title: "RankFlow AI — Autonomous SEO Growth Engine",
    description: "7 AI modules working 24/7 to dominate your search rankings",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${jetbrains.variable} font-sans antialiased`}>
        <main>{children}</main>
      </body>
    </html>
  );
}
