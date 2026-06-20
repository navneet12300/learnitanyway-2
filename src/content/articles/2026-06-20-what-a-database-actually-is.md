---
title: "What a database actually is"
date: 2026-06-20
description: "Past the SQL prompt, a database is a story about durability, ordering, and trust. A first pass at the mental model I wish I'd had earlier."
tags: ["databases", "systems"]
---

Most people's mental model of a database looks like this: you send it data, it stores the data, you ask for the data back.

That's not wrong. But it's incomplete in ways that matter.

## The three jobs of a database

A database does three things that are easy to take for granted:

1. **Durability** — when it says "committed", it means it. Power failure, crash, kernel panic — the data survives.
2. **Ordering** — concurrent writes don't corrupt each other. Transactions happen in some consistent sequence even when they arrive simultaneously.
3. **Queryability** — you can retrieve data efficiently, not just by scanning every row.

Everything else — replication, partitioning, indexing, MVCC — is a solution to one of these three problems at scale.

## Why this matters

When you understand that a database is fundamentally solving durability + ordering + queryability, you stop treating it as a black box and start asking better questions.

"Why is this query slow?" becomes: which of the three jobs is bottlenecking?

"Should I use Postgres or MongoDB?" becomes: what trade-offs am I making on ordering and queryability?

"What does 'eventually consistent' mean?" becomes: which of the three jobs are you relaxing, and why?

The SQL prompt is just the interface. Understanding is underneath it.
