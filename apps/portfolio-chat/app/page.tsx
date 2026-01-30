import { ModeToggle } from "@repo/design-system/components/mode-toggle";
import { Github, Instagram, Linkedin } from "lucide-react";
import Link from "next/link";
import { Chat } from "@/components/chat";

const socialLinks = [
  { href: "https://github.com", icon: Github, label: "GitHub" },
  { href: "https://instagram.com", icon: Instagram, label: "Instagram" },
  { href: "https://linkedin.com", icon: Linkedin, label: "LinkedIn" },
];

const HomePage = () => (
  <main className="flex h-dvh flex-col">
    <header className="sticky top-0 z-10 flex shrink-0 items-center justify-between border-border border-b bg-app px-4 py-3">
      <div className="flex items-center gap-3">
        <h1 className="font-semibold text-lg">Eric Nichols</h1>
        <nav aria-label="Social links" className="flex items-center gap-2">
          {socialLinks.map(({ href, icon: Icon, label }) => (
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
          ))}
        </nav>
      </div>
      <ModeToggle />
    </header>
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <Chat />
    </div>
  </main>
);

export default HomePage;
