"use client";

import { useMemo, useState } from "react";
import { places } from "@/lib/data/places";
import type { Place, PlaceType } from "@/lib/types";

const typeLabels: Record<PlaceType, string> = {
  grocery: "Grocery",
  "farmers-market": "Farmers market",
  "food-pantry": "Pantry / free food",
  "community-garden": "Community garden",
  "mobile-market": "Mobile market",
};

type BenefitFilter = "all" | "snap" | "wic" | "fab" | "free";

const benefitFilters: { id: BenefitFilter; label: string }[] = [
  { id: "all", label: "Everything" },
  { id: "snap", label: "Takes SNAP/EBT" },
  { id: "wic", label: "Takes WIC" },
  { id: "fab", label: "Doubles SNAP (Fresh Access Bucks)" },
  { id: "free", label: "Free food" },
];

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
        <h1 className="text-2xl font-bold">Find healthy food near you</h1>
        <p className="mt-1 text-sm text-stone-600">
          St. Petersburg pilot area. Pantries are open to everyone unless noted
          — no paperwork needed at most.
        </p>
      </div>

      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {benefitFilters.map((f) => (
            <button
              key={f.id}
              onClick={() => setBenefit(f.id)}
              className={`rounded-full border px-3 py-1.5 text-sm font-medium transition ${
                benefit === f.id
                  ? "border-green-700 bg-green-700 text-white"
                  : "border-stone-300 bg-white text-stone-700 hover:border-green-600"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <select
          value={type}
          onChange={(e) => setType(e.target.value as PlaceType | "all")}
          className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm"
          aria-label="Filter by place type"
        >
          <option value="all">All place types</option>
          {Object.entries(typeLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <p className="text-sm text-stone-500">
        {results.length} place{results.length === 1 ? "" : "s"} found
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
                  {typeLabels[p.type]} · {p.address}
                </p>
                <p className="mt-1 text-sm text-stone-600">🕐 {p.hours}</p>
              </div>
              <a
                href={`https://www.openstreetmap.org/?mlat=${p.lat}&mlon=${p.lng}#map=16/${p.lat}/${p.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg bg-green-700 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-800"
              >
                Map ↗
              </a>
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {p.isFree && <Badge tone="amber">Free</Badge>}
              {p.acceptsSnap && <Badge tone="green">SNAP/EBT</Badge>}
              {p.acceptsWic && <Badge tone="blue">WIC</Badge>}
              {p.acceptsFreshAccessBucks && (
                <Badge tone="green">Doubles SNAP $</Badge>
              )}
            </div>
            {p.notes && <p className="mt-2 text-sm text-stone-700">{p.notes}</p>}
          </li>
        ))}
      </ul>

      {results.length === 0 && (
        <p className="rounded-xl border border-stone-200 bg-white p-6 text-center text-stone-600">
          Nothing matches those filters yet — try widening your search.
        </p>
      )}
    </div>
  );
}
