"use client";

import { useMemo, useState } from "react";
import { recipes } from "@/lib/data/recipes";
import { useLocale } from "@/lib/i18n/LocaleContext";

const costFilters = [
  { id: "any", max: Infinity },
  { id: "under1", max: 1 },
  { id: "under150", max: 1.5 },
] as const;

type CostFilterId = (typeof costFilters)[number]["id"];

const allTags = [...new Set(recipes.flatMap((r) => r.dietTags))].sort();

export default function RecipesPage() {
  const { t } = useLocale();
  const [cost, setCost] = useState<CostFilterId>("any");
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
        <h1 className="text-2xl font-bold">{t("recipes.title")}</h1>
        <p className="mt-1 text-sm text-stone-600">{t("recipes.subtitle")}</p>
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
            {t(`recipes.cost.${c.id}`)}
          </button>
        ))}
        <select
          value={tag}
          onChange={(e) => setTag(e.target.value)}
          className="rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-sm"
          aria-label={t("recipes.allDiets")}
        >
          <option value="all">{t("recipes.allDiets")}</option>
          {allTags.map((tg) => (
            <option key={tg} value={tg}>
              {t(`tag.${tg}`)}
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
                    ~${r.costPerServing.toFixed(2)}
                    {t("recipes.perServing")} · {r.timeMinutes}{" "}
                    {t("recipes.min")} · {t("recipes.serves", { n: r.servings })}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {r.dietTags.map((tg) => (
                    <span
                      key={tg}
                      className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-900"
                    >
                      {t(`tag.${tg}`)}
                    </span>
                  ))}
                  <span className="text-stone-400">{isOpen ? "▴" : "▾"}</span>
                </div>
              </button>
              {isOpen && (
                <div className="mt-3 grid gap-4 border-t border-stone-100 pt-3 sm:grid-cols-2">
                  <div>
                    <h3 className="text-sm font-semibold">
                      {t("recipes.ingredients")}
                    </h3>
                    <ul className="mt-1 list-disc space-y-0.5 pl-5 text-sm text-stone-700">
                      {r.ingredients.map((i) => (
                        <li key={i}>{i}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold">
                      {t("recipes.steps")}
                    </h3>
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
          {t("recipes.empty")}
        </p>
      )}
    </div>
  );
}
