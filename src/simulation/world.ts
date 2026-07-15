import { Character, Status } from '../data/characters';
export type InitiationRecord = { characterId: string; reason: string; urgency: number; preferredMessageSeed: string; expiresAt: string };
export type OfflineCatchup = { hoursAbsent: number; worldEvents: string[]; missedMessages: InitiationRecord[]; absenceNotice: string };
const toMinutes = (time: string) => { const [h,m] = time.split(':').map(Number); return h*60+m; };
export function availabilityFor(character: Character, now = new Date()): Status {
  const day = now.toLocaleDateString('en-US', { weekday:'long' }).toLowerCase();
  const minute = now.getHours()*60 + now.getMinutes();
  const block = character.schedule[day]?.find(b => minute >= toMinutes(b.start) && minute <= toMinutes(b.end));
  if (!block || block.onlineChance < .2) return 'offline';
  if (character.awayMessage && (character.mood.intensity > .62 || block.onlineChance < .4)) return 'away';
  return 'online';
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
  return reason.includes('gossip') ? 'omg are you there' : 'hey';
}
export function catchUpOffline(characters: Character[], lastClosedAt: Date, reopenedAt = new Date()): OfflineCatchup {
  const hoursAbsent = Math.max(0, (reopenedAt.getTime() - lastClosedAt.getTime()) / 36e5);
  const worldEvents = hoursAbsent < 2 ? [] : ['Jay and Ben argued after leaving the skate park.'];
  if (hoursAbsent > 24) worldEvents.push('Kat almost withdrew from the art competition, then changed her mind.');
  const missedMessages = characters.map(c => buildInitiation(c, reopenedAt)).filter((x): x is InitiationRecord => Boolean(x));
  return { hoursAbsent, worldEvents, missedMessages, absenceNotice: absenceNotice(hoursAbsent) };
}
export function absenceNotice(hours: number) {
  if (hours >= 24*14) return 'hey\nbeen a while';
  if (hours >= 48) return 'oh wow you’re alive';
  if (hours >= 4) return 'where’d you disappear to lol';
  return '';
}
export function curatedContextPackage(character: Character, playerMessage: string) {
  return { characterIdentity:{ id:character.id, screenName:character.screenName, realName:character.realName, profileText:character.profileText, interests:character.interests }, typingStyle: character.typingStyle, currentSituation: { mood:character.mood, status:character.status, awayMessage:character.awayMessage }, relevantMemories: character.memories.slice(0,4), currentConversation:[{ speaker:'player', text:playerMessage }], knownWorldEvents: character.memories.filter(m => /Jay|Ben|competition/.test(m)), communicationRules:['Never describe actions like a roleplay narrator.','Write only chat messages.','Do not claim knowledge the character does not possess.','It is acceptable to misunderstand or not know things.','Keep messages consistent with 2004 technology and culture.'] };
}
