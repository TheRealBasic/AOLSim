# Away Message Built-in Design Plan

This repository keeps the product plan in git so future work can refer to the design without re-uploading screenshots.

## Core idea

**Away Message** is an early-2000s desktop instant-messenger simulator inspired by AIM, MSN Messenger, and Yahoo Messenger without copying their branding. Contacts are not disposable chatbots or dialogue trees: they are persistent fictional people living alongside the player.

The central design rule is:

> The AI writes the conversation, but the game engine controls reality.

The game maintains facts, schedules, relationships, knowledge boundaries, memories, and events. A language model may perform character dialogue from a curated context package, but it must not invent the entire world state from scratch.

## Player experience

The player creates a screen name, profile, buddy icon, short bio, timezone, and optionally an age bracket/interests. They enter a small fictional social network where buddies sign in, go away, disappear, message first, change profiles, and remember past conversations.

Characters should feel like they have days the player never hears about. A buddy might return from the skate park, leave because a parent needs the computer, hear gossip from another NPC, or react differently after the player has been absent for hours, days, or weeks.

## Four-layer character system

1. **Immutable identity**: screen name, real name, household, core traits, interests, typing style, and other facts that rarely change.
2. **Current life state**: mood, current concerns, recent events, active goals, schedule, and current availability.
3. **Relationship state**: familiarity, trust, fondness, annoyance, curiosity, unresolved topics, boundaries, and NPC-to-NPC relationships.
4. **Memory**: episodic memories, semantic facts, and subjective impressions.

## Living-world simulation

The world advances even when nobody is chatting. Each simulated day should generate a small number of events based on character schedules, relationships, current story threads, and randomness. Knowledge boundaries are crucial: Kat should not know about a Jay/Ben argument unless she witnessed it, was told about it, saw a public post, or heard it through another character.

When the player closes the game, save a timestamp. On return, calculate elapsed real time, run a lightweight catch-up simulation, generate important events, update moods/schedules/relationships, add missed messages, and decide whether anyone noticed the player’s absence.

## Conversation generation

Every dialogue request should contain a curated context package, not the whole database. Include identity, typing style, current situation, relationship to player, relevant memories, current conversation, known world events, and communication rules:

- Never describe actions like a roleplay narrator.
- Write only chat messages.
- Do not claim knowledge the character does not possess.
- It is acceptable to misunderstand or not know things.
- Keep messages consistent with 2004 technology and culture.

Responses should be structured so the engine can validate messages, typing delays, emotional state, relationship deltas, new memories, and possible follow-up reminders.

## API safety

Never put an unrestricted OpenAI API key in the browser JavaScript or a distributed desktop client. Use a local or hosted backend, authenticate game installations, validate request shape, apply usage limits, cache suitable outputs, track spending, and reject prompt-injection attempts from player messages.

## Technical stack direction

The intended prototype stack is Electron or a web scaffold, TypeScript, React or vanilla TypeScript for the interface, SQLite for persistent local data, a backend boundary for API calls, and CSS built around a 2002 desktop-software aesthetic. SQLite should be the source of truth; JSON is useful inside columns but should not become one giant save file.

## Roadmap

### Phase 1 — The convincing chat prototype

Build a buddy list, one chat window, three or more characters, online/offline schedules, local SQLite schema, API-powered reply boundary, persistent-feeling conversation history, basic memories, typing delays, away messages, and characters initiating conversations.

Success condition: after three evenings, at least one character remembers something personal, references an offline event, and messages without being prompted.

### Phase 2 — Living characters

Add daily simulation, character moods, jobs/school/home schedules, NPC-to-NPC relationships, shared world events, knowledge boundaries, missed conversations, absence reactions, and changing profile text/buddy icons.

### Phase 3 — The social world

Add six to ten interconnected characters, gossip propagation, group conversations, conflicting accounts, friendship and relationship arcs, fictional websites/blogs, shared images/files, and character-specific notification habits.

### Phase 4 — Game structure

Add calendar progression, optional authored story arcs, player choices through normal conversation, endings based on accumulated relationships/events, new-game profiles, replay variation, exportable chat logs, and accessibility/content controls.

### Phase 5 — Full period authenticity

Add multiple visual themes, dial-up connection sequence, optional CRT effects, period-appropriate emoticons, fake media player integration, desktop notifications, mail inbox, profile editors, custom buddy groups, original startup/sign-off sounds, and fictional early-web pages.

## Smartest first version

Build one intense, believable week featuring four characters, one interconnected friendship group, seven real-time days, about twelve major world events, character schedules, persistent memory, characters who message first, and one visual asset pack. No romantic requirement and no conventional dialogue choices: the player types anything they like.
