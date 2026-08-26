/**
 * /human-in-the-loop — LangGraph interrupt → Continue → issue refund demo.
 *
 * Layout only; chat logic lives in `components/human-in-the-loop-chat.tsx`.
 */
import { ModeToggle } from "@repo/design-system/components/mode-toggle";
import { Button } from "@repo/design-system/components/ui/button";
import Link from "next/link";
import { HumanInTheLoopChat } from "@/components/human-in-the-loop-chat";

export default function HumanInTheLoopPage() {
  return (
    <main className="flex h-svh flex-col bg-background">
      <header className="flex shrink-0 items-center justify-between border-border border-b px-4 py-3">
        <div className="flex items-center gap-3">
          <Button asChild size="sm" variant="ghost">
            <Link href="/">← Home</Link>
          </Button>
          <h1 className="font-medium text-sm">Human-in-the-loop</h1>
        </div>
        <ModeToggle />
      </header>
      <div className="min-h-0 flex-1">
        <HumanInTheLoopChat />
      </div>
    </main>
  );
}
