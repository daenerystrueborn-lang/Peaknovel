const PROFANITY_LIST = [
  "fuck", "shit", "ass", "bitch", "cunt", "damn", "bastard",
  "asshole", "dick", "piss", "cock", "pussy", "whore", "slut",
  "nigger", "faggot", "retard", "motherfucker",
];

export function containsProfanity(text: string): boolean {
  const lower = text.toLowerCase();
  return PROFANITY_LIST.some((word) => {
    const regex = new RegExp(`\\b${word}\\b`, "i");
    return regex.test(lower);
  });
}

export function filterProfanity(text: string): string {
  let result = text;
  for (const word of PROFANITY_LIST) {
    const regex = new RegExp(`\\b${word}\\b`, "gi");
    result = result.replace(regex, "*".repeat(word.length));
  }
  return result;
}
