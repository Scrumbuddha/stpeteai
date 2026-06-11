"use client";

import { useRef, useState } from "react";

interface ChatTurn {
  role: "user" | "assistant";
  content: string;
}

const presets = [
  "Plan a week of dinners for $30",
  "Where can I use EBT near me?",
  "What can I make with rice, beans, and frozen corn?",
  "Cheap breakfast ideas for kids",
];

export default function CoachPage() {
  const [turns, setTurns] = useState<ChatTurn[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  async function send(text: string) {
    const content = text.trim();
    if (!content || busy) return;
    const next = [...turns, { role: "user" as const, content }];
    setTurns(next);
    setInput("");
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
      } else {
        setTurns([...next, { role: "assistant", content: data.reply }]);
      }
    } catch {
      setError("Couldn't reach the Coach — check your connection.");
    } finally {
      setBusy(false);
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">AI Food Coach</h1>
        <p className="mt-1 text-sm text-stone-600">
          Ask about cheap healthy meals, where to shop with SNAP/EBT, or swaps
          for foods you buy. General food info only — not medical advice.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {presets.map((p) => (
          <button
            key={p}
            onClick={() => send(p)}
            disabled={busy}
            className="rounded-full border border-stone-300 bg-white px-3 py-1.5 text-sm text-stone-700 transition hover:border-green-600 disabled:opacity-50"
          >
            {p}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {turns.map((t, i) => (
          <div
            key={i}
            className={`max-w-prose whitespace-pre-wrap rounded-xl px-4 py-3 text-sm ${
              t.role === "user"
                ? "ml-auto bg-green-700 text-white"
                : "border border-stone-200 bg-white text-stone-800 shadow-sm"
            }`}
          >
            {t.content}
          </div>
        ))}
        {busy && (
          <div className="max-w-prose rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-500 shadow-sm">
            Thinking…
          </div>
        )}
        {error && (
          <div className="max-w-prose rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            {error}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="flex gap-2"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask the Coach anything about food on a budget…"
          maxLength={4000}
          className="flex-1 rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm"
          aria-label="Message the Food Coach"
        />
        <button
          type="submit"
          disabled={busy || !input.trim()}
          className="rounded-lg bg-green-700 px-4 py-2 text-sm font-medium text-white hover:bg-green-800 disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  );
}
