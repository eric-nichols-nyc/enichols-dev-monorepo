const SENTENCE_SPLIT = /(?<=[.!?])\s+/;

/** One readable line from long project copy (first sentence, bounded length). */
export function projectPreviewSentence(description: string, maxChars = 140): string {
  const trimmed = description.trim();
  if (!trimmed) {
    return "";
  }
  const segments = trimmed.split(SENTENCE_SPLIT);
  const first =
    segments[0]?.trimEnd() ??
    trimmed.slice(0, maxChars);
  const bounded =
    first.length <= maxChars
      ? first
      : `${first.slice(0, Math.max(0, maxChars - 1)).trim()}…`;
  return bounded;
}
