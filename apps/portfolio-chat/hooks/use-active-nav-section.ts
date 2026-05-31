import type { UIMessage } from "ai";
import { useMemo } from "react";
import { NAV_ITEMS, type NavItemId } from "@/components/constants";

const TOOL_TYPE_TO_NAV_ID: Record<string, NavItemId> = {
  "tool-show_projects": "projects",
  "tool-showProjects": "projects",
  "tool-show_about": "about",
  "tool-showAbout": "about",
  "tool-show_experience": "experience",
  "tool-showExperience": "experience",
  "tool-show_tech_stack": "tech",
  "tool-showTechStack": "tech",
};

/** Common suggestion / pill phrasing that maps to sidebar sections (not nav presets). */
const USER_TEXT_TO_NAV_ID: Array<{ id: NavItemId; phrases: string[] }> = [
  {
    id: "projects",
    phrases: [
      "show projects",
      "show me some projects",
      "show me your projects",
      "show your projects",
    ],
  },
  {
    id: "about",
    phrases: ["about me", "tell me about yourself"],
  },
  {
    id: "experience",
    phrases: [
      "show my work experience",
      "what's your experience",
      "show me your experience",
      "what is your experience",
    ],
  },
  {
    id: "tech",
    phrases: [
      "tech stack",
      "what's your tech stack",
      "what is your tech stack",
      "what technologies do you use",
    ],
  },
];

function normalizeUserText(text: string): string {
  return text.trim().toLowerCase().replace(/\?+$/, "");
}

function getUserMessageText(message: UIMessage): string {
  return (
    message.parts
      ?.filter(
        (part): part is { type: "text"; text: string } => part.type === "text"
      )
      .map((part) => part.text)
      .join("\n")
      .trim() ?? ""
  );
}

function navIdFromUserText(text: string): NavItemId | null {
  const normalized = normalizeUserText(text);
  if (!normalized) {
    return null;
  }

  for (const item of NAV_ITEMS) {
    if (normalizeUserText(item.message) === normalized) {
      return item.id;
    }
  }

  for (const { id, phrases } of USER_TEXT_TO_NAV_ID) {
    if (phrases.some((phrase) => normalized === phrase)) {
      return id;
    }
  }

  return null;
}

/**
 * Derives the active sidebar section from chat history (newest signal wins).
 * Tools beat older user text; does not react to suggestion UI re-renders.
 */
export function getActiveNavSection(messages: UIMessage[]): NavItemId | null {
  if (messages.length === 0) {
    return null;
  }

  for (let i = messages.length - 1; i >= 0; i--) {
    const message = messages[i];

    if (message.role === "assistant" && message.parts) {
      for (let j = message.parts.length - 1; j >= 0; j--) {
        const part = message.parts[j];
        const navId = TOOL_TYPE_TO_NAV_ID[part.type];
        if (navId) {
          return navId;
        }
      }
    }

    if (message.role === "user") {
      const navId = navIdFromUserText(getUserMessageText(message));
      if (navId) {
        return navId;
      }
    }
  }

  return null;
}

export function useActiveNavSection(messages: UIMessage[]): NavItemId | null {
  return useMemo(() => getActiveNavSection(messages), [messages]);
}
