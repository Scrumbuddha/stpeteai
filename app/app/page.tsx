"use client";

import Link from "next/link";
import { useLocale } from "@/lib/i18n/LocaleContext";

const features = [
  { href: "/finder", emoji: "📍", key: "finder" },
  { href: "/swaps", emoji: "🔄", key: "swaps" },
  { href: "/recipes", emoji: "🍳", key: "recipes" },
];

export default function Home() {
  const { t } = useLocale();
  return (
    <div className="space-y-8">
      <section className="rounded-2xl bg-green-50 p-6 sm:p-10">
        <h1 className="text-3xl font-bold text-green-900 sm:text-4xl">
          {t("home.title")}
        </h1>
        <p className="mt-3 max-w-2xl text-lg text-green-950/80">
          {t("home.body")}
        </p>
        <p className="mt-2 text-sm text-green-950/60">{t("home.privacy")}</p>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        {features.map((f) => (
          <Link
            key={f.href}
            href={f.href}
            className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm transition hover:shadow-md"
          >
            <div className="text-3xl">{f.emoji}</div>
            <h2 className="mt-2 text-lg font-semibold">
              {t(`home.${f.key}.title`)}
            </h2>
            <p className="mt-1 text-sm text-stone-600">
              {t(`home.${f.key}.body`)}
            </p>
            <span className="mt-3 inline-block text-sm font-medium text-green-700">
              {t(`home.${f.key}.cta`)} →
            </span>
          </Link>
        ))}
      </section>

      <section className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
        <strong>{t("home.tip.title")}</strong> {t("home.tip.body")}
      </section>
    </div>
  );
}
