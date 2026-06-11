# NourishStPete — App Design Document

**An app that helps people find healthy food near them and discover low-cost healthy alternatives to what they already eat.**

Status: Draft v1 · Owner: stpeteai.org · Last updated: 2026-06-11

---

## 1. Problem Statement

Eating healthy is widely perceived as expensive and inconvenient, and for many
people it genuinely is:

- **Access**: Parts of South St. Petersburg are USDA-designated food deserts —
  residents may live more than a mile from a full-service grocery store and
  rely on convenience stores with little fresh food.
- **Cost perception**: People assume healthy = expensive because the healthy
  options they see marketed (organic brands, prepared salads, specialty
  stores) are expensive. Cheap healthy staples (dry beans, frozen vegetables,
  oats, eggs, seasonal produce) are invisible in that framing.
- **Knowledge gap**: Even motivated shoppers don't know *what to swap*. "Eat
  healthier" is abstract; "swap your $4.50 sugary cereal for $1.20 of oats
  and a banana" is actionable.
- **Benefit complexity**: SNAP/EBT, WIC, and Fresh Access Bucks (which doubles
  SNAP dollars at participating Florida farmers markets) are underused because
  people don't know which retailers accept them or how they work.

**Goal**: Make the healthy choice the easy, cheap, and obvious choice — by
showing people (1) where to get healthy food near them, including
benefit-friendly and free options, and (2) concrete cheaper-and-healthier
alternatives to the specific foods they already buy.

## 2. Target Users & Personas

| Persona | Situation | Primary need |
|---|---|---|
| **Tanya, 34** — single mom, two kids, South St. Pete | Shops weekly on a tight budget, uses SNAP, no car | Nearby stores/markets that take EBT; cheap kid-friendly healthy meals |
| **Marcus, 67** — retiree on fixed income | Pre-diabetic, doctor said "eat better" | Simple swaps for his current diet; food pantry schedules; low-sodium options |
| **Jess, 26** — service worker, irregular hours | Wants to stop eating fast food, thinks healthy food is pricey | Quick cost-per-meal comparisons; convenient healthy options near work |
| **Community navigator / case worker** | Helps clients find food resources | Shareable, printable lists of resources filtered by location and benefits |

Design implications: mobile-first, works on low-end Android phones, low data
usage, readable at large font sizes, English + Spanish at launch, no account
required for core features.

## 3. Core Features

### 3.1 Healthy Food Finder (map + list)

A map and list view of places to get healthy food, filterable by:

- **Type**: grocery store, farmers market, food pantry / food bank, community
  garden, mobile market, CSA pickup, community fridge
- **Benefits accepted**: SNAP/EBT, WIC, Fresh Access Bucks (double SNAP at
  markets), free (pantries)
- **Open now / open this week** — critical for pantries and markets with
  limited hours
- **Distance / transit accessible** (near a PSTA route)

Each place gets a detail card: hours, what benefits it accepts, what's
typically available, photos, and a one-tap directions link. Pantry listings
show eligibility requirements (most have none — say so explicitly to reduce
stigma).

### 3.2 Smart Swaps (the signature feature)

User tells us what they eat — by searching, picking from common items, or
photographing a product/receipt — and we return **specific cheaper, healthier
alternatives** with the math shown:

```
You buy: Frosted cereal, 18 oz ............ $4.79  (~$0.53/serving, 12g added sugar)
Swap:    Old-fashioned oats + banana ...... $0.42/serving, 0g added sugar
         → Saves ~$5.80/month per person, cuts 12g sugar/day
```

Swap logic ranks alternatives by a blend of:
1. **Nutrition delta** (less added sugar/sodium/sat fat, more fiber/protein —
   based on USDA FoodData Central data)
2. **Cost delta** (price per serving, using regional price data)
3. **Similarity** (a swap must be plausibly satisfying: cereal→oats yes,
   cereal→kale no)

Categories of swaps: brand-name → store brand, processed → minimally
processed, fresh out-of-season → frozen/canned (no salt added), meat-heavy →
beans/lentils/eggs blends, beverage swaps (soda → infused water/seltzer).

### 3.3 Budget Meal Ideas

- Recipes filtered by **cost per serving** (e.g., "under $1.50/serving"),
  prep time, equipment needed (some users lack a full kitchen), and dietary
  needs (diabetic-friendly, low sodium, vegetarian, halal).
- "What's cheap right now" — seasonal Florida produce calendar (e.g., summer:
  mangoes, okra, sweet corn) cross-referenced to recipes.
