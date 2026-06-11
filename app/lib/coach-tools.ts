import { foods, swaps } from "./data/foods";
import { places } from "./data/places";
import { recipes } from "./data/recipes";
import type { Place } from "./types";

const foodById = new Map(foods.map((f) => [f.id, f]));

/**
 * Tool implementations for the AI Food Coach. Each returns a JSON string so
 * every place, price, and nutrition figure in a chat answer comes from the
 * app's data rather than model memory.
 */

export function searchPlaces(input: {
  benefit?: "snap" | "wic" | "fab" | "free";
  place_type?: Place["type"];
}): string {
  const results = places.filter((p) => {
    if (input.place_type && p.type !== input.place_type) return false;
    switch (input.benefit) {
      case "snap":
        return p.acceptsSnap;
      case "wic":
        return p.acceptsWic;
      case "fab":
        return p.acceptsFreshAccessBucks;
      case "free":
        return p.isFree;
      default:
        return true;
    }
  });
  return JSON.stringify(
    results.map((p) => ({
      name: p.name,
      type: p.type,
      address: p.address,
      hours: p.hours,
      accepts_snap: p.acceptsSnap,
      accepts_wic: p.acceptsWic,
      doubles_snap_dollars: p.acceptsFreshAccessBucks,
      free: p.isFree,
      notes: p.notes,
    }))
  );
}

export function getSwaps(input: { query?: string }): string {
  const q = input.query?.trim().toLowerCase() ?? "";
  const results = swaps.filter((s) => {
    if (!q) return true;
    const from = foodById.get(s.fromId)!;
    const to = foodById.get(s.toId)!;
    return (
      from.name.toLowerCase().includes(q) ||
      to.name.toLowerCase().includes(q) ||
      from.category.toLowerCase().includes(q)
    );
  });
  return JSON.stringify(
    results.map((s) => {
      const from = foodById.get(s.fromId)!;
      const to = foodById.get(s.toId)!;
      return {
        instead_of: from.name,
        instead_of_price_per_serving: from.pricePerServing,
        try: to.name,
        try_price_per_serving: to.pricePerServing,
        added_sugar_cut_g: from.addedSugarG - to.addedSugarG,
        sodium_cut_mg: from.sodiumMg - to.sodiumMg,
        fiber_gain_g: to.fiberG - from.fiberG,
        protein_gain_g: to.proteinG - from.proteinG,
        why: s.rationale,
      };
    })
  );
}

export function getRecipes(input: {
  max_cost_per_serving?: number;
  diet_tag?: string;
}): string {
  const results = recipes
    .filter(
      (r) =>
        (input.max_cost_per_serving == null ||
          r.costPerServing <= input.max_cost_per_serving) &&
        (!input.diet_tag || r.dietTags.includes(input.diet_tag))
    )
    .sort((a, b) => a.costPerServing - b.costPerServing);
  return JSON.stringify(results);
}
