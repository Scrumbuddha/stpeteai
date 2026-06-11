"use client";

import { useMemo, useState } from "react";
import { foods, swaps } from "@/lib/data/foods";
import { useLocale } from "@/lib/i18n/LocaleContext";
import type { FoodItem } from "@/lib/types";

const foodById = new Map(foods.map((f) => [f.id, f]));
const categories = [...new Set(foods.map((f) => f.category))];

const SERVINGS_PER_MONTH = 30;

function money(n: number): string {
  return `$${n.toFixed(2)}`;
}

function Delta({ from, to }: { from: FoodItem; to: FoodItem }) {
  const { t } = useLocale();
  const savings = (from.pricePerServing - to.pricePerServing) * SERVINGS_PER_MONTH;
  const sugarCut = from.addedSugarG - to.addedSugarG;
  const sodiumCut = from.sodiumMg - to.sodiumMg;
  const lines = [
    savings > 0.5 && t("swaps.save", { amount: money(savings) }),
    sugarCut > 0 && t("swaps.sugar", { g: sugarCut }),
    sodiumCut >= 100 && t("swaps.sodium", { mg: sodiumCut }),
    to.fiberG - from.fiberG >= 3 && t("swaps.fiber", { g: to.fiberG - from.fiberG }),
    to.proteinG - from.proteinG >= 5 &&
      t("swaps.protein", { g: to.proteinG - from.proteinG }),
  ].filter(Boolean) as string[];

  return (
    <ul className="mt-2 space-y-1 text-sm text-stone-700">
      {lines.map((l) => (
        <li key={l}>{l}</li>
      ))}
    </ul>
  );
}

export default function SwapsPage() {
  const { t } = useLocale();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string | "all">("all");

  const visibleSwaps = useMemo(() => {
    const q = query.trim().toLowerCase();
    return swaps.filter((s) => {
      const from = foodById.get(s.fromId)!;
      const to = foodById.get(s.toId)!;
      if (category !== "all" && from.category !== category) return false;
      if (!q) return true;
      return (
        from.name.toLowerCase().includes(q) || to.name.toLowerCase().includes(q)
      );
    });
  }, [query, category]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">{t("swaps.title")}</h1>
        <p className="mt-1 text-sm text-stone-600">{t("swaps.subtitle")}</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("swaps.search")}
          className="w-full max-w-xs rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm"
          aria-label={t("swaps.search")}
        />
        <div className="flex flex-wrap gap-2">
          {(["all", ...categories] as const).map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`rounded-full border px-3 py-1.5 text-sm font-medium transition ${
                category === c
                  ? "border-green-700 bg-green-700 text-white"
                  : "border-stone-300 bg-white text-stone-700 hover:border-green-600"
              }`}
            >
              {c === "all" ? t("swaps.all") : t(`cat.${c}`)}
            </button>
          ))}
        </div>
      </div>

      <ul className="grid gap-4 sm:grid-cols-2">
        {visibleSwaps.map((s) => {
          const from = foodById.get(s.fromId)!;
          const to = foodById.get(s.toId)!;
          return (
            <li
              key={`${s.fromId}-${s.toId}`}
              className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm"
            >
              <p className="text-sm text-stone-500">
                {t("swaps.insteadOf")}{" "}
                <span className="font-medium text-stone-800">{from.name}</span>{" "}
                ({money(from.pricePerServing)}
                {t("swaps.perServing")})
              </p>
              <p className="mt-1 text-lg font-semibold text-green-800">
                {t("swaps.try")} {to.name}
                <span className="ml-1 text-sm font-normal text-stone-500">
                  ({money(to.pricePerServing)}
                  {t("swaps.perServing")})
                </span>
              </p>
              <Delta from={from} to={to} />
              <p className="mt-3 border-t border-stone-100 pt-2 text-sm text-stone-600">
                {s.rationale}
              </p>
            </li>
          );
        })}
      </ul>

      {visibleSwaps.length === 0 && (
        <p className="rounded-xl border border-stone-200 bg-white p-6 text-center text-stone-600">
          {t("swaps.empty", { q: query })}
        </p>
      )}

      <p className="text-xs text-stone-500">{t("swaps.note")}</p>
    </div>
  );
}
