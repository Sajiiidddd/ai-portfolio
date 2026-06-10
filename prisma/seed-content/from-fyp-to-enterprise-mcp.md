# **From an Award-Winning Final-Year Project to Enterprise MCP**

*How a college research assistant taught me the ideas that — less than a year later — would keep a production MCP from quietly setting an enterprise on fire.*

There's a version of this story that's just a list of features. I'd rather tell you the other one: how the **same idea** showed up twice in my life, barely eight months apart, wearing completely different clothes. The first time it was a final-year project that won an award and got accepted for publication. The second time it was a piece of infrastructure at my company that a support team now leans on every day. Both were built on the **Model Context Protocol**. Only one of them could afford to fail — and that difference is the whole point of this post.

---

## It started as a final-year project

My final-year project was called **MCP Deep Researcher** — a research assistant for people drowning in academic papers. The pitch was simple: instead of a chatbot that confidently makes things up, build an agent that *actually retrieves*, reasons over what it found, and tells you where it got it.

Under the hood it was a **Retrieval-Augmented Generation** system with a few opinions of its own. The one I'm proudest of was **adaptive similarity thresholding** — rather than blindly returning the top-k matches, the system tuned how strict it was about relevance based on the query, so a vague question didn't drag in noise and a precise one didn't get starved. Around that sat **modular components** — retrieval, storage, indexing, and inference were each their own clean boundary, swappable and testable in isolation.

It worked. It won **Best Final-Year Project** at my university, and the paper — *"MCP Deep Researcher: Smart Search, Reliable Research, Strong Collaboration"* — was accepted at **ICT4SD 2026** for an oral presentation and publication in **Springer's LNNS** series.

But the thing I actually *learned* wasn't in the abstract. It was this:

> The model was never the hard part. The plumbing around the model was the entire job.

Anyone can wire an LLM to a vector store and get a demo. Making it return the *right* thing, *reliably*, every time, without embarrassing itself — that's where all the real engineering hides. I didn't have the words for it yet, but I'd just spent a year learning that **an AI system is only as trustworthy as its weakest guardrail.** Keep that sentence in mind.

---

## So what is MCP, really?

If you haven't met it: the **Model Context Protocol** is a standard way to give a language model *hands*. Instead of an LLM that can only talk, MCP lets it call **tools** (do things) and read **resources** (see things) through a consistent interface. A "Zendesk MCP server," for example, is a program that exposes Zendesk's capabilities — list tickets, search users, update a macro — as tools an AI assistant can actually invoke.

Here's the trap, and it's a good one: **MCP is gloriously easy to demo and deceptively hard to ship.** A weekend project that wraps three API calls will dazzle in a screen-share. The same code, pointed at a real company's data, with a real LLM deciding what to call and how often, is a liability waiting for a quiet Tuesday afternoon to introduce itself.

That gap — between the demo and the deployment — is the "enterprise" in *enterprise MCP*.

---

## The gap at AppZen: the Zendesk MCP that didn't exist

When I joined AppZen, our global support function ran on **Zendesk**. The dream was obvious: let our AI assistants *operate* Zendesk directly — triage, search, summarize, act — instead of a human ferrying context back and forth.

There was just one problem. **There was no official Zendesk MCP server.** Not from Zendesk, not a credible open one. If we wanted it, we had to build it. So I did — but this time the stakes were inverted from my college project. A research assistant that returns a slightly-off citation is an inconvenience. An MCP wired into a live support platform that gets it wrong can spam an API into a ban, mutate the wrong ticket, or leak data it had no business touching.

The lesson from the final-year project came back, louder: *as trustworthy as its weakest guardrail.* Except now "untrustworthy" had a blast radius.

---

## Why a naive MCP is a liability

Before the solutions, it's worth being honest about how a careless MCP fails — because every guardrail I'll describe exists to answer a specific one of these:

- **Rate-limit storms.** LLMs are *enthusiastic*. Ask one to "review all open tickets" and it will happily fire hundreds of calls in a burst, hit the API's rate limit, and either crash or get the whole integration throttled.
- **Runaway loops.** An agent that paginates "until done" with no ceiling can walk off a cliff — fetching forever, or re-fetching in circles, burning quota and time.
- **Destructive or hallucinated tool calls.** The model can confidently invoke a write it shouldn't, with arguments it invented. Without a safety net, "update ticket" becomes "update the *wrong* ticket."
- **Data over-exposure.** A tool that returns everything hands the model — and whatever it's connected to — far more than the task needed.
- **Silence.** When something does go wrong, a naive server gives you no idea *what* it did or *how much* it cost. You can't debug what you can't see.

Put plainly:

| | Toy MCP | Enterprise MCP |
|---|---|---|
| API calls | Fire and hope | Pooled, throttled, backed-off |
| Pagination | "Until done" | **Bounded**, batched, capped |
| Writes | Trust the model | Validated, scoped, reversible |
| Failures | Crash the tool | Retry, degrade, report |
| Observability | None | Every call accounted for |
| Blast radius | Unknown | **Designed in advance** |

The rest of this post is the right-hand column.

---

## Layer 1 — Treat the API as a finite, shared resource

The first mental shift is to stop thinking of the downstream API as infinite. It's a **shared, finite resource** you're borrowing on behalf of an excitable agent, and your server is the responsible adult in the room.

