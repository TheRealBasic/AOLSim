import { Character, ProfileVariant, RelationshipState, Status } from '../data/characters';
export type InitiationRecord = { characterId: string; reason: string; urgency: number; preferredMessageSeed: string; expiresAt: string };
export type WorldEvent = { id: string; eventType: string; participants: string[]; occurredAt: string; summary: string; location: string; publicKnowledge: boolean; knownBy: Record<string, string>; effects: Record<string, number> };
export type MissedConversation = { id: string; participants: string[]; summary: string; occurredAt: string; visibleToPlayer: boolean };
export type SimulatedCharacter = Character & { computedStatus: Status; activeBlock: string; profileChange?: ProfileVariant; relationshipPulse: RelationshipState[] };
export type DailySimulation = { simulatedAt: string; characters: SimulatedCharacter[]; worldEvents: WorldEvent[]; missedConversations: MissedConversation[]; knowledgeBoundaries: string[] };
export type OfflineCatchup = { hoursAbsent: number; worldEvents: string[]; missedMessages: InitiationRecord[]; absenceNotice: string; daily: DailySimulation };
const toMinutes = (time: string) => { const [h,m] = time.split(':').map(Number); return h*60+m; };
const timeKey = (now: Date) => Number(`${now.getMonth()+1}${now.getDate()}${now.getHours()}`);
const pick = <T,>(items: T[], seed: number) => items[Math.abs(seed) % items.length];
export function availabilityFor(character: Character, now = new Date()): Status {
  const day = now.toLocaleDateString('en-US', { weekday:'long' }).toLowerCase();
  const minute = now.getHours()*60 + now.getMinutes();
  const block = character.schedule[day]?.find(b => minute >= toMinutes(b.start) && minute <= toMinutes(b.end));
  if (!block || block.onlineChance < .2) return 'offline';
  if (character.awayMessage && (character.mood.intensity > .62 || block.onlineChance < .4)) return 'away';
  return 'online';
}
export function activeScheduleBlock(character: Character, now = new Date()) {
  const day = now.toLocaleDateString('en-US', { weekday:'long' }).toLowerCase();
  const minute = now.getHours()*60 + now.getMinutes();
  return character.schedule[day]?.find(b => minute >= toMinutes(b.start) && minute <= toMinutes(b.end));
}
export function profileForMood(character: Character, now = new Date()) {
  const moodMatch = character.profileVariants.find(v => v.triggerMood === character.mood.primary);
  return moodMatch ?? (character.profileVariants.length ? pick(character.profileVariants, timeKey(now) + character.id.length) : undefined);
}
export function buildInitiation(character: Character, now = new Date()): InitiationRecord | undefined {
  const status = availabilityFor(character, now);
  if (status === 'offline') return undefined;
  const reason = character.motives[0];
  if (!reason) return undefined;
  const urgency = Math.min(.95, character.mood.intensity + (status === 'away' ? -.18 : .12));
  if (urgency < .35) return undefined;
  return { characterId: character.id, reason, urgency, preferredMessageSeed: seedLineFor(character.screenName, reason), expiresAt: new Date(now.getTime()+1000*60*60*3).toISOString() };
}
function seedLineFor(screenName: string, reason: string) {
  if (screenName === 'PixelKat') return 'hey how did that thing go today?';
  if (screenName === 'xXS!rJayXx') return 'ben is being weird lol';
  if (screenName === 'benji88') return 'did jay say anything';
  if (screenName === 'MATT_ATTACK') return 'amy said there was drama?';
  return reason.includes('gossip') ? 'omg are you there' : 'hey';
}
export function simulateDailyLife(characters: Character[], now = new Date()): DailySimulation {
  const jay = characters.find(c => c.id === 'char_jay_002');
  const ben = characters.find(c => c.id === 'char_ben_003');
  const kat = characters.find(c => c.id === 'char_kat_001');
  const amy = characters.find(c => c.id === 'char_amy_004');
  const events: WorldEvent[] = [];
  if (jay && ben) events.push({ id:'evt_skate_argument', eventType:'social_conflict', participants:[jay.id, ben.id], occurredAt:new Date(now.getTime()-72e5).toISOString(), summary:'Jay and Ben argued after the skate park.', location:'skate_park', publicKnowledge:false, knownBy:{ [jay.id]:'participant, thinks Ben overreacted', [ben.id]:'participant, felt humiliated', [amy?.id ?? '']:'heard a slanted version from Jay' }, effects:{ jay_to_ben_annoyance:.12, ben_to_jay_trust:-.08 } });
  if (kat) events.push({ id:'evt_art_deadline', eventType:'deadline_pressure', participants:[kat.id], occurredAt:new Date(now.getTime()-30e5).toISOString(), summary:'Kat almost withdrew from the art competition before deciding to keep working.', location:'home', publicKnowledge:false, knownBy:{ [kat.id]:'participant' }, effects:{ kat_mood_intensity:.08 } });
  const missedConversations = events.map((event, index) => ({ id:`missed_${index+1}`, participants:event.participants, summary:event.summary, occurredAt:event.occurredAt, visibleToPlayer:event.publicKnowledge }));
  const simulatedCharacters = characters.map(c => ({ ...c, computedStatus: availabilityFor(c, now), activeBlock: activeScheduleBlock(c, now)?.activity ?? 'unaccounted-for offline time', profileChange: profileForMood(c, now), relationshipPulse: c.relationships.filter(r => r.tension > .5 || r.annoyance > .35) }));
  return { simulatedAt: now.toISOString(), characters: simulatedCharacters, worldEvents: events, missedConversations, knowledgeBoundaries:['Characters only know events they participated in, witnessed, were told about, or saw posted publicly.','Conflicting accounts are preserved as perspectives rather than resolved into one objective chat line.'] };
}
export function catchUpOffline(characters: Character[], lastClosedAt: Date, reopenedAt = new Date()): OfflineCatchup {
  const hoursAbsent = Math.max(0, (reopenedAt.getTime() - lastClosedAt.getTime()) / 36e5);
  const daily = simulateDailyLife(characters, reopenedAt);
  const worldEvents = hoursAbsent < 2 ? [] : daily.worldEvents.map(e => e.summary);
  const missedMessages = characters.map(c => buildInitiation(c, reopenedAt)).filter((x): x is InitiationRecord => Boolean(x));
  return { hoursAbsent, worldEvents, missedMessages, absenceNotice: absenceNotice(hoursAbsent), daily };
}
export function absenceNotice(hours: number) {
  if (hours >= 24*14) return 'hey\nbeen a while';
  if (hours >= 48) return 'oh wow you’re alive';
  if (hours >= 4) return 'where’d you disappear to lol';
  return '';
}
export function curatedContextPackage(character: Character, playerMessage: string, knownEvents: WorldEvent[] = []) {
  const visibleEvents = knownEvents.filter(e => e.publicKnowledge || Boolean(e.knownBy[character.id]));
  return { characterIdentity:{ id:character.id, screenName:character.screenName, realName:character.realName, profileText:character.profileText, interests:character.interests }, typingStyle: character.typingStyle, currentSituation: { mood:character.mood, status:character.status, awayMessage:character.awayMessage, activeBlock:activeScheduleBlock(character)?.activity }, relationshipWithPlayer:{ familiarity:.47, trust:.51, fondness:.63, annoyance:.08, curiosity:.72 }, npcRelationships: character.relationships, relevantMemories: character.memories.slice(0,4), currentConversation:[{ speaker:'player', text:playerMessage }], knownWorldEvents: visibleEvents, communicationRules:['Never describe actions like a roleplay narrator.','Write only chat messages.','Do not claim knowledge the character does not possess.','It is acceptable to misunderstand or not know things.','Keep messages consistent with 2004 technology and culture.'] };
}
