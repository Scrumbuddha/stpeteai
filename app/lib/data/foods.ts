import type { FoodItem, Swap } from "../types";

/**
 * Seed catalog of common grocery items with estimated price bands
 * (midpoints, USD per serving) from local price surveys, and simplified
 * per-serving nutrition figures based on USDA FoodData Central.
 */
export const foods: FoodItem[] = [
  // breakfast
  { id: "frosted-cereal", name: "Frosted sugary cereal", category: "Breakfast", pricePerServing: 0.53, addedSugarG: 12, sodiumMg: 190, fiberG: 1, proteinG: 1 },
  { id: "oats-banana", name: "Old-fashioned oats + banana", category: "Breakfast", pricePerServing: 0.42, addedSugarG: 0, sodiumMg: 0, fiberG: 7, proteinG: 6 },
  { id: "breakfast-pastry", name: "Toaster pastries", category: "Breakfast", pricePerServing: 0.65, addedSugarG: 16, sodiumMg: 210, fiberG: 1, proteinG: 2 },
  { id: "eggs-toast", name: "Eggs + whole-wheat toast", category: "Breakfast", pricePerServing: 0.55, addedSugarG: 1, sodiumMg: 220, fiberG: 3, proteinG: 12 },
  { id: "flavored-yogurt", name: "Flavored yogurt cups", category: "Breakfast", pricePerServing: 0.95, addedSugarG: 13, sodiumMg: 95, fiberG: 0, proteinG: 5 },
  { id: "plain-yogurt-fruit", name: "Plain yogurt tub + frozen fruit", category: "Breakfast", pricePerServing: 0.6, addedSugarG: 0, sodiumMg: 80, fiberG: 2, proteinG: 9 },

  // drinks
  { id: "soda-2l", name: "Soda (2-liter)", category: "Drinks", pricePerServing: 0.4, addedSugarG: 26, sodiumMg: 30, fiberG: 0, proteinG: 0 },
  { id: "seltzer-water", name: "Store-brand seltzer or infused water", category: "Drinks", pricePerServing: 0.25, addedSugarG: 0, sodiumMg: 0, fiberG: 0, proteinG: 0 },
  { id: "juice-drink", name: "Fruit-flavored juice drink", category: "Drinks", pricePerServing: 0.5, addedSugarG: 22, sodiumMg: 25, fiberG: 0, proteinG: 0 },
  { id: "whole-fruit", name: "Whole fruit (banana, orange)", category: "Drinks", pricePerServing: 0.35, addedSugarG: 0, sodiumMg: 1, fiberG: 3, proteinG: 1 },

  // protein / dinner
  { id: "ground-beef-80", name: "Ground beef (80/20)", category: "Protein", pricePerServing: 1.4, addedSugarG: 0, sodiumMg: 75, fiberG: 0, proteinG: 19 },
  { id: "beef-lentil-blend", name: "Half beef, half lentils blend", category: "Protein", pricePerServing: 0.85, addedSugarG: 0, sodiumMg: 45, fiberG: 6, proteinG: 18 },
  { id: "chicken-nuggets", name: "Frozen chicken nuggets", category: "Protein", pricePerServing: 1.1, addedSugarG: 0, sodiumMg: 480, fiberG: 1, proteinG: 12 },
  { id: "baked-chicken-thighs", name: "Baked chicken thighs (family pack)", category: "Protein", pricePerServing: 0.75, addedSugarG: 0, sodiumMg: 90, fiberG: 0, proteinG: 21 },
  { id: "deli-lunch-meat", name: "Packaged deli lunch meat", category: "Protein", pricePerServing: 1.0, addedSugarG: 1, sodiumMg: 560, fiberG: 0, proteinG: 10 },
  { id: "canned-tuna", name: "Canned tuna (in water)", category: "Protein", pricePerServing: 0.7, addedSugarG: 0, sodiumMg: 210, fiberG: 0, proteinG: 17 },

  // sides & snacks
  { id: "instant-noodle-cups", name: "Instant noodle cups", category: "Sides & Snacks", pricePerServing: 0.6, addedSugarG: 1, sodiumMg: 1160, fiberG: 1, proteinG: 5 },
  { id: "rice-beans", name: "Rice + canned black beans", category: "Sides & Snacks", pricePerServing: 0.45, addedSugarG: 0, sodiumMg: 230, fiberG: 7, proteinG: 8 },
  { id: "potato-chips", name: "Potato chips", category: "Sides & Snacks", pricePerServing: 0.55, addedSugarG: 0, sodiumMg: 170, fiberG: 1, proteinG: 2 },
  { id: "popcorn-kernels", name: "Air-popped popcorn (kernels)", category: "Sides & Snacks", pricePerServing: 0.15, addedSugarG: 0, sodiumMg: 2, fiberG: 4, proteinG: 3 },
  { id: "fresh-berries-offseason", name: "Fresh berries (out of season)", category: "Sides & Snacks", pricePerServing: 1.25, addedSugarG: 0, sodiumMg: 1, fiberG: 4, proteinG: 1 },
  { id: "frozen-berries", name: "Frozen mixed berries", category: "Sides & Snacks", pricePerServing: 0.65, addedSugarG: 0, sodiumMg: 1, fiberG: 4, proteinG: 1 },
  { id: "fruit-snacks", name: "Fruit-flavored gummy snacks", category: "Sides & Snacks", pricePerServing: 0.5, addedSugarG: 11, sodiumMg: 30, fiberG: 0, proteinG: 0 },
  { id: "raisins-applesauce", name: "Raisin boxes or no-sugar applesauce cups", category: "Sides & Snacks", pricePerServing: 0.3, addedSugarG: 0, sodiumMg: 5, fiberG: 2, proteinG: 0 },
  { id: "bottled-smoothie", name: "Bottled smoothie", category: "Drinks", pricePerServing: 2.5, addedSugarG: 18, sodiumMg: 50, fiberG: 2, proteinG: 2 },
  { id: "homemade-smoothie", name: "Frozen fruit + yogurt smoothie (homemade)", category: "Drinks", pricePerServing: 0.85, addedSugarG: 0, sodiumMg: 60, fiberG: 3, proteinG: 6 },
  { id: "frozen-pizza", name: "Frozen pizza", category: "Protein", pricePerServing: 1.75, addedSugarG: 4, sodiumMg: 720, fiberG: 2, proteinG: 11 },
  { id: "tortilla-pizza", name: "Tortilla pizzas (tortilla + sauce + cheese)", category: "Protein", pricePerServing: 0.9, addedSugarG: 1, sodiumMg: 420, fiberG: 2, proteinG: 10 },
  { id: "salad-kit", name: "Bagged salad kit", category: "Sides & Snacks", pricePerServing: 1.5, addedSugarG: 3, sodiumMg: 220, fiberG: 2, proteinG: 1 },
  { id: "whole-romaine", name: "Whole romaine + homemade dressing", category: "Sides & Snacks", pricePerServing: 0.6, addedSugarG: 0, sodiumMg: 65, fiberG: 2, proteinG: 1 },
  { id: "granola-bars", name: "Sweetened granola bars", category: "Breakfast", pricePerServing: 0.45, addedSugarG: 8, sodiumMg: 95, fiberG: 1, proteinG: 2 },
  { id: "pb-banana-toast", name: "Peanut butter banana toast", category: "Breakfast", pricePerServing: 0.4, addedSugarG: 1, sodiumMg: 150, fiberG: 4, proteinG: 7 },
];

