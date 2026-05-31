/** Split text into words and spaces so we can stream with preserved formatting */
const SPLIT_WORDS_AND_SPACES = /(\s+)/;

export type StreamCopyWriter = {
  write: (part: { type: string; id: string; delta?: string }) => void;
};

export async function streamCopy(
  writer: StreamCopyWriter,
  textId: string,
  copy: string
) {
  writer.write({ type: "text-start", id: textId });
  const words = copy.split(SPLIT_WORDS_AND_SPACES);
  for (const word of words) {
    writer.write({ type: "text-delta", id: textId, delta: word });
    await new Promise((r) => setTimeout(r, 20));
  }
  writer.write({ type: "text-end", id: textId });
}
