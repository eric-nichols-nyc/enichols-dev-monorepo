import { describe, expect, it } from "vitest";
import {
  MAX_ABOUT_INTRO_WORDS,
  selectAboutIntro,
  selectAboutIntroVariant,
} from "@/features/ai-chat/utils/select-about-intro";

describe("selectAboutIntroVariant", () => {
  it("maps phrase clusters to variants", () => {
    expect(selectAboutIntroVariant("tell me about yourself")).toBe("default");
    expect(selectAboutIntroVariant("introduce yourself")).toBe("hello");
    expect(selectAboutIntroVariant("who is eric")).toBe("identity");
    expect(selectAboutIntroVariant("your background")).toBe("background");
  });

  it("normalizes sidebar About Me alias to default", () => {
    expect(selectAboutIntroVariant("about me")).toBe("default");
  });
});

describe("selectAboutIntro", () => {
  it("keeps each variant under the word cap", () => {
    const messages = [
      "Tell me about yourself",
      "Introduce yourself",
      "Who is Eric?",
      "What's your background",
    ];

    for (const message of messages) {
      const { copy, variant } = selectAboutIntro(message);
      const words = copy.trim().split(/\s+/).length;
      expect(words).toBeLessThanOrEqual(MAX_ABOUT_INTRO_WORDS);
      expect(copy.length).toBeGreaterThan(0);
      expect(variant).toBeTruthy();
    }
  });

  it("does not include prior-employer timeline paragraphs", () => {
    const { copy } = selectAboutIntro("Tell me about yourself");
    expect(copy).not.toMatch(/Before that I was at/);
    expect(copy).not.toMatch(/Earlier at/);
    expect(copy).toMatch(/Eric Nichols/i);
    expect(copy).toMatch(/VoteMate/i);
  });
});
