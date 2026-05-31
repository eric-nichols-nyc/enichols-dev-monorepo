import type { UIMessage } from "ai";

type MessagePart = {
  type: string;
  state?: string;
  text?: string;
};

export function isToolPartLoading(part: MessagePart): boolean {
  return (
    (part.type.startsWith("tool-") || part.type.startsWith("tool-show")) &&
    (part.state === "input-available" || part.state === "input-streaming")
  );
}

export function partHasVisibleOutput(part: MessagePart): boolean {
  if (part.type === "text" && part.text?.trim()) {
    return true;
  }
  if (part.type === "data-related") {
    return true;
  }
  if (
    (part.type.startsWith("tool-") || part.type.startsWith("tool-show")) &&
    part.state === "output-available"
  ) {
    return true;
  }
  return false;
}

export function getAssistantThinkingVariant({
  parts,
  status,
  isActiveAssistant,
}: {
  parts: MessagePart[];
  status: "streaming" | "submitted" | "ready" | "error";
  isActiveAssistant: boolean;
}): "active" | "complete" | null {
  if (!isActiveAssistant) {
    return null;
  }

  const hasLoading = parts.some(isToolPartLoading);
  const hasOutput = parts.some(partHasVisibleOutput);

  if (status === "streaming" && hasOutput) {
    return "complete";
  }
  if (status === "ready" && parts.length > 0) {
    return "complete";
  }
  if (status === "streaming" && (hasLoading || !hasOutput)) {
    return "active";
  }
  if (status === "submitted") {
    return "active";
  }

  return null;
}

export function messageParts(msg: UIMessage): MessagePart[] {
  return (msg.parts ?? []) as MessagePart[];
}
