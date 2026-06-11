"use client";

import { useMemo, useState } from "react";
import { foods, swaps } from "@/lib/data/foods";
import type { FoodItem } from "@/lib/types";

const foodById = new Map(foods.map((f) => [f.id, f]));
const categories = [...new Set(foods.map((f) => f.category))];

const SERVINGS_PER_MONTH = 30;

function money(n: number): string {
  return `$${n.toFixed(2)}`;
}

function Delta({ from, to }: { from: FoodItem; to: FoodItem }) {
  const savings = (from.pricePerServing - to.pricePerServing) * SERVINGS_PER_MONTH;
  const sugarCut = from.addedSugarG - to.addedSugarG;
  const sodiumCut = from.sodiumMg - to.sodiumMg;
  const lines = [
    savings > 0.5 && `💰 Save about ${money(savings)}/month per person`,
    sugarCut > 0 && `🍬 ${sugarCut}g less added sugar per serving`,
    sodiumCut >= 100 && `🧂 ${sodiumCut}mg less sodium per serving`,
    to.fiberG - from.fiberG >= 3 && `🌾 ${to.fiberG - from.fiberG}g more fiber`,
    to.proteinG - from.proteinG >= 5 && `💪 ${to.proteinG - from.proteinG}g more protein`,
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
        <h1 className="text-2xl font-bold">Smart Swaps</h1>
        <p className="mt-1 text-sm text-stone-600">
          Find what you already buy and see a cheaper, healthier stand-in. No
          food is &quot;bad&quot; — these are just better deals for your body
          and your wallet.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search: soda, cereal, chips…"
          className="w-full max-w-xs rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm"
          aria-label="Search foods"
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
              {c === "all" ? "All" : c}
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
                Instead of{" "}
                <span className="font-medium text-stone-800">{from.name}</span>{" "}
                ({money(from.pricePerServing)}/serving)
              </p>
              <p className="mt-1 text-lg font-semibold text-green-800">
                Try {to.name}
                <span className="ml-1 text-sm font-normal text-stone-500">
                  ({money(to.pricePerServing)}/serving)
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
          No swaps match &quot;{query}&quot; yet. We&apos;re adding more all the
          time.
        </p>
      )}

      <p className="text-xs text-stone-500">
        Monthly savings assume one serving per day. Prices are estimated
        midpoints from local store surveys and will vary.
      </p>
    </div>
  );
}
