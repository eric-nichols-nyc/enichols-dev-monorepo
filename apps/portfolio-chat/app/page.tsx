import { ModeToggle } from "@repo/design-system/components/mode-toggle";
import { Chat } from "@/components/chat";

const HomePage = () => (
  <main className="flex min-h-screen flex-col bg-background">
    <header className="flex shrink-0 items-center justify-between border-border border-b px-4 py-3">
      <h1 className="font-semibold text-lg">Portfolio Chat</h1>
      <ModeToggle />
    </header>
    <div className="flex flex-1 flex-col items-center justify-center p-6">
      <Chat />
    </div>
  </main>
);

export default HomePage;