export const swaps: Swap[] = [
  {
    fromId: "frosted-cereal",
    toId: "oats-banana",
    rationale: "Same warm-bowl breakfast, 12g less added sugar, and oats keep you full longer.",
  },
  {
    fromId: "breakfast-pastry",
    toId: "eggs-toast",
    rationale: "Six times the protein for less money — and no sugar crash before lunch.",
  },
  {
    fromId: "flavored-yogurt",
    toId: "plain-yogurt-fruit",
    rationale: "A big plain tub plus frozen fruit costs ~35% less per bowl and skips 13g of added sugar.",
  },
  {
    fromId: "soda-2l",
    toId: "seltzer-water",
    rationale: "Keeps the fizz, drops 26g of sugar per glass, and saves about $13/month per person.",
  },
  {
    fromId: "juice-drink",
    toId: "whole-fruit",
    rationale: "Whole fruit gives you the sweetness plus fiber that juice drinks strip out.",
  },
  {
    fromId: "ground-beef-80",
    toId: "beef-lentil-blend",
    rationale: "Stretch one pound of beef into two meals — tacos and pasta sauce taste the same, cost 40% less.",
  },
  {
    fromId: "chicken-nuggets",
    toId: "baked-chicken-thighs",
    rationale: "Family-pack thighs cost less per serving with double the protein and a fifth of the sodium.",
  },
  {
    fromId: "deli-lunch-meat",
    toId: "canned-tuna",
    rationale: "Cheaper sandwich filling with more protein and half the sodium.",
  },
  {
    fromId: "instant-noodle-cups",
    toId: "rice-beans",
    rationale: "Costs less, has 7g fiber instead of 1g, and one-fifth the sodium of a noodle cup.",
  },
  {
    fromId: "potato-chips",
    toId: "popcorn-kernels",
    rationale: "Still salty and crunchy — about a quarter of the price per bowl when you pop it yourself.",
  },
  {
    fromId: "fresh-berries-offseason",
    toId: "frozen-berries",
    rationale: "Frozen berries are picked ripe, equally nutritious, and roughly half the price year-round.",
  },
  {
    fromId: "fruit-snacks",
    toId: "raisins-applesauce",
    rationale: "Same sweet lunchbox treat at almost half the price — real fruit, zero added sugar.",
  },
  {
    fromId: "bottled-smoothie",
    toId: "homemade-smoothie",
    rationale: "A blender, frozen fruit, and plain yogurt make the same smoothie for about a third of the price — and skip 18g of added sugar.",
  },
  {
    fromId: "frozen-pizza",
    toId: "tortilla-pizza",
    rationale: "Pizza night for half the price with under half the sodium — kids can build their own.",
  },
  {
    fromId: "salad-kit",
    toId: "whole-romaine",
    rationale: "A whole head of romaine costs less than one kit and makes three salads. Oil + vinegar + salt beats the packet.",
  },
  {
    fromId: "granola-bars",
    toId: "pb-banana-toast",
    rationale: "More protein and fiber for the same money, without the 8g of added sugar that wears off by mid-morning.",
  },
];
