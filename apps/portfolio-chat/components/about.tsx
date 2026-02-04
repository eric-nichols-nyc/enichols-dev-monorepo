"use client";

import { Github, Instagram, Linkedin } from "lucide-react";
import Link from "next/link";

const SOCIAL_ICONS = {
  GitHub: Github,
  Instagram,
  LinkedIn: Linkedin,
} as const;

type AboutProps = {
  title: string;
  paragraphs: string[];
  socialLinks?: Array<{ href: string; label: string }>;
};

export function About({ title, paragraphs, socialLinks }: AboutProps) {
  return (
    <div className="space-y-4">
      <h2 className="font-semibold text-foreground text-lg">{title}</h2>
      <div className="space-y-3 text-muted-foreground leading-relaxed">
        {paragraphs.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
      {Array.isArray(socialLinks) && socialLinks.length > 0 ? (
        <nav
          aria-label="Social links"
          className="flex flex-wrap items-center gap-3"
        >
          {socialLinks.map(({ href, label }) => {
            const Icon =
              SOCIAL_ICONS[label as keyof typeof SOCIAL_ICONS] ?? Linkedin;
            return (
              <Link
                aria-label={label}
                className="text-muted-foreground transition-colors hover:text-foreground"
                href={href}
                key={label}
                rel="noopener noreferrer"
                target="_blank"
              >
                <Icon className="size-5" />
              </Link>
            );
          })}
        </nav>
      ) : null}
    </div>
  );
}
