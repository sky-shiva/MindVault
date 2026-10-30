import "./globals.css";
import type { Metadata } from "next";
import { AuthProvider } from "@/lib/auth-context";

export const metadata: Metadata = {
  title: "MindVault — Complete Learning & Knowledge Retention Platform",
  description:
    "Learn today. Remember tomorrow. Master forever. Spaced repetition, active recall, structured digital notebooks, and personal RAG AI.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-charcoal-950 text-gray-100 min-h-screen antialiased selection:bg-brand-500 selection:text-white">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
