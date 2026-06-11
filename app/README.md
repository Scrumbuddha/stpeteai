# NourishStPete (MVP)

Web app that helps people in St. Petersburg find healthy food nearby and
discover low-cost healthy alternatives to what they already buy.

Full product design: [`../docs/design/nourish-stpete-app-design.md`](../docs/design/nourish-stpete-app-design.md)

## Features (Phase 1)

- **Find Food** (`/finder`) — markets, pantries, groceries, and mobile markets,
  filterable by SNAP/EBT, WIC, Fresh Access Bucks (double SNAP), and free food.
- **Smart Swaps** (`/swaps`) — cheaper, healthier alternatives to common
  grocery items, with per-serving cost and nutrition deltas spelled out.
- **Budget Recipes** (`/recipes`) — meals filtered by cost per serving and
  diet tags, including no-stove options.

## Running

```bash
npm install
npm run dev    # http://localhost:3000
npm run build  # production build
```

## Data

All data currently lives in `lib/data/` as TypeScript seed files:

- `places.ts` — St. Pete pilot listings (illustrative; verify before launch)
- `foods.ts` — food items + swap pairs (prices are surveyed band midpoints)
- `recipes.ts` — budget recipes

Phase 2 moves this into Postgres with scheduled ingestion from USDA
FoodData Central, the SNAP retailer dataset, and Open Food Facts, and adds
the Claude-powered AI Food Coach (see the design doc).
