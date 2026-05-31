import {
  type AboutIntroVariant,
  aboutIntroVariants,
} from "@/data/about";
import { normalizeMessage } from "@/features/ai-chat/utils/intent-router";

export const MAX_ABOUT_INTRO_WORDS = 150;

const HELLO_PHRASES = ["introduce yourself"] as const;

const IDENTITY_PHRASES = ["who is eric", "about you"] as const;

const BACKGROUND_PHRASES = [
  "your background",
  "overview of your experience",
  "what's your background",
] as const;

const DEFAULT_PHRASES = [
  "tell me about yourself",
  "about me",
] as const;

export type SelectedAboutIntro = {
  variant: AboutIntroVariant;
  paragraphs: string[];
  copy: string;
};

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function selectAboutIntroVariant(
  normalizedMessage: string
): AboutIntroVariant {
  if (includesPhrase(normalizedMessage, DEFAULT_PHRASES)) {
    return "default";
  }

  if (includesPhrase(normalizedMessage, HELLO_PHRASES)) {
    return "hello";
  }

  if (includesPhrase(normalizedMessage, BACKGROUND_PHRASES)) {
    return "background";
  }

  if (includesPhrase(normalizedMessage, IDENTITY_PHRASES)) {
    return "identity";
  }

  return "default";
}

function includesPhrase(message: string, phrases: readonly string[]): boolean {
  return phrases.some((phrase) => message.includes(phrase));
}

export function selectAboutIntro(message: string): SelectedAboutIntro {
  const normalized = normalizeMessage(message);
  const variant = selectAboutIntroVariant(normalized);
  const paragraphs = [...aboutIntroVariants[variant]];
  const copy = paragraphs.join("\n\n");

  const wordCount = countWords(copy);
  if (wordCount > MAX_ABOUT_INTRO_WORDS) {
    throw new Error(
      `About intro variant "${variant}" exceeds ${MAX_ABOUT_INTRO_WORDS} words (${wordCount})`
    );
  }

  return { variant, paragraphs, copy };
}