- Each recipe links its ingredients back to the Food Finder ("get these at
  Saturday Morning Market — EBT doubled with Fresh Access Bucks").

### 3.4 AI Food Coach (powered by Claude)

A conversational layer over everything above:

- "I have $30, EBT, no car, and two kids — what should I buy this week?"
  → a shopping list, the nearest EBT-friendly store/market, and 4 dinner ideas.
- "What can I make with rice, a can of black beans, and frozen corn?"
- Photo of a pantry shelf or receipt → swap suggestions.
- Tone: practical and non-judgmental. Never shames current choices; always
  leads with savings and taste, with health as the bonus.

Guardrails: the coach gives general nutrition information, not medical advice;
it deflects clinical questions ("ask your doctor/dietitian") and never
recommends restriction diets. All claims trace to USDA data.

### 3.5 Community Layer (post-MVP)

- Crowdsourced price spotting ("flag a deal") and pantry stock reports.
- Saved lists shareable as a link or printable PDF (for case workers).
- Organizations can claim and update their listings.

## 4. What This App Is Not

- Not a calorie tracker or diet app — no weight-loss framing, no streaks/guilt
  mechanics.
- Not a delivery service — it routes people to existing food sources.
- Not a replacement for dietitians — it's grocery-level guidance.

## 5. User Flows (MVP)

### First open (no account)
1. Ask for ZIP code or location permission (location optional — ZIP works).
2. Optional one-tap context: "I use SNAP/EBT" / "I use WIC" / "Just browsing"
   — sets default filters, stored locally only.
3. Land on Food Finder map centered on user, pantries and markets highlighted.

### Finding a swap
1. Tap **Swaps** → search "soda" (or scan barcode / pick from "common buys"
   grid).
2. See 3 ranked alternatives, each with $/serving and nutrition delta.
3. Tap a swap → where to buy nearby + a recipe if relevant → "add to my list".

### Weekly plan via AI Coach
1. Tap **Coach** → preset chips ("Plan my week", "Use what I have",
   "Cheap dinner tonight") or free text.
2. Coach returns plan with shopping list; list items deep-link into Finder.

## 6. Data Sources

| Data | Source | Refresh |
|---|---|---|
| Food nutrition | USDA FoodData Central API | Quarterly sync |
| Packaged-product barcodes/labels | Open Food Facts | Weekly sync |
| SNAP retailer locations | USDA SNAP Retailer Locator dataset | Monthly |
| Farmers markets | USDA Local Food Directories + manual curation | Monthly + manual |
| Food pantries | Feeding Tampa Bay network + 211 Tampa Bay + manual curation | Weekly + crowdsource |
| Fresh Access Bucks sites | Feeding Florida program list | Monthly |
| Grocery prices | Seeded from manual price surveys of common staples at 4–5 local chains; later store APIs/crowdsourcing | Monthly survey |
| Seasonal produce | UF/IFAS Florida produce calendar (static) | Annual |
| Recipes | USDA MyPlate Kitchen (public domain) + curated originals | As needed |

Pricing honesty: exact live prices are infeasible at MVP. Use **price bands
per serving** ("about $0.40–0.60/serving") from periodic surveys, clearly
labeled as estimates. The swap math holds even with band-level precision
because the gaps between processed and staple foods are large.

## 7. Architecture

```
┌─────────────────────────────────────────────────────────┐
│  Client: Progressive Web App (Next.js + Tailwind)        │
│  - installable, offline-cached resource list, low data   │
│  - map via MapLibre GL + OpenStreetMap tiles             │
└──────────────────────────┬──────────────────────────────┘
                           │ HTTPS / JSON
┌──────────────────────────┴──────────────────────────────┐
│  API: Next.js route handlers (single deployable)         │
│  - /api/places     geo search w/ filters                 │
│  - /api/swaps      swap engine (precomputed + ranked)    │
│  - /api/recipes    cost-filtered recipe search           │
│  - /api/coach      Claude-backed chat (streaming)        │
└───────┬──────────────────────────────┬──────────────────┘
        │                              │
┌───────┴────────────┐      ┌──────────┴─────────────────┐
│ Postgres + PostGIS │      │ Claude API (claude-fable-5  │
│ places, foods,     │      │ or claude-haiku for cost)   │
│ prices, swaps,     │      │ tool-use: search_places,    │
│ recipes            │      │ get_swaps, get_recipes      │
└───────┬────────────┘      └────────────────────────────┘
        │
┌───────┴────────────────────────────────────────────────┐
│ Ingestion jobs (scheduled): USDA FDC, Open Food Facts,  │
│ SNAP retailers, pantry feeds, price surveys             │
└─────────────────────────────────────────────────────────┘
```

Key decisions:

- **PWA over native app** for MVP: no app-store friction, one codebase, works
  on any phone, shareable as a plain URL (important for case workers). Wrap
  with Capacitor later if store presence matters.
- **Swaps are precomputed**, not generated live by the LLM: a nightly job
  builds a swap graph (item → ranked alternatives with nutrition/cost deltas)
  so results are fast, cheap, consistent, and auditable. The AI Coach *uses*
  this graph via tool calls rather than inventing numbers.
- **Coach uses tool-use against our APIs** so every place, price, and
  nutrition claim in a chat answer comes from our database, not model memory.
- **OpenStreetMap/MapLibre** instead of Google Maps to keep per-user cost near
  zero (this should run on a nonprofit budget).

### Core data model (simplified)

```sql
places(id, name, type, geom, address, hours_json, accepts_snap,
       accepts_wic, accepts_fab, is_free, eligibility_notes, verified_at)

foods(id, fdc_id, name, category, serving_g, nutrients_json,
      price_band_low, price_band_high, price_unit)

swaps(from_food_id, to_food_id, nutrition_score, cost_delta_per_serving,
      similarity_score, rationale_text)

recipes(id, title, cost_per_serving_band, time_minutes, equipment,
        diet_tags[], ingredients_json, steps_json, locale)
```

## 8. Privacy & Trust

- **No account required** for any core feature; optional account only to sync
  saved lists.
- Benefit status (SNAP/WIC) stored **client-side only**; never sent to
  analytics. It is a filter preference, not a profile attribute.
- Location used transiently for search; never stored server-side.
- Coach conversations not used for training; retention measured in days, with
  a visible "clear chat" control.
- Plain-language privacy notice at a 6th-grade reading level, English and
  Spanish.

## 9. Accessibility & Localization

- WCAG 2.2 AA: 4.5:1 contrast, full keyboard/screen-reader support, tap
  targets ≥44px.
- Reading level for all copy: 6th grade. Numbers shown with context
  ("$0.42 per bowl"), not raw nutrition jargon.
- English + Spanish at launch (Pinellas County demographics); copy stored in
  locale files from day one.
- Low-bandwidth mode: list view default on slow connections, map tiles
  deferred.

## 10. Success Metrics

| Metric | Target (6 months post-launch) |
|---|---|
| Monthly active users in Pinellas County | 2,000 |
| Swap views → "added to list" rate | ≥ 20% |
| Food Finder sessions ending in a directions tap | ≥ 30% |
| Resource listings verified within last 60 days | ≥ 90% |
| Self-reported "saved money this month" (in-app pulse survey) | ≥ 50% yes |

Anti-metrics (things we will *not* optimize): session length, daily streaks,
notification opens. This app succeeds when people get in, get food, get out.

## 11. Roadmap

**Phase 1 — MVP (8–10 weeks)**
- Food Finder with ~150 curated Pinellas County listings (groceries, markets,
  pantries) with benefit flags and hours
- Swap engine over ~200 common grocery items with surveyed price bands
- 50 budget recipes with cost-per-serving
- English UI, PWA, no accounts

**Phase 2 — Coach & Spanish (4–6 weeks)**
- Claude-powered AI Coach with tool-use over Finder/Swaps/Recipes
- Spanish localization
- Barcode scan for swaps (Open Food Facts lookup)

**Phase 3 — Community (ongoing)**
- Org-claimed listings, crowdsourced deal/stock flags
- Shareable/printable resource lists for case workers
- Partnerships: Feeding Tampa Bay, St. Pete Free Clinic, UF/IFAS Extension,
  city Healthy St. Pete program — both for data and distribution

**Later / explore**
- SMS interface to the Coach (reaches users without smartphones/data plans)
- Receipt photo → monthly savings report
- Expansion template for other cities (the data model is city-agnostic;
  only the curated listings and price surveys are local)

## 12. Open Questions

1. Name/branding — working title "NourishStPete"; needs community input.
2. Funding model — grant-funded nonprofit tool vs. sponsorships from grocers
   (sponsorships create a neutrality risk in swap rankings; if accepted, they
   must never influence ranking and must be labeled).
3. Pantry data freshness — can we get a direct feed from Feeding Tampa Bay,
   or do we rely on volunteer verification cadence?
4. WIC item-level eligibility is complex (approved product lists vary) —
   MVP flags WIC *retailers* only; item-level WIC guidance is post-MVP.
