export type Locale = "en" | "es";

type Dict = Record<string, string>;

const en: Dict = {
  "nav.finder": "Find Food",
  "nav.swaps": "Smart Swaps",
  "nav.recipes": "Budget Recipes",
  "nav.coach": "Coach",

  "footer.disclaimer":
    "Prices are estimates from local surveys. Nutrition figures based on USDA FoodData Central. This app gives general food information, not medical advice. A project of stpeteai.org.",

  "home.title": "Healthy food shouldn't cost more.",
  "home.body":
    "Find healthy food near you in St. Pete — including free pantries and markets that double your SNAP dollars — and learn simple swaps that save money and cut sugar and salt.",
  "home.privacy": "No account. No sign-up. Your info stays on your phone.",
  "home.finder.title": "Find Food Near You",
  "home.finder.body":
    "Farmers markets, food pantries, and groceries — filtered by what's free, what takes SNAP/EBT, and what's open now.",
  "home.finder.cta": "Open the finder",
  "home.swaps.title": "Smart Swaps",
  "home.swaps.body":
    "Pick something you already buy and see a cheaper, healthier alternative — with the savings spelled out.",
  "home.swaps.cta": "See the swaps",
  "home.recipes.title": "Budget Recipes",
  "home.recipes.body":
    "Real meals under $1.50 a serving, including no-stove options. Most use 6 ingredients or fewer.",
  "home.recipes.cta": "Browse recipes",
  "home.tip.title": "Did you know?",
  "home.tip.body":
    "Fresh Access Bucks doubles your SNAP/EBT dollars on fresh fruits and vegetables at participating farmers markets — including the Saturday Morning Market downtown.",

  "finder.title": "Find healthy food near you",
  "finder.subtitle":
    "St. Petersburg pilot area. Pantries are open to everyone unless noted — no paperwork needed at most.",
  "finder.benefit.all": "Everything",
  "finder.benefit.snap": "Takes SNAP/EBT",
  "finder.benefit.wic": "Takes WIC",
  "finder.benefit.fab": "Doubles SNAP (Fresh Access Bucks)",
  "finder.benefit.free": "Free food",
  "finder.type.all": "All place types",
  "type.grocery": "Grocery",
  "type.farmers-market": "Farmers market",
  "type.food-pantry": "Pantry / free food",
  "type.community-garden": "Community garden",
  "type.mobile-market": "Mobile market",
  "finder.resultOne": "1 place found",
  "finder.resultMany": "{n} places found",
  "finder.map": "Map ↗",
  "badge.free": "Free",
  "badge.snap": "SNAP/EBT",
  "badge.wic": "WIC",
  "badge.fab": "Doubles SNAP $",
  "finder.empty": "Nothing matches those filters yet — try widening your search.",

  "swaps.title": "Smart Swaps",
  "swaps.subtitle":
    'Find what you already buy and see a cheaper, healthier stand-in. No food is "bad" — these are just better deals for your body and your wallet.',
  "swaps.search": "Search: soda, cereal, chips…",
  "swaps.all": "All",
  "cat.Breakfast": "Breakfast",
  "cat.Drinks": "Drinks",
  "cat.Protein": "Protein",
  "cat.Sides & Snacks": "Sides & Snacks",
  "swaps.insteadOf": "Instead of",
  "swaps.try": "Try",
  "swaps.perServing": "/serving",
  "swaps.save": "💰 Save about {amount}/month per person",
  "swaps.sugar": "🍬 {g}g less added sugar per serving",
  "swaps.sodium": "🧂 {mg}mg less sodium per serving",
  "swaps.fiber": "🌾 {g}g more fiber",
  "swaps.protein": "💪 {g}g more protein",
  "swaps.note":
    "Monthly savings assume one serving per day. Prices are estimated midpoints from local store surveys and will vary.",
  "swaps.empty": 'No swaps match "{q}" yet. We\'re adding more all the time.',

  "recipes.title": "Budget Recipes",
  "recipes.subtitle":
    'Real meals, few ingredients, honest costs. "No-stove" recipes need only a fridge or microwave.',
  "recipes.cost.any": "Any price",
  "recipes.cost.under1": "Under $1/serving",
  "recipes.cost.under150": "Under $1.50/serving",
  "recipes.allDiets": "All diets",
  "recipes.perServing": "/serving",
  "recipes.min": "min",
  "recipes.serves": "serves {n}",
  "recipes.ingredients": "Ingredients",
  "recipes.steps": "Steps",
  "recipes.empty": "No recipes match those filters yet.",
  "tag.vegetarian": "vegetarian",
  "tag.high-fiber": "high-fiber",
  "tag.high-protein": "high-protein",
  "tag.low-sugar": "low-sugar",
  "tag.kid-friendly": "kid-friendly",
  "tag.quick": "quick",
  "tag.no-stove": "no-stove",

  "coach.title": "AI Food Coach",
  "coach.subtitle":
    "Ask about cheap healthy meals, where to shop with SNAP/EBT, or swaps for foods you buy. General food info only — not medical advice.",
  "coach.preset1": "Plan a week of dinners for $30",
  "coach.preset2": "Where can I use EBT near me?",
  "coach.preset3": "What can I make with rice, beans, and frozen corn?",
  "coach.preset4": "Cheap breakfast ideas for kids",
  "coach.thinking": "Thinking…",
  "coach.errorNetwork": "Couldn't reach the Coach — check your connection.",
  "coach.placeholder": "Ask the Coach anything about food on a budget…",
  "coach.send": "Send",
};

