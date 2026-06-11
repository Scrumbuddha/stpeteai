import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { getRecipes, getSwaps, searchPlaces } from "@/lib/coach-tools";

const MODEL = process.env.COACH_MODEL ?? "claude-opus-4-8";
const MAX_TOOL_ITERATIONS = 5;
const MAX_HISTORY_MESSAGES = 20;

const SYSTEM_PROMPT = `You are the NourishStPete Food Coach, helping people in St. Petersburg, Florida eat well on a tight budget.

Your job: help users find healthy food nearby (including free pantries and places that take SNAP/EBT, WIC, or Fresh Access Bucks, which doubles SNAP dollars on produce at farmers markets), suggest cheaper-and-healthier swaps for foods they already buy, and plan affordable meals.

Rules:
- Always use your tools to look up places, swaps, and recipes. Never invent addresses, hours, prices, or nutrition numbers. If the tools return nothing relevant, say so plainly.
- Be practical and non-judgmental. Never shame anyone's current food choices. Lead with savings and taste; health is the bonus.
- Plain language at roughly a 6th-grade reading level. Show money as dollars with context ("$0.42 per bowl").
- You give general food information, not medical advice. For clinical questions (diabetes management, allergies, medication interactions), suggest they ask their doctor or a dietitian.
- Never recommend restriction diets, fasting, or weight-loss targets.
- Keep answers short and scannable. When listing places, include hours and what benefits they accept.`;

const tools: Anthropic.Tool[] = [
  {
    name: "search_places",
    description:
      "Search places to get food in St. Petersburg. Call this whenever the user asks where to buy or get food, or mentions SNAP/EBT, WIC, food pantries, or free food.",
    input_schema: {
      type: "object",
      properties: {
        benefit: {
          type: "string",
          enum: ["snap", "wic", "fab", "free"],
          description:
            "Filter: snap = accepts SNAP/EBT, wic = accepts WIC, fab = Fresh Access Bucks (doubles SNAP dollars), free = free food. Omit for all places.",
        },
        place_type: {
          type: "string",
          enum: [
            "grocery",
            "farmers-market",
            "food-pantry",
            "community-garden",
            "mobile-market",
          ],
          description: "Filter by place type. Omit for all types.",
        },
      },
    },
  },
  {
    name: "get_swaps",
    description:
      "Find cheaper, healthier alternatives to common grocery items, with per-serving prices and nutrition differences. Call this when the user mentions a specific food they buy or asks how to save money on groceries.",
    input_schema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description:
            "Food to find swaps for, e.g. 'soda', 'cereal', 'ground beef'. Omit to list all swaps.",
        },
      },
    },
  },
  {
    name: "get_recipes",
    description:
      "Find budget recipes with cost per serving. Call this when the user asks what to cook, asks for meal ideas, or gives a food budget.",
    input_schema: {
      type: "object",
      properties: {
        max_cost_per_serving: {
          type: "number",
          description: "Maximum cost per serving in dollars, e.g. 1.5",
        },
        diet_tag: {
          type: "string",
          enum: [
            "vegetarian",
            "high-fiber",
            "high-protein",
            "low-sugar",
            "kid-friendly",
            "quick",
            "no-stove",
          ],
          description: "Filter by diet tag. Omit for all recipes.",
        },
      },
    },
  },
];

function executeTool(name: string, input: unknown): string {
  const args = (input ?? {}) as Record<string, never>;
  switch (name) {
    case "search_places":
      return searchPlaces(args);
    case "get_swaps":
      return getSwaps(args);
    case "get_recipes":
      return getRecipes(args);
    default:
      return JSON.stringify({ error: `Unknown tool: ${name}` });
  }
}

interface ChatTurn {
  role: "user" | "assistant";
  content: string;
}

export async function POST(request: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      {
        error:
          "The AI Coach isn't configured yet (missing ANTHROPIC_API_KEY). The Finder, Swaps, and Recipes pages all work without it.",
      },
      { status: 503 }
    );
  }

  let turns: ChatTurn[];
  try {
    const body = await request.json();
    turns = body.messages;
    if (
      !Array.isArray(turns) ||
      turns.length === 0 ||
      !turns.every(
        (t) =>
          (t.role === "user" || t.role === "assistant") &&
          typeof t.content === "string" &&
          t.content.length > 0 &&
          t.content.length <= 4000
      ) ||
      turns[turns.length - 1].role !== "user"
    ) {
      throw new Error("invalid");
    }
  } catch {
    return NextResponse.json(
      { error: "Send { messages: [{ role, content }] } ending with a user message." },
      { status: 400 }
    );
  }

  const client = new Anthropic();
  const messages: Anthropic.MessageParam[] = turns
    .slice(-MAX_HISTORY_MESSAGES)
    .map((t) => ({ role: t.role, content: t.content }));

  try {
    let response: Anthropic.Message | undefined;
    for (let i = 0; i < MAX_TOOL_ITERATIONS; i++) {
      response = await client.messages.create({
        model: MODEL,
        max_tokens: 2048,
        thinking: { type: "adaptive" },
        system: SYSTEM_PROMPT,
        tools,
        messages,
      });

      if (response.stop_reason !== "tool_use") break;

      messages.push({ role: "assistant", content: response.content });
      const toolResults: Anthropic.ToolResultBlockParam[] = response.content
        .filter((b): b is Anthropic.ToolUseBlock => b.type === "tool_use")
        .map((b) => ({
          type: "tool_result",
          tool_use_id: b.id,
          content: executeTool(b.name, b.input),
        }));
      messages.push({ role: "user", content: toolResults });
    }

    if (response?.stop_reason === "refusal") {
      return NextResponse.json({
        reply:
          "I can't help with that one. I'm best at finding food near you, grocery swaps, and budget meals — try me on those!",
      });
    }

    const reply =
      response?.content
        .filter((b): b is Anthropic.TextBlock => b.type === "text")
        .map((b) => b.text)
        .join("\n")
        .trim() ?? "";

    return NextResponse.json({
      reply: reply || "Sorry, I came up empty — try rephrasing that?",
    });
  } catch (err) {
    if (err instanceof Anthropic.RateLimitError) {
      return NextResponse.json(
        { error: "The Coach is busy right now — try again in a minute." },
        { status: 429 }
      );
    }
    console.error("Coach error:", err);
    return NextResponse.json(
      { error: "Something went wrong talking to the Coach. Try again." },
      { status: 500 }
    );
  }
}
