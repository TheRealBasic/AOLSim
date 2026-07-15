import { Character } from '../data/characters';
import { curatedContextPackage } from '../simulation/world';
export type DialogueResponse = { messages: { text: string; delayMs: number }[]; emotionalState: { primary: string; intensity: number }; relationshipChanges: Record<string, number>; memoriesToStore: { summary: string; importance: number }[]; };
export async function requestDialogue(character: Character, playerMessage: string): Promise<DialogueResponse> {
  const context = curatedContextPackage(character, playerMessage);
  // In production this request must go to a local/hosted backend, never directly from renderer code with an API key.
  const firstPhrase = character.typingStyle.commonPhrases[0] ?? 'wait';
  return { messages:[{ text:firstPhrase, delayMs:700 }, { text:`${context.currentConversation[0].text.length > 28 ? 'you seriously remembered that??' : 'yeah lol'}`, delayMs:1400 }], emotionalState:{ primary:'engaged', intensity:Math.min(1, character.mood.intensity+.08) }, relationshipChanges:{ trust:.02, fondness:.03 }, memoriesToStore:[{ summary:`Player said: ${playerMessage}`, importance:.42 }] };
}
