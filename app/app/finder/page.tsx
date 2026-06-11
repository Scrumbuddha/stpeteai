"use client";

import { useMemo, useState } from "react";
import { places } from "@/lib/data/places";
import { useLocale } from "@/lib/i18n/LocaleContext";
import type { Place, PlaceType } from "@/lib/types";

const placeTypes: PlaceType[] = [
  "grocery",
  "farmers-market",
  "food-pantry",
  "community-garden",
  "mobile-market",
];

type BenefitFilter = "all" | "snap" | "wic" | "fab" | "free";

const benefitFilters: BenefitFilter[] = ["all", "snap", "wic", "fab", "free"];

function matchesBenefit(place: Place, filter: BenefitFilter): boolean {
  switch (filter) {
    case "snap":
      return place.acceptsSnap;
    case "wic":
      return place.acceptsWic;
    case "fab":
      return place.acceptsFreshAccessBucks;
    case "free":
      return place.isFree;
    default:
      return true;
  }
}

function Badge({ children, tone }: { children: string; tone: "green" | "blue" | "amber" }) {
  const tones = {
    green: "bg-green-100 text-green-900",
    blue: "bg-blue-100 text-blue-900",
    amber: "bg-amber-100 text-amber-900",
  };
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${tones[tone]}`}>
      {children}
    </span>
  );
}

export default function FinderPage() {
  const { t } = useLocale();
  const [benefit, setBenefit] = useState<BenefitFilter>("all");
  const [type, setType] = useState<PlaceType | "all">("all");

  const results = useMemo(
    () =>
      places.filter(
        (p) => matchesBenefit(p, benefit) && (type === "all" || p.type === type)
      ),
    [benefit, type]
  );

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">{t("finder.title")}</h1>
        <p className="mt-1 text-sm text-stone-600">{t("finder.subtitle")}</p>
      </div>

      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {benefitFilters.map((f) => (
            <button
              key={f}
              onClick={() => setBenefit(f)}
              className={`rounded-full border px-3 py-1.5 text-sm font-medium transition ${
                benefit === f
                  ? "border-green-700 bg-green-700 text-white"
                  : "border-stone-300 bg-white text-stone-700 hover:border-green-600"
              }`}
            >
              {t(`finder.benefit.${f}`)}
            </button>
          ))}
        </div>
        <select
          value={type}
          onChange={(e) => setType(e.target.value as PlaceType | "all")}
          className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm"
          aria-label={t("finder.type.all")}
        >
          <option value="all">{t("finder.type.all")}</option>
          {placeTypes.map((value) => (
            <option key={value} value={value}>
              {t(`type.${value}`)}
            </option>
          ))}
        </select>
      </div>

      <p className="text-sm text-stone-500">
        {results.length === 1
          ? t("finder.resultOne")
          : t("finder.resultMany", { n: results.length })}
      </p>

      <ul className="space-y-3">
        {results.map((p) => (
          <li
            key={p.id}
            className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm"
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <h2 className="font-semibold">{p.name}</h2>
                <p className="text-sm text-stone-600">
                  {t(`type.${p.type}`)} · {p.address}
                </p>
                <p className="mt-1 text-sm text-stone-600">🕐 {p.hours}</p>
              </div>
              <a
                href={`https://www.openstreetmap.org/?mlat=${p.lat}&mlon=${p.lng}#map=16/${p.lat}/${p.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg bg-green-700 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-800"
              >
                {t("finder.map")}
              </a>
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {p.isFree && <Badge tone="amber">{t("badge.free")}</Badge>}
              {p.acceptsSnap && <Badge tone="green">{t("badge.snap")}</Badge>}
              {p.acceptsWic && <Badge tone="blue">{t("badge.wic")}</Badge>}
              {p.acceptsFreshAccessBucks && (
                <Badge tone="green">{t("badge.fab")}</Badge>
              )}
            </div>
            {p.notes && <p className="mt-2 text-sm text-stone-700">{p.notes}</p>}
          </li>
        ))}
      </ul>

      {results.length === 0 && (
        <p className="rounded-xl border border-stone-200 bg-white p-6 text-center text-stone-600">
          {t("finder.empty")}
        </p>
      )}
    </div>
  );
}
