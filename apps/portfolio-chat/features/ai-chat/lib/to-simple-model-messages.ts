import type { UIMessage } from "@repo/ai";

export type SimpleModelMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export function toSimpleModelMessages(
  messages: UIMessage[]
): SimpleModelMessage[] {
  return messages
    .map((message) => {
      const content =
        message.parts
          ?.filter(
            (part): part is { type: "text"; text: string } =>
              part.type === "text"
          )
          .map((part) => part.text)
          .join("\n")
          .trim() ?? "";

      if (!content) {
        return null;
      }

      if (
        message.role === "user" ||
        message.role === "assistant" ||
        message.role === "system"
      ) {
        return {
          role: message.role,
          content,
        } satisfies SimpleModelMessage;
      }

      return null;
    })
    .filter((message): message is SimpleModelMessage => message !== null);
}
