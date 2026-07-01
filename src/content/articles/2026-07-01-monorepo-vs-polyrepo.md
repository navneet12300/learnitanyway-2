---
title: "Organising Your Codebase: Monorepo vs. Polyrepo"
date: 2026-07-01
description: "Most teams decide how many repos to use by accident. Google has 10,000+ engineers in one repo. Here's why — and how to decide what's right for your team."
tags: ["architects-mindset", "software-architecture", "system-design", "learning-in-public"]
---

Your 3 developers are fighting over merge conflicts.

Google has 10,000+ engineers committing to **one** repository. Two billion lines of code. Hundreds of folders. One repo.

Sounds impossible, right?

It's not. And the reason it works is the whole point of this article.

---

*This is Day 2 of [The Architect's Mindset](/roadmap) — a series on the decisions behind modern software systems. [Day 1 covered how your system runs](/articles/2026-06-29-monolith-vs-microservices-modular-monolith-serverless) — monolith vs microservices. Today we look at something that comes before that, and that most teams decide by accident: **how many Git repositories your code lives in.***

---

Imagine your company builds three things: a backend API, a frontend web app, and a shared library that both of them use.

The shared library is things both sides need — type definitions, authentication logic, utility functions, validation schemas. It's not a product. It's shared plumbing that lives between your backend and frontend.

Here's how you can organise that:

**Monorepo** — all three live in **one** repository.

```
company-repo/
├── api/        ← backend
├── web/        ← frontend
└── shared/     ← types, auth helpers, utils used by both
```

One `git clone` and you have everything. One place. One history. When you change something in `shared/`, the API and the web app that use it are *right there* — you can update all three in a single commit.

**Polyrepo** — each thing gets its **own** repository.

```
company-api/       ← backend, repo 1
company-web/       ← frontend, repo 2
company-shared/    ← shared library, repo 3
```

Three separate clones. Three separate histories. The shared library is now published like a package, and the API and web app install a *version* of it. Change the shared library, and you have to release a new version, then go update it in the other two repos, one by one.

That's the surface difference. Here's the part nobody tells you:

> **This is not a folder decision. It's a coordination decision.**
>
> The real thing you're choosing is your *unit of change*. In a monorepo, "update the API and the frontend that uses it" is one commit, one PR, merged together or not at all. In a polyrepo, the same change is two PRs in two repos — and there's a window where one is merged and the other isn't. Someone pulls in that window. Something breaks.
>
> Everything else — build times, tooling, access control — flows from this one difference.

---

## A Monorepo Is Not a Monolith

Kill this confusion now, because it stops people from making the right call.

- **Monorepo** = how your *code is organised*. How many repos.
- **Monolith** = how your *app runs*. One deployable unit, or many.

These are unrelated.

You can run 20 independent microservices out of a single monorepo — Google does exactly that. You can also have one bloated monolith smeared across five repos and call it "microservices."

The repo count says nothing about how your system runs.

So if someone says *"we can't use a monorepo, we do microservices"* — that sentence doesn't make sense. They're answering a different question.

---

## When to Use What

**Reach for monorepo when:**
- One change often touches multiple projects
- You share a lot of code — types, auth, models, UI components
- Your team ships together, not on separate schedules
- You're small-to-mid sized and want one source of truth

**Reach for polyrepo when:**
- Teams genuinely move independently, on their own release cadence
- You need a hard security boundary — a contractor sees repo A, never repo B
- You're open-sourcing one piece but keeping the rest private

Notice what's *not* on the polyrepo list: "it feels cleaner." That's the trap. Teams split repos for aesthetics and pay for it in coordination for years.

> **The asymmetry matters.**
>
> Monorepo → polyrepo is a clean split later.
> Polyrepo → monorepo is a painful merge with lost history.
>
> **When unsure, start together.**

If you're a small team with shared code shipping together — that's most of us — monorepo is almost always the right call.

---

## How Does Google Survive One Repo?

Here's the honest catch. A monorepo has one enemy: **scale.**

Picture it. Your repo is big now. You add one small thing — a single `if` condition in one service. You commit. And your CI rebuilds the *entire* repo. Every service. Every frontend. Everything.

That one-line change just cost you a **30-minute build.**

Do that ten times a day and your afternoon is gone. This is the exact wall most teams hit right before they wrongly say *"monorepos don't scale."*

They scale. You just need a build system smarter than "rebuild everything."

Two ideas fix it:

**1. Dependency graph.** The tool maps what depends on what. You changed service A — it knows services B and C never touch A. So it rebuilds *only* A and whatever actually uses it. The rest is skipped. This is called an **affected build**.

**2. Caching.** If a project's inputs haven't changed since last time, don't rebuild it — reuse the old result. With *remote* caching, if a teammate already built it, you just download their result instead. Nobody builds the same unchanged thing twice.

> Put those together and that 30-minute build becomes a 30-second one. Not because your machine got faster — **because it stopped doing the 90% of work it never needed to do.**

**This is exactly how Google survives.** They built two custom systems for it:

- **Piper** — their version control. Plain Git couldn't handle a repo this size.
- **Blaze** — their build system. Runs the dependency-graph + caching idea at massive scale, rebuilding only affected dependencies on every commit.

The numbers: as of 2016, over **2 billion lines of code** across ~86 TB, with **40,000 commits a day** by more than 10,000 engineers. About 95% of Google's code sits in that one repo. *(Source: Potvin & Levenberg, Communications of the ACM, 2016.)*

You'll never be Google. But Blaze has an open-source version you *can* use. Three options, depending on your stack:

- **Bazel** — the public version of Blaze. Language-agnostic, very powerful, brutal learning curve. Overkill unless you're genuinely large.
- **Nx** — JS/TS-focused. Dependency graph, caching, scaffolding, lots of structure. Popular in the Node world.
- **Turborepo** — from Vercel. Deliberately minimal. Tell it your projects and what depends on what — it does the graph and caching and stays out of your way. Easiest starting point for a Next.js or Node stack.

All three do the same two things: **build only what changed, cache what didn't.**

That's 90% of monorepo tooling in one sentence.

---

## When to Actually Add Tooling

Here's where people go wrong in the *other* direction — they bolt Nx onto a two-project repo on day one and drown in config for a problem they don't have yet.

The honest sequence:

1. Start with a plain monorepo — folders, workspace config, clean imports. No special tooling.
2. Feel the pain. When CI gets slow enough to annoy you *daily* — that's the signal.
3. Then add a tool. Turborepo first for a JS/Next.js stack. Nx if you want more structure. Bazel basically never, unless a company hands it to you.

**These tools are painkillers. Don't take painkillers before you have the pain.**

The tooling doesn't *make* your repo a monorepo — your folders already did that. It just makes a *big* monorepo fast.

---

> **The Architect's Rule**
>
> *Split repos when teams need to move independently — not when code needs to look organised.*
>
> Repo boundaries are for people coordination, not code aesthetics.

---

*That's Day 2.*

*Next up: your codebase needs internal walls so it doesn't rot into a mess — that's the Modular Monolith, where we draw clean boundaries inside one codebase.*

*[← Back to all articles](/articles)*
