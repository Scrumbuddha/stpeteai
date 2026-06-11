import Link from "next/link";

const features = [
  {
    href: "/finder",
    emoji: "📍",
    title: "Find Food Near You",
    body: "Farmers markets, food pantries, and groceries — filtered by what's free, what takes SNAP/EBT, and what's open now.",
    cta: "Open the finder",
  },
  {
    href: "/swaps",
    emoji: "🔄",
    title: "Smart Swaps",
    body: "Pick something you already buy and see a cheaper, healthier alternative — with the savings spelled out.",
    cta: "See the swaps",
  },
  {
    href: "/recipes",
    emoji: "🍳",
    title: "Budget Recipes",
    body: "Real meals under $1.50 a serving, including no-stove options. Most use 6 ingredients or fewer.",
    cta: "Browse recipes",
  },
];

export default function Home() {
  return (
    <div className="space-y-8">
      <section className="rounded-2xl bg-green-50 p-6 sm:p-10">
        <h1 className="text-3xl font-bold text-green-900 sm:text-4xl">
          Healthy food shouldn&apos;t cost more.
        </h1>
        <p className="mt-3 max-w-2xl text-lg text-green-950/80">
          Find healthy food near you in St. Pete — including free pantries and
          markets that <strong>double your SNAP dollars</strong> — and learn
          simple swaps that save money and cut sugar and salt.
        </p>
        <p className="mt-2 text-sm text-green-950/60">
          No account. No sign-up. Your info stays on your phone.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        {features.map((f) => (
          <Link
            key={f.href}
            href={f.href}
            className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm transition hover:shadow-md"
          >
            <div className="text-3xl">{f.emoji}</div>
            <h2 className="mt-2 text-lg font-semibold">{f.title}</h2>
            <p className="mt-1 text-sm text-stone-600">{f.body}</p>
            <span className="mt-3 inline-block text-sm font-medium text-green-700">
              {f.cta} →
            </span>
          </Link>
        ))}
      </section>

      <section className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
        <strong>Did you know?</strong> Fresh Access Bucks doubles your SNAP/EBT
        dollars on fresh fruits and vegetables at participating farmers markets
        — including the Saturday Morning Market downtown.
      </section>
    </div>
  );
}
