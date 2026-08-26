/**
 * /reasoning — practical AI SDK reasoning demo.
 * Shows a Thinking panel (reasoning parts) then the final answer.
 */
import { ModeToggle } from "@repo/design-system/components/mode-toggle";
import { Button } from "@repo/design-system/components/ui/button";
import Link from "next/link";
import { ReasoningChat } from "@/components/reasoning-chat";

export default function ReasoningPage() {
  return (
    <main className="flex h-svh flex-col bg-background">
      <header className="flex shrink-0 items-center justify-between border-border border-b px-4 py-3">
        <div className="flex items-center gap-3">
          <Button asChild size="sm" variant="ghost">
            <Link href="/">← Home</Link>
          </Button>
          <h1 className="font-medium text-sm">Reasoning</h1>
        </div>
        <ModeToggle />
      </header>
      <div className="min-h-0 flex-1">
        <ReasoningChat />
      </div>
    </main>
  );
}
