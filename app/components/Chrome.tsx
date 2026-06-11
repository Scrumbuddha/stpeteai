"use client";

import Link from "next/link";
import { useLocale } from "@/lib/i18n/LocaleContext";

const navLinks = [
  { href: "/finder", key: "nav.finder" },
  { href: "/swaps", key: "nav.swaps" },
  { href: "/recipes", key: "nav.recipes" },
  { href: "/coach", key: "nav.coach" },
];

export function Header() {
  const { locale, setLocale, t } = useLocale();
  return (
    <header className="bg-green-800 text-white">
      <div className="mx-auto flex max-w-4xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
        <Link href="/" className="text-lg font-bold tracking-tight">
          🥬 NourishStPete
        </Link>
        <nav className="flex flex-wrap gap-4 text-sm font-medium">
          {navLinks.map((l) => (
            <Link key={l.href} href={l.href} className="hover:underline">
              {t(l.key)}
            </Link>
          ))}
        </nav>
        <button
          onClick={() => setLocale(locale === "en" ? "es" : "en")}
          className="ml-auto rounded-full border border-white/40 px-3 py-1 text-xs font-semibold hover:bg-white/10"
          aria-label={locale === "en" ? "Cambiar a español" : "Switch to English"}
        >
          {locale === "en" ? "Español" : "English"}
        </button>
      </div>
    </header>
  );
}

export function Footer() {
  const { t } = useLocale();
  return (
    <footer className="mx-auto max-w-4xl px-4 py-8 text-xs text-stone-500">
      {t("footer.disclaimer")}
    </footer>
  );
}
