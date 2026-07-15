# AOLSim / Away Message

AOLSim is an early-2000s instant-messenger simulation prototype inspired by the supplied design plan. The working title is **Away Message**: a desktop-feeling social world where fictional contacts keep schedules, moods, memories, relationships, and offline lives that continue without the player.

## Current scope

This repository now contains a Phase 2 web prototype scaffold for the core experience. The built-in product plan lives in [`docs/away-message-plan.md`](docs/away-message-plan.md), so the roadmap can be referenced from git instead of screenshot uploads:

- Buddy list with Online, Away, and Offline groups.
- Five interconnected characters with schedules, moods, away messages, memories, motives, NPC-to-NPC relationships, and profile variants.
- One chat panel with persistent-feeling seeded history, typing delays, and first-message hooks.
- Deterministic world simulation utilities for daily life, availability, offline catch-up, absence recognition, NPC-initiated messages, knowledge boundaries, missed conversations, and shared world events.
- SQLite schema documentation for the intended local source of truth.
- Phase 2 UI panels that expose living-world events, private/public knowledge, relationship tension, and changing profiles.
- A safe API boundary stub that keeps model calls out of the browser/client.

## Development

```bash
npm install
npm run dev
npm run build
npm run typecheck
```

## North-star rule

> Characters must feel capable of having a day the player never hears about.

The simulation code intentionally controls reality. Language-model calls should only perform character dialogue and summarisation against curated context packages.
