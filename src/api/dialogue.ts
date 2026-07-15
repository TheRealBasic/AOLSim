import { Character } from '../data/characters';
import { InitiationRecord, WorldEvent, curatedContextPackage } from '../simulation/world';
export type DialogueResponse = { messages: { text: string; delayMs: number }[]; emotionalState: { primary: string; intensity: number }; relationshipChanges: Record<string, number>; memoriesToStore: { summary: string; importance: number }[]; };
const privateEventPrompt = (character: Character, event: WorldEvent) => {
  const knowledge = event.knownBy[character.id] ?? '';
  if (event.eventType === 'social_conflict') return knowledge.includes('overreacted') ? 'ben is making the skate thing way bigger than it was' : 'I hate that everyone saw the skate park thing.';
  if (event.eventType === 'deadline_pressure') return 'I almost bailed on the art competition, which is pathetic, but whatever.';
  return event.summary;
};
export async function requestDialogue(character: Character, playerMessage: string, knownEvents: WorldEvent[] = [], initiation?: InitiationRecord): Promise<DialogueResponse> {
  const context = curatedContextPackage(character, playerMessage, knownEvents);
  // In production this request must go to a local/hosted backend, never directly from renderer code with an API key.
  const firstPhrase = character.typingStyle.commonPhrases[0] ?? 'wait';
  const knownPrivateEvent = context.knownWorldEvents.find(event => !event.publicKnowledge);
  const publicEvent = context.knownWorldEvents.find(event => event.publicKnowledge);
  const motiveReply = initiation && initiation.urgency > .6 ? initiation.preferredMessageSeed : undefined;
  const boundaryAwareReply = knownPrivateEvent
    ? privateEventPrompt(character, knownPrivateEvent)
    : publicEvent
      ? `everyone saw ${publicEvent.summary.toLowerCase()}`
      : character.mood.intensity > .65
        ? `sorry i'm ${character.mood.primary} about ${character.mood.reason}`
        : `${context.currentConversation[0].text.length > 28 ? 'you seriously remembered that??' : 'yeah lol'}`;
  const messages = [
    { text:firstPhrase, delayMs:700 },
    { text:motiveReply ?? boundaryAwareReply, delayMs:1400 },
  ];
  return { messages, emotionalState:{ primary:'engaged', intensity:Math.min(1, character.mood.intensity+.08) }, relationshipChanges:{ trust:.02, fondness:.03 }, memoriesToStore:[{ summary:`Player said: ${playerMessage}`, importance:.42 }] };
}
