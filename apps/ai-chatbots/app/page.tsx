import { ModeToggle } from "@repo/design-system/components/mode-toggle";
import { Button } from "@repo/design-system/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/design-system/components/ui/card";
import { MessageSquare } from "lucide-react";
import Link from "next/link";

const HomePage = () => (
  <main className="flex min-h-screen items-center justify-center bg-background p-8">
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="absolute top-4 right-4">
          <ModeToggle />
        </div>
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <MessageSquare className="h-6 w-6 text-primary" />
        </div>
        <CardTitle className="text-2xl">AI Chatbots</CardTitle>
        <CardDescription>
          Build intelligent conversational experiences
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <p className="text-center text-muted-foreground text-sm">
          Create powerful AI chatbots with Next.js and modern AI technologies.
        </p>
        <Button asChild className="w-full">
          <Link href="/basic-chat">Open Basic Chat</Link>
        </Button>
        <Button asChild className="w-full" variant="outline">
          <Link href="/langchain-chat">Open LangChain Chat</Link>
        </Button>
        <Button asChild className="w-full" variant="outline">
          <Link href="/human-in-the-loop">Open Human-in-the-loop</Link>
        </Button>
        <Button asChild className="w-full" variant="outline">
          <Link href="/reasoning">Open Reasoning</Link>
        </Button>
      </CardContent>
    </Card>
  </main>
);

export default HomePage;
