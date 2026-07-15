export type StarterTranscriptMessage = {
  sender: string;
  body: string;
  at: string;
  pending?: boolean;
};

export const starterTranscriptsByCharacter: Record<string, StarterTranscriptMessage[]> = {
  char_kat_001: [
    { sender: 'PixelKat', body: 'hey\njay said you were asking about me lol', at: '21:00' },
  ],
  char_jay_002: [],
};