That responsibility shows up as a few concrete habits. **Connection pooling** — one well-managed HTTP client reused across every call, with the auth handshake computed once, rather than a fresh, expensive connection per request. **Honoring the platform, not fighting it** — when Zendesk says "you're going too fast" with a `429` and a `Retry-After`, the server *waits exactly that long* instead of hammering blindly; the API is telling you the speed limit, so drive it. And **proactive backpressure** — rather than only reacting to errors, the server paces itself, easing off after long runs of calls so it never reaches the cliff edge in the first place.

The subtle one is **pagination as a budget**. When the agent wants "all of something," the server fetches in **bounded batches** with a hard ceiling — concurrently where it's safe, but never an open-ended "keep going until the API gives up." The model gets its data; the integration never becomes the reason an entire team's Zendesk goes dark.

> Reacting to rate limits keeps you alive. *Anticipating* them keeps you fast.

---

## Layer 2 — Guardrails: make the safe path the default

A guardrail isn't a wall that says *no*. It's a shape that makes the **right thing the easy thing** and the dangerous thing require deliberate effort.

In practice that means **validating and scoping inputs** before they ever reach the API — a search is bounded, a fetch is for a specific thing, defaults are conservative. It means **shaping outputs** so a tool returns what the task needs and not a firehose of fields the model has to wade through (and might leak). It means **caching what doesn't change** — schemas and metadata get a short time-to-live cache so the server isn't re-asking the platform the same structural question dozens of times a minute.

And critically, it means **observability is built in, not bolted on.** Every tool result carries a small accounting block — how many records, how many underlying API calls it actually took. When something behaves strangely, you can *see* the cost and the shape of what happened instead of guessing. A guardrail you can't observe is just a hope.

---

## Layer 3 — A firewall against derailment

This is the layer I care about most, and it's the one most people skip.

Assume the model **will** go off the rails. Not because it's bad, but because that's the nature of a probabilistic system handed real capabilities. The job of an enterprise MCP isn't to make derailment impossible — it's to make sure that **when it happens, nothing irreversible does.** Think of it less like a fence and more like a **firewall**: traffic is allowed, but it passes through a layer that knows what *should* never get through.

Concretely, that firewall is made of a few principles:

- **Bounded everything.** No loop without a ceiling, no fetch without a cap. An agent can be wrong; it can't be wrong *unboundedly*.
- **Reversible by default for anything that writes.** Destructive actions are the ones that need the most friction — validation, scoping, and a clear, auditable trail — so a confident-but-wrong call is recoverable, not catastrophic.
- **Least privilege, on purpose.** A tool can only reach what its job requires. The model never gets a skeleton key just because it asked nicely.
- **A guarded escape hatch, not an open door.** There's always a long tail of "but I need to do *this one weird thing*." A raw, lower-level access path exists for power users — but it lives behind the same accounting and the same guardrails as everything else, so the escape hatch can't become the hole in the firewall.

The goal is a system where the *worst* an off-the-rails agent can do is waste a little time — never quietly corrupt data or knock out an integration.

---

## Design for the agent, not the API

There's a design instinct that only clicks once you've watched an LLM use your tools: **you're not building an API wrapper, you're building an interface for a reasoner.**

A one-to-one mapping of every API endpoint to a tool is the lazy version — and it makes the model do too much bookkeeping, which is exactly when it starts making mistakes. The better move is **composite tools**: a single tool that does the obvious multi-step thing the agent actually wants, fanning out the underlying calls concurrently and handing back one clean, reasoned-over result. Fewer round-trips, fewer chances to wander, fewer tokens spent narrating its own confusion.

The same philosophy that made the final-year project reliable — *clean modules with sharp boundaries* — is what makes an MCP pleasant for a model to use. You're designing the **ergonomics of a mind that thinks in language.**

---

## Two servers, one discipline

The Zendesk MCP ended up as **two servers** — an engineering-facing one and an execution-facing one — together exposing **77+ tools**. That split isn't an accident; it's the least-privilege idea made structural. Different audiences, different capabilities, different blast radii, separated by design rather than by a comment in the code that says *"please be careful."*

It's MIT-licensed and installable in a single command, because the other half of "enterprise-grade" is that other engineers can actually *adopt* it without a week of setup. The discipline that keeps it safe is the same discipline that makes it shareable: clear boundaries, conservative defaults, and nothing hidden.

---

## What "enterprise-grade" actually means

If I had to compress everything above into a checklist I'd hand my past, final-year-project self:

- **Nothing is unbounded.** Every loop, fetch, and retry has a ceiling.
- **The platform's limits are instructions, not obstacles.** Pace yourself; honor the back-off.
- **The safe path is the default path.** Make danger require intent.
- **Writes are reversible and accountable.** Confidence is not correctness.
- **Every call is visible.** You can't trust what you can't measure.
- **Tools fit the reasoner, not the spec.** Compose; don't dump.
- **Least privilege is structural**, not a promise.

None of these are about the model. They're about everything *around* the model — which, it turns out, is the whole job. The same thing my final-year project tried to teach me, now with consequences.

---

## The through-line

I find it a little funny that the most important thing I built in college and the most important thing I've built at work are, at their core, **the same idea handled with different levels of fear.** The research assistant taught me that intelligence is cheap and reliability is expensive. The enterprise MCP made me *pay* for that reliability, in guardrails and rate limiters and a firewall that assumes the worst so the worst never arrives.

If you're building your own MCP — for Zendesk or anything else — start from the assumption that it will be used harder, more often, and more creatively than you designed for. Then build the thing that survives that. The demo is the easy 20%. The other 80% is the part nobody claps for, and it's the only part that matters once real people are depending on it.

*Strong with the Source — both the Force, and the open one.*
