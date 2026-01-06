"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/design-system/components/ui/card";
import { ComponentCodeLayout } from "@/components/component-code-layout";
import { PageWrapper } from "@/components/page-wrapper";
import { SplitLayout } from "@/components/split-layout";
import { buildPageContext } from "@/lib/page-context";
import { BadUserProfile } from "./components/bad-user-profile";
import { UserProfile } from "./components/good-user-profile";

const badCode = `"use client";

import { Button } from "@repo/design-system/components/ui/button";
import { Card, CardContent } from "@repo/design-system/components/ui/card";
import { useState } from "react";

/**
 * ❌ BAD: This component violates SRP
 * It handles:
 * - Displaying user data
 * - Fetching data
 * - Saving to localStorage
 * - Sending analytics
 * - Formatting dates
 */
export const BadUserProfile = () => {
  const user = {
    name: "John Doe",
    email: "john@example.com",
  };
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    // Saving to localStorage
    localStorage.setItem("user", JSON.stringify(user));

    // Sending analytics
    fetch("/api/analytics", {
      method: "POST",
      body: JSON.stringify({ event: "user_saved", userId: user.email }),
    });

    // Formatting and displaying
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const formatDate = (date: Date) =>
    date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  return (
    <Card>
      <CardContent className="space-y-4 pt-6">
        <div>
          <h3 className="font-semibold">{user.name}</h3>
          <p className="text-muted-foreground text-sm">{user.email}</p>
          <p className="mt-2 text-muted-foreground text-xs">
            Last updated: {formatDate(new Date())}
          </p>
        </div>
        <Button disabled={saved} onClick={handleSave}>
          {saved ? "Saved!" : "Save User"}
        </Button>
      </CardContent>
    </Card>
  );
};`;

const goodCode = `"use client";

import { Button } from "@repo/design-system/components/ui/button";
import { Card, CardContent } from "@repo/design-system/components/ui/card";

type User = {
  name: string;
  email: string;
  lastUpdated: Date;
};

type UserProfileProps = {
  user: User;
  onSave?: () => void;
  isSaving?: boolean;
};

/**
 * ✅ GOOD: Single Responsibility - Only displays user data
 */
export const UserProfile = ({ user, onSave, isSaving }: UserProfileProps) => {
  return (
    <Card>
      <CardContent className="pt-6 space-y-4">
        <div>
          <h3 className="font-semibold">{user.name}</h3>
          <p className="text-muted-foreground text-sm">{user.email}</p>
          <p className="text-muted-foreground text-xs mt-2">
            Last updated: {user.lastUpdated.toLocaleDateString()}
          </p>
        </div>
        {onSave && (
          <Button onClick={onSave} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save User"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};`;

// Build the page context for the chatbot
const pageContext = buildPageContext({
  principle: "Single Responsibility Principle (SRP)",
  description: "A class should have only one reason to change",
  definition:
    "The Single Responsibility Principle states that a class or module should have only one reason to change, meaning it should have only one job or responsibility.",
  benefits: [
    "Easier to understand and maintain",
    "Reduced coupling between components",
    "Improved testability",
    "Better code organization",
  ],
  badCode,
  goodCode,
  badDescription:
    "Component handles display, storage, analytics, and formatting",
  goodDescription:
    "Component only displays data. Logic handled by parent/hooks",
});

const SRPPage = () => (
  <PageWrapper context={pageContext}>
    <div className="flex min-h-[calc(100vh-4rem)] flex-col">
      <div className="shrink-0 p-6">
        <Card>
          <CardHeader>
            <CardTitle>Single Responsibility Principle</CardTitle>
            <CardDescription>
              A class should have only one reason to change
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="mb-2 font-semibold">Definition</h3>
              <p className="text-muted-foreground text-sm">
                The Single Responsibility Principle states that a class or
                module should have only one reason to change, meaning it should
                have only one job or responsibility.
              </p>
            </div>
            <div>
              <h3 className="mb-2 font-semibold">Benefits</h3>
              <ul className="list-inside list-disc space-y-1 text-muted-foreground text-sm">
                <li>Easier to understand and maintain</li>
                <li>Reduced coupling between components</li>
                <li>Improved testability</li>
                <li>Better code organization</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex-1">
        <SplitLayout
          left={
            <ComponentCodeLayout
              code={badCode}
              component={<BadUserProfile />}
              description="Component handles display, storage, analytics, and formatting"
              title="❌ Bad Component"
            />
          }
          right={
            <ComponentCodeLayout
              code={goodCode}
              component={
                <UserProfile
                  onSave={() => {
                    console.log("Save logic handled externally");
                  }}
                  user={{
                    name: "Jane Doe",
                    email: "jane@example.com",
                    lastUpdated: new Date(),
                  }}
                />
              }
              description="Component only displays data. Logic handled by parent/hooks"
              title="✅ Good Component"
            />
          }
        />
      </div>
    </div>
  </PageWrapper>
);

export default SRPPage;
