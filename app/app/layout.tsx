import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "NourishStPete — healthy food, low cost",
  description:
    "Find healthy food near you in St. Petersburg — markets, pantries, and groceries that take SNAP/EBT — plus cheaper, healthier swaps for what you already buy.",
};

const navLinks = [
  { href: "/finder", label: "Find Food" },
  { href: "/swaps", label: "Smart Swaps" },
  { href: "/recipes", label: "Budget Recipes" },
  { href: "/coach", label: "Coach" },
];

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <header className="bg-green-800 text-white">
          <div className="mx-auto flex max-w-4xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
            <Link href="/" className="text-lg font-bold tracking-tight">
              🥬 NourishStPete
            </Link>
            <nav className="flex gap-4 text-sm font-medium">
              {navLinks.map((l) => (
                <Link key={l.href} href={l.href} className="hover:underline">
                  {l.label}
                </Link>
              ))}
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-4xl px-4 py-6">{children}</main>
        <footer className="mx-auto max-w-4xl px-4 py-8 text-xs text-stone-500">
          Prices are estimates from local surveys. Nutrition figures based on
          USDA FoodData Central. This app gives general food information, not
          medical advice. A project of stpeteai.org.
        </footer>
      </body>
    </html>
  );
}
