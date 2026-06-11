"use client";

import { useMemo, useState } from "react";
import { recipes } from "@/lib/data/recipes";

const costFilters = [
  { id: "all", label: "Any price", max: Infinity },
  { id: "under1", label: "Under $1/serving", max: 1 },
  { id: "under150", label: "Under $1.50/serving", max: 1.5 },
] as const;

type CostFilterId = (typeof costFilters)[number]["id"];

const allTags = [...new Set(recipes.flatMap((r) => r.dietTags))].sort();

export default function RecipesPage() {
  const [cost, setCost] = useState<CostFilterId>("all");
  const [tag, setTag] = useState<string | "all">("all");
  const [open, setOpen] = useState<string | null>(null);

  const maxCost = costFilters.find((c) => c.id === cost)!.max;

  const results = useMemo(
    () =>
      recipes
        .filter(
          (r) =>
            r.costPerServing <= maxCost &&
            (tag === "all" || r.dietTags.includes(tag))
        )
        .sort((a, b) => a.costPerServing - b.costPerServing),
    [maxCost, tag]
  );

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Budget Recipes</h1>
        <p className="mt-1 text-sm text-stone-600">
          Real meals, few ingredients, honest costs. &quot;No-stove&quot;
          recipes need only a fridge or microwave.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {costFilters.map((c) => (
          <button
            key={c.id}
            onClick={() => setCost(c.id)}
            className={`rounded-full border px-3 py-1.5 text-sm font-medium transition ${
              cost === c.id
                ? "border-green-700 bg-green-700 text-white"
                : "border-stone-300 bg-white text-stone-700 hover:border-green-600"
            }`}
          >
            {c.label}
          </button>
        ))}
        <select
          value={tag}
          onChange={(e) => setTag(e.target.value)}
          className="rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-sm"
          aria-label="Filter by diet tag"
        >
          <option value="all">All diets</option>
          {allTags.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      <ul className="space-y-3">
        {results.map((r) => {
          const isOpen = open === r.id;
          return (
            <li
              key={r.id}
              className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm"
            >
              <button
                onClick={() => setOpen(isOpen ? null : r.id)}
                className="flex w-full flex-wrap items-center justify-between gap-2 text-left"
                aria-expanded={isOpen}
              >
                <div>
                  <h2 className="font-semibold">{r.title}</h2>
                  <p className="text-sm text-stone-600">
                    ~${r.costPerServing.toFixed(2)}/serving · {r.timeMinutes}{" "}
                    min · serves {r.servings}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {r.dietTags.map((t) => (
                    <span
                      key={t}
                      className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-900"
                    >
                      {t}
                    </span>
                  ))}
                  <span className="text-stone-400">{isOpen ? "▴" : "▾"}</span>
                </div>
              </button>
              {isOpen && (
                <div className="mt-3 grid gap-4 border-t border-stone-100 pt-3 sm:grid-cols-2">
                  <div>
                    <h3 className="text-sm font-semibold">Ingredients</h3>
                    <ul className="mt-1 list-disc space-y-0.5 pl-5 text-sm text-stone-700">
                      {r.ingredients.map((i) => (
                        <li key={i}>{i}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold">Steps</h3>
                    <ol className="mt-1 list-decimal space-y-0.5 pl-5 text-sm text-stone-700">
                      {r.steps.map((s) => (
                        <li key={s}>{s}</li>
                      ))}
                    </ol>
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>

      {results.length === 0 && (
        <p className="rounded-xl border border-stone-200 bg-white p-6 text-center text-stone-600">
          No recipes match those filters yet.
        </p>
      )}
    </div>
  );
}
