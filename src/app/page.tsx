export default function Home() {
  return (
    <div className="min-h-screen bg-white text-zinc-900">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
        <a href="/" className="font-semibold tracking-tight">
          pitchdeck.biz
        </a>
        <nav className="hidden items-center gap-6 text-sm text-zinc-600 md:flex">
          <a href="#features" className="hover:text-zinc-900">
            Features
          </a>
          <a href="#pricing" className="hover:text-zinc-900">
            Pricing
          </a>
          <a href="#faq" className="hover:text-zinc-900">
            FAQ
          </a>
        </nav>
        <a
          href="#cta"
          className="inline-flex items-center justify-center rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
        >
          Get a deck
        </a>
      </header>

      <main>
        <section className="mx-auto w-full max-w-6xl px-6 pb-20 pt-12">
          <div className="grid gap-10 md:grid-cols-2 md:items-center">
            <div>
              <p className="mb-4 inline-flex rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs font-medium text-zinc-700">
                Built for founders who need to ship the story fast
              </p>
              <h1 className="text-balance text-4xl font-semibold tracking-tight md:text-5xl">
                Investor-ready pitch decks in days — not weeks.
              </h1>
              <p className="mt-5 max-w-prose text-pretty text-lg leading-7 text-zinc-600">
                Send your notes, rough doc, or recording. We turn it into a clean,
                persuasive deck with a tight narrative, crisp design, and clear
                next steps.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row" id="cta">
                <a
                  href="mailto:julian@aiacrobatics.com?subject=Pitch%20deck%20request"
                  className="inline-flex h-12 items-center justify-center rounded-full bg-zinc-900 px-6 text-sm font-medium text-white hover:bg-zinc-800"
                >
                  Request a deck
                </a>
                <a
                  href="#pricing"
                  className="inline-flex h-12 items-center justify-center rounded-full border border-zinc-200 px-6 text-sm font-medium text-zinc-900 hover:bg-zinc-50"
                >
                  See pricing
                </a>
              </div>

              <p className="mt-4 text-xs text-zinc-500">
                Optional: Use 21st.dev components as our design reference library.
              </p>
            </div>

            <div className="rounded-3xl border border-zinc-200 bg-gradient-to-b from-zinc-50 to-white p-6 shadow-sm">
              <div className="grid gap-4">
                <div className="rounded-2xl border border-zinc-200 bg-white p-5">
                  <p className="text-xs font-medium text-zinc-500">Included</p>
                  <ul className="mt-3 space-y-2 text-sm text-zinc-700">
                    <li>• Narrative + positioning</li>
                    <li>• Slide design + layout polish</li>
                    <li>• Visual charts + simple diagrams</li>
                    <li>• Versioning + async review</li>
                  </ul>
                </div>
                <div className="rounded-2xl border border-zinc-200 bg-white p-5">
                  <p className="text-xs font-medium text-zinc-500">Outputs</p>
                  <ul className="mt-3 space-y-2 text-sm text-zinc-700">
                    <li>• Google Slides / PPTX</li>
                    <li>• PDF export</li>
                    <li>• One-page summary</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="border-t border-zinc-100 bg-zinc-50">
          <div className="mx-auto w-full max-w-6xl px-6 py-16">
            <h2 className="text-2xl font-semibold tracking-tight">
              What we optimize
            </h2>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {[
                {
                  title: "Story",
                  body: "Clear problem → solution → traction → ask. No fluff.",
                },
                {
                  title: "Design",
                  body: "Clean, modern, readable. Consistent typography and spacing.",
                },
                {
                  title: "Speed",
                  body: "Fast async iteration. Tight feedback loops.",
                },
              ].map((f) => (
                <div
                  key={f.title}
                  className="rounded-3xl border border-zinc-200 bg-white p-6"
                >
                  <h3 className="font-medium">{f.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-zinc-600">{f.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="pricing" className="border-t border-zinc-100">
          <div className="mx-auto w-full max-w-6xl px-6 py-16">
            <div className="flex items-end justify-between gap-6">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight">Pricing</h2>
                <p className="mt-2 text-sm text-zinc-600">
                  Simple packages. Custom scopes available.
                </p>
              </div>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {[
                {
                  name: "Starter",
                  price: "$499",
                  items: [
                    "Up to 10 slides",
                    "Copy polish",
                    "Basic visual cleanup",
                    "1 revision",
                  ],
                },
                {
                  name: "Investor",
                  price: "$1,500",
                  items: [
                    "Up to 15 slides",
                    "Narrative restructure",
                    "Charts/diagrams",
                    "3 revisions",
                  ],
                },
                {
                  name: "Go-to-market",
                  price: "Custom",
                  items: [
                    "Messaging + positioning",
                    "Case studies / proof",
                    "Pitch variants",
                    "Ongoing support",
                  ],
                },
              ].map((p) => (
                <div
                  key={p.name}
                  className="rounded-3xl border border-zinc-200 bg-white p-6"
                >
                  <div className="flex items-baseline justify-between">
                    <h3 className="font-medium">{p.name}</h3>
                    <p className="text-lg font-semibold">{p.price}</p>
                  </div>
                  <ul className="mt-4 space-y-2 text-sm text-zinc-700">
                    {p.items.map((it) => (
                      <li key={it}>• {it}</li>
                    ))}
                  </ul>
                  <a
                    className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-full bg-zinc-900 px-5 text-sm font-medium text-white hover:bg-zinc-800"
                    href="mailto:julian@aiacrobatics.com?subject=Pitch%20deck%20package%20-%20\""
                  >
                    Start
                  </a>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="faq" className="border-t border-zinc-100 bg-zinc-50">
          <div className="mx-auto w-full max-w-6xl px-6 py-16">
            <h2 className="text-2xl font-semibold tracking-tight">FAQ</h2>
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {[...
                [
                  "What do you need from me?",
                  "A rough doc, notes, or a quick Loom. We’ll take it from there.",
                ],
                [
                  "Can you match my brand?",
                  "Yes. Send your logo/colors or a site reference and we’ll align.",
                ],
                [
                  "Do you do financial models?",
                  "We can format + present your numbers. Modeling itself is scoped separately.",
                ],
                [
                  "How fast?",
                  "Starter decks can be turned around in 48–72 hours depending on inputs.",
                ],
              ].map(([q, a]) => (
                <div
                  key={q}
                  className="rounded-3xl border border-zinc-200 bg-white p-6"
                >
                  <p className="font-medium">{q}</p>
                  <p className="mt-2 text-sm leading-6 text-zinc-600">{a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-zinc-100">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-10 text-sm text-zinc-500">
          <p>© {new Date().getFullYear()} pitchdeck.biz</p>
          <p>Built with Next.js on Vercel</p>
        </div>
      </footer>
    </div>
  );
}
