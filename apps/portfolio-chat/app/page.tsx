import { ModeToggle } from "@repo/design-system/components/mode-toggle";
import { Chat } from "@/components/chat";

const HomePage = () => (
  <main className="flex h-dvh flex-col">
    <header className="sticky top-0 z-10 flex shrink-0 items-center justify-between border-border border-b bg-app px-4 py-3">
      <h1 className="font-semibold text-lg">Eric Nichols</h1>
      <ModeToggle />
    </header>
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <Chat />
    </div>
  </main>
);

export default HomePage;
