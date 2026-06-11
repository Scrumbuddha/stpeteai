export type PlaceType =
  | "grocery"
  | "farmers-market"
  | "food-pantry"
  | "community-garden"
  | "mobile-market";

export interface Place {
  id: string;
  name: string;
  type: PlaceType;
  address: string;
  lat: number;
  lng: number;
  hours: string;
  acceptsSnap: boolean;
  acceptsWic: boolean;
  acceptsFreshAccessBucks: boolean;
  isFree: boolean;
  notes?: string;
}

export interface FoodItem {
  id: string;
  name: string;
  category: string;
  /** estimated price per serving in USD (band midpoint) */
  pricePerServing: number;
  addedSugarG: number;
  sodiumMg: number;
  fiberG: number;
  proteinG: number;
}

export interface Swap {
  fromId: string;
  toId: string;
  rationale: string;
}

export interface Recipe {
  id: string;
  title: string;
  costPerServing: number;
  timeMinutes: number;
  servings: number;
  dietTags: string[];
  ingredients: string[];
  steps: string[];
}
