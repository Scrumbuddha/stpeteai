import type { Metadata } from "next";
import { Footer, Header } from "@/components/Chrome";
import { LocaleProvider } from "@/lib/i18n/LocaleContext";
import "./globals.css";

export const metadata: Metadata = {
  title: "NourishStPete — healthy food, low cost",
  description:
    "Find healthy food near you in St. Petersburg — markets, pantries, and groceries that take SNAP/EBT — plus cheaper, healthier swaps for what you already buy.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <LocaleProvider>
          <Header />
          <main className="mx-auto max-w-4xl px-4 py-6">{children}</main>
          <Footer />
        </LocaleProvider>
      </body>
    </html>
  );
}
