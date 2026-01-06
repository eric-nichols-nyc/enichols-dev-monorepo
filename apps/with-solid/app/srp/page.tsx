"use client";

import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/design-system/components/ui/card";
import { SplitLayout } from "@/components/split-layout";
import { BadUserProfile } from "./components/bad-user-profile";
import { UserProfile } from "./components/good-user-profile";

const SRPPage = () => (
  <SplitLayout
    left={
      <>
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
              The Single Responsibility Principle states that a class or module
              should have only one reason to change, meaning it should have only
              one job or responsibility.
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
      </>
    }
    right={
      <>
        <CardHeader>
          <CardTitle>Example</CardTitle>
          <CardDescription>Good vs Bad implementation</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="mb-3 font-semibold text-destructive">
              ❌ Bad Component
            </h3>
            <p className="mb-3 text-muted-foreground text-xs">
              Component handles display, storage, analytics, and formatting
            </p>
            <BadUserProfile />
          </div>
          <div>
            <h3 className="mb-3 font-semibold text-green-600 dark:text-green-400">
              ✅ Good Component
            </h3>
            <p className="mb-3 text-muted-foreground text-xs">
              Component only displays data. Logic handled by parent/hooks
            </p>
            <UserProfile
              onSave={() => {
                // Save logic handled externally
                console.log("Save logic handled externally");
              }}
              user={{
                name: "Jane Doe",
                email: "jane@example.com",
                lastUpdated: new Date(),
              }}
            />
          </div>
        </CardContent>
      </>
    }
  />
);

export default SRPPage;
