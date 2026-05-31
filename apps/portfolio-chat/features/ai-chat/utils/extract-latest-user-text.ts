import type { UIMessage } from "@repo/ai";

export function extractLatestUserText(messages: UIMessage[]): string | null {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const message = messages[index];
    if (message.role !== "user") {
      continue;
    }

    const text =
      message.parts
        ?.filter(
          (part): part is { type: "text"; text: string } => part.type === "text"
        )
        .map((part) => part.text)
        .join("\n")
        .trim() ?? "";

    if (text) {
      return text;
    }
  }

  return null;
}
