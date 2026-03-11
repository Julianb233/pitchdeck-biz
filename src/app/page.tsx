const features = [
  {
    title: "Story that closes",
    body: "We tighten the narrative so an investor can repeat it back to you — accurately.",
    tag: "Narrative",
  },
  {
    title: "Design that signals taste",
    body: "Typography, spacing, and hierarchy that feels expensive (without being loud).",
    tag: "Design",
  },
  {
    title: "Fast async iterations",
    body: "You send notes. We ship versions. No meetings unless you want one.",
    tag: "Workflow",
  },
  {
    title: "Numbers, but readable",
    body: "We turn messy metrics into clean slides with charts that can survive scrutiny.",
    tag: "Clarity",
  },
];

const processSteps = [
  {
    n: "01",
    title: "Input",
    body: "Doc, bullets, voice note, rough deck — whatever you have.",
  },
  {
    n: "02",
    title: "Structure",
    body: "We outline the story: problem → solution → why now → traction → ask.",
  },
  {
    n: "03",
    title: "Design",
    body: "We build the deck system: type scale, grid, components, visuals.",
  },
  {
    n: "04",
    title: "Ship",
    body: "Final deck delivered as Slides/PPT + PDF. Ready to send.",
  },
];

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#07070A] text-zinc-50">
      {/* atmospheric background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 left-1/2 h-[520px] w-[820px] -translate-x-1/2 rounded-full bg-gradient-to-tr from-fuchsia-500/25 via-indigo-400/10 to-cyan-400/20 blur-3xl" />
        <div className="absolute -bottom-56 left-[-10%] h-[520px] w-[720px] rounded-full bg-gradient-to-tr from-emerald-400/15 via-sky-400/10 to-violet-500/15 blur-3xl" />
        <div className="absolute inset-0 opacity-[0.18] [background-image:radial-gradient(circle_at_1px_1px,rgba(255,255,255,.28)_1px,transparent_0)] [background-size:24px_24px]" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/30 to-black/70" />
      </div>

      <header className="relative mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
        <a href="/" className="group inline-flex items-center gap-3">
          <span className="relative grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/5 shadow-[0_0_0_1px_rgba(255,255,255,.06)_inset]">
            <span className="h-2 w-2 rounded-full bg-gradient-to-tr from-cyan-300 to-fuchsia-300" />
          </span>
          <span className="text-sm font-semibold tracking-wide">
            <span className="text-white">pitchdeck</span>
            <span className="text-white/60">.biz</span>
          </span>
        </a>

        <nav className="hidden items-center gap-6 text-sm text-white/70 md:flex">
          <a href="#work" className="hover:text-white">
            Work
          </a>
          <a href="#process" className="hover:text-white">
            Process
          </a>
          <a href="#pricing" className="hover:text-white">
            Pricing
          </a>
          <a href="#faq" className="hover:text-white">
            FAQ
          </a>
        </nav>

        <a
          href="#cta"
          className="inline-flex h-10 items-center justify-center rounded-full bg-white px-4 text-sm font-semibold text-black hover:bg-zinc-100"
        >
          Get a deck
        </a>
      </header>

      <main className="relative">
        {/* HERO */}
        <section className="mx-auto w-full max-w-6xl px-6 pb-10 pt-10 md:pb-16 md:pt-14">
          <div className="grid gap-10 md:grid-cols-2 md:items-center">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-white/70">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-300/80" />
                Investor-ready pitch decks, shipped fast
              </p>

              <h1 className="mt-6 text-balance text-5xl font-semibold leading-[1.05] tracking-tight md:text-6xl">
                Make your story
                <span className="bg-gradient-to-r from-cyan-200 via-fuchsia-200 to-indigo-200 bg-clip-text text-transparent">
                  {" "}
                  feel inevitable.
                </span>
              </h1>

              <p className="mt-5 max-w-prose text-pretty text-lg leading-7 text-white/70">
                You bring the raw ingredients. We deliver a deck with crisp
                narrative, premium design, and a clear ask — ready for investors,
                partners, or customers.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row" id="cta">
                <a
                  href="mailto:julian@aiacrobatics.com?subject=Pitch%20deck%20request"
                  className="inline-flex h-12 items-center justify-center rounded-full bg-gradient-to-r from-white to-white/90 px-6 text-sm font-semibold text-black shadow-[0_10px_30px_rgba(255,255,255,.12)] hover:from-white hover:to-white"
                >
                  Request a deck
                </a>
                <a
                  href="#work"
                  className="inline-flex h-12 items-center justify-center rounded-full border border-white/15 bg-white/5 px-6 text-sm font-semibold text-white hover:bg-white/10"
                >
                  See what you get
                </a>
              </div>

              <div className="mt-6 grid grid-cols-3 gap-4 text-xs text-white/60">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                  <p className="text-white">48–72h</p>
                  <p className="mt-1">typical first draft</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                  <p className="text-white">Slides + PDF</p>
                  <p className="mt-1">deliverables</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                  <p className="text-white">Async</p>
                  <p className="mt-1">tight feedback loops</p>
                </div>
              </div>
            </div>

            {/* right column: deck preview */}
            <div className="relative">
              <div className="absolute -inset-4 rounded-[28px] bg-gradient-to-tr from-white/10 via-white/5 to-white/10 blur-2xl" />
              <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-white/5 shadow-[0_0_0_1px_rgba(255,255,255,.06)_inset]">
                <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
                  <p className="text-xs font-semibold tracking-wide text-white/70">
                    DECK PREVIEW
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-red-400/70" />
                    <span className="h-2 w-2 rounded-full bg-amber-300/70" />
                    <span className="h-2 w-2 rounded-full bg-emerald-300/70" />
                  </div>
                </div>

                <div className="grid gap-4 p-5 md:p-6">
                  <div className="rounded-2xl border border-white/10 bg-black/30 p-5">
                    <p className="text-xs text-white/60">Title</p>
                    <p className="mt-2 text-2xl font-semibold tracking-tight">
                      The fastest way to ship a credible pitch.
                    </p>
                    <p className="mt-2 text-sm text-white/70">
                      Problem → Solution → Traction → Ask
                    </p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-2xl border border-white/10 bg-black/30 p-5">
                      <p className="text-xs text-white/60">Market</p>
                      <p className="mt-2 text-sm text-white/80">
                        A simple story backed by numbers.
                      </p>
                      <div className="mt-4 h-20 rounded-xl bg-gradient-to-tr from-cyan-300/20 via-fuchsia-300/10 to-indigo-300/20" />
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-black/30 p-5">
                      <p className="text-xs text-white/60">Traction</p>
                      <p className="mt-2 text-sm text-white/80">
                        The proof slide investors actually care about.
                      </p>
                      <div className="mt-4 h-20 rounded-xl bg-gradient-to-tr from-emerald-300/20 via-sky-300/10 to-violet-300/20" />
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-black/30 p-5">
                    <p className="text-xs text-white/60">Ask</p>
                    <p className="mt-2 text-sm text-white/80">
                      Exactly what you’re raising, why, and what changes after.
                    </p>
                    <div className="mt-4 grid grid-cols-3 gap-2">
                      {Array.from({ length: 6 }).map((_, i) => (
                        <div
                          key={i}
                          className="h-8 rounded-lg border border-white/10 bg-white/5"
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section id="work" className="mx-auto w-full max-w-6xl px-6 py-10">
          <div className="flex items-end justify-between gap-8">
            <div>
              <h2 className="text-3xl font-semibold tracking-tight">What you get</h2>
              <p className="mt-2 max-w-prose text-sm leading-6 text-white/70">
                A tight story, a premium slide system, and a deck you can ship
                immediately.
              </p>
            </div>
            <p className="hidden text-sm text-white/60 md:block">
              Deliverables: Slides / PPT + PDF
            </p>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {features.map((f) => (
              <div
                key={f.title}
                className="group rounded-[26px] border border-white/10 bg-white/5 p-6 shadow-[0_0_0_1px_rgba(255,255,255,.06)_inset]"
              >
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold tracking-wide text-white/60">
                    {f.tag.toUpperCase()}
                  </p>
                  <span className="h-8 w-8 rounded-xl border border-white/10 bg-gradient-to-tr from-white/10 to-white/5" />
                </div>
                <h3 className="mt-4 text-xl font-semibold tracking-tight">
                  {f.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-white/70">{f.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* PROCESS */}
        <section id="process" className="mx-auto w-full max-w-6xl px-6 py-10">
          <div className="rounded-[34px] border border-white/10 bg-gradient-to-b from-white/10 to-white/5 p-7 shadow-[0_0_0_1px_rgba(255,255,255,.06)_inset] md:p-10">
            <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
              <div>
                <h2 className="text-3xl font-semibold tracking-tight">
                  How it works
                </h2>
                <p className="mt-2 max-w-prose text-sm leading-6 text-white/70">
                  Four steps. Tight feedback. Ship the deck.
                </p>
              </div>
              <p className="text-sm text-white/60">
                You can send input as a doc, a Loom, or a voice note.
              </p>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-4">
              {processSteps.map((s) => (
                <div
                  key={s.n}
                  className="rounded-3xl border border-white/10 bg-black/30 p-6"
                >
                  <p className="text-xs font-semibold text-white/60">{s.n}</p>
                  <p className="mt-3 text-lg font-semibold tracking-tight">
                    {s.title}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-white/70">
                    {s.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PRICING */}
        <section id="pricing" className="mx-auto w-full max-w-6xl px-6 py-10">
          <div className="flex items-end justify-between gap-8">
            <div>
              <h2 className="text-3xl font-semibold tracking-tight">Pricing</h2>
              <p className="mt-2 max-w-prose text-sm leading-6 text-white/70">
                Start simple. Upgrade if you need deeper narrative + visuals.
              </p>
            </div>
            <p className="hidden text-sm text-white/60 md:block">
              Custom scopes available
            </p>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              {
                name: "Starter",
                price: "$499",
                note: "Great for quick partner/customer decks",
                items: [
                  "Up to 10 slides",
                  "Copy polish",
                  "Design cleanup",
                  "1 revision",
                ],
              },
              {
                name: "Investor",
                price: "$1,500",
                note: "Best for fundraising",
                highlight: true,
                items: [
                  "Up to 15 slides",
                  "Narrative restructure",
                  "Charts + diagrams",
                  "3 revisions",
                ],
              },
              {
                name: "GTM+",
                price: "Custom",
                note: "Positioning, variants, ongoing support",
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
                className={
                  "relative rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-[0_0_0_1px_rgba(255,255,255,.06)_inset]" +
                  (p.highlight
                    ? " ring-1 ring-white/25 shadow-[0_30px_80px_rgba(99,102,241,.12)]"
                    : "")
                }
              >
                {p.highlight ? (
                  <div className="absolute -top-3 left-6 rounded-full bg-white px-3 py-1 text-xs font-semibold text-black">
                    Most popular
                  </div>
                ) : null}
                <div className="flex items-baseline justify-between">
                  <h3 className="text-lg font-semibold tracking-tight">
                    {p.name}
                  </h3>
                  <p className="text-2xl font-semibold">{p.price}</p>
                </div>
                <p className="mt-2 text-sm text-white/70">{p.note}</p>
                <ul className="mt-5 space-y-2 text-sm text-white/75">
                  {p.items.map((it) => (
                    <li key={it}>• {it}</li>
                  ))}
                </ul>
                <a
                  className={
                    "mt-6 inline-flex h-11 w-full items-center justify-center rounded-full px-5 text-sm font-semibold " +
                    (p.highlight
                      ? "bg-white text-black hover:bg-zinc-100"
                      : "border border-white/15 bg-white/5 text-white hover:bg-white/10")
                  }
                  href={`mailto:julian@aiacrobatics.com?subject=${encodeURIComponent(
                    `Pitch deck package — ${p.name}`
                  )}`}
                >
                  Start
                </a>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="mx-auto w-full max-w-6xl px-6 py-10 pb-16">
          <h2 className="text-3xl font-semibold tracking-tight">FAQ</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {[
              [
                "What do you need from me?",
                "A doc, bullets, or a Loom. If you have nothing, we can also start from a short questionnaire.",
              ],
              [
                "Can you match my brand?",
                "Yes — send a logo/colors, website, or a reference deck and we’ll align.",
              ],
              [
                "Do you write the content?",
                "We can. Best results come from your raw input + our structure/polish.",
              ],
              [
                "Do you do financial modeling?",
                "We format and present your numbers. Modeling itself is scoped separately.",
              ],
            ].map(([q, a]) => (
              <div
                key={q}
                className="rounded-[26px] border border-white/10 bg-white/5 p-6 shadow-[0_0_0_1px_rgba(255,255,255,.06)_inset]"
              >
                <p className="font-semibold tracking-tight">{q}</p>
                <p className="mt-2 text-sm leading-6 text-white/70">{a}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="relative border-t border-white/10">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-6 py-10 text-sm text-white/60 md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} pitchdeck.biz</p>
          <p className="text-white/50">
            Built with Next.js on Vercel • Designed for speed + clarity
          </p>
        </div>
      </footer>
    </div>
  );
}
