export const sqliteSchema = `
CREATE TABLE IF NOT EXISTS characters (
  id TEXT PRIMARY KEY,
  screen_name TEXT NOT NULL,
  real_name TEXT NOT NULL,
  birthdate TEXT,
  location TEXT,
  profile_text TEXT,
  buddy_icon TEXT,
  current_song TEXT,
  away_message TEXT,
  typing_style_json TEXT NOT NULL,
  identity_json TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS character_traits (character_id TEXT, trait TEXT, value REAL, PRIMARY KEY(character_id, trait));
CREATE TABLE IF NOT EXISTS character_schedules (id TEXT PRIMARY KEY, character_id TEXT, weekday TEXT, activity TEXT, start_time TEXT, end_time TEXT, online_chance REAL);
CREATE TABLE IF NOT EXISTS relationships (from_character_id TEXT, to_character_id TEXT, label TEXT, trust REAL, fondness REAL, annoyance REAL, tension REAL, history_json TEXT, PRIMARY KEY(from_character_id, to_character_id));
CREATE TABLE IF NOT EXISTS world_events (id TEXT PRIMARY KEY, event_type TEXT, occurred_at TEXT, summary TEXT, location TEXT, cause TEXT, outcome TEXT, effects_json TEXT);
CREATE TABLE IF NOT EXISTS event_knowledge (event_id TEXT, character_id TEXT, source TEXT, confidence REAL, perspective TEXT, PRIMARY KEY(event_id, character_id));
CREATE TABLE IF NOT EXISTS memories (id TEXT PRIMARY KEY, owner_id TEXT, type TEXT, summary TEXT, confidence REAL, importance REAL, emotional_weight REAL, topics_json TEXT, created_at TEXT, source_conversation_id TEXT);
CREATE TABLE IF NOT EXISTS conversations (id TEXT PRIMARY KEY, character_id TEXT, started_at TEXT, last_message_at TEXT, summary TEXT);
CREATE TABLE IF NOT EXISTS messages (id TEXT PRIMARY KEY, conversation_id TEXT, sender_id TEXT, sent_at TEXT, body TEXT, delay_ms INTEGER, metadata_json TEXT);
CREATE TABLE IF NOT EXISTS story_threads (id TEXT PRIMARY KEY, title TEXT, state TEXT, importance REAL, next_check_at TEXT, participants_json TEXT, facts_json TEXT);
CREATE TABLE IF NOT EXISTS status_history (id TEXT PRIMARY KEY, character_id TEXT, status TEXT, message TEXT, started_at TEXT, ended_at TEXT);
CREATE TABLE IF NOT EXISTS player_profile (id TEXT PRIMARY KEY, screen_name TEXT, profile_text TEXT, buddy_icon TEXT, timezone TEXT, interests_json TEXT);
CREATE TABLE IF NOT EXISTS simulation_state (id TEXT PRIMARY KEY, current_time TEXT, last_closed_at TEXT, rng_seed TEXT, flags_json TEXT);
`;
