# AOLSim / Away Message

AOLSim is an early-2000s instant-messenger simulation prototype inspired by the supplied design plan. The working title is **Away Message**: a desktop-feeling social world where fictional contacts keep schedules, moods, memories, relationships, and offline lives that continue without the player.

## Current scope

This repository now contains a Phase 1 web prototype scaffold for the core experience:

- Buddy list with Online, Away, and Offline groups.
- Four interconnected characters with schedules, moods, away messages, memories, and motives.
- One chat panel with persistent-feeling seeded history, typing delays, and first-message hooks.
- Deterministic world simulation utilities for availability, offline catch-up, absence recognition, and NPC-initiated messages.
- SQLite schema documentation for the intended local source of truth.
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