const es: Dict = {
  "nav.finder": "Buscar Comida",
  "nav.swaps": "Cambios Inteligentes",
  "nav.recipes": "Recetas Económicas",
  "nav.coach": "Asistente",

  "footer.disclaimer":
    "Los precios son estimados de encuestas locales. Datos de nutrición basados en USDA FoodData Central. Esta aplicación ofrece información general sobre alimentos, no consejos médicos. Un proyecto de stpeteai.org.",

  "home.title": "Comer sano no debería costar más.",
  "home.body":
    "Encuentra comida saludable cerca de ti en St. Pete — incluyendo despensas gratuitas y mercados que duplican tus dólares de SNAP — y aprende cambios simples que ahorran dinero y reducen el azúcar y la sal.",
  "home.privacy":
    "Sin cuenta. Sin registro. Tu información se queda en tu teléfono.",
  "home.finder.title": "Encuentra Comida Cerca",
  "home.finder.body":
    "Mercados de agricultores, despensas de alimentos y supermercados — filtrados por lo que es gratis, lo que acepta SNAP/EBT y lo que está abierto ahora.",
  "home.finder.cta": "Abrir el buscador",
  "home.swaps.title": "Cambios Inteligentes",
  "home.swaps.body":
    "Elige algo que ya compras y descubre una alternativa más barata y saludable — con el ahorro explicado.",
  "home.swaps.cta": "Ver los cambios",
  "home.recipes.title": "Recetas Económicas",
  "home.recipes.body":
    "Comidas reales por menos de $1.50 la porción, incluyendo opciones sin estufa. La mayoría usa 6 ingredientes o menos.",
  "home.recipes.cta": "Ver recetas",
  "home.tip.title": "¿Sabías que…?",
  "home.tip.body":
    "Fresh Access Bucks duplica tus dólares de SNAP/EBT en frutas y verduras frescas en los mercados de agricultores participantes — incluyendo el Saturday Morning Market en el centro.",

  "finder.title": "Encuentra comida saludable cerca de ti",
  "finder.subtitle":
    "Área piloto de St. Petersburg. Las despensas están abiertas a todos salvo que se indique — la mayoría no pide papeles.",
  "finder.benefit.all": "Todo",
  "finder.benefit.snap": "Acepta SNAP/EBT",
  "finder.benefit.wic": "Acepta WIC",
  "finder.benefit.fab": "Duplica SNAP (Fresh Access Bucks)",
  "finder.benefit.free": "Comida gratis",
  "finder.type.all": "Todos los tipos de lugar",
  "type.grocery": "Supermercado",
  "type.farmers-market": "Mercado de agricultores",
  "type.food-pantry": "Despensa / comida gratis",
  "type.community-garden": "Jardín comunitario",
  "type.mobile-market": "Mercado móvil",
  "finder.resultOne": "1 lugar encontrado",
  "finder.resultMany": "{n} lugares encontrados",
  "finder.map": "Mapa ↗",
  "badge.free": "Gratis",
  "badge.snap": "SNAP/EBT",
  "badge.wic": "WIC",
  "badge.fab": "Duplica SNAP $",
  "finder.empty":
    "Nada coincide con esos filtros — intenta ampliar tu búsqueda.",

  "swaps.title": "Cambios Inteligentes",
  "swaps.subtitle":
    'Busca lo que ya compras y descubre un sustituto más barato y saludable. Ninguna comida es "mala" — estos son mejores tratos para tu cuerpo y tu bolsillo.',
  "swaps.search": "Buscar: refresco, cereal, papitas…",
  "swaps.all": "Todo",
  "cat.Breakfast": "Desayuno",
  "cat.Drinks": "Bebidas",
  "cat.Protein": "Proteína",
  "cat.Sides & Snacks": "Acompañamientos y Botanas",
  "swaps.insteadOf": "En vez de",
  "swaps.try": "Prueba",
  "swaps.perServing": "/porción",
  "swaps.save": "💰 Ahorra unos {amount}/mes por persona",
  "swaps.sugar": "🍬 {g}g menos de azúcar añadida por porción",
  "swaps.sodium": "🧂 {mg}mg menos de sodio por porción",
  "swaps.fiber": "🌾 {g}g más de fibra",
  "swaps.protein": "💪 {g}g más de proteína",
  "swaps.note":
    "El ahorro mensual asume una porción al día. Los precios son estimados de encuestas en tiendas locales y pueden variar.",
  "swaps.empty":
    'Ningún cambio coincide con "{q}" todavía. Agregamos más constantemente.',

  "recipes.title": "Recetas Económicas",
  "recipes.subtitle":
    'Comidas reales, pocos ingredientes, costos honestos. Las recetas "sin estufa" solo necesitan refrigerador o microondas.',
  "recipes.cost.any": "Cualquier precio",
  "recipes.cost.under1": "Menos de $1/porción",
  "recipes.cost.under150": "Menos de $1.50/porción",
  "recipes.allDiets": "Todas las dietas",
  "recipes.perServing": "/porción",
  "recipes.min": "min",
  "recipes.serves": "rinde {n}",
  "recipes.ingredients": "Ingredientes",
  "recipes.steps": "Pasos",
  "recipes.empty": "Ninguna receta coincide con esos filtros.",
  "tag.vegetarian": "vegetariano",
  "tag.high-fiber": "alta fibra",
  "tag.high-protein": "alta proteína",
  "tag.low-sugar": "bajo azúcar",
  "tag.kid-friendly": "para niños",
  "tag.quick": "rápido",
  "tag.no-stove": "sin estufa",

  "coach.title": "Asistente de Comida (IA)",
  "coach.subtitle":
    "Pregunta sobre comidas saludables y baratas, dónde comprar con SNAP/EBT, o cambios para lo que ya compras. Solo información general — no consejos médicos.",
  "coach.preset1": "Planea una semana de cenas con $30",
  "coach.preset2": "¿Dónde puedo usar EBT cerca de mí?",
  "coach.preset3": "¿Qué puedo hacer con arroz, frijoles y elote congelado?",
  "coach.preset4": "Ideas de desayuno barato para niños",
  "coach.thinking": "Pensando…",
  "coach.errorNetwork": "No se pudo conectar con el Asistente — revisa tu conexión.",
  "coach.placeholder": "Pregunta lo que sea sobre comida con poco presupuesto…",
  "coach.send": "Enviar",
};

export const translations: Record<Locale, Dict> = { en, es };

export function translate(
  locale: Locale,
  key: string,
  vars?: Record<string, string | number>
): string {
  let text = translations[locale][key] ?? translations.en[key] ?? key;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      text = text.replaceAll(`{${k}}`, String(v));
    }
  }
  return text;
}
